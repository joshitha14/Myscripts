/********************************************************************************
Name:			AP_Import_DocuSign.js
Author:			Jay Taffel
Created:		02/10/2020 TechHelp 325904 JM Do not archive empty csv file and remove old archive files from secureshare
Last Updated:	
For Version:	6.x
Script Version: $Id$
---------------------------------------------------------------------------------
Summary:
		Imports and indexes College of Education Center for Professional Practice teacher mentor contracts and W9s.

Business Use:  
		Scheduled task to run once a day to import items from a network drive.
		
Program Logic:
	 Loop
		Get .csv file with index value of Name to import converted PDF files and index them based on CSV values of Name and DateSigned.
		Name field stored full name (Field2).
		Only read in csv lines with EnvelopeID = 1
		Delete last 5 pages after splitting multipage tiffs
		All files to be hard coded as DocumentType: FS_AP_Vouchers; Drawer: FS AP Vouchers
		All files routed to Workflow queue: "AP_DocuSign_Review"
		Send a summary email to JMHall with statistics.
		
Mod Summary: 
		04/02/2019 TechHelp 282089 - JMT - Check file name for ‘AU Eligible’,add to Field4. 
					Now importing pdfs vs. tifs. Use FCC. No need for split tiff and delete of last 5 pages. Change destination queue to ‘FCC Start.’
					Update to current STL standards.
		02/10/2020 TechHelp 325904 JMT & JM Do not archive empty csv file and remove old archive files from secureshare

********************************************************************************/

//******************************* LOGGING *****************************

#include "$IMAGENOWDIR6$/script/STL/packages/Logging/iScriptDebug.js"
#define LOG_TO_FILE true // false - log to stdout if ran by intool, wf user if inscript.
                         // true  - log to inserverXX/log/ directory
#define DEBUG_LEVEL 5    // 0 - 5.  0 least output, 5 most verbose. Use 3 for normal operation since some STLs use 4/Info
var debug = "";
var strThisScript = "TEST AP_Import_DocuSign.js";

//************************** INCLUDE Towson COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/TU_LIB_TU_FUNCTIONS.js"

//************************** INCLUDE STL COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/STL/packages/Document/createDocument.js"
#include "$IMAGENOWDIR6$/script/STL/packages/File/advancedArchiveFile.js"
#include "$IMAGENOWDIR6$/script/STL/packages/File/CSVObject.js"
#include "$IMAGENOWDIR6$/script/STL/packages/File/doesFileExist.js"
//#include "$IMAGENOWDIR6$/script/STL/packages/File/splitAndGetMultipageTif.js"
//#include "$IMAGENOWDIR6$/script/STL/packages/File/removeDirectoryAndFiles.js"
//#include "$IMAGENOWDIR6$/script/STL/packages/System/exec.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Workflow/createOrRouteItem.js"
#include "$IMAGENOWDIR6$/script/STL/packages/File/getFiles.js"
// *********************         Configuration        *******************

// ********************* Global variables ********************
//Import directories
/*var IMPORT_DIR		= "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\CPP\\Ready_for_Import\\";
var ARCHIVE_DIR		= "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\CPP\\Ready_for_Import\\complete\\";
var ERROR_DIR		= "\\\\secureshare\\ots-docusign\\ImageNowImport\\DocuSign_Retrieve\\CPP\\Ready_for_Import\\failed\\";
*/
var IMPORT_DIR		= "\\\\customshare\\ImageNowImport\\TEST\\";
var ARCHIVE_DIR		= "\\\\customshare\\ImageNowImport\\TEST\\complete\\";
var ERROR_DIR		= "\\\\customshare\\ImageNowImport\\TEST\\failed\\";

//Workflow Queues
var Q_COMPLETE = "AP_DocuSign_AU_Review";  //"FCC Complete" //###"FCC Start" //"AP_DocuSign_Review"; TechHelp 282089
var Q_ERROR = "AP_DocuSign_Review_Error";

