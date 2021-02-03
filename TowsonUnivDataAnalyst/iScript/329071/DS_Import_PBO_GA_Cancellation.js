//DS_Import_PBO_GA_Cancellation.js
/********************************************************************************
Name:			DS_Import_PBO_GA_Cancellation.js
Author:			Jay Taffel, Eric Baumbusch & Joshitha Mandali
Created:		04/06/2020 JMT, ECB & JM - TechHelp 329071; to be reviewed by JMT & ECB
Last Updated:	04/06/2020 JMT, JM & ECB: TechHelp 329071-
For Version:	7.x
Script Version: $Id$
---------------------------------------------------------------------------------
Summary:
		Imports GraduateAssistantship Cancellation forms for PBO. Hardcode the files with TUID", "CandidateName","FiscalYearDropdown","CompletedDate","Envelope Id"

Mod Summary:
		04/06/2020 TechHelp 329071 JMT, ECB & JM
		04/07/2020 TechHelp 329071 Added to Dev instance, set TEST prefix to strThisScript, removed Heather from MailTo, added JM to CC.

Business Use:
		Scheduled task to run once a day to import items from a network drive.
		
Program Logic:
	 Loop
		Get .csv file with index values of Candidate Name (CandidateNameText). Use that to import PDF files and index them based on CSV value.
		CandidateNameText index value stored as Field2.
		All files to be hard coded as "TUID", "CandidateName","FiscalYearDropdown","CompletedDate","Envelope Id"
		All files routed to Workflow queue: "FCC Start", eventually to "AP_DocuSign_Candidate" //need to discuss
		Rows in CSV file with missing PayeeName indicate that there was an attachment on the (likely) previous person's file. Log these.
		Send a summary email to Eric, Heather Wilson with statistics including the list of people with attachments.

********************************************************************************/

//******************************* LOGGING *****************************
#include "$IMAGENOWDIR6$/script/STL/packages/Logging/iScriptDebug.js"
#define LOG_TO_FILE true // false - log to stdout if ran by intool, wf user if inscript.
                         // true  - log to inserverXX/log/ directory
#define DEBUG_LEVEL 4    // 0 - 5.  0 least output, 5 most verbose. Use 3 for normal operation since some STLs use 4/Info
var debug = "";
var strThisScript = "DS_Import_PBO_GA_Cancellation.js";

//************************** INCLUDE Towson COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/TU_LIB_TU_FUNCTIONS.js"
#include "$IMAGENOWDIR6$/script/TU_LIB_DB_CONNECTION.js"

//************************** INCLUDE STL COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/STL/packages/Document/createDocument.js"
#include "$IMAGENOWDIR6$/script/STL/packages/File/advancedArchiveFile.js"
#include "$IMAGENOWDIR6$/script/STL/packages/File/CSVObject.js"
#include "$IMAGENOWDIR6$/script/STL/packages/File/doesFileExist.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Workflow/createOrRouteDoc.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Workflow/routeItem.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Document/toINKeys.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Database/DBAccess.js"

// *********************         Configuration        *******************
// set to true when configuration values have been verified
#define CONFIG_VERIFIED		true

// ********************* Global variables ********************
//Import directories for GA_Cancellation
var IMPORT_DIR = "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\PBO\\GA_Cancellation\\";
var ARCHIVE_DIR = "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\PBO\\GA_Cancellation\\complete\\";
var ERROR_DIR = "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\PBO\\GA_Cancellation\\failed\\";

//Workflow Queues
var Q_COMPLETE = "FCC Start";
var Q_ERROR = "";  //### need to build. where?

//Index Values
var idx_DRAWER = "PBO_GA_Appointments";
var idx_DOCTYPE = "PBO_GA_Cancellation"; //Double check once

