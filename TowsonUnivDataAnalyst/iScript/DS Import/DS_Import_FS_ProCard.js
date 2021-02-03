//DS_Import_FS_ProCard.js
/********************************************************************************
Name:			DS_Import_FS_ProCard.js
Author:			Eric Baumbusch (Copied from FS_Requisition_Import_DocuSign.js)
Created:		07/18/2019 ECB - OPW TechHelp 295631; review/approved by Jay Taffel 07/xx/2019
Last Updated:	
For Version:	7.x
Script Version: $Id$
---------------------------------------------------------------------------------
Summary:
		Imports Pro Card Applications for FS (Procurement).

Mod Summary: 	02/19/2020 TechHelp ###### JMT & JM Renaming the script filename from "FS_ProCard_Import_DocuSign.js" to "DS_Import_FS_ProCard.js"				
				
Business Use:  
		Scheduled task to run once a day to import items from a network drive.
		
Program Logic:
	 Loop
		Get .csv file with index values of:
		ProCardApplication (literal value, used as unique field to only export requisitions, will not be used)
		TUID (F1),
		Name (F2)
		ReviewerNameText (F3),
		DeptNumberText (F4),
		Envelope ID (used to match .pdf file name, will not be used as PC index value).
		Use that to import PDF files and index them based on CSV value.
		All files to be hard coded Drawer: Procurement_ProCard, Field5: date/time stamp and doctype: 'ProCard Application.'
		All files routed to Workflow queue: "FCC Start", eventually to ProCard_Index.
		Rows in CSV file with missing values indicate that there was an attachment on the previous person's file,
		EnvelopeID will match prior row . Log these.
		Send a summary email to Eric (maybe Bobby Zengel/Brian Starkloff) with statistics including the list of people with attachments.

********************************************************************************/

//******************************* LOGGING *****************************
#include "$IMAGENOWDIR6$/script/STL/packages/Logging/iScriptDebug.js"
#define LOG_TO_FILE true // false - log to stdout if ran by intool, wf user if inscript.
                         // true  - log to inserverXX/log/ directory
#define DEBUG_LEVEL 5    // 0 - 5.  0 least output, 5 most verbose. Use 3 for normal operation since some STLs use 4/Info
var debug = "";
var strThisScript = "DS_Import_FS_ProCard.js";

//************************** INCLUDE Towson COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/TU_LIB_TU_FUNCTIONS.js"

//************************** INCLUDE STL COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/STL/packages/Date/convertToDateStr.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Document/createDocument.js"
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

/*
var IMPORT_DIR		= "\\\\customshare\\ImageNowImport\\Retrieve_Testing\\Procurement\\ProCardApplication\\";
var ARCHIVE_DIR		= "\\\\customshare\\ImageNowImport\\Retrieve_Testing\\Procurement\\ProCardApplication\\complete\\";
var ERROR_DIR		= "\\\\customshare\\ImageNowImport\\Retrieve_Testing\\Procurement\\ProCardApplication\\failed\\";
*/

var IMPORT_DIR		= "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\Procurement\\ProCardApplication\\";
var ARCHIVE_DIR		= "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\Procurement\\ProCardApplication\\complete\\";
var ERROR_DIR		= "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\Procurement\\ProCardApplication\\failed\\";


//Workflow Queues
var Q_COMPLETE = "FCC Start"  //"ProCard_Index";
var Q_ERROR = "Procurement_Error";

//Define CSV file fields
/***on index file, if row has all banks except for the 5th value (Envelope Id), it indicates an attachment,
match Envelope Id (to filename) and add ContactNameText to attachment counter. Envelope Id is a unique ID for that entire envelope.
example index lines with header:
"ProCardApplication","TUID","Name","ReviewerNameText","DeptNumberText","Envelope Id"
"ProCardApplication","1231456","Donna Amoriello","Mardette W","20830","03bbdc52-a09b-42d1-a857-d7f7429aad14"

NO ATTACHMENTS AVAILABLE FOR ProCardApp solution.

***/
#define CSV_HEADER_LINE_COUNT 1  //0 no header
var CSV_CONFIG =
[
	{name:"ProCardApplication"},
	{name:"TUID"}, //Field1
	{name:"Name"}, //Field2
	{name:"ReviewerNameText"}, //Field3
	{name:"DeptNumberText"},  //Field4
	{name:"FileName"}  //Envelope ID
];

//Array to store the PayeeNameText's of documents with duplicates/attachments
var arrHasAttachment = new Array;
var arrMissingFile = new Array;

//Counters for logging and reporting
var cntCSVRow = -1;  //counter for csv file
var cntFiles = 0;
var cntAttachments = 0;
var cntFileMissing = 0;
var cntFileError = 0;

//Other Variables
var prevID = "";
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

		//for each line...
		while (true)
		{
			var line = csv.getNextRowObject();
			if (!line) break;
			cntCSVRow++;
			debug.logln(5, "File [%s] | TUID aka Field1 [%s]", line["FileName"], line["TUID"]);

			//Check if have Payee. If so, save for next line. If not, then this person has an attachment.
			if (line["TUID"] == "")
			{
				//Update stuff for reporting
				cntAttachments++;
				var strNameInFile = line["FileName"];
				debug.logln(4, "It looks like an attachment for previous Person [%s] | Current Envelop ID [%s]", prevID, strNameInFile);
				arrHasAttachment.push(prevID);  //add to array for log
				continue;  //get next row in CSV. Nothing to import
			}
			else
			{
				prevID = line["TUID"];
			}

			//Only get to here if have something to import
			//See if listed file exists. if so, open and import, if not, log missing file.
			var fileToImport = IMPORT_DIR + line["FileName"] + ".pdf";
			fileExists = doesFileExist(fileToImport);
			if (fileExists) //it is there, get it and import into PC using CSV index values
			{
				cntFiles++;
				//Create new keys object and set them based on current wfDoc or query results
				var statusDate = new Date();
				var strNow = convertToDateStr(statusDate, "%datetime");
				var keys = new INKeys("Procurement_ProCard", line["TUID"], line["Name"], line["ReviewerNameText"], line["DeptNumberText"], strNow, "ProCard Application");
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
				createOrRouteDoc(newDoc, Q_COMPLETE, "add to workflow");

				//Successfully added the tiff file contents to IN. Archive the tiff file (or not)
				advancedArchiveFile(fileToImport, ARCHIVE_DIR, advancedArchiveFile.DELETE);  //ARCHIVE
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

		//Archive the index file with a time stamp since Retrieve uses the same filename every time
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

		//Send email of summary stats to interested parties
		//set the parts of the SendMail function
		var ListTo = (cntCSVRow == -1) ? "" : "rzengel@towson.edu";  //skip ListTo recip. if no data rows in csv file
		//ListTo = "jtaffel@towson.edu, ebaumbusch@towson.edu";
		ListCC = "ebaumbusch@towson.edu";
		ListBCC = "";
		MailSubject = "ProCard Application DocuSign Statistics";
		MailBody = "The script importing ProCard Application DocuSign files into Perceptive Content has completed successfully.\n\n"; 
		MailBody += "CSV lines: " + (cntCSVRow + 1) + ".\n";
		MailBody += "Files read in: " + cntFiles + ".\n";
		MailBody += "Attachments: " + cntAttachments + ".\n";
		MailBody += "Files that could not be stored: " + cntFileError + ".\n";
		MailBody += "Files in index file but missing from import folder: " + cntFileMissing + ".\n";
		
		if (cntAttachments > 0)
		{
			MailBody += "\nPeople with attachments.\n"; 
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


//-- last line must be a comment --