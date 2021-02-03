/************************************************************* @fileoverview<pre>
Name:			Purchase_Order.js
Author:			Jay Taffel, Eric Baumbusch & Joshitha Mandali
Created:		04/16/2020 TechHelp ###### JMT, JM & ECB
Last Updated:
For Version:	7.x
Script Version: $Id$
---------------------------------------------------------------------------------
Summary:
		Get .csv file with index values of Candidate Name (CandidateNameText). Use that to import PDF files and index them based on CSV value.
		Get the PDF files from the unique ID folder and hard coded as "CompleteName","PONoText","CODropdown","CompletedDate","Envelope Id"

Business Use:  
		Scheduled task to run once a day to import items from a network drive.
		
Program Logic:
	    Loop
	    Open .csv file get the Filename (unique Envelope Id).
	    Go to the SUBDIR and search for the folder with unique Filename and get all the .pdf attachments from the filename folder
	    Convert .pdf to .tiff
	    Go back to .csv file and get the remaining attachments
        Tiff files Route to the workflow queue: "FCC start". pdf file attachments to the "PO_Index"
		Send a summary email to Eric, Heather Wilson with statistics including the list of people with attachments.

</pre>*************************************************************************/

//******************************* LOGGING *****************************
#include "$IMAGENOWDIR6$/script/STL/packages/Logging/iScriptDebug.js"
#define LOG_TO_FILE true // false - log to stdout if ran by intool, wf user if inscript.
                         // true  - log to inserverXX/log/ directory
#define DEBUG_LEVEL 4    // 0 - 5.  0 least output, 5 most verbose. Use 3 for normal operation since some STLs use 4/Info
var debug = "";
var strThisScript = "TEST_Purchase_Order.js";

//************************** INCLUDE Towson COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/TU_LIB_TU_FUNCTIONS.js"

//************************** INCLUDE STL COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/STL/packages/Document/createDocument.js"
#include "$IMAGENOWDIR6$/script/STL/packages/File/advancedArchiveFile.js"
#include "$IMAGENOWDIR6$/script/STL/packages/File/CSVObject.js"
#include "$IMAGENOWDIR6$/script/STL/packages/File/doesFileExist.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Workflow/createOrRouteDoc.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Document/toINKeys.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Workflow/routeItem.js"


// *********************         Configuration        *******************
// set to true when configuration values have been verified
#define CONFIG_VERIFIED		true

// ********************* Global variables ********************
//Import directories for Purchase_Order
var IMPORT_DIR = "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\Procurement\\PurchaseOrder";
var ARCHIVE_DIR = "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\Procurement\\PurchaseOrder";
var ERROR_DIR = "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\Procurement\\PurchaseOrder";

//Workflow Queues
var Q_COMPLETE = "FCC Start";
var Q_COMPLETE_PDF = "PO_Index";
var Q_ERROR = "";

//Index Values
var idx_DRAWER = "Procurement_PO";
var idx_DOCTYPE1 = "PO_Attachment";
var idx_DOCTYPE2 = "PO_DS Certification";
var idx_DOCTYPE3 = "PO_Processing Form";

//Define CSV file fields  ###need to update
/***on index file, empty blank1 and index2 indicates an attachment, match filename and CandidateNameText to attachment counter.
"PurchaseOrderProcessing","CompleteName","PONoText","CODropdown","CompletedDate","Envelope Id"
"PurchaseOrderProcessing","Michelle Compton - PO 9477 CO #1","9477","1","2020-04-07T20:18:35.0000000Z","ec76375d-f82a-4cee-84e7-16c3d4fa7553"
"","","","","","ec76375d-f82a-4cee-84e7-16c3d4fa7553"
"","","","","","ec76375d-f82a-4cee-84e7-16c3d4fa7553"
"PurchaseOrderProcessing","Lauren Davin - 10783","10783","N/A","2020-04-08T14:16:08.0000000Z","ecdc8018-358b-4fdf-a7eb-a75215860b17"
"","","","","","ecdc8018-358b-4fdf-a7eb-a75215860b17"
"","","","","","ecdc8018-358b-4fdf-a7eb-a75215860b17"
"","","","","","ecdc8018-358b-4fdf-a7eb-a75215860b17"

***/
#define CSV_HEADER_LINE_COUNT 1  //0 no header
var CSV_CONFIG =
[
	{name:"EMailSubject"}, //PurchaseOrderProcessing
	{name:"Field1"}, //CompleteName
	{name:"Field2"}, //PONoText
	{name:"Field3"}, //CODropdown
	{name:"Field4"}, //CompletedDate
	{name:"FileName"}  //DocuSign envelopeID.
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

		//if get to here, have DocuSign files that need importing to IN
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
        while (true)
		{
			var line = csv.getNextRowObject();
			if (!line) break;
			cntCSVRow++;
			debug.log(4, "File [%s] | CandidateNameText [%s]\n", line["FileName"], line["Field1"], line["Field2"]);

			//See if listed pdf file exists. if so, open and import, if not, log missing file.
			var fileToImport = IMPORT_DIR + line["FileName"] + ".pdf";
            fileExists = doesFileExist(fileToImport);
			if (fileExists) //it is there, get it and import into PC using CSV index values
			{
				cntFiles++;

				//Create new keys object and set them based on current wfDoc or query results
				var keys = new INKeys(idx_DRAWER, line["Field1"], line["Field2"], line["Field3"],  line["Field4"], idx_DOCTYPE);
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
				debug.log(1, "No PDF file matching current CSV line!\n");
				debug.log(1, "\n CSV value [%s]\n fileToImport [%s]\n", line["FileName"], fileToImport);
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
		var ListTo = (cntCSVRow == -1) ? "" : "ebaumbusch@towson.edu";  //skip ListTo recipient. if no data rows in csv file
		ListCC = "jmanda2@students.towson.edu";
		ListBCC = "";
		MailSubject = "Purchase_Order DocuSign Statistics";
		MailBody = "The script importing Purchase_Order DocuSign files into Perceptive Content has completed successfully.\n\n";
		//Do NOT touch below
		MailBody += "CSV lines: " + (cntCSVRow + 1) + ".\n";
		MailBody += "Files read in: " + cntFiles + ".\n";
		MailBody += "Attachments: " + cntAttachments + ".\n";
		MailBody += "Files that could not be stored: " + cntFileError + ".\n";
		MailBody += "Files in index file but missing from import folder: " + cntFileMissing + ".\n";

		if (cntAttachments > 0)
		{
			MailBody += "\n Purchase_Order with attachments.\nBoth names should match.\n";
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