//Define CSV file fields  ###need to update
/***on index file, empty blank1 and index2 indicates an attachment, match filename and add CandidateNameText to attachment counter. Blank2 is a unique ID for that entire envelope, meaning index2 can be found by matching the unique ID (blank2) above it. Note, there may be two attachment lines in this solution
example index lines:
"GraduateAssistantshipAppointment","TUID","FiscalYearDropdown","CompletedDate","Envelope Id"
"GraduateAssistantshipAppointment","0701222","2019-2020","2020-02-04T12:59:30.0000000Z","3e805603-081b-4249-ab81-12e7af1ed2c5"
"","","","","3e805603-081b-4249-ab81-12e7af1ed2c5"

Above maps to:
Field1: TUID 
Field2: SQL for Name,
Field3: FiscalYearDropdown,
Field4: <blank>
Field5: CompletedDate
***/
#define CSV_HEADER_LINE_COUNT 1  //0 no header
var CSV_CONFIG =
[
	{name:"EMailSubject"}, //GraduateAssistantshipCancellation
	{name:"Field1"}, //TU ID
	{name:"Field3"}, //FiscalYearDropdown
	{name:"Field5"}, //CompletedDate
	{name:"FileName"}  //DocuSign envelopeID.
];
//	{name:"Field2"}, //Employee name

//Array to store the CandidateNameText's of documents with duplicates/attachments
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
var errbuf = " "; //*** needs to be discussed

//********************* Include additional libraries *******************
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
			debug.logln(5, "File [%s] | CandidateNameText [%s]", line["FileName"], line["Field1"]);

			//Only get to here if have something to import
			//See if listed file exists. if so, open and import, if not, log missing file.
			var fileToImport = IMPORT_DIR + line["FileName"] + ".pdf";
			//value in csv is different than true file name. Subject has non-Windows file characters. Need to change so entry matches file names.
			fileToImport = fileToImport.replace("Sign:", "Sign-");  //all entries
			fileToImport = fileToImport.replace("Agreement:", "Agreement-");  //all entries
			fileToImport = fileToImport.replace(/\. /g, "- ");  //Changes middle initial periods to dashes
			fileExists = doesFileExist(fileToImport);
			if (fileExists) //it is there, get it and import into PC using CSV index values
			{
				cntFiles++;
    		    //do NAME lookup
			    var strEmpName = TU_Func_LookupName_by_EmplID_OHR(line["Field1"]); //MAIN call - get name from folder value i.e. TU ID
			    //Pulling the date and time till 19 characters "2020-02-04T12:59:30" from "2020-02-04T12:59:30.0000000Z"
				var dateUpdated = line["Field5"];
				var result = dateUpdated.substr(0, 19);
				//Create new keys object and set them based on current wfDoc or query results
				var keys = new INKeys(idx_DRAWER, line["Field1"], strEmpName, line["Field3"], "", result, idx_DOCTYPE);
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
				advancedArchiveFile(fileToImport, ARCHIVE_DIR, advancedArchiveFile.DELETE);  //advancedArchiveFile
				debug.logln(4, "Completed import and archive of this tif file.");

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
		
		//Remove old files in archive dir
		TU_DeleteArchivedFiles(ARCHIVE_DIR,14);

		//Finish the logging
		debug.log(3, "LOOK HERE\n");
		debug.log(3, "CSV lines: %s\n", cntCSVRow + 1);
		debug.log(3, "Files read in: %s\n", cntFiles);
		debug.log(3, "Attachments: %s\n", cntAttachments);
		debug.log(3, "Files that could not be stored: %s\n", cntFileError);
		debug.log(3, "Files in index file but missing from import folder: %s\n", cntFileMissing);

		//Send email of summary stats to interested parties
		//set the parts of the SendMail function
		var ListTo = (cntCSVRow == -1) ? "" : "hwilson@towson.edu";  //skip ListTo recipient. if no data rows in csv file
		ListCC = "ebaumbusch@towson.edu";
		ListBCC = "";
		MailSubject = "DS_Import_PBO_GA_Cancellation DocuSign Statistics";
		MailBody = "The script importing GraduateAssistantship Cancellation DocuSign files into Perceptive Content has completed successfully.\n\n";
		//Do NOT touch below
		MailBody += "CSV lines: " + (cntCSVRow + 1) + ".\n";
		MailBody += "Files read in: " + cntFiles + ".\n";
		MailBody += "Attachments: " + cntAttachments + ".\n";
		MailBody += "Files that could not be stored: " + cntFileError + ".\n";
		MailBody += "Files in index file but missing from import folder: " + cntFileMissing + ".\n";
		
		if (cntAttachments > 0)
		{
			MailBody += "\nTU_ID's of GraduateAssistantship Cancellation with attachments.\nBoth names should match.\n";
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
//End of Towson functions

//-- last line must be a comment --