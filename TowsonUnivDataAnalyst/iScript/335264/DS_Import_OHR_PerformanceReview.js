/************************************************************* @fileoverview<pre>
Name:			DS_Import_OHR_PerformanceReview.js
Author:			Jay Taffel, Eric Baumbusch & Joshitha Mandali
Created:		04/21/2020 TechHelp 335264 JMT, JM & ECB
Last Updated:
For Version:	7.x
Script Version: $Id$
---------------------------------------------------------------------------------
Summary:
	    Hardcode the files with TUID", "db lookup for name","CompletedDate","Last4 SSN","Envelope Id"

Business Use:
		Scheduled task to run once a day to import items from a network drive.

Program Logic:
	    Loop
	    Get .csv file with index values of Candidate Name (CandidateNameText). Use that to import PDF files and index them based on CSV value.
	   	CandidateNameText index value stored as Field2.
		All files to be hard coded as "PerformanceReviewForm","TUIDText","CompletedDate","Envelope Id"
	    All files routed to Workflow queue: "FCC Start", eventually to "OHR_Error" on failure
	    Rows in CSV file with missing PayeeName indicate that there was an attachment on the (likely) previous person's file. Log these.
	    Send a summary email to Eric with statistics including the list of people with attachments.


</pre>*************************************************************************/

//******************************* LOGGING *****************************
#include "$IMAGENOWDIR6$/script/STL/packages/Logging/iScriptDebug.js"
#define LOG_TO_FILE true // false - log to stdout if ran by intool, wf user if inscript.
                         // true  - log to inserverXX/log/ directory
#define DEBUG_LEVEL 4    // 0 - 5.  0 least output, 5 most verbose. Use 3 for normal operation since some STLs use 4/Info
var debug = "";
var strThisScript = "TEST_DS_Import_OHR_PerformanceReview.js";

//************************** INCLUDE Towson COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/TU_LIB_TU_FUNCTIONS.js"
#include "$IMAGENOWDIR6$/script/TU_LIB_DB_CONNECTION.js"

//************************** INCLUDE STL COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/STL/packages/Document/createDocument.js"
#include "$IMAGENOWDIR6$/script/STL/packages/File/advancedArchiveFile.js"
#include "$IMAGENOWDIR6$/script/STL/packages/File/CSVObject.js"
#include "$IMAGENOWDIR6$/script/STL/packages/File/doesFileExist.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Workflow/createOrRouteDoc.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Document/toINKeys.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Workflow/routeItem.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Database/DBAccess.js"

// *********************         Configuration        *******************
// set to true when configuration values have been verified
#define CONFIG_VERIFIED		true

// ********************* Global variables ********************
//Import directories for Purchase_Order
var IMPORT_DIR = "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\OHR\\PerformanceReview\\";
var ARCHIVE_DIR = "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\OHR\\PerformanceReview\\complete\\";
var ERROR_DIR = "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\OHR\\PerformanceReview\\failed\\";

//Workflow Queues
var Q_COMPLETE     = "FCC Start";
var Q_ERROR        = "OHR_Error";

//Index Values
var idx_DRAWER     = "OHR_ER";
var idx_DOCTYPE    = "OHR_DS Performance Review Form";


//Define CSV file fields  ###need to update
/***on index file, empty blank1 and index2 indicates an attachment, match foldername and CandidateNameText to attachment counter.
"PerformanceReviewForm","TUIDText","CompletedDate","Envelope Id"
"PerformanceReviewForm","3453453","2020-04-20T20:20:21.0000000Z","8188a1cd-cbcc-4eb8-9cc5-00403081e00c"
"","","","8188a1cd-cbcc-4eb8-9cc5-00403081e00c"
                                                 
PC fields:
Drawer: OHR_ER
Field1: TUIDText
Field2: db lookup for name (TU_Func_LookupName_by_EmplID_OHR)
Field3: <blank>
Field4: CompleteDate
Field5: Last4 SSN (db lookup? or ignore?)
Type: OHR_DS Performance Review Form
***/

#define CSV_HEADER_LINE_COUNT 1  //0 no header
var CSV_CONFIG =
[
	{name:"EMailSubject"}, //OHR_ER drawer
	{name:"Field1"}, //TUID
	{name:"Field2"}, //CompletedDate
	{name:"FileName"}  //EnvelopeID.
];

//Array to store the CandidateNameText's of documents with duplicates/attachments
var arrHasAttachment = new Array;
var arrMissingFile = new Array;

//Counters for logging and reporting
var cntCSVRow = -1, cntFiles = 0, cntAttachments = 0, cntFileMissing = 0, cntFileError = 0, cntSQLError = 0;//counter for csv file

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

		//Look for csv file first
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
        	TU_Func_AlertINAdmins(strThisScript);  //alert the admins
        	return false;
        }

        //for each line...
        while (true)  //have a row in the csv file
		{
			var line = csv.getNextRowObject();
			if (!line) break;
			cntCSVRow++;
			debug.logln(4, "Folder [%s] | CandidateNameText [%s] ", line["FileName"], line["Field1"]);
			//Check if we have empty fields with the attachment, just continue
			if (line["Field1"] == "")
			{
				//Update stuff for reporting
				cntAttachments++;
				continue;  //get next row in CSV. Nothing to import
			}
			//Only get to here if have something to import
			//See if listed file exists. if so, open and import, if not, log missing file.
			var fileToImport = IMPORT_DIR + line["FileName"] + ".pdf";
			fileExists = doesFileExist(fileToImport);
			if (fileExists) //it is there, get it and import into PC using CSV index values
			{
				cntFiles++;

			    //do NAME lookup
			    var strEmpName = TU_Func_LookupName_by_EmplID_OHR(line["Field1"]); //MAIN call - get name from folder value i.e. TU ID
			    var strEmpSSN = TU_Func_LookupSSN4_by_EmplID_OHR(line["Field1"]); //MAIN call - get last 4 digits of SSN from folder value i.e. TU ID
			    //Parse date relevant value "2020-02-04T12:59:30" from "2020-02-04T12:59:30.0000000Z"
				var dateUpdated = line["Field2"];
				dateUpdated = dateUpdated.substr(0, 19);
				//Create new keys object and set them based on current wfDoc or query results
				var keys = new INKeys(idx_DRAWER, line["Field1"], strEmpName, "", dateUpdated, strEmpSSN, idx_DOCTYPE);
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
		var ListTo = (cntCSVRow == -1) ? "" : "";  //skip ListTo recipient. if no data rows in csv file
		ListCC = "ebaumbusch@towson.edu";
		ListBCC = "";
		MailSubject = "DS_Import_OHR_PerformanceReview";
		MailBody = "The script importing OHR PerformanceReview DocuSign files into Perceptive Content has completed successfully.\n\n";
		//Do NOT touch below
		MailBody += "CSV lines: " + (cntCSVRow + 1) + ".\n";
		MailBody += "Files read in: " + cntFiles + ".\n";
		MailBody += "Attachments: " + cntAttachments + ".\n";
		MailBody += "Files that could not be stored: " + cntFileError + ".\n";
		MailBody += "Files in index file but missing from import folder: " + cntFileMissing + ".\n";

		if (cntAttachments > 0)
		{
			MailBody += "\n TU_ID's of OHR Performance Review with attachments.\nBoth names should match.\n";
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

//last line must be a comment --