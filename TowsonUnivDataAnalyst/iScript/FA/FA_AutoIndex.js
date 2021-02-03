/************************************************************* @fileoverview<pre>
	Name:		FA_AutoIndex_ID_or_SSN.js
	Modified:	03/16/2020 by JMT & JM for FinAid - TH 331013
	Last Updated:	
	For Version:    7.2
--------------------------------------------------------------------------------
	Summary:         
		Does an external DB lookup to find the name of a student based on
		an empl id.  Reindexes document as follows:
        Uses STL functions

	Mod Summary:	
	     03/16/2020 - JMT & JM, TH 331013 , Add indexing script to FinAid intake queue
                      Make an auto indexing script for Financial Aid to easily add documents to IN for remote working.
                      Similar to GS script.
	Business Use:
		Intended to be an inscript on an autoindex queue

	@revision
</pre>*************************************************************************/


// *********************         Configuration        *******************

//******************************* LOGGING *****************************
var LOG_TO_FILE 		= true; // false - log to stdout if ran by intool, wf user if inscript.
var SPLIT_LOG_BY_THREAD = false; // set to true in high volume scripts when multiple worker threads are used (workflow, external message agent, etc)
var MAX_LOG_FILE_SIZE 	= 100; // Maximum size of log file (in MB) before a new one will be created							   // true  - log to inserverXX/log/ directory
var DEBUG_LEVEL 		= 5;  // 0 - 5.  0 least output, 5 most verbose
var debug = "";
var strThisScript = "FA_AutoIndex_ID_or_SSN.js";

//************************** INCLUDE Towson COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/TU_LIB_TU_FUNCTIONS.js"
#include "$IMAGENOWDIR6$/script/TU_LIB_DB_CONNECTION.js"  // Database configuration

//************************** INCLUDE STL COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/STL/packages/Logging/iScriptDebug.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Database/DBAccess.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Document/toINKeys.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Document/reindexDocument.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Workflow/routeItem.js"

// *********************       BEGIN  Configuration     *******************

//#define CONFIG_VERIFIED       true

//Index Values
#define IDX_EMPL_ID		field1
#define IDX_NAME		field2
#define IDX_DOC_TYPE	field3
#define IDX_DATE		field4
#define IDX_F5			field5  //JMT

//Queues
var QUEUE_ERROR         = "FinAid Group Link"
var QUEUE_NEXT		    = "FinAid Group Link"  //"REMOVE FROM WORKFLOW"


// *********************       End  Configuration     *******************

// ********************* Initialize global variables ********************


// ********************* Include additional libraries *******************
#link "sedbc" //needed for DBAccess

/** ****************************************************************************
  *	Main body of script.
  *
  * @param {none} None
  * @returns {void} None
  *****************************************************************************/
function main ()
{
    var strH = "----------------------------------------------------------------------------------------------------\n";
    var strF = "____________________________________________________________________________________________________\n";
    debug = new iScriptDebug("USE SCRIPT FILE NAME", LOG_TO_FILE, DEBUG_LEVEL, undefined, {strHeader:strH, strFooter:strF});
    debug.showINowInfo("INFO\n");
    debug.logAlways("INFO", "Script Version: $Id$\n");

		/*check script execution
		if(typeof(currentWfItem) != "undefined")  //intool
		{
			debug.log("CRITICAL", "This script is designed to run from intool.\n");  //intool
			//return false;
		}*/
   try
   {
	var emplid, name, ssn, dateStr = "", newDoc, now = new Date();
	var wfItem = new INWfItem(currentWfItem.id); // get current workflow item
	wfItem.getInfo();
	var wfDoc = new INDocument(wfItem.objectId); // get current document from wf item
	if(!wfDoc.getInfo())
	{
		debug.log("CRITICAL", "Couldn't get document info: %s\n", getErrMsg());
		return false;
	}

    //JMT - 01/21/2009 add log entry to see the user who sent item to workflow
	debug.log(5, "Processing %s\n", wfDoc);
	debug.log("INFO", "Current User: " + wfItem.queueStartUserName + "\n");

/*Main part of program here:
Look at Folder (EmplID) - if not null then set name and SSN based on EmplID
If Folder is null, look at F5 (SSN) - if not null then set name and EmplID based on SSN
If both Folder and F5 are null, then route to exception*/

	if (!wfDoc.IDX_EMPL_ID)  
	{
		//folder is null, look at F5
		if (!wfDoc.IDX_F5)
		{
			//folder and F5 null - route to exception and terminate
			debug.log("ERROR", "No Folder or F5 values\n\n");
			routeItem(wfItem, QUEUE_ERROR, "No Folder (EmplID) or F5 (SSN) values");
			return false;
		}  
		else   //F5 is not null use SSN to get other indexes
		{
			emplid = lookupID_by_SSN(wfDoc.IDX_F5);  //JMT use SSN in F5 as lookup Where value	
			name = lookupName_by_EmplID(emplid);  //JMT use above value as lookup Where criteria for name
			wfDoc.IDX_F5 = "";  //remove any SSN reference
			//ssn = wfDoc.IDX_F5;
		}
	}
	else    //Folder is not null use EmplID to get other indexes
	{	
		emplid = wfDoc.IDX_EMPL_ID;
		name = lookupName_by_EmplID(wfDoc.IDX_EMPL_ID);  //JMT use EmplID in Folder as lookup Where value
		//ssn = lookupSSN_by_EmplID(wfDoc.IDX_EMPL_ID);  //JMT use EmplID in Folder as lookup Where value	
	}

//  end of main section to find index values			##############

	if(!name)  //no match so route to exception queue
	{
		debug.log("NOTIFY", "Could not lookup name in external db\n\n");
		routeItem(wfItem, QUEUE_ERROR, "Could not lookup name");
		return false;  //all done, leave function
	}

	var newDoc = toINKeys(wfDoc);	//have a good match, set index values to returned results
	newDoc.IDX_EMPL_ID = emplid;
	newDoc.IDX_NAME = name;

	debug.log(5, "Reindexing to %s\n", newDoc);
	if(!reindexDocument(wfDoc, newDoc, "APPEND"))
	{
		debug.log("ERROR", "Could not reindex document\n");
		routeItem(wfItem, QUEUE_ERROR, "Could not reindex doc");
		return false;
	}

	debug.log("INFO", "Reindexed\n");

	if(QUEUE_NEXT == "REMOVE FROM WORKFLOW")
	{
		var item = "";
		wfItem.remove();
	}
	else if( QUEUE_NEXT)
	{
//		debug.log("DEBUG", "Routing to %s\n", QUEUE_NEXT);
		routeItem(wfItem, QUEUE_NEXT, "Auto ID / Name Indexed");
	}
  
  }
  catch(e)
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
  }

  finally
  {
    debug.finish();
    return;
  }

}

