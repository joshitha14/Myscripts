//DS_Import_OHR_CA.js
/********************************************************************************
Name:			DS_Import_OHR_CA.js
Author:			Eric Baumbusch (copied from FA_Import_DocuSign.js authored by Jay Taffel)
Created:		10/02/2019 ECB - Project 2017-056 Confidentiality Agreement
Last Updated:	10/07/2019 TechHelp 308870 JMT - Created OHR index lookup functions to be used in many DocuSign import routines. Replaced local functions with TU LIB.
For Version:	6.x
Script Version: $Id$
---------------------------------------------------------------------------------
Summary:
		Imports and indexes Confidentiality Agreement forms.
Mod Summary: 
				10/07/2019 TechHelp 308870 JMT - Created OHR index lookup functions to be used in many DocuSign import routines. Replaced local functions with TU LIB.
				Renamed file from OHR_CA_Import_DocuSign.
				10/31/2019 ECB - Commented out ListCC recipients
				11/20/2019 ECB - Changed index file field name from Name to CompleteName and DateSigned to CompletedDate because of conflicts
									with scheduled tasks, those are reserved words it seems. Run fine out of Retrieve, but not via scheduled task
				02/19/2020 TechHelp ###### JMT & JM Renaming the script filename from "OHR_Import_DocuSign_CA.js" to "DS_Import_OHR_CA.js"

				
Business Use:  
		Scheduled task to run once a week to import items from a network drive.
		
Program Logic:
	 Loop
		Get .csv file with index values of "Subject","TUConfidentialityAgreement","Name","EmailID","TUID","DateSigned","Envelope Id".
		Use that to import PDF files and index them based on CSV values.
		TU ID index value stored as Field1 and used as lookup for full name (Field2).
		All files to be hard coded as DocumentType: OHR_Confidentiality Agreement
		All files routed to Workflow queue: "FCC Start" eventually arriving in OHR_Complete

********************************************************************************/

//******************************* LOGGING *****************************

#include "$IMAGENOWDIR6$/script/STL/packages/Logging/iScriptDebug.js"
#define LOG_TO_FILE true // false - log to stdout if ran by intool, wf user if inscript.
                         // true  - log to inserverXX/log/ directory
#define DEBUG_LEVEL 5    // 0 - 5.  0 least output, 5 most verbose. Use 3 for normal operation since some STLs use 4/Info
var debug = "";
var strThisScript = "DS_Import_OHR_CA.js";

//************************** INCLUDE Towson COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/TU_LIB_TU_FUNCTIONS.js"
#include "$IMAGENOWDIR6$/script/TU_LIB_DB_CONNECTION.js"  // Database configuration

//************************** INCLUDE STL COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/STL/packages/Database/DBAccess.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Document/createDocument.js"
#include "$IMAGENOWDIR6$/script/STL/packages/File/advancedArchiveFile.js"
#include "$IMAGENOWDIR6$/script/STL/packages/File/CSVObject.js"
#include "$IMAGENOWDIR6$/script/STL/packages/File/doesFileExist.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Workflow/createOrRouteDoc.js"

// *********************         Configuration        *******************
// set to true when configuration values have been verified
#define CONFIG_VERIFIED		true

// ********************* Global variables ********************
//Import directories
var IMPORT_DIR		= "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\OHR\\";
var ARCHIVE_DIR		= "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\OHR\\complete\\";
var ERROR_DIR		= "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\OHR\\failed\\";

//Workflow Queues
var Q_COMPLETE = "FCC Start"; //eventually to OHR_Complete
var Q_ERROR = "OHR_Error";

//Define CSV file fields
/***Example rows from index file
"Subject","TUConfidentialityAgreement","Name","EmailID","TUID","DateSigned","Envelope Id"
"Please Sign: TU Confidentiality Agreement: Katherine Scanlan","TUConfidentialityAgreement","Katherine Scanlan","kscanlan@towson.edu","0125371","2018-05-21T22:05:17.0000000Z","ee3a0ccd-b9cb-4bd2-853f-8e27c71d7887"
"Please Sign: TU Confidentiality Agreement: Matt Applebaum","TUConfidentialityAgreement","Matt Applebaum","Mapplebaum@towson.edu","8001203","2018-05-22T01:19:34.0000000Z","8ab84903-bd39-4323-a70e-325e5cba7d4e"

***/
#define CSV_HEADER_LINE_COUNT 1  //0 no header
var CSV_CONFIG =
[
	{name:"Subject"},
	{name:"TUConfidentialityAgreement"},
	{name:"CompleteName"},
	{name:"EmailID"},
	{name:"TUID"},
	{name:"CompletedDate"},
	{name:"EnvelopeId"}
];

