//DS_Import_AP_MEV.js
/********************************************************************************
Name:			DS_Import_AP_MEV.js
Author:			Jay Taffel (Copied from FA_Import_DocuSign.js by ECB)
Created:		03/26/2019 ECB - OPW TechHelp 259814; completed by Jay 20190521
Last Updated:	06/25/2019 TechHelp 294757 - JMT - Update import to use unique envelope ID instead of email subject. Also added timestamp to field5.
For Version:	7.x
Script Version: $Id$
---------------------------------------------------------------------------------
Summary:
		Imports Miscellaneous Expense Vouchers for AP.
Mod Summary: 
				06/25/2019 TechHelp 294757 - JMT - Update import to use unique envelope ID instead of email subject. Also added timestamp to field5.
				02/19/2020 TechHelp ###### JMT & JM Renaming the script filename from "AP_MEV_Import_DocuSign.js" to "DS_Import_AP_MEV.js"

				
Business Use:  
		Scheduled task to run once a day to import items from a network drive.
		
Program Logic:
	 Loop
		Get .csv file with index values of Payee Name (PayeeNameText). Use that to import PDF files and index them based on CSV value.
		PayeeNameText index value stored as Field2.
		All files to be hard coded as PayeeNameText, field4 MEV, doctype FS_AP_Vouchers.
		All files routed to Workflow queue: "FCC Start", eventually to AP_DocuSign_MEV_Review
		Rows in CSV file with missing PayeeName indicate that there was an attachment on the (likely) previous person's file. Log these.
		Send a summary email to Eric (maybe Julie Hall) with statistics including the list of people with attachments.
		
********************************************************************************/

//******************************* LOGGING *****************************
#include "$IMAGENOWDIR6$/script/STL/packages/Logging/iScriptDebug.js"
#define LOG_TO_FILE true // false - log to stdout if ran by intool, wf user if inscript.
                         // true  - log to inserverXX/log/ directory
#define DEBUG_LEVEL 4    // 0 - 5.  0 least output, 5 most verbose. Use 3 for normal operation since some STLs use 4/Info
var debug = "";
var strThisScript = "DS_Import_AP_MEV.js";

//************************** INCLUDE Towson COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/TU_LIB_TU_FUNCTIONS.js"

//************************** INCLUDE STL COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/STL/packages/Document/createDocument.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Date/convertToDateStr.js"
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
var IMPORT_DIR		= "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\AP\\";
var ARCHIVE_DIR		= "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\AP\\complete\\";
var ERROR_DIR		= "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\AP\\failed\\";

//Workflow Queues
var Q_COMPLETE = "FCC Start";
var Q_ERROR = "AP_DocuSign_MEV_Review_Error";

//Define CSV file fields
/***on index file, empty blank1 and index2 indicates an attachment, match filename and add PayeeNameText to attachment counter. Blank2 is a unique ID for that entire envelope, meaning index2 can be found by matching the unique ID (blank2) above it. Note, there may be two attachment lines in this solution
example index lines:
"Subject","ExpenseVoucher","PayeeNameText","Envelope Id"
"Miscellaneous Expense Voucher (Company) - Bart Simpson","ExpenseVoucher","Bart Simpson","79672567-1383-42b1-a394-333c6351dd1b"
"Miscellaneous Expense Voucher (Company) - Bart Simpson","","","79672567-1383-42b1-a394-333c6351dd1b"
"Miscellaneous Expense Voucher (Company) - Bart Simpson","","","79672567-1383-42b1-a394-333c6351dd1b"
***/
#define CSV_HEADER_LINE_COUNT 1  //0 no header
var CSV_CONFIG =
[
	{name:"EMailSubject"},
	{name:"blank1"},
	{name:"Index2"}, //PayeeNameText
	{name:"FileName"}  //TechHelp 294757
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
			debug.logln(5, "File [%s] | PayeeNameText [%s]", line["FileName"], line["Index2"]);

			//Check if have Payee. If so, save for next line. If not, then this person has an attachment.
			if (line["blank1"] =="")
			{
				//Update stuff for reporting
				cntAttachments++;
				var strNameInFile = line["FileName"];
				debug.logln(4, "It looks like an attachment for previous Payee [%s] | Current Payee [%s]", prevID, strNameInFile.slice(strNameInFile.search(" - ") + 3));
				arrHasAttachment.push(prevID + " " + strNameInFile.slice(strNameInFile.search(" - ") + 3));  //add to array for log
				continue;  //get next row in CSV. Nothing to import
			}
			else
			{
				prevID = line["Index2"];
			}

			//Only get to here if have something to import
			//See if listed file exists. if so, open and import, if not, log missing file.
			var fileToImport = IMPORT_DIR + line["FileName"] + ".pdf";
			fileExists = doesFileExist(fileToImport);
			if (fileExists) //it is there, get it and import into PC using CSV index values
			{
				cntFiles++;
				//Create new keys object and set them based on current wfDoc or query results
				var statusDate = new Date();  //TechHelp 294757
				var strNow = convertToDateStr(statusDate, "%datetime");
				var keys = new INKeys("FS AP Vouchers", "", line["Index2"], "", "MEV", strNow, "FS_AP_Vouchers");
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
		ListTo = "jmhall@towson.edu";
		//ListTo = "jtaffel@towson.edu, ebaumbusch@towson.edu";
		ListCC = "ebaumbusch@towson.edu";
		ListBCC = "";
		MailSubject = "AP MEV Import DocuSign Statistics";
		MailBody = "The script importing MEV DocuSign files into Perceptive Content has completed successfully.\n\n"; 
		MailBody += "CSV lines: " + (cntCSVRow + 1) + ".\n";
		MailBody += "Files read in: " + cntFiles + ".\n";
		MailBody += "Attachments: " + cntAttachments + ".\n";
		MailBody += "Files that could not be stored: " + cntFileError + ".\n";
		MailBody += "Files in index file but missing from import folder: " + cntFileMissing + ".\n";
		
		if (cntAttachments > 0)
		{
			MailBody += "\nNetID's of Payees that submitted MEV forms with attachments.\nBoth names should match.\n"; 
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