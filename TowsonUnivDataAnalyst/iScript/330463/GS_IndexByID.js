/************************************************************* @fileoverview<pre>
	Name:           GS_IndexByID.js
	Author:         ImageNow Service Team
	Created:        03/12/2020 JM - TH 330463
	Last Updated:	
	For Version:    7.2
--------------------------------------------------------------------------------
	Summary:         
		Does an external DB lookup to find the name of a student based on
		an empl id.  Reindexes document by only changing Field2 / Name if success

		Uses STL functions
		
	Mod Summary:
		mm/dd/yyyy - who, TH###, what
	
	Business Use:
		Intended to be an inscript on an autoindex queue

	@revision 
</pre>*************************************************************************/

// *********************         Configuration        *******************

//******************************* LOGGING *****************************
#include "$IMAGENOWDIR6$/script/STL/packages/Logging/iScriptDebug.js"
#define LOG_TO_FILE 	true // false - log to stdout if ran by intool, wf user if inscript.
							 // true  - log to inserverXX/log/ directory
#define DEBUG_LEVEL 	4    // 0 - 5.  0 least output, 5 most verbose
var debug = "";
var strThisScript = "GS_IndexByID.js";

//************************** INCLUDE Towson COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/TU_LIB_TU_FUNCTIONS.js"
#include "$IMAGENOWDIR6$/script/TU_LIB_DB_CONNECTION.js"  // Database configuration

//************************** INCLUDE STL COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/STL/packages/Database/DBAccess.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Document/toINKeys.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Document/reindexDocument.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Document/setDocNotes.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Workflow/routeItem.js"

// *********************       BEGIN  Configuration     *******************
// *** index fields ***
#define IDX_F1_EMPL_ID	field1
#define IDX_F2_NAME		field2
#define IDX_F3			field3
#define IDX_F4			field4
#define IDX_F5_DATE		field5

// *** queues ****
// If there's a problem, send the item here
#define QUEUE_ERROR		"GS_Error"

// If not false, items will be routed to this queue after successful index
#define QUEUE_NEXT		""

// *********************       End  Configuration     *******************

// ********************* Initialize global variables ********************

// ********************* Include additional libraries *******************
#link "sedbc"  //needed for DBAccess

// ********************* Function definitions ***************************

// ----------------------------------------------------------------------
// Function:    main
// Purpose:     Main body of script.
// Args:        none
// Returns:     none
// ----------------------------------------------------------------------
function main ()
{
	var strH = "----------------------------------------------------------------------------------------------------\n";
	var strF = "____________________________________________________________________________________________________\n";
	debug = new iScriptDebug("USE SCRIPT FILE NAME", LOG_TO_FILE, DEBUG_LEVEL, undefined, {strHeader:strH, strFooter:strF});
	debug.showINowInfo("INFO");

	try
	{
		var name, dateStr = "", newDoc, now = new Date();
		var wfItem = new INWfItem(currentWfItem.id); // get current workflow item
		wfItem.getInfo();
		var wfDoc = new INDocument(wfItem.objectId); // get current document from wf item
		if(!wfDoc.getInfo())
		{
			debug.log("CRITICAL", "Couldn't get document info: %s\n", getErrMsg());
			return false;
		}

		debug.log(5, "Processing %s\n", wfDoc);
		debug.log("INFO", "Current User: " + wfItem.queueStartUserName + "\n");

		name = lookupName(wfDoc.IDX_F1_EMPL_ID);  //MAIN call - get PS name from folder value i.e. TU ID

		if(!name)
		{
			debug.logln("NOTIFY", "Could not lookup name in external db");
			setDocNotes(wfDoc, TU_Func_DateMDY() + " Could not lookup name in CS.", setDocNotes.APPEND, "\n");
			//routeItem(wfItem, QUEUE_ERROR, "Could not lookup name");
			return false;
		}

		var newDoc = toINKeys(wfDoc);
		newDoc.IDX_F2_NAME = name;

		debug.log(5, "Reindexing to %s\n", newDoc);
		if(!reindexDocument(wfDoc, newDoc, "APPEND"))
		{
			debug.log("ERROR", "Could not reindex document\n\n");
			//routeItem(wfItem, QUEUE_ERROR, "Could not reindex doc");
			return false;
		}
		debug.log("INFO", "Reindexed\n");
		//Leave item in WF
		//debug.log("INFO", "Routing to %s\n", QUEUE_NEXT);
		//routeItem(wfItem, QUEUE_NEXT, "Processed by TU_IndexByID");
/*
		if(QUEUE_NEXT == "REMOVE FROM WORKFLOW")
		{
			wfItem.remove();
		}
		else if( QUEUE_NEXT)
		{
			debug.log("DEBUG", "Routing to %s\n", QUEUE_NEXT);
			routeItem(wfItem, QUEUE_NEXT, "Processed by TU_IndexFromEmplID");
		}
*/
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
		TU_Func_AlertINAdmins(strThisScript);

	}

	finally
	{
		debug.finish();
		return;
	}

}

/**  LOCAL FUNCTIONS  *******************************/

/** ****************************************************************************
  *		Performs an external DB lookup (PeopleSoft) to retrieve the employees 
  *		Name
  *
  * @param {String} emplID Employee ID
  * @returns {String} Name of the Employee or false
  * @requires DB_DBAccess
  *****************************************************************************/
function lookupName(emplID)
{
	var db, cursor, emplID, SQL = "";

	db = new DBAccess("ODBC", hostDSN, hostUsername, hostPW);
hostDSN = "CS9PRD";
	if(!db.open())
	{
		debug.log('CRITICAL', "Unable to open db\n");
		return false;
	}

	//JMT Using Admissions ImageNow linking page view for SQL
	Clib.sprintf(SQL, "SELECT SYSADM.PS_TU_ADM_IMGNW_VW.NAME FROM SYSADM.PS_TU_ADM_IMGNW_VW WHERE SYSADM.PS_TU_ADM_IMGNW_VW.EMPLID='%s'", emplID);

	//debug.log("DEBUG", "SQL=%s\n", SQL);
	cursor = db.query(SQL, Database.dynamic);
	db.logQuery(cursor, "DEBUG", 10);
	if(!cursor || !cursor.first())
	{
		debug.log("NOTIFY", "Could not get first row\n");
		return false;
	}
	rtn = cursor[0];
	rtn = trim(rtn);
	rtn = rtn.substr(0,40)  //limit the result to 40 characters for long names

	cursor.close();
	db.close();

	return rtn;
}

//