function trim(str)
{
	var rtn = str.replace(/^\s*/, '');
	rtn = rtn.replace(/\s*$/, '');
	return rtn;
}

/** ****************************************************************************
  *		Performs an external DB lookup (PeopleSoft) to retrieve the employees 
  *		Name
  *
  * @param {String} emplId Employee ID
  * @returns {String} Name of the Employee or false
  * @requires DB_DBAccess
  *****************************************************************************/
function lookupName_by_EmplID(emplId)
{
	var db, cursor, emplId, SQL = "", MiddleInit = "", NameSuffix = "";

	db = new DBAccess('ODBC', hostDSN, hostUsername, hostPW);
    //hostDSN = "CS9PRD";
	if(!db.open())
	{
		debug.log('CRITICAL', "Unable to open db\n");
		return false;
	}

/*
	Clib.sprintf(SQL, 'SELECT SYSADM_PS_PERSONAL_DATA.LAST_NAME & ", " & ' +
			"SYSADM_PS_PERSONAL_DATA.FIRST_NAME " +
			"FROM SYSADM_PS_PERSONAL_DATA " +
			'WHERE (SYSADM_PS_PERSONAL_DATA.EMPLID="%s")', emplId);
*/

//	Clib.sprintf(SQL, "SELECT SYSADM.PS_PERSONAL_DATA.LAST_NAME, SYSADM.PS_PERSONAL_DATA.FIRST_NAME FROM SYSADM.PS_PERSONAL_DATA WHERE SYSADM.PS_PERSONAL_DATA.EMPLID='%s'", emplId);
    Clib.sprintf(SQL, "SELECT SYSADM.PS_PERSONAL_DATA.LAST_NAME, SYSADM.PS_PERSONAL_DATA.FIRST_NAME, SYSADM.PS_PERSONAL_DATA.MIDDLE_NAME, SYSADM.PS_PERSONAL_DATA.NAME_SUFFIX FROM SYSADM.PS_PERSONAL_DATA WHERE SYSADM.PS_PERSONAL_DATA.EMPLID='%s'", emplId);

//   debug.log("DEBUG", "SQL=%s\n", SQL);
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
//	rtn = trim(cursor[0]) + "," + trim(cursor[1]) + " " + trim(cursor[2].substr(0,1));
//	rtn = trim(cursor[0])  + NameSuffix + ", " + trim(cursor[1]) + MiddleInit;
	rtn = trim(cursor[0])  + NameSuffix + "," + trim(cursor[1]) + " " + trim(cursor[2]);
	rtn = rtn.substr(0,40)  //limit the result to 40 characters for long names

	cursor.close();
	db.close();

	return rtn;
}

//----------------------------------------------------------------------
function lookupID_by_SSN(SSN)
{
	var db, cursor, SSN, SQL = "";

	db = new DBAccess("ODBC", hostDSN, hostUsername, hostPW);
//   hostDSN = "CS9PRD";

	if(!db.open())
	{
		debug.log('CRITICAL', "Unable to open db\n");
		return false;
	}

//	Clib.sprintf(SQL, "SELECT SYSADM.PS_PERSONAL_DATA.EMPLID FROM SYSADM.PS_PERS_NID INNER JOIN SYSADM.PS_PERSONAL_DATA ON SYSADM.PS_PERS_NID.EMPLID = SYSADM.PS_PERSONAL_DATA.EMPLID WHERE (((SYSADM.PS_PERS_NID.NATIONAL_ID)='%s') AND ((SYSADM.PS_PERS_NID.PRIMARY_NID)='Y'))", SSN);
	Clib.sprintf(SQL, "SELECT SYSADM.PS_PERS_NID.EMPLID FROM SYSADM.PS_PERS_NID WHERE ((SYSADM.PS_PERS_NID.NATIONAL_ID='%s') AND (SYSADM.PS_PERS_NID.PRIMARY_NID='Y'))", SSN);

//	debug.log("DEBUG", "SQL=%s\n", SQL);
	cursor = db.query(SQL, Database.dynamic);

	if(!cursor || !cursor.first())
	{
		debug.log("ERROR", "Could not get first row\n");
		return false;
	}
//return ID only
	rtn = trim(cursor[0]);  // + ", " + trim(cursor[1]);

	cursor.close();
	db.close();

	return rtn;
}
//