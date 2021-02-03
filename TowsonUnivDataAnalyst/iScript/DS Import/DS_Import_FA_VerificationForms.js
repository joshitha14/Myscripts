//DS_Import_FA_VerificationForms
/********************************************************************************
Name:			DS_Import_FA_VerificationForms.js
Author:			Jay Taffel
Created:		01/17/2018 Jay Taffel - Project 2017-017 Forms Project
Last Updated:	
For Version:	6.x
Script Version: $Id$
---------------------------------------------------------------------------------
Summary:
		Imports and indexes Financial Aid DocuSign Verifications forms.
Mod Summary: 
				11/07/2019 TechHelp 314134 - Change Q_Compelte to FCC Start from FA DS Verification Forms
				02/19/2020 TechHelp ###### JMT & JM Renaming the script filename from "FA_Import_DocuSign.js" to "DS_Import_FA_VerificationForms.js"

Business Use:  
		Scheduled task to run once a day to import items from a network drive.
		
Program Logic:
	 Loop
		Get .csv file with index values of TU ID and Aid Year. Use that to import PDF files and index them based on CSV values.
		TU ID index value stored as Field1 and used as lookup for full name (Field2).
		All files to be hard coded as DocumentType: Verification Form
		All files routed to Workflow queue: "FA DS Verification Forms"
		Rows in CSV file with missing TUID indicate that there was an attachment on the (likely) previous person's file. Log these.
		Send a summary email to FinAid with statistics including the list of poeple with attachments.

********************************************************************************/

//******************************* LOGGING *****************************

#include "$IMAGENOWDIR6$/script/STL/packages/Logging/iScriptDebug.js"
#define LOG_TO_FILE true // false - log to stdout if ran by intool, wf user if inscript.
                         // true  - log to inserverXX/log/ directory
#define DEBUG_LEVEL 5    // 0 - 5.  0 least output, 5 most verbose. Use 3 for normal operation since some STLs use 4/Info
var debug = "";
var strThisScript = "DS_Import_FA_VerificationForms";

//************************** INCLUDE Towson COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/TU_LIB_TU_FUNCTIONS.js"
#include "$IMAGENOWDIR6$/script/TU_LIB_DB_CONNECTION.js"  // Database configuration

//************************** INCLUDE STL COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/STL/packages/Document/createDocument.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Database/DBAccess.js"
#include "$IMAGENOWDIR6$/script/STL/packages/File/advancedArchiveFile.js"
#include "$IMAGENOWDIR6$/script/STL/packages/File/CSVObject.js"
#include "$IMAGENOWDIR6$/script/STL/packages/File/doesFileExist.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Properties/PropertyManager.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Workflow/createOrRouteDoc.js"

// *********************         Configuration        *******************
// set to true when configuration values have been verified
#define CONFIG_VERIFIED		true

// ********************* Global variables ********************
//Import directories
var IMPORT_DIR		= "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\FinAid\\";
var ARCHIVE_DIR		= "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\FinAid\\complete\\";
var ERROR_DIR		= "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\FinAid\\failed\\";


//Workflow Queues
var Q_COMPLETE = "FCC Start"; //eventually to FA DS Verification Forms
var Q_ERROR = "FA DS Verification Forms Error";

//Define CSV file fields
#define CSV_HEADER_LINE_COUNT 1  //0 no header
var CSV_CONFIG =
[
	{name:"FileName"},
	{name:"Index1"},
	{name:"Index3"},
	{name:"blank4"}
];

//Array to store the NetID's of documents with duplicates/attachments
var arrHasAttachment = new Array;
var arrMissingFile = new Array;

//Counters for logging and reporting
//on index file, empty index1, index3 and blank2 indicates an attahment, match filename and add ID to attachment counter
var cntCSVRow = -1;  //counter for csv file
var cntFiles = 0;
var cntAttachments = 0;
var cntFileMissing = 0;
var cntFileError = 0;
var cntSQLError = 0;

//Other Variables
var prevID = "";
var db = null;
//SendMail buffer
var errbuf = " ";