/***************************  TechHelp 282089
//SplitTiff variables
var TEMP_DIR			= "D:\\inserver\\temp\\Import_AccountsPayable\\";  // Split tiffs are temporarily put in this folder
var SCRIPT_UTILITIES 	= "D:\\inserver\\script_utilities\\";  // Tiffsplit.exe location
var TIFF_SPLIT_PREFIX 	= SCRIPT_UTILITIES + "tiffsplit.exe ";
//var ARCHIVE_FILES		= true; //false  true to archive, false to delete
//*************************/

//Define CSV file fields
#define CSV_HEADER_LINE_COUNT 1  //0 no header; header names from csv file: "Subject","CPPContracts","Name","EmailID","DateSigned","Document ID","Envelope Id"
var CSV_CONFIG =
[
	{name:"FileName"},
	{name:"blank2"},
	{name:"Name"},
	{name:"EmailID"},
	{name:"DateSigned"},
	{name:"DocumentID"},
	{name:"EnvelopeID"}
];

//Standard doc index values
var DRAWER = "FS AP Vouchers";
var DOCTYPE = "FS_AP_Vouchers";

//Array to store the NetID's of documents with duplicates/attachments
//var arrHasAttachment = new Array; no attachments being collected for this solution
var arrMissingFile = new Array;

//Counters for logging and reporting
//on index file, empty index1, index3 and blank2 indicates an attachment, match filename and add ID to attachment counter
var cntCSVRow = 0;  //counter for csv file
var cntFiles = 0;
//var cntAttachments = 0;
var cntFileMissing = 0;
var cntFileError = 0;
var cntSQLError = 0;

//Other Variables
//var prevID = ""; no attachments, so no need to find prevID from prior csv line
//SendMail buffer
var errbuf = " ";

// ********************* Include additional libraries *******************

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

		
		