//Array to store the NetID's of documents with duplicates/attachments
var arrHasAttachment = new Array;
var arrMissingFile = new Array;

//Counters for logging and reporting
//on index file, empty index1, index3 and blank2 indicates an attachment, match filename and add ID to attachment counter
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
			TU_Func_AlertINAdmins(strThisScript);  //local function
			return false;
		}

		//for each line...
		while (true)
		{
			var line = csv.getNextRowObject();
			if (!line) break;
			cntCSVRow++;
			debug.log(4, "Name [%s] | EmplID [%s]\n", line["CompleteName"], line["TUID"]);

			//See if listed file exists. if so, open and import, if not, log missing file.
			var fileToImport = IMPORT_DIR + line["Subject"] + ".pdf";
			//value in csv is different than true file name. Subject has non-Windows file characters. Need to change so entry matches file names.
			fileToImport = fileToImport.replace("Sign:", "Sign-");  //all entries
			fileToImport = fileToImport.replace("Agreement:", "Agreement-");  //all entries
			fileToImport = fileToImport.replace(/\. /g, "- ");  //Changes middle initial periods to dashes
			fileExists = doesFileExist(fileToImport);
			if (fileExists) //it is there, get it and import into PC using CSV index values
			{
				cntFiles++;
				//Perform a PS lookup using EmplID, and set index variables equal to results.
				var strEmpName = TU_Func_LookupName_by_EmplID_OHR(line["TUID"]);  //TU Function
				var strEmpSSN4 = TU_Func_LookupSSN4_by_EmplID_OHR(line["TUID"]);  //TU Function
				//Create new keys object and set them based on current wfDoc or query results
				var keys = new INKeys("OHR_ECC", line["TUID"], strEmpName, "", line["CompletedDate"], strEmpSSN4, "OHR_Confidentiality Agreement");
				//Make a new doc from the file
				var newDoc = createDocument(keys, fileToImport);  //only 1 pdf. will go to FCC for later processing.
				//var newDoc = StoreDoc(keys, fileToImport);
				if(!newDoc)
				{
					cntFileError++;
					debug.log("ERROR", "Failed to store file [%s]\n", fileToImport);
					advancedArchiveFile(fileToImport, ERROR_DIR, advancedArchiveFile.ARCHIVE);
					continue;
				}

				//Create the doc and add to workflow
				//Check if query result from PS is false. If so, route to error queue
				if ((!strEmpName)||(!strEmpSSN4))  //SQL return of false equals true
				{
					cntSQLError++;
					debug.log("ERROR", "SQL problem with ID [%s]\n", line["TUID"]);
					createOrRouteDoc(newDoc, Q_ERROR, "add to workflow");
				}
				else
				{
					createOrRouteDoc(newDoc, Q_COMPLETE, "add to workflow");
				}

				//Successfully added the file contents to IN. Archive the file (or not)
				advancedArchiveFile(fileToImport, ARCHIVE_DIR, advancedArchiveFile.DELETE);  //advancedArchiveFile.ARCHIVE);
				debug.log(4, "Completed import and archive of this file.\n");
			}//end of adding existing file to PC
			else  //no file for current CSV line
			{
				cntFileMissing++;
				debug.log(1, "No file matching current CSV line!\n");
				debug.log(1, "\nCSV value [%s]\nfileToImport [%s]\n", line["FileName"], fileToImport);
				arrMissingFile.push(fileToImport);  //add to array for log
			}
		}  //get next line in CSV file 

		//Archive the index file with a timestamp since Retrieve uses the same filename every time
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
		ListTo = "ebaumbusch@towson.edu";
		ListCC = ""; //"jtaffel@towson.edu, ebaumbusch@towson.edu";
		ListBCC = "";
		MailSubject = "OHR_Import_DocuSign_CA.js Statistics";
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
			//send mail to IN team
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
//End of Towson functions


//-- last line must be a comment --