// ********************* Include additional libraries *******************
#link <sedbc>

/** ****************************************************************************
  *		Main body of script.
  *
  * @param {none} None
  * @returns {void} None
  *****************************************************************************/
  
function main ()
{
	try
	{
		var strH = "----------------------------------------------------------------------------------------------------\n";
		var strF = "____________________________________________________________________________________________________\n";
		debug = new iScriptDebug("USE SCRIPT FILE NAME", LOG_TO_FILE, DEBUG_LEVEL, undefined, {strHeader:strH, strFooter:strF});
        debug.showINowInfo("INFO");
		debug.logAlways("INFO", "Script Version: $Id$\n");

		//look for files in input folder
		var fileList = SElib.directory(IMPORT_DIR + "*.*", false, ~FATTR_SUBDIR & ~FATTR_HIDDEN);  //exclude sub dirs and thumbs.db
		if(!fileList || fileList.length == 0)
		{
			debug.log(3, "No files found in [%s]\n", IMPORT_DIR);
			return false;
		}

		//if get to here, have DocuSign files that need importing to IN
		//Look for text file first
		var CSV_FILE = SElib.directory(IMPORT_DIR + "*.csv", false, ~FATTR_SUBDIR);
		if(!CSV_FILE || CSV_FILE.length == 0)
		{
			debug.log("NOTIFY", "No files found in [%s]\n", IMPORT_DIR);
			return false;
		}
		//open csv
		var csv = new CSVObject(CSV_FILE[0].name, CSV_CONFIG, {intHeaderLen:CSV_HEADER_LINE_COUNT, delim:','});
		if (!csv.openFile("r"))
		{
			debug.log("ERROR", "Unable to open csv file: \n", CSV_FILE);
			return false;
		}

		//Initialize database access
		db = new DBAccess(dbEngine, hostDSN, hostUsername, hostPW);
		if(!db.open())
		{
			debug.log("CRITICAL", "Could not open database connection\n");
			SendMailOnError(strThisScript);  //local function
			return false;
		}

		//for each line...
		while (true)
		{
			var line = csv.getNextRowObject();
			if (!line) break;
			cntCSVRow++;
			debug.log(4, "File [%s] | EmplID [%s] | FinAidYear [%s]\n", line["FileName"], line["Index1"], line["Index3"]);

			//Check if have TUID. If so, save for next line. If not, then this person has an attachment.
			if (line["Index1"] =="")
			{
				//Update stuff for reporting
				cntAttachments++;
				var strNameInFile = line["FileName"];
				debug.log(4, "It looks like an attachment for EmplID [%s] | Name [%s]\n", prevID, strNameInFile.slice(strNameInFile.search("Student - ") + 10));
				arrHasAttachment.push(prevID + " " + strNameInFile.slice(strNameInFile.search("Student - ") + 10));  //add to array for log
				continue;
			}
			else
			{
				prevID = line["Index1"];
			}

			//See if listed file exists. if so, open and import, if not, log missing file.
			var fileToImport = IMPORT_DIR + line["FileName"] + ".pdf";
			//value in csv is different than true file name. Subject has non-Windows file characters. Need to change so entry matches file names.
			fileToImport = fileToImport.replace("DocuSign:", "DocuSign-");  //all entries
			fileToImport = fileToImport.replace(/\. /g, "- ");  //Changes middle initial periods to dashes
			fileExists = doesFileExist(fileToImport);
			if (fileExists) //it is there, get it and import into PC using CSV index values
			{
				cntFiles++;
				//Perform a PS lookup using EmplID, and set name variable equal to the result.
				var StudentName = lookupName_by_EmplID(line["Index1"]);
				//Create new keys object and set them based on current wfDoc or query reults
				var keys = new INKeys("FinAid", line["Index1"], StudentName, line["Index3"], "", "", "Verification Form");
				//Set aid year if not current one. This is for older docs that get imported.
				if (keys.field3 == "2018") keys.field3 = "2019" ;

				//Make a new doc from the file
				var newDoc = createDocument(keys, fileToImport);
				if(!newDoc)
				{
					cntFileError++;
					debug.log("ERROR", "Failed to store file [%s]\n", fileToImport);
					advancedArchiveFile(fileToImport, ERROR_DIR, advancedArchiveFile.ARCHIVE);
					continue;
				}
				
				//Create the doc and add to workflow
				//Check if query result from PS is false. If so, route to error queue
				if (!StudentName)  //SQL return of false equals true
				{
					cntSQLError++;
					debug.log("ERROR", "SQL problem with ID [%s]\n", line["Index1"]);
					createOrRouteDoc(newDoc, Q_ERROR, "add to workflow");
				}
				else
				{
					createOrRouteDoc(newDoc, Q_COMPLETE, "add to workflow");
				}

				//Successfully added the tiff file contents to IN. Archive the tiff file (or not)
				advancedArchiveFile(fileToImport, ARCHIVE_DIR, advancedArchiveFile.DELETE);  //advancedArchiveFile.ARCHIVE);
				debug.log(4, "Completed import and archive of this tif file.\n");

			}
			else  //no file for current CSV line
			{
				cntFileMissing++;
				debug.log(1, "No TIFF file matching current CSV line!\n");
				debug.log(1, "\nCSV value [%s]\nfileToImport [%s]\n", line["FileName"], fileToImport);
				arrMissingFile.push(fileToImport);  //add to array for log
			}
		
		}  //get next line in CSV file 

		//Archive the index file with a timestamp since Retreive uses the same filename every time
		csv.closeFile();
		advancedArchiveFile(CSV_FILE[0].name, ARCHIVE_DIR, advancedArchiveFile.ARCHIVETIMESTAMP);

		//TechHelp 326257 - Delete old archived files
		TU_DeleteArchivedFiles(ARCHIVE_DIR, 14);

		//Finish the logging
		debug.log(3, "LOOK HERE\n");
		debug.log(3, "CSV lines: %s\n", cntCSVRow + 1);
		debug.log(3, "Files read in: %s\n", cntFiles);
		debug.log(3, "Attachments: %s\n", cntAttachments);
		debug.log(3, "Files that could not be stored: %s\n", cntFileError);
		debug.log(3, "Files in index file but missing from import folder: %s\n", cntFileMissing);
		debug.log(3, "SQL errors from PS: %s\n", cntSQLError);

		//Send email of summary stats to interested parties
		//set the parts of the SendMail function
		ListTo = "hmccann@towson.edu, kstamper@towson.edu";
		//ListTo = "jtaffel@towson.edu, ebaumbusch@towson.edu";
		ListCC = "jtaffel@towson.edu, ebaumbusch@towson.edu";
		ListBCC = "";
		MailSubject = "FA_Import_DocuSign Statistics";
		MailBody = "The script importing DocuSign files into Perceptive Content has completed successfully.\n\n"; 
		MailBody += "CSV lines: " + (cntCSVRow + 1) + ".\n";
		MailBody += "Files read in: " + cntFiles + ".\n";
		MailBody += "Attachments: " + cntAttachments + ".\n";
		MailBody += "Files that could not be stored: " + cntFileError + ".\n";
		MailBody += "Files in index file but missing from import folder: " + cntFileMissing + ".\n";
		MailBody += "Files with SQL errors from PeopleSoft routed to error queue: " + cntSQLError + ".\n\n";
		
		if (cntAttachments > 0)
		{
			MailBody += "NetID's of students that submitted FA forms with attachments.\n\n"; 
			for (var i=0; i<arrHasAttachment.length; i++)
			{
				MailBody += arrHasAttachment[i] +"\n";
			}  //end of for arrNetIDs email
		}

		if (cntFileMissing > 0)
		{
			MailBody += "\nMissing files listed below\n"; 
			for (var i=0; i<arrMissingFile.length; i++)
			{
				MailBody += "<" + arrMissingFile[i] +">\n\n";
			}  //end of for arrNetIDs email
		}
		MailBody = MailBody + "\n";
		
		SendMail("ImageNow_Server@towson.edu", ListTo, ListCC, ListBCC, MailSubject, MailBody, "mail.towson.edu", "imaging.towson.edu", errbuf);

	}  //end of try
	
	catch(e)
	{
		if(!debug)
		{
			printf("\n\nFATAL iSCRIPT ERROR: %s\n\n", e.toString());
		}
		else
		{
			debug.log("CRITICAL", "***********************************************\n");
			debug.log("CRITICAL", "***********************************************\n");
			debug.log("CRITICAL", "**                                           **\n");
			debug.log("CRITICAL", "**    ***    Fatal iScript Error!     ***    **\n");
			debug.log("CRITICAL", "**                                           **\n");
			debug.log("CRITICAL", "***********************************************\n");
			debug.log("CRITICAL", "***********************************************\n");
			debug.log("CRITICAL", "\n\n\n%s\n\n\n", e.toString());
			debug.log("CRITICAL", "***********************************************\n");
			debug.log("CRITICAL", "***********************************************\n");
			////send mail to IN team
			TU_Func_AlertINAdmins(strThisScript);
		}
	}
	
	finally
	{
		if(debug)
		{
			debug.finish();
		}
	}
}

