/********************************************************************************
	Name:			GS_Import_Transcripts.js
	Author:			Jay Taffel
	Created:		01/28/2020 - JMT TechHelp 318012
	Last Updated:	
	For Version:	7.x
	Script Version: $Id$
---------------------------------------------------------------------------------
    Summary:
		Used to import CollegeNET transcripts for the Grad Admissions solution.
		The file name contains the student bio-demo data. Parse the file name to save as index fields then route to FCC and then indexing queue
		The file names look like:
		Acosta_Kaitlyn_1901-12-31T0000-0400_Transcript_2889.pdf
		
	Mod Summary:
		mm/dd/yyyy - XXX - TechHelp ##
		
    Business Use:  
		intool - runs every 6 hours
		
********************************************************************************/

//******************************* LOGGING *****************************
var LOG_TO_FILE 		= true;    // false - log to stdout if ran by intool, true - log to inserverXX/log/ directory
var DEBUG_LEVEL 		= 5;       // 0 - 5.  0 least output, 5 most verbose
var SPLIT_LOG_BY_THREAD = false;   // set to true in high volume scripts when multiple worker threads are used (workflow, external message agent, etc)
var MAX_LOG_FILE_SIZE 	= 100;     // Maximum size of log file (in MB) before a new one will be created
var debug = "";
var strThisScript = "TEST GS_Import_Transcripts.js";

//************************** INCLUDE Towson COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/TU_LIB_TU_FUNCTIONS.js"

//************************** INCLUDE STL COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/STL/packages/Logging/iScriptDebug.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Document/createDocument.js"
#include "$IMAGENOWDIR6$/script/STL/packages/File/advancedArchiveFile.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Properties/PropertyManager.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Workflow/createOrRouteItem.js"

// *********************         Configuration        *******************
var IMPORT_DIR		= "\\\\customshare\\imagenowimport\\GS_Admissions\\GS_Transcripts_ET\\";
var ERROR_DIR		= "\\\\customshare\\imagenowimport\\GS_Admissions\\GS_Transcripts_ET\\failed\\";
var ARCHIVE_DIR		= "\\\\customshare\\imagenowimport\\GS_Admissions\\GS_Transcripts_ET\\complete\\";

//Index Values
var ADMISSIONS_DRAWER  = "GS Admissions";
var DOCTYPE_COLLEGE	= "Transcript - College";
var DOCTYPE_HS		= "Transcript - HS 9-12";
var DOCTYPE_ICE		= "UA International Credential Evaluation";

//Queues
var Q_STORE_DOCS	= "NONE";  //"FCC Start";  //from there to GS_DocSort
var Q_ERROR			= "GS_Error";

//Custom Properties
var CP_SSN			= "SSN";
var CP_BIRTH_DATE	= "Birth Date";

// *********************       End  Configuration     *******************

// ********************* Initialize global variables ********************
var propMgr = new PropertyManager();
var ARCHIVE_FILES = advancedArchiveFile.DELETE;  //What to do with file after import  NOARCHIVE

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
		
		//check script execution
		if(typeof(currentWfItem) != "undefined")  //intool
		{
			debug.log("CRITICAL", "This script is designed to run from intool.\n");  //intool
			//return false;
		}
		
		//Get array of pdf files to import
		var arrFileList = new Array();
		arrFileList = SElib.directory(IMPORT_DIR + "*.*", false, ~FATTR_SUBDIR);
		if(!arrFileList || arrFileList.length == 0)
		{
			debug.log("NOTIFY", "No files found in [%s]\n", IMPORT_DIR);
			return false;
		}
		
		//Have files to import. Begin.
		for(var i=0; i<arrFileList.length; i++)
		{
			var file = arrFileList[i].name;
			var fileNameParts = SElib.splitFilename(file);
			debug.log("INFO", "Processing [%s]\n", file);
			
			//Set out route based on file extension
			var strFileExt = fileNameParts.ext.toUpperCase();
			debug.logln(5,"strFileExt:[%s]",strFileExt);
			switch(strFileExt)
			{
				case(".PDF"):
					Q_STORE_DOCS = "FCC Start";  //pdfs get tunred into tiffs
					break;
				case(".TIF"):
					Q_STORE_DOCS = "GS_NO_TU_ID";  //ultimate end queue for all imports
					break;
				case(".TIFF"):
					Q_STORE_DOCS = "GS_NO_TU_ID";  //ultimate end queue for all imports
					break;
				default:  //skip this file
					debug.logln(3, "Current file is not a pdf or tif. Skipping");
					continue;  //get next file
					break;
			}  //end of switch

			//get file name parts for index values
			var indexKeys = fileNameParts.name.split("_");
			if(indexKeys.length != 5)
			{
				debug.log("NOTIFY", "Could not parse file name\n");
				advancedArchiveFile(file, ERROR_DIR, advancedArchiveFile.ARCHIVE);
				continue;
			}
			
			//Parse file name parts to usable index values. Modify as necessary based on imported file.
			var keys = new INKeys(ADMISSIONS_DRAWER, "", indexKeys[0], indexKeys[1], indexKeys[4], getFormattedDate_YYYYMMDDHHMMSS(new Date()), DOCTYPE_COLLEGE);  //see TU_LIB_TU_FUNCTIONS.js
			if(indexKeys[3] == "SECONDARY")
			{
				keys["docTypeName"] = DOCTYPE_HS;
			}
			if(indexKeys[3] == "Foreign Evaluation")
			{
				keys["docTypeName"] = DOCTYPE_ICE;
				keys[4] = "";
			}
			//Set queue to route to. Auto routing with createDoc
			keys.Q = Q_STORE_DOCS;
			
			var newDoc = createDocument(keys, file);
			if(!newDoc)
			{
				debug.log("ERROR", "Failed to store file [%s]\n", file);
				advancedArchiveFile(file, ERROR_DIR, advancedArchiveFile.ARCHIVE);
				continue;
			}
			//This file was added, archive based on above parameters
			advancedArchiveFile(file, ARCHIVE_DIR, ARCHIVE_FILES);

			//Set Custom Properties
			var propArr = new Array();
			//DOB is 2020-01-28T0000-0400 ==> date object of 01/28/2020
			var dob = indexKeys[2];
			dob = dob.substr(0,10);
			dob = dob.replace(/\D/g,'');  //remove all non-digits
			propArr.push({name:CP_BIRTH_DATE, value:getBirthDate(dob)});
			if(!propMgr.set(newDoc, propArr))
			{
				debug.log("ERROR", "Failed to set custom properties for document\n");
				createOrRouteItem(newDoc, Q_ERROR, "Failed to set custom properties");
				continue;
			}
		}  //end of for for each file in arrFileList
	}
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

// custom functions go here...
function getBirthDate(dateStr)
{
	var year = dateStr.substr(0,4);
	var month = dateStr.substr(4,2);
	var day = dateStr.substr(6,2)
	
	var date = new Date(year, month-1, day);
	return date;
}

//-- last line must be a comment --