TU_DeleteArchivedFiles(ARCHIVE_DIR,10);
return;
		
		
		
		
		
		
		/*TechHelp 282089 - BEGIN - No need to manage
		// clear out temp directory. Archive all files to complete folder if find anything.
		var tempFiles = SElib.directory(TEMP_DIR + "*.*", false, ~FATTR_SUBDIR);
		if(tempFiles && tempFiles.length > 0)
		{
			debug.log("WARNING", "There were files found in the temp directory\n");
			for(var i=0; i<tempFiles.length; i++)
			{
				advancedArchiveFile(tempFiles[i].name, ARCHIVE_DIR, advancedArchiveFile.ARCHIVE);
			}  
		}TechHelp 282089 - END - No need to manage*/

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
			debug.log("NOTIFY", "No csv files found in [%s]\n", IMPORT_DIR);
			return false;
		}
		//open csv
		var csv = new CSVObject(CSV_FILE[0].name, CSV_CONFIG, {intHeaderLen:CSV_HEADER_LINE_COUNT, delim:','});
		debug.logln(4,"CSV file to open [%s]", CSV_FILE[0].name);
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
			debug.log(4, "File [%s] | Name [%s] | DocumentID [%s] \n", line["FileName"], line["Name"], line["DocumentID"]);

			//only read lines with DocumentID equal to 1, as other lines are dupes
			if (line["DocumentID"] != "1") continue;
			
			//See if listed file exists. if so, open and import, if not, log missing file.
			var fileToImport = IMPORT_DIR + line["FileName"] + ".pdf";  //TechHelp 282089
			//value in csv is different than true file name. Subject has non-Windows file characters. Need to change so entry matches file names.
			fileToImport = fileToImport.replace(":", "-");  //all entries
			fileToImport = fileToImport.replace(/\. /g, "- ");  //Changes middle initial periods to dashes. OK for middle initial with and without period, apostrophe and hyphenated; 
			fileExists = doesFileExist(fileToImport);
			if (fileExists) //it is there, get it and import into PC using CSV index values
			{
				cntFiles++;
				/*  BEGIN TechHelp 282089. No need to convert from tif to pdf
				//Create 2 arrays of splitTIFF files. One set to import the other to skip
				var filesToImport = new Array();
				var filesToSkip = new Array();
				filesToImport = splitAndGetMultipageTif(fileToImport, TEMP_DIR, TIFF_SPLIT_PREFIX);
				if(!filesToImport || filesToImport.length == 0)
				{
					debug.log("ERROR", "Could not split multipage tiff\n");
					advancedArchiveFile(fileToImport, ERROR_DIR, advancedArchiveFile.ARCHIVE);
					continue;
				}
				debug.log(5,"filesToImport.length [%s]\n",filesToImport.length);
				//Get rid of last 5 pages. 
				filesToSkip = filesToImport.splice((filesToImport.length - 5), 5);  //skip last 5 pages. I9 instructions
				debug.log(5,"filesToSkip.length [%s]\n",filesToSkip.length);
				END TechHelp 282089 */

				//Create new keys object and set them based on current wfDoc or query reults
				//TechHelp 282089 - Have 2 different set of keys if file name contains 'AU Eligible'
				if (fileToImport.indexOf("AU Eligible") > -1)
				{
					var keys = new INKeys(DRAWER, "", line["Name"], "", "AU Eligible", line["DateSigned"], DOCTYPE);  //is part of file name
				}
				else
				{
					var keys = new INKeys(DRAWER, "", line["Name"], "", "", line["DateSigned"], DOCTYPE);  //is not part of file name
				}

				//Make a new doc from the file
				//TechHelp 282089 - use current STL library
				var newDoc = createDocument(keys, fileToImport);  //only 1 pdf. will go to FCC for later processing.
				if(!newDoc)
				{
					cntFileError++;
					debug.log("ERROR", "Failed to store file [%s]\n", fileToImport);
					advancedArchiveFile(fileToImport, ERROR_DIR, advancedArchiveFile.ARCHIVE);
					continue;
				}
				
				//Create the doc and add to workflow
				createOrRouteItem(newDoc, Q_COMPLETE, "doc imported");

				/*TechHelp 282089 - BEGIN - No need to manage
				// Delete all the split tiff files, BOTH imported and skipped files
				for(var idx in filesToImport)
				{
					advancedArchiveFile(filesToImport[idx], TEMP_DIR, advancedArchiveFile.DELETE);
				}
				for(var idx in filesToSkip)
				{
					advancedArchiveFile(filesToSkip[idx], TEMP_DIR, advancedArchiveFile.DELETE);
				}  TechHelp 282089 - END*/

				//Successfully added the tiff file contents to IN. Archive the tiff file (or not)
				//###advancedArchiveFile(fileToImport, ARCHIVE_DIR, advancedArchiveFile.DELETE);  //advancedArchiveFile.ARCHIVE);
				debug.log(4, "Completed import and archive of this file.\n");
			}
			else  //no file for current CSV line
			{
				cntFileMissing++;
				debug.log(5, "No file matching current CSV line!\n");
				debug.log(5, "\nCSV value [%s]\nfileToImport [%s]\n", line["FileName"], fileToImport);
				arrMissingFile.push(fileToImport);  //add to array for log
			}
		
		}  //get next line in CSV file

		//BEGIN of TechHelp 325904
		//Finished with csv file. Process by delete or archive
		csv.closeFile();
		debug.logln(5, "cntCSVRow [%s]", cntCSVRow);
		if (cntCSVRow < 1)  //delete file if rows are empty
		{
			advancedArchiveFile(CSV_FILE[0].name, ARCHIVE_DIR, advancedArchiveFile.DELETE);
			debug.logln(5, "advancedArchiveFile(): Successfully deleted [%s]", CSV_FILE[0].name);
			return true;
		}
		//END of TechHelp 325904
		//If get to here then Index file had other files to import
		//Archive the index file with a timestamp since Retreive uses the same filename every time
		advancedArchiveFile(CSV_FILE[0].name, ARCHIVE_DIR, advancedArchiveFile.ARCHIVETIMESTAMP);
		
		//Finish the logging
        debug.log(3, "LOOK HERE\n");
		debug.log(3, "CSV lines: %s\n", cntCSVRow + 1);
		debug.log(3, "Files read in: %s\n", cntFiles);
		//debug.log(3, "Attachments: %s\n", cntAttachments);
		debug.log(3, "Files that could not be stored: %s\n", cntFileError);
		debug.log(3, "Files in index file but missing from import folder: %s\n", cntFileMissing);
		//debug.log(3, "SQL errors from PS: %s\n", cntSQLError);

		//Send email of summary stats to interested parties
		//set the parts of the SendMail function
		//ListTo = "JMHall@towson.edu";
		ListTo = "jtaffel@towson.edu, ebaumbusch@towson.edu";
		ListCC = "ebaumbusch@towson.edu";
		ListBCC = "";
		MailSubject = "TEST AP_Import_DocuSign Statistics";
		MailBody = "The script importing DocuSign files into Perceptive Content has completed successfully.\n\n"; 
		MailBody += "CSV lines: " + (cntCSVRow + 1) + ".\n";
		MailBody += "Files read in: " + cntFiles + ".\n";
		//MailBody += "Attachments: " + cntAttachments + ".\n";
		MailBody += "Files that could not be stored: " + cntFileError + ".\n";
		MailBody += "Files in index file but missing from import folder: " + cntFileMissing + ".\n";
		//MailBody += "Files with SQL errors from PeopleSoft routed to error queue: " + cntSQLError + ".\n\n";
		/**
		if (cntAttachments > 0)
		{
			MailBody += "NetID's of students that submitted FA forms with attachments.\n\n"; 
			for (var i=0; i<arrHasAttachment.length; i++)
			{
				MailBody += arrHasAttachment[i] +"\n";
			}  //end of for arrNetIDs email
		}  */
		if (cntFileMissing > 0)
		{
			MailBody += "\nMissing files listed below\n"; 
			for (var i=0; i<arrMissingFile.length; i++)
			{
				MailBody += "<" + arrMissingFile[i] +">\n\n";
			}  //end of for arrNetIDs email
		}
		MailBody = MailBody + "\n";
		
		//###SendMail("ImageNow_Server@towson.edu", ListTo, ListCC, ListBCC, MailSubject, MailBody, "mail.towson.edu", "imaging.towson.edu", errbuf);

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
		debug.log(5, "In Finally:\n");
		/*  BEGIN TechHelp 282089. No need to convert from tif to pdf
		//Get rid of directory that was made to clean things up
		if (!removeDirectoryAndFiles(TEMP_DIR))
		{
			debug.log(1, "Failed to delete directory and files in [%s]\n", TEMP_DIR);
			return false;
		}
		Clib.mkdir(TEMP_DIR);  //recreate directory  */
		if(debug)
		{
			debug.finish();
		}
	}
}