// ********************* Function Definitions **********************************

//BEGIN of Towson functions
/** ****************************************************************************
  *		Performs an external DB lookup (PeopleSoft) to retrieve the employees 
  *		name
  *
  * @param {String} emplId Employee ID
  * @returns {String} Name of the Employee or false
  * @requires DB_DBAccess
  *****************************************************************************/
function lookupName_by_EmplID(emplId)
{
	var cursor, emplId, SQL = "", MiddleInit = "", NameSuffix = "";
	Clib.sprintf(SQL, "SELECT SYSADM.PS_PERSONAL_DATA.LAST_NAME, SYSADM.PS_PERSONAL_DATA.FIRST_NAME, SYSADM.PS_PERSONAL_DATA.MIDDLE_NAME, SYSADM.PS_PERSONAL_DATA.NAME_SUFFIX FROM SYSADM.PS_PERSONAL_DATA WHERE SYSADM.PS_PERSONAL_DATA.EMPLID='%s'", emplId);
	cursor = db.query(SQL, Database.dynamic);
	if(!cursor || !cursor.first())
	{
		debug.log("ERROR", "Could not get first row\n");
		return false;
	}
	//JMT See if there is a middle initial or suffix
	if(cursor[2].charAt(0)!=" ")  // has middle name, get first letter and append to a period, o/w is blank from var statement above
	{
		MiddleInit = " " + cursor[2].charAt(0) + ".";
	}
	if(cursor[3].charAt(0)!=" ")  // has suffix, set variable w/ space before, o/w is blank from var statement above
	{
		NameSuffix = " " + trim(cursor[3]);
	}
	//JMT set the name as last suffix,first MI
	rtn = trim(cursor[0])  + NameSuffix + "," + trim(cursor[1]) + " " + trim(cursor[2]);          //newDoc.IDX_Field5.substr(0,3)
	//limit the result to 39 characters for long names
	rtn = rtn.substr(0,39) 

	cursor.close();
	//db.close();
	return rtn;
}

/**Sends email when error in running of script */
function SendMailOnError(strThisScript)
{
	ListTo = "jtaffel@towson.edu,ebaumbusch@towson.edu";
	ListCC = "";
	ListBCC = "";
	var errbuf = " ";
	MailSubject = "!!ERROR in ImageNow script: " + strThisScript;
	MailBody = "The script  [" + strThisScript +"] errored abrubtly! Go figure out what happened."; 
	SendMail("ImageNow_Server@towson.edu", ListTo, ListCC, ListBCC, MailSubject, MailBody, "mail.towson.edu", "imaging.towson.edu", errbuf);

} // end of SendMailOnError

//End of Towson functions

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!                   GENERIC FUNCTIONS / OBJECTS                           !!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !! For support purposes, please comment and notify PERCEPTIVE SOFTWARE of  !!
// !!                  any changes to the code below                          !!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

must be a comment --