// ********************* Function Definitions **********************************
/********************************
 * Converts IN javascript date to Oracle date format for Where clause
 Use file attribute .DateCreated to get the archived file create date
 If that date is >= intDays from today then delete it, otherwise keep the file
 * By Jay Taffel 02/10/2020
 * Input is date in javascript   
 * Output is date for Oracle as 16-MAY-2014 to be used in SQL Where clause
 *********************************/


//************************** INCLUDE STL COMMON FUNCTIONS ***********************

function TU_DeleteArchivedFiles(path, intDays) 
#include "$IMAGENOWDIR6$/script/STL/packages/Date/dateDiff.js"
{
	//Get today
	var dteToday = new Date();
	var arrArchiveFiles = SElib.directory(path + "*.csv", false, ~FATTR_SUBDIR);
	for (var i = 1; i <= arrArchiveFiles.length ; i++)
	{
		debug.logln(5,"arrArchiveFiles [%s] | Date Created [%s]", i, arrArchiveFiles[i].DateCreated);
		intDaysOld = dateDiff(dteToday, arrArchiveFiles[i].DateCreated);
		debug.logln(5,"intDaysOld [%s]", intDaysOld);
		if(dateDiff <= abs(intDays)) continue;  //nothing to do here, get next file
		//Get to here> Delete this old archive file
		var booDeleteArchive = advancedArchiveFile(arrArchiveFiles[i].name, path, advancedArchiveFile.DELETE)
		if(booDeleteArchive)
		{
			debug.logln(5, "TU_DeleteArchivedFiles: Successfully deleted [%s]", arrArchiveFiles[i].name);
		}
		else
		{
			debug.logln(2, "TU_DeleteArchivedFiles: FAILED to delete [%s]", path + "\" + arrArchiveFiles[i].name);
		}
	}  //end of for
return true;
}


//-- last line must be a comment --
