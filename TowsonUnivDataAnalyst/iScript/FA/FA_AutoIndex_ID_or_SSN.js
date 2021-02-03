/************************************************************* @fileoverview<pre>
	Name:		FA_AutoIndex_ID_or_SSN.js
	Modified:	01/28/2010 by JMT for FinAid
	Purpose:	Provide 9-digit SSN or 7-digit EmplID indexing for HR
			New functionality is to allow either Folder or F5 to have value instead of making
			user choose
			If find EmplID - set Name and SSN, if find SSN - set EmplID and name.
			Unusual is that all items route to same queue - FA Group Link. All items
			have further processing.
			See FA_AutoIndex_Barcode.js for other variant.
	Changes:	
	
	Author:         Perceptive Software, Inc        
	Created:        06/12/07-LMS: 
	Last Updated:	
	For Version:    6.x
--------------------------------------------------------------------------------
	Summary:         
		Does an external DB lookup to find the name of a student based on
		an empl id.  Reindexes document as follows:

		Drawer: Literal - based on Capture Profile
		Folder: Empl ID (7 digits)
		Tab: Empty - script will populate the Name (Last Name, First Name)
		F3: Doc Type - based on Capture Profile
		F4: Unique ID - will need to replace based on the date the document is 
		   indexed (MM/DD/YYYY).
		F5: Blank (may have another value, but script will ignore)

		If there is NO Empl ID match in PeopleSoft send the document(s) to the 
		regular FA Group Link queue for manual indexing and routing. 

	Mod Summary:	
	
	Business Use:
		Intended to be an inscript on an autoindex queue

	@revision $Id: TU_IndexFromEmplID.js 1055 2007-06-28 13:08:00Z lsanders $
</pre>*************************************************************************/


// *********************         Configuration        *******************

#define CONFIG_VERIFIED       true

// *** Data Source ***
#define DB_DSN			"CS9PRD"
#define DB_USER			<USER>
#define DB_PASS			<password>


// *** index fields ***

#define IDX_EMPL_ID		folder
#define IDX_NAME		tab
#define IDX_DOC_TYPE	f3
#define IDX_DATE		f4
#define IDX_F5			f5  //JMT


// *** queues ****

// If there's a problem, send the item here
#define QUEUE_ERROR		"FinAid Group Link"  //unusual, all items route to same queue
											//even if no match. Will be manually linked

// If not false, items will be routed to this queue after successful index
//For FinAid, all items go to group link for further processing and/or routing
#define QUEUE_NEXT		"FinAid Group Link"  //"REMOVE FROM WORKFLOW"

// *** logging ***
#define LOG_TO_FILE true        // false - log to stdout if ran by intool, wf
                                //      user if inscript. 
                                //  true  - log to inserverXX/log/ directory
#define DEBUG_LEVEL 5           // 0 - 5.  0 least output, 5 most verbose

// *********************       End  Configuration     *******************

// ********************* Initialize global variables ********************

var debug = "";

// ********************* Include additional libraries *******************

#link "sedbc"

// ********************* Function definitions ***************************

// ----------------------------------------------------------------------
// Function:    main
// Purpose:     Main body of script.
// Args:        none
// Returns:     none
// ----------------------------------------------------------------------
function main ()
{
  debug = new iScriptDebug("USE SCRIPT FILE NAME", LOG_TO_FILE, DEBUG_LEVEL);

  try
  {
    if( ! CONFIG_VERIFIED )
    {
        var errorStr = "Configuration not verified.  Please verify \n" +
            "the defines in the *** Configuration *** section at the top \n" +
            "of this script and set CONFIG_VERIFIED to true.  Aborting.\n\n";
        debug.log("CRITICAL", errorStr);
        INprintf(errorStr);
        return;
    }

   debug.showINowInfo("INFO\n");
  
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


//Main part of program here:
//Look at Folder (EmplID) - if not null then set name and SSN based on EmplID
//If Folder is null, look at F5 (SSN) - if not null then set name and EmplID based on SSN
//If both Folder and F5 are null, then route to exception

	if (!wfDoc.IDX_EMPL_ID)  
	{
		//folder is null, look at F5
		if (!wfDoc.IDX_F5)
		{
			//folder and F5 null - route to exception and terminate
			debug.log("ERROR", "No Folder or F5 values\n\n");
			RouteItem(wfItem, QUEUE_ERROR, "No Folder (EmplID) or F5 (SSN) values");
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
		RouteItem(wfItem, QUEUE_ERROR, "Could not lookup name");
		return false;  //all done, leave function
	}

//have a good match, set index values to returned results
	var newDoc = ToINKeys(wfDoc);	
	newDoc.IDX_EMPL_ID = emplid
	newDoc.IDX_NAME = name;
//	newDoc.IDX_F5 = "";  //JMT for UG - no SSN
//	newDoc.IDX_F5 = ssn;  //JMT SSN keep here

/* JMT 05/04/2010 BEGIN Not needed by FinAid. Keep F5 random
//JMT 05/02/2010 BEGIN
//Check F5 for system generated scanning or fax unique ids and remove only these
	if(newDoc.IDX_F5.substring(0,3) == "FA-" || newDoc.IDX_F5.substring(0,5) == "20000")
	{
	 	newDoc.IDX_F5 = "";
	}
//JMT 05/02/2010 END
  JMT 05/04/2010 END  */


/*Not for FinAid
//JMT begin 01/26/2009
//    getting creation date for F4 
	var d = new Date(wfDoc.creationTime * 1000);
	Clib.sprintf(newDoc.IDX_DATE, "%02d/%02d/%04d", d.getMonth()+1, d.getDate(), d.getFullYear());
//JMT end 
*/

//JMT	debug.log("INFO", "Reindexing to %s\n", newDoc);

	if(!MoveDocument(wfDoc, newDoc))
	{
		debug.log("ERROR", "Could not reindex document\n");
		RouteItem(wfItem, QUEUE_ERROR, "Could not reindex doc");
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
		RouteItem(wfItem, QUEUE_NEXT, "Auto ID / Name Indexed");
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

	db = new DBAccess('ODBC',DB_DSN, DB_USER, DB_PASS);

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

//JMT no need to see	debug.log("DEBUG", "SQL=%s\n", SQL);
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
//	rtn = trim(cursor[0]) + "," + trim(cursor[1]) + " " + trim(cursor[2].substr(0,1));          //newDoc.IDX_F5.substr(0,3)
//	rtn = trim(cursor[0])  + NameSuffix + ", " + trim(cursor[1]) + MiddleInit;          //newDoc.IDX_F5.substr(0,3)
	rtn = trim(cursor[0])  + NameSuffix + "," + trim(cursor[1]) + " " + trim(cursor[2]);          //newDoc.IDX_F5.substr(0,3)

//JMT begin 09/11/2008
//limit the result to 39 characters for long names
	rtn = rtn.substr(0,39) 
//JMT end 09/11/2008

	cursor.close();
	db.close();

	return rtn;
}


//------------------------------------------------------------------
function lookupSSN_by_EmplID(emplid)
{
	var db, cursor, SSN, SQL = "";

	db = new DBAccess('ODBC',DB_DSN, DB_USER, DB_PASS);

	if(!db.open())
	{
		debug.log('CRITICAL', "Unable to open db\n");
		return false;
	}

//	Clib.sprintf(SQL, "SELECT SYSADM.PS_PERSONAL_DATA.EMPLID FROM SYSADM.PS_PERS_NID INNER JOIN SYSADM.PS_PERSONAL_DATA ON SYSADM.PS_PERS_NID.EMPLID = SYSADM.PS_PERSONAL_DATA.EMPLID WHERE (((SYSADM.PS_PERS_NID.NATIONAL_ID)='%s') AND ((SYSADM.PS_PERS_NID.PRIMARY_NID)='Y'))", SSN);
	Clib.sprintf(SQL, "SELECT SYSADM.PS_PERS_NID.NATIONAL_ID FROM SYSADM.PS_PERS_NID WHERE ((SYSADM.PS_PERS_NID.EMPLID='%s') AND (SYSADM.PS_PERS_NID.PRIMARY_NID='Y'))", emplid);

//JMT no need to see	
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

//------------------------------------------------------------------

/** ****************************************************************************
  *		Performs an external DB lookup (PeopleSoft) to retrieve the employees 
  *		Name
  *
  * @param {String} emplId Employee ID
  * @returns {String} Name of the Employee or false
  * @requires DB_DBAccess
  *****************************************************************************/
function lookupName_by_SSN(SSN)
{
	var db, cursor, SSN, SQL = "";

	db = new DBAccess('ODBC',DB_DSN, DB_USER, DB_PASS);

	if(!db.open())
	{
		debug.log('CRITICAL', "Unable to open db\n");
		return false;
	}

//	Clib.sprintf(SQL, "SELECT SYSADM.PS_PERSONAL_DATA.LAST_NAME, SYSADM.PS_PERSONAL_DATA.FIRST_NAME FROM SYSADM.PS_PERS_NID INNER JOIN SYSADM.PS_PERSONAL_DATA ON SYSADM.PS_PERS_NID.EMPLID = SYSADM.PS_PERSONAL_DATA.EMPLID WHERE (((SYSADM.PS_PERS_NID.NATIONAL_ID)='%s') AND ((SYSADM.PS_PERS_NID.PRIMARY_NID)='Y'))", SSN);
	Clib.sprintf(SQL, "SELECT SYSADM.PS_PERSONAL_DATA.LAST_NAME, SYSADM.PS_PERSONAL_DATA.FIRST_NAME, SYSADM.PS_PERSONAL_DATA.MIDDLE_NAME, SYSADM.PS_PERSONAL_DATA.NAME_SUFFIX FROM SYSADM.PS_PERS_NID INNER JOIN SYSADM.PS_PERSONAL_DATA ON SYSADM.PS_PERS_NID.EMPLID = SYSADM.PS_PERSONAL_DATA.EMPLID WHERE (((SYSADM.PS_PERS_NID.NATIONAL_ID)='%s') AND ((SYSADM.PS_PERS_NID.PRIMARY_NID)='Y'))", SSN);

//JMT no need to see	
//	debug.log("DEBUG", "SQL=%s\n", SQL);
//	debug.log("INFO", "SSN is %s\n",SSN);

	cursor = db.query(SQL, Database.dynamic);

//JMT	debug.log("RESULT", "Cursor[0] is %s\n",cursor[0]);
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
//	rtn = trim(cursor[0]) + "," + trim(cursor[1]) + " " + trim(cursor[2].substr(0,1));          //newDoc.IDX_F5.substr(0,3)
	rtn = trim(cursor[0])  + NameSuffix + "," + trim(cursor[1]) + MiddleInit;          //newDoc.IDX_F5.substr(0,3)
//	rtn = trim(cursor[0]) + ", " + trim(cursor[1]);

//JMT begin 09/11/2008
//limit the result to 39 characters for long names
	rtn = rtn.substr(0,39) 
//JMT end 09/11/2008


//JMT	debug.log("RESULT", "Return value is %s\n",rtn);

	cursor.close();
	db.close();

	return rtn;
}

//----------------------------------------------------------------------
function lookupID_by_SSN(SSN)
{
	var db, cursor, SSN, SQL = "";

	db = new DBAccess('ODBC',DB_DSN, DB_USER, DB_PASS);

	if(!db.open())
	{
		debug.log('CRITICAL', "Unable to open db\n");
		return false;
	}

//	Clib.sprintf(SQL, "SELECT SYSADM.PS_PERSONAL_DATA.EMPLID FROM SYSADM.PS_PERS_NID INNER JOIN SYSADM.PS_PERSONAL_DATA ON SYSADM.PS_PERS_NID.EMPLID = SYSADM.PS_PERSONAL_DATA.EMPLID WHERE (((SYSADM.PS_PERS_NID.NATIONAL_ID)='%s') AND ((SYSADM.PS_PERS_NID.PRIMARY_NID)='Y'))", SSN);
	Clib.sprintf(SQL, "SELECT SYSADM.PS_PERS_NID.EMPLID FROM SYSADM.PS_PERS_NID WHERE ((SYSADM.PS_PERS_NID.NATIONAL_ID='%s') AND (SYSADM.PS_PERS_NID.PRIMARY_NID='Y'))", SSN);

//JMT no need to see	
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





var DBAccess = {};
DBAccess._construct = DBAccess_constructor;
//***********************************************************************
/**
 * Simple access to a database for lookups and such.  Error handling is
 * handled in the object and therefore standard.
 * <p><em>Generic Function</em> (common)</em></p>
 * <p>Modified:   $Revision: 977 $ $Date: 2007-06-22 11:09:36 -0500 (Fri, 22 Jun 2007) $ $Author: trothwell $</p>
 * <pre>
 * Mod Summary:
 *    04/09/07-TJR: Restructed constructor
 *                  Changed error handling
 *    05/18/07-TJR: Modified lookup to check how many results are returned
 *                  Changed output format of logQuery
 *    05/23/07-LMS: Added db.execute functionality
 *    06/20/07-TJR: Modified to conform to jsDoc (attempt #1)
 * </pre>
 * <pre>
// Example
function main()
{
	global.debug = new iScriptDebug('USE SCRIPT FILE NAME', false, 'DEBUG');
	var db = new DBAccess('ODBC','JDETEST', 'sa', undefined);
	if(!db.open())
	{
		debug.log('CRITICAL', "Unable to open db - here at DBAccess._construct \n");
	}
	var csr = db.query('SELECT * FROM IMG_DOCUMENTS_TABLE');
	db.logQuery(csr);
}
 *</pre>
 *
 *
 * @name DBAccess
 * @constructor
 * @param {String} dbEngine Usually this will be 'ODBC'
 * @param {String} hostDSN The 'System DSN' to connect to
 * @param {String} hostUsername used to connect
 * @param {String} hostPW used to connect
 */ //*******************************************************************
function DBAccess_constructor(dbEngine, hostDSN, hostUsername, hostPW)
{
	if(global.Database === undefined)
	{
		debug.log('CRITICAL', "DBAccess_constructor: Must have \'#link <SEDBC>\'\n");
		throw('Missing required libraries!');
	}
// Private Variables
	var db;
// Private Functions
// Protected Functions
	//***********************************************************************
	/**
	 * Create connection to a database (uses properties set in constructor)
	 * @method open
	 * @return {Boolean} true if successfull
	 */ //*******************************************************************
	function DBAccess_open()
	{
		if(!db.connected()) {
			if(db.connect(dbEngine, hostDSN, hostUsername, hostPW) != 0)
			{
				//Error encountered
				debug.log('CRITICAL', "DBAccess_open: Could not open DB through DSN: [%s]\n", hostDSN);
				this.showDBErrorInfo('CRITICAL');
				return false;
			}
			else
			{
				//No errors
//				debug.log('DEBUG', "DBAccess_open: Connected to DB through DSN: [%s]\n", hostDSN);
				return true;
			}
		}
		else
		{
			//Already open
//			debug.log('DEBUG', "DBAccess_open: Already connected to DB\n");
			return true;
		}
	}
	//***********************************************************************
	/**
	 * Check if the database connection is open
	 * @method isConnected
	 * @return {Boolean} true if successfull
	 */ //*******************************************************************
	function DBAccess_isConnected()
	{
		if(db)
		{
			return db.connected();
		}
		else
		{
			return false;
		}
	}
	//***********************************************************************
	/**
	 * Closes the connection to the database
	 * @method close
	 * @return {Boolean} true if successfull
	 */ //*******************************************************************
	function DBAccess_close()
	{
		if(db && db.connected()) {
			//Needs to be closed
			if(db.disconnect() != 0)
			{
				//Error encountered
				debug.log('WARNING', "DBAccess_close: Error disconnecting from DB through DSN: [%s]\n", this.hostDSN);
				this.showDBErrorInfo('WARNING');
			}
		}
		return undefined;
	}
	//***********************************************************************
	/**
	 * Displays error codes on database object
	 * @method showDBErrorInfo
	 * @param {String|int} strLevel debug level to output as (default is <em>DEBUG</em>)
	 * @return {undefined}
	 */ //*******************************************************************
	function DBAccess_showDBErrorInfo(strLevel)
	{
		strLevel = strLevel ? strLevel : 'WARNING';
		if(db.majorErrorCode() != 0)
		{
			debug.log(strLevel, "DBAccess_showDBErrorInfo: Database Error!\n\nError code: %d\nMajor error message: \n%sMinor error message: \n%s\n",
				db.majorErrorCode(),
				db.majorErrorMessage(),
				db.minorErrorMessage());
		}
		else
		{
			debug.log(strLevel, "DBAccess_showDBErrorInfo: No DB errors.\n");
		}
		return undefined;
	}
	//***********************************************************************
	/**
	 * Execute a stored procedure.  iScript may crash during this call
	 * @method storedProc
	 * @param {String} strProcName stored procedure name
	 * @param {Array of Object} arrArgs arguments to stored procedure
	 * @return {Curosr} null on error
	 */ //*******************************************************************
	function DBAccess_storedProc(strProcName, arrArgs)
	{
		// Ensure DB is connected
		if(!db.connected())
		{
			debug.log('WARNING', "DBAccess_storedProc: Unable to process query because DB is not connected, DSN=[%s]\n", hostDSN);
			return null;
		}
		var objStProc = db.storedProc(strProcName);
		var numParams = objStProc.parameters();
		debug.log('DEBUG', "DBAccess_storedProc: Parameter total: [%d]\n", numParams);
		if(arrArgs instanceof Array)
		{
			for(var idx=0; arrArgs[idx] !== undefined || idx < numParams; idx++)
			{
				try
				{
					var strClass = arrArgs[idx]._class;
				}
				catch(e)
				{
					var strClass = "x";
				}
				debug.log('DEBUG', "args[%s]: [%s] (%s)\n", idx, arrArgs[idx], strClass);
				objStProc[idx] = arrArgs[idx];
			}
		}
		else
		{
			for(var key in arrArgs)
			{
				debug.log('DEBUG', "args(%s): [%s] (%s)\n", key, arrArgs[key], arrArgs[key]._class);
				objStProc[key] = arrArgs[key];
			}
		}
		var sqlCursor = objStProc.cursor();
		if(!sqlCursor)
		{
			this.showDBErrorInfo();
			return null;
		}
		else
		{
			return sqlCursor;
		}
	}
	//***********************************************************************
	/**
	 * Get a recordset back from a database
	 * @method query
	 * @param {String} strSQL SQL select statement
	 * @param {int} csrMode the type of cursor to use (default is <em>Database.snapshot</em>)
	 * @return {Cursor} null on error
	 */ //*******************************************************************
	function DBAccess_query(strSQL, csrMode)
	{
		// Ensure DB is connected
		if(!db.connected())
		{
			debug.log('WARNING', "DBAccess_query: Unable to process query because DB is not connected, DSN=[%s]\n", hostDSN);
			return null;
		}
		csrMode = csrMode ? csrMode : Database.snapshot; // set default
//JMT		debug.log('DEBUG', "DBAccess_query: SQL: [%s]\n", strSQL);
//JMT   	debug.log("DEBUG", "mode: %s\n", csrMode);
		try
		{
			var sqlCursor = db.cursor(strSQL);
			if(!sqlCursor)
			{
				debug.log('WARNING', "DBAccess_query: Query returned null: [%s].\n", strSQL);
				sqlCursor.close();
				this.showDBErrorInfo();
				return null;
			}
			else
			{
				return sqlCursor;
			}
		}
		catch(e)
		{
			this.showDBErrorInfo('WARNING');
			debug.log('WARNING', "DBAccess_query: Error creating cursor.\n");
			return null;
		}
	}
	//***********************************************************************
	/**
	 * Get a string from a dblookup
	 * @method lookup
	 * @param {String} strSQL SQL select statement
	 * @param {int} numMaxRows max returned rows allowed (default is <em>0</em> - no checking)
	 * @return {String} first row of first field (or null on error)
	 */ //*******************************************************************
	function DBAccess_lookup(strSQL, numMaxRows)
	{
		numMaxRows = (numMaxRows !== undefined) ? numMaxRows : 0;
		var strResult = null;
		var csr;
		if((csr=this.query(strSQL)) !== null)
		{
			strResult = csr.first() ? csr[0] : null;
			if((numMaxRows > 0) && (strResult !== null))
			{
				// Make sure we didn't get too many results back
				var numRows = 0;
				do
				{
					numRows++;
				}
				while(csr.next());
				debug.log('DEBUG', "DBAccess_lookup: Rows returned: [%d]\n", numRows);
				if(numRows > numMaxRows)
				{
					debug.log('ERROR', "DBAccess_lookup: Rows returned [%d] greater than max allowed [%d]!\n", numRows, numMaxRows);
					return null;
				}
			}
			csr.close();
		}
		return strResult;
	}
	//***********************************************************************
	/**
	 * Output the values in a query.
	 * @method logQuery
	 * @param {Cursor} cursorObj cursor to output
	 * @param {String|int} strLevel debug level to output as (default is <em>DEBUG</em>)
	 * @return {undefined}
	 */ //*******************************************************************
	function DBAccess_logQuery(cursorObj, strLevel)
	{
		function strDup(str, numTimes)
		{
			var strResult = '';
			for(var idx=0;idx<numTimes;idx++)
			{
				strResult += str;
			}
			return strResult;
		}
		if(!cursorObj)
		{
			debug.log('WARNING', "DBAccess_logQuery: Logging Query: cursorObj is invalid\n");
			return undefined;
		}
		strLevel = strLevel ? strLevel : 'DEBUG';
		debug.log(strLevel, "\n");
		debug.log(strLevel, "DBAccess_logQuery: Logging Query: ("+cursorObj.columns()+" cols)\n");
		var tempLine;
		//Display columns
		var arrColWidth = [];
		var colCount = cursorObj.columns();
		Clib.sprintf(tempLine,"");
		for(var idx=0;idx<colCount;idx++)
		{
			Clib.sprintf(tempLine,"%s%s", tempLine, cursorObj.columnName(idx));
			arrColWidth[idx] = cursorObj.columnName(idx).length;
			if(idx+1 < colCount)
			{
				Clib.sprintf(tempLine,"%s|", tempLine);
			}
		}
		Clib.sprintf(tempLine,"%s\n", tempLine);
		debug.log(strLevel, tempLine); // send to output
		//Header border
		tempLine = "";
		for(var idx=0;idx<colCount;idx++)
		{
			Clib.sprintf(tempLine,"%s%s", tempLine, strDup('-',arrColWidth[idx]));
			if(idx+1 < colCount)
			{
				Clib.sprintf(tempLine,"%s|", tempLine);
			}
		}
		Clib.sprintf(tempLine,"%s\n", tempLine);
		debug.log(strLevel, tempLine); // send to output
		//Display data
		if(cursorObj.first())
		{
			do
			{
				Clib.sprintf(tempLine,"");
				for(var idx=0;idx<colCount;idx++)
				{
					Clib.sprintf(tempLine,"%s%-*s", tempLine, arrColWidth[idx], '\''+cursorObj[idx]+'\'');
					if(idx+1 < colCount)
					{
						Clib.sprintf(tempLine,"%s|", tempLine);
					}
				}
				Clib.sprintf(tempLine,"%s\n", tempLine.replace(/\n/g,'\\n').replace(/\r/g,'\\r'));
				debug.log(strLevel, tempLine); // send to output
			}
			while(cursorObj.next());
			debug.log(strLevel, "\n"); // send to output
		}
		else
		{
			// When there are no records
			debug.log(strLevel, "<No data>\n");
			return undefined;
		}
		if(!cursorObj.first())
		{
			debug.log('WARNING', "[DBAccess] Unable to reposition cursor\n");
		}
	}
	//***********************************************************************
	/**
	 * Execute a DB SQL statement
	 * @method execute
	 * @param {String} strSQL SQL statement
	 * @return {Boolean} true on success
	 */ //*******************************************************************
	function DBAccess_execute(strSQL)
	{
		var rtn;
		if(!db.connected())
		{
			debug.log('WARNING', "DBAccess_execute: Unable to process query because DB is not connected, DSN=[%s]\n", hostDSN);
			return null;
		}
		debug.log('DEBUG', "DBAccess_execute: Executing: [%s]\n", strSQL);
		rtn = db.execute(strSQL);
		if(rtn !== 0)
		{
			debug.log('ERROR', "DBAccess_execute: Error while executing: [%s]\n", strSQL);
			this.showDBErrorInfo();
			return false;
		}
		else
		{
			return true;
		}
	}
	// Assign functions to instance
	this.open            = DBAccess_open;
	this.close           = DBAccess_close;
	this.showDBErrorInfo = DBAccess_showDBErrorInfo;
	this.query           = DBAccess_query;
	this.logQuery        = DBAccess_logQuery;
	this.lookup          = DBAccess_lookup;
	this.execute         = DBAccess_execute;
	this.storedProc      = DBAccess_storedProc;
	this.isConnected     = DBAccess_isConnected;
// Modify instance
	dbEngine = dbEngine ? dbEngine : undefined;
	hostDSN = hostDSN ? hostDSN : undefined;
	hostUsername = hostUsername ? hostUsername : undefined;
	hostPW = hostPW ? hostPW : undefined;
	db = new Database();
	return this;
}
global.DBAccess = DBAccess;
if((typeof(C_CONFIG_TEST) != 'undefined') && (C_CONFIG_TEST === true))
{
	require('Database');
}


/** ****************************************************************************
  *		Get docKeys from an INDocument object
  *
  * @param {INDocument} indoc Source document
  * @returns {Boolean|INKeys} New INKeys if successful, false otherwise
  * @version 6.x
  *****************************************************************************/
function ToINKeys(indoc)
{
	if(!indoc)
	{
		debug.log('ERROR', "ToINKeys: Invalid param: [%s]\n", indoc);
		return false;
	}
	else if(!indoc instanceof INDocument)
	{
		debug.log('ERROR', "ToINKeys: Invalid param: [%s]\n", indoc);
		return false;
	}
	var inkeys = new INKeys();
	if(!indoc.drawer)
	{
		indoc.getInfo(["doc.drawer", "doc.folder", "doc.tab", "doc.field3", "doc.field4", "doc.field5", "doc.type"]);
	}
	
	if(!indoc.drawer)
	{
		debug.log("ERROR", "ToINKeys: Could not get index values\n");
		return false;
	}
	
	inkeys.drawer = indoc.drawer;
	inkeys.folder = indoc.folder;
	inkeys.tab = indoc.tab;
	inkeys.f3 = indoc.f3;
	inkeys.f4 = indoc.f4;
	inkeys.f5 = indoc.f5;
	inkeys.docTypeName = indoc.docTypeName;
	
	return inkeys;
}

/** ****************************************************************************
  *		Wrapper for INDocManager.moveDocument
  *
  * @param {INKeys|INDocument|String} sInDoc Source document/keys/id
  * @param {INKeys|INDocument|String} dInDoc Destination document/keys/id
  * @param {String} mode Mode to use, APPEND or REPLACE
  * @returns {Boolean|INDocument} New INDocument if successful, false otherwise
  * @version 6.x
  *****************************************************************************/
function MoveDocument(sInDoc, dInDoc, mode)
{
	var modeStr;
	var checkDoc;
	var srcDoc;
	var newDoc;
	
	// Initial argument length check
	if(arguments.length < 2 || arguments.length > 3)
	{
		debug.log("ERROR", "MoveDocument: Invalid argument count: [%s]\n", arguments.length)
		return false;
	}
	
	// Determine move mode
	if(!mode)
	{
		modeStr = "APPEND"; // default mode
	}
	else
	{
		modeStr = mode;
	}
	
	// Determine Source Document
	if(typeof(sInDoc) == "object" && sInDoc instanceof INDocument)
	{
		srcDoc = sInDoc;
		if(!srcDoc.id)
		{
			debug.log("ERROR", "MoveDocument: Document is invalid: [%s]\n", sInDoc);
			return false;
		}
	}
	else if(typeof(sInDoc) == "object" && sInDoc instanceof INKeys)
	{
		srcDoc = new INDocument(sInDoc);
		if(!srcDoc.getInfo(["doc.id", "doc.drawer", "doc.folder", "doc.tab", "doc.field3", "doc.field4", "doc.field5", "doc.type"])) // did we get a valid doc?
		{
			debug.log("ERROR", "MoveDocument: Source document keys are invalid: [%s]\n", sInDoc);
			return false;
		}
	}
	else if(typeof(sInDoc) == "string" || (typeof(sInDoc) == "object" && sInDoc instanceof String)) // doc id
	{
		srcDoc = new INDocument(sInDoc.toString()); // need .toString for String object
		if(!srcDoc.getInfo(["doc.id", "doc.drawer", "doc.folder", "doc.tab", "doc.field3", "doc.field4", "doc.field5", "doc.type"])) // did we get a valid doc?
		{
			debug.log("ERROR", "MoveDocument: Source document id is invalid: [%s]\n", sInDoc);
			return false;
		}
	}
	else
	{
		debug.log("ERROR", "MoveDocument: Source document is a required argument: [%s]\n", sInDoc);
		return false;
	}
	
	// Determine Destination Keys
	var dKeys;
	if(typeof(dInDoc) == "object" && dInDoc instanceof INDocument)
	{
		dKeys = new INKeys(dInDoc.drawer, dInDoc.folder, dInDoc.tab, dInDoc.f3, dInDoc.f4, dInDoc.f5, dInDoc.docTypeName);
	}
	else if(typeof(dInDoc) == "object" && dInDoc instanceof INKeys)
	{
		dKeys = new INKeys(dInDoc.drawer, dInDoc.folder, dInDoc.tab, dInDoc.f3, dInDoc.f4, dInDoc.f5, dInDoc.docTypeName);
	}
	else if(typeof(dInDoc) == "string" || (typeof(dInDoc) == "object" && dInDoc instanceof String)) // doc id
	{
		var dstDoc = new INDocument(dInDoc.toString()); // need .toString for String object
		if(!dstDoc.getInfo(["doc.drawer", "doc.folder", "doc.tab", "doc.field3", "doc.field4", "doc.field5", "doc.type"])) // did we get a valid doc?
		{
			debug.log("ERROR", "MoveDocument: Destination document id is invalid: [%s]\n", dInDoc);
			return false;
		}
		dKeys = new INKeys(dstDoc.drawer, dstDoc.folder, dstDoc.tab, dstDoc.f3, dstDoc.f4, dstDoc.f5, dstDoc.docTypeName);
	}
	else
	{
		debug.log('DEBUG', "[%s]\n", typeof(dInDoc));
		debug.log("ERROR", "MoveDocument: Destination document is a required argument: [%s]\n", dInDoc);
		return false;
	}
	
	// Max Lengths for doc keys
	var objDocKeyMaxLengths =
	{
		drawer:      40,
		folder:      39,
		tab:         39,
		f3:          39,
		f4:          39,
		f5:          39,
		docTypeName: 40
	};
	
	// Check for invalid destination keys
	var blnDKeyErrors = false;
	for(var key in objDocKeyMaxLengths)
	{
		if(dKeys[key] === null || dKeys[key] === undefined) // do this check so we don't have a runtime error
		{
			debug.log("WARNING", "MoveDocument: Destination document key: [%s] is invalid: [%s]\n", key, dKeys[key]);
			blnDKeyErrors = true;
			continue;
		}
		dKeys[key] = dKeys[key].replace(/^\s+|\s+$/, ""); // Trim destination keys (WARNING: modifies src object)
		if(dKeys[key].length === null || dKeys[key].length === undefined || dKeys[key].length > objDocKeyMaxLengths[key]) // all invalid lengths
		{
			debug.log("WARNING", "MoveDocument: Destination document key: [%s] len: [%s] > max: [%s]\n", key, dKeys[key].length, objDocKeyMaxLengths[key]);
			blnDKeyErrors = true;
			continue;
		}
	}
	if(blnDKeyErrors)
	{
		debug.log("ERROR", "MoveDocument: Destination document has invalid index values! [%s]\n", dKeys);
		return false;
	}
	
	// Check if move is necessary
	if(srcDoc.drawer.toUpperCase() == dKeys.drawer.toUpperCase() &&
		srcDoc.folder.toUpperCase() == dKeys.folder.toUpperCase() &&
		srcDoc.tab.toUpperCase() == dKeys.tab.toUpperCase() &&
		srcDoc.f3.toUpperCase() == dKeys.f3.toUpperCase() &&
		srcDoc.f4.toUpperCase() == dKeys.f4.toUpperCase() &&
		srcDoc.f5.toUpperCase() == dKeys.f5.toUpperCase() &&
		srcDoc.docTypeName.toUpperCase() == dKeys.docTypeName.toUpperCase())
	{
		debug.log("WARNING", "MoveDocument: Document has the same index values, not moving\n");
		return srcDoc;
	}
	
	if(srcDoc.docTypeName.toUpperCase() != dKeys.docTypeName.toUpperCase())
	{
		debug.log("INFO", "MoveDocument: Changing doctypes...\n");
		// TODO: add CP checks in here
	}
	
	checkDoc = new INDocument(dKeys);
	checkDoc.getInfo(["doc.id"]);
	
	if(checkDoc.id)
	{
		debug.log("WARNING", "MoveDocument: Destination document already exists\n");
		// Get dst doc page count
		var objExistingVer = new INVersion(checkDoc.id, -1);
		objExistingVer.getInfo(["ver.logob.count"]);
		// we are checking everything else, why not check workflow too....
		var intExistingPages = objExistingVer.logobCount;
		try
		{
			var targetItems = checkDoc.getWfInfo();
			var sourceItems = srcDoc.getWfInfo();
			if(sourceItems.length > 0)
			{
				// check first item only
				if(targetItems.length > 0 && targetItems[0].queueName != sourceItems[0].queueName)
				{
					debug.log("WARNING", "MoveDocument: Workflow status will change - main item will leave queue [%s] and appended to document in queue [%s]\n", sourceItems[0].queueName, targetItems[0].queueName);
				}
				else if(targetItems.length == 0)
				{
					debug.log("WARNING", "MoveDocument: Workflow status will change - source document will leave workflow due to append\n");
				}
				else
				{
					debug.log("WARNING", "MoveDocument: Workflow status will change, but document will remain in queue [%s]\n", targetItems[0].queueName);
				}
			}
		}
		catch(e)
		{
			debug.log("WARNING", "MoveDocument: Problem getting workflow info\n");
		}
	}
	else
	{
		var intExistingPages = 0;
	}
	
	// Get src doc page count
	var objCurrentVer = new INVersion(srcDoc.id, -1);
	objCurrentVer.getInfo(["ver.logob.count"]);
	var intPages = objCurrentVer.logobCount;
	
	debug.log("INFO", "MoveDocument: Moving: [%s]\n", srcDoc);
	debug.log("INFO", "MoveDocument:     To: [%s]\n", dKeys);
	
	// Describe what is happening
	if(intExistingPages > 0)
	{
		debug.log("WARNING", "MoveDocument: %s [%s] pages after page: [%s]\n", modeStr, intPages, intExistingPages);
	}
	else
	{
		debug.log("DEBUG", "MoveDocument: Moving [%s] pages\n", intPages);
	}
	
	// Reindex the document
	if(!INDocManager.moveDocument(srcDoc.id, dKeys, srcDoc.getCustomProperties(), modeStr))
	{
		debug.log("ERROR", "MoveDocument: Could not move document:  Last Server Error: [%s]\n",
				getErrMsg());
		return false;
	}
	else
	{
		newDoc = new INDocument(dKeys);
		newDoc.getInfo(["doc.id", "doc.drawer", "doc.folder", "doc.tab", "doc.field3", "doc.field4", "doc.field5", "doc.type"]);
		var objNewVer = new INVersion(newDoc.id, -1);
		objNewVer.getInfo(["ver.logob.count"]);
		debug.log("DEBUG", "MoveDocument: Total pages in final: [%s]\n", objNewVer.logobCount);
		return newDoc;
	}
}

/** ****************************************************************************
  *     Performs the necessary steps to route an item to a queue
  *
  * $Rev: 6675 $
  * @param {INWfItem|String} item Workflow item or item.id
  * @param {String} queue Name of the queue to route to
  * @param {String} reason Route reason
  * @param {Boolean} blnForce will route on any state besides 'Working', otherwise will only route on 'Idle' (default: false)
  * @version 6.x
  * @return {Boolean} True if successful, false otherwise
  * Mod Summary:        12/28/2007-JWM: Added two additional states to the error 
  *     check for the success of the route to handle parallel routed items 
  *     hitting a join queue.  WfItemState.WaitForSiblings and 
  *     WfItemState.Finished.
  *                     08/05/2008-JWM: Changed reason code to include script 
  *     name on setState prior to route
  *****************************************************************************/
function RouteItem(item, queue, reason, blnForce)
{
	blnForce = (blnForce === true) ? true : false;
	if(!queue)
	{
		debug.log('ERROR', "RouteItem: Queue name is invalid! [%s]\n", queue);
		return false;
	}
	
	var rItem;
	if(item instanceof INWfItem) // passed INWfItem
	{
		rItem = item;
	}
	else
	{
		rItem = new INWfItem(item); // assuming {String} id
	}
	
	// Test that it was valid
	if(!rItem || !rItem.id || rItem.getInfo() !== true)
	{
		debug.log('ERROR', "RouteItem: Invalid item\n");
		return false;
	}
	
	// Never route anything in a working state
	var intState = rItem.getState();
	switch(intState)
	{  // it's ok to be idle or completed
		case WfItemState.Idle: // This is what most items should be
		case WfItemState.Completed:
		case WfItemState.WaitForInboundAction:
			break;
		case WfItemState.Working: // never allow this state
			if(global.currentWfItem && global.currentWfItem.id == rItem.id)
			{
				debug.log('INFO', "RouteItem: Routing item currently open by client in workflow\n");
			}
			else
			{
				debug.log('ERROR', "RouteItem: Item is currently being processed within workflow and cannot be routed to another workflow queue\n");
				return false;
			}
			break;
		case WfItemState.Holding: // the following states--allow only when forcing
		case WfItemState.Pending:
		case WfItemState.Finished:
		case WfItemState.WaitForRouting:
		case WfItemState.WaitForSiblings:
		case WfItemState.Error:
			if(blnForce)
			{
				debug.log('NOTIFY', "RouteItem: Routing non-idle item with state: [%s]\n", intState);
			}
			else
			{
				debug.log('ERROR', "RouteItem: Will not route non-idle item with state: [%s]\n", intState);
				return false;
			}
			break;
		default: // don't allow states that we don't know about
			debug.log('ERROR', "RouteItem: Unknown WfItemState [%s]\n", intState);
			return false;
	}
	
	// Check that we actually need to route
	if(rItem.queueName.toUpperCase() == queue.toUpperCase())
	{
		debug.log('NOTIFY', "RouteItem: [%s] already exists in [%s]\n", rItem.id, rItem.queueName);
		return true;
	}
	
	// Determine script file name
	var scriptName = "";
	var fileSep = "";
	if ( (typeof(_WINDOWS_) != "undefined") || typeof(_WIN32_) != "undefined" ) fileSep = "\\";
	else if (typeof(_UNIX_) != "undefined") fileSep = "/";
	
	if (fileSep != "") scriptName = _argv[0].split(fileSep)[getArrayLength(_argv[0].split(fileSep))-1];
	else scriptName = "Unknown Script";
	
	// Mark our item as busy
	if(rItem.getState() != WfItemState.WaitForInboundAction)    // per dev, okay to route if waiting for inbound
	{
		rItem.setState(WfItemState.Working, ToString("Being routed from iScript by " + scriptName).substr(0,63));
		if(rItem.getState() != WfItemState.Working)
		{
			debug.log('ERROR', "RouteItem: Could not set state to working\n");
			if(blnForce)
			{
				debug.log("WARNING", "RouteItem: Force is true - attempting to route anyway\n");
			}
			else
				return false;
		}
	}
	
	// Do the route
	if(!rItem.manualRoute(queue, reason.substr(0,63)))
	{
		debug.log('ERROR', "RouteItem: Could not route [%s] to queue [%s] Last server error: [%s]\n", rItem.id, queue, getErrMsg());
		rItem.setState(WfItemState.Idle, "Failed manualRoute");
		if(rItem.getState() !== WfItemState.Idle)
		{
			debug.log('ERROR', "RouteItem: Could not set state to idle\n");
		}
		return false;
	}
	
	// Should be g2g
	debug.log('DEBUG', "RouteItem: [%s] routed to [%s] reason [%s]\n", rItem.id, queue, reason.substr(0,63));
	return true;
}
global.RouteItem = RouteItem;

/** ****************************************************************************
  * Object:     (Object) iScriptDebug (header, logToFile, <level>)
  * Purpose:    Creates a debug object
  *
  * Args(Type):
  *     header(string):         represents the name of the script
  *     logToFile(bool):        file will automagically be located in the /log
  *                             dir with the IN log format (datestamp) if true
  *     level(String|int):      representing the level of debug (see below)
  *
  * Methods
  *     .log(severity, formatString[, variables ...])
  *             logs the line
  *             Arguments
  *                     severity(int|string): CRITICAL, ERROR, INFO, etc
  *                     formatString (See Clib.sprintf)
  *     .logAlways(severity, formatString)
  *             Same as .log but the line is outputed regardless of the debug
  *             level
  *     .logObject(severity, object, (optional)maxDepth)
  *             Logs object's name/value pairs
  *             Arguments
  *                     severity(int|string): CRITICAL, ERROR, INFO, etc
  *                     object(object): object to log, will handle any data type
  *                     maxDepth(int)[optional]: sets hard limit on how many
  *                     levels of object to tree through
  *     .setIndent(num)
  *             Sets spacing after the line header and before the debug text
  *             Arguments
  *                     num: number of times to repeat the spacing string on
  *                     each debug statement
  *     .incrementIndent()
  *             Increments the indentation by 1
  *     .decrementIndent()
  *             Decrements the indentation by 1
  *
  * Returns:    null
  *
  * to use:
  *     #define LOG_TO_FILE true        // false - log to stdout if ran by intool, wf user if inscript.
  *                                     // true  - log to inserverXX/log/ directory
  *     #define DEBUG_LEVEL 5           // 0 - 5.  0 least output, 5 most verbose
  *     ...
  *     var debug = new iScriptDebug("USE SCRIPT FILE NAME", LOG_TO_FILE, DEBUG_LEVEL);
  *     debug.log("CRITICAL", "This will be displayed\n");
  *     debug.logAlways("DEBUG", "This will be displayed regardless of the current log level\n");
  *     ...
  *     debug.setIndent(2);
  *     debug.log("INFO", "This line has had its indentation set to 2\n");
  *     debug.incrementIndent();
  *     debug.log("INFO", "This line has had its indentation incremented to a total of 3\n");
  *     debug.decrementIndent();
  *     debug.decrementIndent();
  *     debug.log("INFO", "This line has had its indentation decremented twice, it is now 1\n");
  *     debug.finish();  // closes log file
  *
  *     this would log to ../log/myScript_20051022.log for example.
  *     It will generate the following output:
  *     09/25 13:16:17.902 myScript:1Y [  INFO  ] ImageNow info:  [Running from intool] Version: 6.0+, Database: SQLServer
  *     09/25 13:16:17.902 myScript:1Y [CRITICAL] This will be displayed
  *     09/25 13:16:17.902 myScript:1Y [  DEBUG ] This will be displayed regardless of the current log level
  *     09/25 13:16:17.902 myScript:1Y [  INFO  ]                 This line has had its indentation set to 2
  *     09/25 13:16:17.902 myScript:1Y [  INFO  ]                         This line has had its indentation incremented to a total of 3
  *     09/25 13:16:17.902 myScript:1Y [  INFO  ]         This line has had its indentation decremented twice, it is now 1
  *     09/25 13:16:17.902 myScript:1Y [  INFO  ]
  *     09/25 13:16:17.902 myScript:1Y [  INFO  ] Script run time:  0s
  *
  * Modification summary:
  *     9/29/05-LMS Created.
  *     11/23/05-LMS: now uses INprintf so that logs will go to user IN log file
  *             if ran from workflow and not logging to file
  *     11/29/05-LMS: Handles bad params like log(5, "there should be a parm
  *             with this %s, which would normally bomb");
  *     12/27/05-LMS: Added %s / Document funtionality
  *     01/30/06-LMS: Added workflow detection and timestamp removal msgCount
  *             stats and showINowInfo().
  *     02/16/06-LMS: Added ability for debug to determine file name and use
  *             that as the header / and log file name(pass in "USE SCRIPT FILE
  *             NAME" as the header param
  *     04/24/06-LMS: Fixed: bug in *nix and "USE SCRIPT FILE NAME"
  *     06/17/06-LMS: Changed: uses instanceof operator to id Document objects
  *             to stringify
  *         Changed: Rolled GetDateYYYYMMDD function into prototype to avoid
  *             collisions
  *     06/22/06-LMS: Changed: Trimed some fat off the header.
  *         Fixed: You can set date to use ctime (for old unix that seg fault
  *             on date)
  *     07/26/06-LMS: Changed: Moved prototype def into constructor to address
  *             sunflower issues.
  *         Changed: Added support for sunflower
  *     08/23/07-TJR: Add unique label for each logger (1:72)
  *     08/31/07-LMS: splitfilename bug
  *     09/12/07-JWM: Updated whitespace formatting, comment formatting,
  *             function comments, log spelling
  *         Added this.ctime.dateSegFaultFix - used with this.getDateObject()'s
  *             update to replace the existing #if, #elseif, #else block
  *         Updated this.getDateObject() to always generate our own date object
  *         Added valueOf() to this.getDateObject()
  *         Updated this.getHeaderDate() to use our getDateObject() mod
  *         Updated unique label per logger to use new date object
  *         Added this.startTime
  *         Added script execution time logging to debug.finish()
  *     09/25/07-JWM: Added three calls:
  *         setIndent(num)
  *         incrementIndent()
  *         decrementIndent()
  *         Updated documentation
  *     09/26/07-JWM: Added .logObject(severity, object, (optional)maxDepth)
  *     10/01/07-TJR: Added blnExclusive -- if it cannot lock the log file
  *                     then it will not open a file for output
  *     01/16/08-JWM: Added .getIndent(), cleaned up whitespace
  *****************************************************************************/
function iScriptDebug (header, logToFile, level, blnExclusive, mapConfig)
{
	// Set defaults for parameters values
	header    = (header !== undefined)    ? header    : 'USE SCRIPT FILE NAME';
	logToFile = (logToFile !== undefined) ? logToFile : false;
	level     = (level !== undefined)     ? level     : 'DEBUG';
	blnExclusive = (blnExclusive === true) ? true : false;
	
	this.startTime = 0;
	this.levelHash = new Object();
	this.levelHash = {
		"CRITICAL": 0, // severe - cannot continue
		"ERROR":    1, // major error
		"WARNING":  2, // warning
		"NOTIFY":   3, // possible warning
		"INFO":     4, // informational
		"DEBUG":    5  // verbose debugging
	};
	this.file =  stdout;
	this.workflow = false;
	this.header = "";
	this.oneline = "";              // set this to "" if you want only one line per
	                                // .log() call or set to "\n"
	this.level = 3;
	this.pathSep = "";
	this.levels = ["CRITICAL", "ERROR", "WARNING", "NOTIFY", "INFO", "DEBUG"];
	
	this.offset = 0;                //number of times to prepend this.offsetString to each .log statement
	this.offsetString = "        "; //string repeated for use with this.offset
	this.INObjectList = new Array();//stores object name/tag lists for all document imaging objects (for use with .logObject())
	this.strHeader = '';
	this.strFooter = "\n";
	this.queueName = "";            // pass in via mapConfig (ugh) and set to queueName to produces log
									// that looks like  ScriptName_CurrentQueueName_20080911.log
	if(mapConfig)
	{
		for(var key in mapConfig)
		{
			this[key] = mapConfig[key];
		}
	}
	
	/* Functions here - contructor below */
	
	/** ********************************************************************
	  * Function:   getDateObject()
	  * Purpose:    creates and returns a date object.
	  *     date/time returned for all functions is "now"
	  *     return object, ctime, has the following member functions:
	  *         getFullYear()
	  *         getMonth()
	  *         getDate()
	  *         toTimeString()
	  *         getMilliseconds()
	  *
	  * Args(Type): none
	  * Returns:    this.ctime (date object)
	  *********************************************************************/
	this.getDateObject = function ()
	{
		this.ctime = new Object();
		this.ctime.dateSegFaultFix = false;     // if on HP-UX and Date segfaults, change
		                                        // this to true
		
		this.ctime.getFullYear = function ()
		{
			if (!this.dateSegFaultFix)
			{
				var now = new Date();
				return now.getFullYear();
			}
			
			else
			{
				return Clib.localtime(Clib.time()).tm_year + 1900;
			}
		}
		
		this.ctime.getMonth = function ()
		{
			if (!this.dateSegFaultFix)
			{
				var now = new Date();
				return now.getMonth();
			}
			
			else
			{
				return Clib.localtime(Clib.time()).tm_mon;
			}
		}
		
		this.ctime.getDate = function ()
		{
			if (!this.dateSegFaultFix)
			{
				var now = new Date();
				return now.getDate();
			}
			
			else
			{
				return Clib.localtime(Clib.time()).tm_mday;
			}
		}
		
		this.ctime.toTimeString = function ()
		{
			var s = "";
			
			if (!this.dateSegFaultFix)
			{
				var now = new Date();
				Clib.sprintf(s, "%02d:%02d:%02d", now.getHours(), now.getMinutes(), now.getSeconds());
			}
			
			else
			{
				var t = Clib.localtime(Clib.time());
				Clib.sprintf(s, "%02d:%02d:%02d", t.tm_hour, t.tm_min, t.tm_sec);
			}
			
			return s;
		}
		
		this.ctime.getMilliseconds = function ()
		{
			if (!this.dateSegFaultFix)
			{
				var now = new Date();
				return now.getMilliseconds();
			}
			
			else
			{
				// no milliseconds in the tm_time structure
				return 0;
			}
		}
		
		this.ctime.valueOf = function ()
		{
			if (!this.dateSegFaultFix)
			{
				var now = new Date();
				return now.valueOf();
			}
			
			else
			{
				// no milliseconds in tm_time structure, returning seconds
				return Clib.localtime(Clib.time()).tm_sec;
			}
		}
		
		return this.ctime;
	};
	
	/** ********************************************************************
	  * Function:   setLevel(level)
	  * Purpose:    sets the debug level
	  *
	  * Args(Type): level (string|int) debug level
	  * Returns:    null
	  *********************************************************************/
	this.setLevel = function (level)
	{
		// if a string and a real debug level, set it
		if (isNaN(level) && !isNaN(this.levelHash[level]))
		{
			this.level = this.levelHash[level];
		}
		else if (level >= 0 && level < 6) // if number and real debug level, set it
		{
			this.level = level;
		}
		
		//default (3), don't change
	};
	
	/** ********************************************************************
	  * Function:   center()
	  * Purpose:    simply formats the debug header and centers the [LEVEL]
	  *
	  * Args(Type): none
	  * Returns:    s (string)
	  *********************************************************************/
	this.center = function (s)
	{
		var pad = (7 - s.length) / 2;
		if (s.length % 2)
		{
			s = " " + s;
		}
		
		for (var x=0; x < pad; x++)
		{
			s = " " + s + " ";
		}
		
		return s.toString();
	};
	
	/** ********************************************************************
	  * Function:   finish()
	  * Purpose:    closes log file pointer
	  *
	  * Args(Type): none
	  * Returns:    none
	  *********************************************************************/
	this.finish = function ()
	{
		try
		{
			var duration = Clib.time()-this.startTime;
			
			var d = ToInteger(duration/86400);
			var h = ToInteger((duration/3600)%24);
			var m = ToInteger((duration/60)%60);
			var s = duration%60;
			
			this.setIndent(0);
			this.log(4, "\n");
			this.log(4, "Script run time:  %s\n", (d)?d+"d "+h+"h "+m+"m "+s+"s ("+duration+" total seconds)":(h)?h+"h "+m+"m "+s+"s ("+duration+" total seconds)":(m)?m+"m "+s+"s ("+duration+" total seconds)":s+"s", duration);
		}
		
		catch (err)
		{
			debug.log(1, "Error determining script execution time\n");
		}
		
		try
		{
			if(this.blnHasWrittenToLog)
			{
				if(this.file == stdout)
				{
					// Write footer
					INprintf("%s", this.strFooter);
					this.blnHasWrittenToLog = true;
				}
				else
				{
					// Write footer
					Clib.fprintf(this.file, "%s", this.strFooter);
				}
			}
			Clib.fclose(this.file);
		}
		
		catch (err)
		{
			INprintf("iScriptDebug: Couldn't close debug file [%s]!!!\n", this.header)
		}
		
		return;
	};
	
	/** ********************************************************************
	  * Function:   getIndent()
	  * Purpose:    Returns the logging offset
	  * Args(Type): none
	  * Returns:    int
	  *********************************************************************/
	this.getIndent = function ()
	{
		return this.offset;
	};
	
	/** ********************************************************************
	  * Function:   setIndent(num)
	  * Purpose:    Sets the number of times to repeat offsetString.  This
	  *     is prepended to log statements after the header to allow for
	  *     indention to follow execution path
	  *
	  * Args(Type): num (int) number of times to repeat offsetString
	  * Returns:    none
	  *********************************************************************/
	this.setIndent = function (num)
	{
		if (isNaN(num))
		{
			this.log("CRITICAL", "iScriptDebug.setIndent: not passed a number, indentation not changed\n");
			return;
		}
		
		this.offset = num;
		return;
	};
	
	/** ********************************************************************
	  * Function:   incrementIndent()
	  * Purpose:    Increments offset.  This is prepended to log statements
	  *     after the header to allow for indention to follow execution path
	  *
	  * Args(Type): none
	  * Returns:    none
	  *********************************************************************/
	this.incrementIndent = function ()
	{
		this.offset++;
		return;
	};
	
	/** ********************************************************************
	  * Function:   decrementIndent()
	  * Purpose:    Decrements offset.  This is prepended to log statements
	  *     after the header to allow for indention to follow execution path
	  *
	  * Args(Type): none
	  * Returns:    none
	  *********************************************************************/
	this.decrementIndent = function ()
	{
		if (this.offset > 0) this.offset--;
		return;
	};
	
	/** ********************************************************************
	  * Function:   log(severity, msg,...)
	  * Purpose:    write a message to the log
	  *
	  * Args(Type): severity (string|int) severity of the error message
	  *     msg (printf format and message) message to log
	  * Example:    debugObject.log("WARNING", "X = %d\n", x);
	  * Returns:    null
	  *********************************************************************/
	this.log = function (severity)
	{
		var args = new Array();
		var headerStr = "";
		var sev;
		
		if (isNaN(severity))
		{
			// legacy
			if (severity == "NOTIFICATION")
			{
				severity = "NOTIFY";
			}
			
			sev = this.levelHash[severity];
		}
		
		else
		{
			sev = severity;
		}
		
		if (isNaN(sev))
		{
			this.log("CRITICAL", "iScriptDebug: not passed a debug level: remaining string: %s\n", severity);
			return;
		}
		
		this.msgCount[sev]++;
		
		if (sev <= this.level)
		{
			if (arguments.length < 2)
			{
				return;
			}
			
			for (var x=1; x < arguments.length; x++)
			{
				// check args for ImageNow Document Object and replace with string
				if ((typeof(Document) != "undefined" && typeof(arguments[x]) == "object" &&
						arguments[x] instanceof Document) ||
					(typeof(INDocument) != "undefined" && typeof(arguments[x]) == "object" &&
						arguments[x] instanceof INDocument) ||
					(typeof(INKeys) != "undefined" && typeof(arguments[x]) == "object" &&
						arguments[x] instanceof INKeys))
				{
					args[x] = this.docToString(arguments[x]);
				}
				
				else
				{
					// assign to Array
					args[x] = arguments[x];
				}
			}
			
			args[0] = this.file;
			
			try
			{
				if (this.workflow && this.file == stdout)
				{
					Clib.sprintf(headerStr, "%s [%s]: %s", this.header, this.center(this.levels[sev]), this.oneline);
				}
				
				else
				{
					Clib.sprintf(headerStr, "%s %s[%s] %s", this.getHeaderDate(), this.header, this.center(this.levels[sev]), this.oneline);
				}
				
				for (var i=0; i<this.offset; i++)
				{
					headerStr += this.offsetString;
				}
				
				if (this.file == stdout)
				{
					if(!this.blnHasWrittenToLog)
					{
						// Write header
						INprintf("%s", this.strHeader);
						this.blnHasWrittenToLog = true;
					}
					//args.shift();
					if (typeof(args[1]) == "string")
					{
						args[0] = "%s" + args[1];
						args[1] = headerStr;
					}
					
					else
					{
						args[0] = headerStr + "%s";
					}
					
					INprintf.apply("", args);
				}
				
				else
				{
					if(!this.blnHasWrittenToLog)
					{
						// Write header
						Clib.fprintf(this.file, "%s", this.strHeader);
						this.blnHasWrittenToLog = true;
					}
					Clib.fprintf(this.file, headerStr);
					Clib.fprintf.apply("", args);
					Clib.fflush(this.file);
				}
			}
			
			catch (err)
			{
				if (err.number == "6214")
				{
					if (err.trace.length > 2)
					{
						this.log(sev, "iScriptDebug: script passed illegal print statement: line %s\n", err.trace[2].lineNum);
					}
					
					else
					{
						this.log(sev, "iScriptDebug: script passed illegal print statement: (line unknown)\n");
					}
				}
				
				else
				{
					INprintf("Could not open log file (%s) - using STDOUT", ToString(this.file));
					this.file = stdout;
				}
			}
		}
	};
	
	/** ********************************************************************
	  * Function:   logAlways()
	  * Purpose:    log message to file regardless of current configured
	  *     logging level
	  *
	  * Args(Type): same as log
	  * Returns:    none
	  *********************************************************************/
	this.logAlways = function ()
	{
		var save = this.level;
		this.level = 5;
		this.log.apply(this, arguments);
		this.level = save;
	};
	
	/** ********************************************************************
	  * Function:   logObject(severity, object, maxDepth)
	  * Purpose:    logs the content of an object
	  *
	  * Args(Type): severity (string|int) severity of the error message
	  *         msg (printf format and message) message to log (passed
	  *         straight through to .log())
	  *     object (Object) object to log
	  *     maxDepth (int) maximum number of object levels to tree through
	  *         (default of 1)
	  * Returns:    none
	  *********************************************************************/
	this.logObject = function (severity, object, maxDepth)
	{
		this.incrementIndent();
		
		try
		{
			if (typeof(maxDepth) == "undefined" || isNaN(maxDepth)) var maxDepth = 1;
			
			if (maxDepth<=0)
			{
				this.log(severity, "***Content not logged, set optional parameter \"maxDepth\" to see content***\n");
			}
			else if(typeof(object) != "object")
			{
				this.log(severity, "%s\n", object);
			}
			else
			{
				var INObjectListIndex = -1;
				for (var i=0; i<this.INObjectList.length; i++)
				{
					if (object instanceof this.INObjectList[i]["obj"])
					{
						INObjectListIndex = i;
						for (var j=0; j<this.INObjectList[i]["properties"].length; j++)
						{
							if (typeof(object[this.INObjectList[i]["properties"][j]]) == "undefined") continue;
							if (typeof(object[this.INObjectList[i]["properties"][j]]) == "object")
							{
								this.log(severity, "[%s] =>\n", this.INObjectList[i]["properties"][j]);
								this.logObject(severity, object[this.INObjectList[i]["properties"][j]], maxDepth-1);
							}
							else
							{
								//skip this element if it is a function
								if (ToString(object[this.INObjectList[i]["properties"][j]]).indexOf(") { [native code] }") == -1)
								{
									this.log(severity, "[%s] => %s%s", this.INObjectList[i]["properties"][j], (typeof(object[this.INObjectList[i]["properties"][j]])=="string")?"\""+object[this.INObjectList[i]["properties"][j]]+"\"":object[this.INObjectList[i]["properties"][j]], (ToString((typeof(object[this.INObjectList[i]["properties"][j]])=="string")?"\""+object[this.INObjectList[i]["properties"][j]]+"\"":object[this.INObjectList[i]["properties"][j]]).substr(-1,1)=="\n")?"":"\n");
								}
							}
						}
						break;
					}
				}
				
				for (var arg in object)
				{
					if (typeof(object[arg]) == "object")
					{
						if (object[arg] instanceof Date)
						{
							this.log(severity, "[%s] => %s (Date)\n", arg, object[arg].toString());
						}
						else
						{
							this.log(severity, "[%s] =>\n", arg);
							this.logObject(severity, object[arg], maxDepth-1);
						}
					}
					else
					{
						//skip this element if it was logged via INObjectList
						if (INObjectListIndex != -1)
						{
							var skip = false;
							for (var i=0; i<this.INObjectList[INObjectListIndex]["properties"].length; i++)
							{
								if (arg == this.INObjectList[INObjectListIndex]["properties"][i])
								{
									skip = true;
									break;
								}
							}
							if (skip) continue;
						}
						
						//skip this element if it is a function
						if (ToString(object[arg]).indexOf(") { [native code] }") == -1)
						{
							this.log(severity, "[%s] => %s%s", arg, (typeof(object[arg])=="string")?"\""+object[arg]+"\"":object[arg], (ToString((typeof(object[arg])=="string")?"\""+object[arg]+"\"":object[arg]).substr(-1,1)=="\n")?"":"\n");
						}
					}
				}
			}
		}
		
		catch(e)
		{
			this.log(severity, "Unable to log object\n");
		}
		
		this.decrementIndent();
	}
	
	/** ********************************************************************
	  * Function:   showMsgCounts(level)
	  * Purpose:    displays the number of messages for each debug level
	  *
	  * Args(Type): level (debug level)
	  * Returns:    none
	  *********************************************************************/
	this.showMsgCounts = function (l)
	{
		var str = "\nDebug message counts:\n";
		
		for (var i = 0; i < getArrayLength(this.msgCount); i++)
		{
			Clib.sprintf(str, "%sLevel %d [%s]: %d\n", str, i, this.center(this.levels[i]), this.msgCount[i]);
		}
		
		this.log(l, str);
	};
	
	/** ********************************************************************
	  * Function:   showINowInfo(level)
	  * Purpose:    Displays imagenow version info
	  *
	  * Args(Type): level (debug level)
	  * Returns:    none
	  *********************************************************************/
	this.showINowInfo = function (l)
	{
		try
		{
			var ds = "";
			var rtn = "";
			var str = "";
			
			// version
			GetPrivateProfileString("General", "product.version", "6.0+", rtn, 40, ".." + this.pathSep + "etc" + this.pathSep + "inow.ini");
			str += "Version: " + rtn.toString();
			
			// db
			GetPrivateProfileString("General", "product.db", "Unknown", rtn, 40, ".." + this.pathSep + "etc" + this.pathSep + "inow.ini");
			
			if (rtn == "Unknown")
			{
				GetPrivateProfileString("ODBC", "odbc.dbms", "Unknown", rtn, 40, ".." + this.pathSep + "etc" + this.pathSep + "inow.ini");
			}
			
			str += ", Database: " + rtn.toString();
			
			if (this.workflow)
			{
				str = "ImageNow info:  [Running from workflow] " + str;
			}
			
			else
			{
				str = "ImageNow info:  [Running from intool] " + str;
			}
			
			this.log(l, "%s\n", str);
		}
		
		catch (err)
		{
			this.log(l, "Could not get ImageNow version info: %s\n", err);
		}
	};
	
	/** ********************************************************************
	 * Displays imagenow version info
	 * @param {String|int} l debug level to output as
	 * @return {undefined}
	 **********************************************************************/
	iScriptDebug.prototype.showINowInfo2 = function (l, blnExtended)
	{
		blnExtended = blnExtended === true ? true : false;
		try
		{
			this.mapConfig = {exec:{},intool:{},server:{},workflow:{},inow:{}};
			var strPathToIni = ".." + this.pathSep + "etc" + this.pathSep;
			if(blnExtended)
			{
				if(global.currentWfItem)
				{
					this.currentWfItem = new INWfItem(global.currentWfItem.id);
					if(!this.currentWfItem || this.currentWfItem.getInfo() !== true)
					{
						this.currentWfItem = false;
					}
					else
					{
						this.mapConfig.exec.user = this.currentWfItem.stateUserName;
					}
				}
			}
			if(blnExtended)
			{
				// INTOOL
				this.mapConfig.intool.ini   = "intool.ini";
				this.mapConfig.intool.fileDebugLevel = getPrivateProfileString('Logging', 'debug.level.file', "?", strPathToIni+this.mapConfig.intool.ini);
				// SERVER
				this.mapConfig.server.ini   = "inserver.ini";
				this.mapConfig.server.fileDebugLevel = getPrivateProfileString('Logging', 'debug.level.file', "?", strPathToIni+this.mapConfig.server.ini);
				if(this.mapConfig.exec.user)
				{
					this.mapConfig.server.userFileDebugLevel = getPrivateProfileString('Logging', this.mapConfig.exec.user+'.debug.level.file', "Unknown", strPathToIni+this.mapConfig.server.ini);
				}
				// WORKFLOW
				this.mapConfig.workflow.ini = "inserverWorkflow.ini";
				this.mapConfig.workflow.fileDebugLevel = getPrivateProfileString('Logging', 'debug.level.file', "?", strPathToIni+this.mapConfig.workflow.ini);
				if(this.mapConfig.exec.user)
				{
					this.mapConfig.workflow.userFileDebugLevel = getPrivateProfileString('Logging', this.mapConfig.exec.user+'.debug.level.file', "Unknown", strPathToIni+this.mapConfig.workflow.ini);
				}
			}
			// INOW
			this.mapConfig.inow.ini     = "inow.ini";
			this.mapConfig.inow.version = getPrivateProfileString('General', 'product.version', "6.0+",    strPathToIni+this.mapConfig.inow.ini); // pre-6.x
			this.mapConfig.inow.db      = getPrivateProfileString('General', 'product.db',      null,      strPathToIni+this.mapConfig.inow.ini); // pre-6.x
			this.mapConfig.inow.dbms    = getPrivateProfileString('ODBC',    'odbc.dbms',       "Unknown", strPathToIni+this.mapConfig.inow.ini); // 6.x+
			// EXEC
			this.mapConfig.exec.runningFrom = this.workflow ? 'WORKFLOW' : 'INTOOL';
			var str = Clib.rsprintf
			(
				"Info: Running from:[%s] Version:[%s] Database:[%s]",
				this.mapConfig.exec.runningFrom,
				this.mapConfig.inow.version,
				this.mapConfig.inow.db ? this.mapConfig.inow.db : this.mapConfig.inow.dbms
			);
			if(blnExtended)
			{
				if(this.workflow)
				{
					str += Clib.rsprintf
					(
						" Logging: Workflow:[%s%s] Server:[%s%s] Iscript:[%s]",
						!this.mapConfig.workflow.userFileDebugLevel ? '' : this.mapConfig.workflow.userFileDebugLevel+':',
						this.mapConfig.workflow.fileDebugLevel,
						!this.mapConfig.server.userFileDebugLevel ? '' : this.mapConfig.server.userFileDebugLevel+':',
						this.mapConfig.server.fileDebugLevel,
						this.level
					)
				}
				else
				{
					str += Clib.rsprintf
					(
						" Logging: Intool:[%s] Server:[%s%s] Iscript:[%s]",
						this.mapConfig.intool.fileDebugLevel,
						!this.mapConfig.server.userFileDebugLevel ? '' : this.mapConfig.server.userFileDebugLevel+':',
						this.mapConfig.server.fileDebugLevel,
						this.level
					);
				}
			}
			this.log(l?l:'DEBUG', "%s\n", str);
		}
		catch (err)
		{
			this.log(l?l:'DEBUG', "iScriptDebug.prototype.showINowInfo: Could not get ImageNow version info: [%s]\n", err);
		}
		return undefined;
	};
	
	/** ********************************************************************
	  * Function:   logDoc(l, doc)
	  * Purpose:    prints out the document keys and id0, id1 to log
	  *     Obsoleted by log which will take a %s, Document()
	  *     and do the right thing.
	  *
	  * Args(Type): doc (Document|INDocument|INKeys)
	  *             l (debug level)
	  * Returns:    none
	  *********************************************************************/
	this.logDoc = function (l, doc)
	{
		//this.log(l, "-%s/%s/%s/%s/%s/%s-%s/%s-\n", doc.Drawer, doc.Folder, doc.Tab, doc.F3, doc.F4, doc.F5, doc.Doc_ID_0, doc.Doc_ID_1);
		this.log(l, "%s\n", this.docToString(doc));
	};
	
	/** ********************************************************************
	  * Function:   docToString(doc)
	  * Purpose:    returns a string representation of doc
	  *
	  * Args(Type): doc (Document|INDocument|INKeys)
	  * Returns:    str (string)
	  *********************************************************************/
	this.docToString = function(doc)
	{
		var str = "";
		try
		{
			if (typeof(INDocument) != "undefined")
			{
				// sunflower
				if (doc instanceof INDocument)
				//if (defined(doc.drawerId))
				{
					Clib.sprintf(str, "-%s/%s/%s/%s/%s/%s-%s-V:%d-%s-", ToString(doc.drawer), ToString(doc.folder), ToString(doc.tab), ToString(doc.f3), ToString(doc.f4), ToString(doc.f5), ToString(doc.docTypeName), doc.underVersionControl ? ToNumber(doc.currentVersionNum) : 0, ToString(doc.id));
				}
				
				else if (doc instanceof INKeys)
				{
					Clib.sprintf(str, "-%s/%s/%s/%s/%s/%s-%s(INKeys) -", ToString(doc.drawer), ToString(doc.folder), ToString(doc.tab), ToString(doc.f3), ToString(doc.f4), ToString(doc.f5), ToString(doc.docTypeName));
				}
				
				else
				{
					Clib.sprintf(str, "->>> getInfo() not called <<< -%s-", ToString(doc.id));
				}
			}
			
			else
			{
				Clib.sprintf(str, "-%s/%s/%s/%s/%s/%s-%d-%s/%s-", ToString(doc.Drawer), ToString(doc.Folder), ToString(doc.Tab), ToString(doc.F3), ToString(doc.F4), ToString(doc.F5), ToNumber(doc.Total_Pages), ToString(doc.Doc_ID_0), ToString(doc.Doc_ID_1));
			}
			
			return str;
		}
		
		catch(e)
		{
			INprintf("e is %s\n", e.toString());
			return "Bad Doc Passed";
		}
	};
	
	/** ********************************************************************
	  * Function:   getHeaderDate()
	  * Purpose:    returns a formatted date - MM/DD HH:MM:SS.MSS
	  *
	  * Args(Type): none
	  * Returns:    d (string)
	  *********************************************************************/
	this.getHeaderDate = function ()
	{
		var d = "";
		Clib.sprintf(d, "%02d/%02d %s.%03d", this.ctime.getMonth()+1, this.ctime.getDate(), this.ctime.toTimeString(), this.ctime.getMilliseconds());
		return d;
	};
	
	/** ********************************************************************
	  * Function:   GetDateYYYYMMDD()
	  * Purpose:    returns a formatted date - YYYYMMDD
	  *
	  * Args(Type): none
	  * Returns:    todayDate (string)
	  *********************************************************************/
	this.GetDateYYYYMMDD = function ()
	{
		var todayDate = "";
		Clib.sprintf(todayDate, "%04d%02d%02d", this.ctime.getFullYear(), this.ctime.getMonth()+1, this.ctime.getDate());
		return (todayDate);
	};
	
	/** ********************************************************************
	  * Determine if a level would output
	  * @param {String|int} strLevel
	  * @return {Boolean} null on error
	  *********************************************************************/
	this.checkLevel = function(strLevel)
	{
		var intLevel = this.levelHash[strLevel]!==undefined?this.levelHash[strLevel]:parseInt(strLevel);
		if(isNaN(intLevel))
		{
			return null;
		}
		return intLevel <= this.level;
	};
	
	/** ********************************************************************
	  * Function:   populateINObjectList()
	  * Purpose:    populates INObjectList with object/tagList appropriate
	  *     to the version of the product in use
	  *
	  * Args(Type): none
	  * Returns:    none
	  *********************************************************************/
	this.populateINObjectList = function ()
	{
		try
		{
			//6.x
			if (typeof(INClassProp) != "undefined") this.INObjectList.push({obj:INClassProp, properties:["id","name","isRequired"]});
			if (typeof(INDocType) != "undefined") this.INObjectList.push({obj:INDocType, properties:["id","name","desc","isActive","props"]});
			if (typeof(INDocTypeList) != "undefined") this.INObjectList.push({obj:INDocTypeList, properties:["id","name","desc","isActive"]});
			if (typeof(INDocument) != "undefined") this.INObjectList.push({obj:INDocument, properties:["id","drawer","folder","tab","f3","f4","f5","docTypeName","drawerId","docTypeId","isUnderVersionControl","currentVersionNum","isCheckedout","checkedoutNotes","checkoutUserName","checkoutUserId","checkoutProjectId","creationUserName","creationUserId","creationTime","modUserName","modUserId","modTime","notes","instanceId","itemID","itemState","itemUserName","checkedOutTime","lastViewedUserName","lastViewedTime","privateName","privs"]});
			if (typeof(INDrawer) != "undefined") this.INObjectList.push({obj:INDrawer, properties:["id","name"]});
			if (typeof(INFont) != "undefined") this.INObjectList.push({obj:INFont, properties:["id","name","color","size","width","weight","orientation","bold","italic","underline","strikeout","charset","escapement","outPrecision","clipPrecision","quality","pitchAndFamily"]});
			if (typeof(INInstanceProp) != "undefined") this.INObjectList.push({obj:INInstanceProp, properties:["id","name","type","displayFormat"]});
			if (typeof(INKeys) != "undefined") this.INObjectList.push({obj:INKeys, properties:["drawer","folder","tab","f3","f4","f5","docTypeName"]});
			if (typeof(INLogicalObject) != "undefined") this.INObjectList.push({obj:INLogicalObject, properties:["docid","versionNum","sequenceNum","id","versionId","workingPath","immutable","creationTime","creationUserId","creationUserName","creationTime","modUserId","modUserName","contentStatus","contentTime","origId","phsobId"]});
			if (typeof(INMail) != "undefined") this.INObjectList.push({obj:INMail, properties:["from","to","cc","bcc","subject","body","smtp","smtpFrom","smtpPort","attachment"]});
			if (typeof(INProject) != "undefined") this.INObjectList.push({obj:INProject, properties:["id","name","typeId","typeName","customProps","typeId","cretionUserId","creationUserName","creationTime","modUserId","modUserName","modTime","status","statusUserId","statusUserName","statusTime","completionUserId","completionUserName","completionTime","priority","hasRequiredDocTypes"]});
			if (typeof(INProjectType) != "undefined") this.INObjectList.push({obj:INProjectType, properties:["id","name","desc","isActive","namingRule","creationUserId","creationUserName","creationTime","modUserId","modUserName","modTime","customProps","docTypes"]});
			if (typeof(INProperty) != "undefined") this.INObjectList.push({obj:INProperty, properties:["id","name","type","defaultValue","displayFormat","isActive"]});
			if (typeof(INSubObject) != "undefined") this.INObjectList.push({obj:INSubObject, properties:["id","type","templId","creationUserId","creationUserName","creationTime","modUserId","modUserName","modTime","ipod","pageNumber","location","creationOrientation","color","width","phsobId","objPath","fileType","workingName","privs","fillColor","opacity","frameColor","frameStyle","frameThickness","frameCornerRadius","frameMarginX","frameMarginY","scaleX","scaleY","justify","text","font","actionType","actionValue","formId"]});
			if (typeof(INSubobTemplate) != "undefined") this.INObjectList.push({obj:INSubobTemplate, properties:["id","name","type","desc","creationUserId","creationUserName","creationTime","modUserId","modUserName","modTime","isPartOfDoc","isOnAllPages","isActive","immutable","formId","privs","props"]});
			if (typeof(INUser) != "undefined") this.INObjectList.push({obj:INUser, properties:["id","name","desc","org","orgUnit","email","lastName","firstName","title","locale","phone","mobile","pager","fax","state"]});
			if (typeof(INVersion) != "undefined") this.INObjectList.push({obj:INVersion, properties:["id","docId","versionNum","isProvisional","logobCount","creationUserId","creationUserName","creationTime","modUserId","modUserName","modTime","lastviewUserId","lastviewUserName","lastviewTime","checkinUserId","checkinUserName","checkinTime","checkinNotes","isCurrent","isPrivate","privateUserId","privateUserName"]});
			if (typeof(INWfItem) != "undefined") this.INObjectList.push({obj:INWfItem, properties:["id","type","objectId","objectLock","priority","isChildItem","parentItemId","creationUserId","creationUserName","creationTime","completeTime","queueSeqNum","queueId","queueName","queueStartUserId","queueStartUserName","queueStartTime","stateSeqNum","state","stateDetail","stateUserId","stateUserName","stateStartTime","scriptExecuted","holdUntilTime","destinationQueueId","totalHoldTime","childGenerationNum","objPriv","queuePriv"]});
			if (typeof(INWfQueue) != "undefined") this.INObjectList.push({obj:INWfQueue, properties:["id","name"]});
			if (typeof(INWorksheet) != "undefined") this.INObjectList.push({obj:INWorksheet, properties:["id","name"]});
			if (typeof(INWsDataDef) != "undefined") this.INObjectList.push({obj:INWsDataDef, properties:["id","name"]});
			if (typeof(INWsPresentation) != "undefined") this.INObjectList.push({obj:INWsPresentation, properties:["id","name"]});
			
			//5.4x
			if (typeof(Batch) != "undefined") this.INObjectList.push({obj:Batch, properties:["SerialNumber","Type","Step","State","CreationDate","ModificationDate","TotalPages","PagesProcessed","PagesDiscarded","CreationUser","CheckedOutUser","QAUser","LinkUser","Notes","Logging"]});
			if (typeof(CnDocument) != "undefined") this.INObjectList.push({obj:CnDocument, properties:["CnDocID","SpoolID","Drawer","Folder","Tab","F3","F4","F5","F6","F7","F8","F9","FirstPage","PageCount"]});
			if (typeof(CnItem) != "undefined") this.INObjectList.push({obj:CnItem, properties:["CnDocID","ItemNumber","ItemValue1","ItemValue2","ItemValue3","ItemValue4","ItemValue5"]});
			if (typeof(CnReportCol) != "undefined") this.INObjectList.push({obj:CnReportCol, properties:["ReportID","ReportName","Drawer","Folder","Tab","F3","F4","F5","F6","F7","F8","F9"]});
			if (typeof(CnSpool) != "undefined") this.INObjectList.push({obj:CnSpool, properties:["SpoolID","OSMTreeID","IOK1","IOK2","IOK3","ReportID","TotalTime","TotalImportTime","CreationTime","UploadTime","ImportTime","TotalPages","CurrentPageCount","Notes","Logging","Step","State"]});
			if (typeof(Document) != "undefined") this.INObjectList.push({obj:Document, properties:["Drawer","Folder","Tab","F3","F4","F5","Doc_ID_0","Doc_ID_1"]});
			if (typeof(DocumentEx) != "undefined") this.INObjectList.push({obj:DocumentEx, properties:["Doc_ID_0","Doc_ID_1","ScanUser","ScanTime","ModUser","ModTime","LastViewedUser","DrawerName","LastViewedTime","DocType"]});
			if (typeof(DocExKeyword) != "undefined") this.INObjectList.push({obj:DocExKeyword, properties:["Doc_ID_0","Doc_ID_1","AppendageID","FreeField"]});
			if (typeof(DocLock) != "undefined") this.INObjectList.push({obj:DocLock, properties:["Doc_ID_0","Doc_ID_1","Drawer","Folder","Tab","F3","F4","F5","LockType","LockingUserID","Modified","Time_0","Time_1"]});
			if (typeof(Drawer) != "undefined") this.INObjectList.push({obj:Drawer, properties:["DrawerName","DrawerID","DrawerDesc","DeptID"]});
			if (typeof(General) != "undefined") this.INObjectList.push({obj:General, properties:["GenType","GenCode","GenDesc"]});
			if (typeof(IOK) != "undefined") this.INObjectList.push({obj:IOK, properties:["Doc_ID_0 ","Doc_ID_1","PageNumber ","OSMTreeID","IOK1 ","IOK2 ","IOK3","FileType","LinkUserID","LinkTime","ModUserID","ModTime"]});
			if (typeof(OsmControl) != "undefined") this.INObjectList.push({obj:OsmControl, properties:["OsmSetID","OsmType","OsmSetDesc","TreeIDInUse","Notes"]});
			if (typeof(OsmRedirection) != "undefined") this.INObjectList.push({obj:OsmRedirection, properties:["OsmSetID","RedirectionValue","RedirectionType","RedirectionLogic"]});
			if (typeof(OsmReference) != "undefined") this.INObjectList.push({obj:OsmReference, properties:["Osm_TreeID","IOK_1","IOK_2","IOK_3","Ref_Count"]});
			if (typeof(OsmTree) != "undefined") this.INObjectList.push({obj:OsmTree, properties:["TreeID","OsmSetID","MirroringOn","RetrieveTree","TreeDesc","TreePath","TreePathMirror","TreeShdwPath","TreeShdwPathMirror","NextSlot","Retries","Delay","MaxFilePerDir"]});
			if (typeof(QAlarm) != "undefined") this.INObjectList.push({obj:QAlarm, properties:["QID","AlarmType","AlarmValue","AlarmNumber","ModificationDate","TriggerType","TriggerValue","ResultValue","AlarmPriority"]});
			if (typeof(QHistory) != "undefined") this.INObjectList.push({obj:QHistory, properties:["ItemID ","QID ","State ","Reason ","InstanceTime ","WFStartTime ","WFFinishTIme ","QStartTime ","QFinishTime","UserID ","ComputerName","DomainName","NetcardAddr","Entity","PriorQID","PriorViewTime","FirstViewTime","TotalHoldTime","Description"]});
			if (typeof(Queue) != "undefined") this.INObjectList.push({obj:Queue, properties:["QName","QID ","ItemsInQ","ItemsNotProcessed ","ItemsBeingProcessed ","ItemsOnHold ","Status ","Alarm ","HelpTips ","Notes","QType","CanRouteback","ItemsPending","ItemsCompleted","Coordinates","WorkspaceID","WorkspaceName","InboundScript","OutboundScript","Misc"]});
			if (typeof(QueueRoute) != "undefined") this.INObjectList.push({obj:QueueRoute, properties:["OriginQid","DestQid","RouteType"]});
			if (typeof(QueueUser) != "undefined") this.INObjectList.push({obj:QueueUser, properties:["QID","UserID ","IsAGroup ","SeesQAs ","Misc"]});
			if (typeof(Script) != "undefined") this.INObjectList.push({obj:Script, properties:["ScriptID","ScriptName","Description","Language","CreationDate","CreationUserID","ModificationDate","ModificationUserID","Data"]});
			if (typeof(ScriptEvent) != "undefined") this.INObjectList.push({obj:ScriptEvent, properties:["EventID","Class","Qualifier1","Qualifier2","Qualifier3","Qualifier4","Qualifier5","Qualifier6","Event","ScriptID"]});
			if (typeof(SubLock) != "undefined") this.INObjectList.push({obj:SubLock, properties:["Sub_ID_0","Sub_ID_1","Doc_ID_0","Doc_ID_1","PageNumber","UserID","LockType","Time_0","Time_1"]});
			if (typeof(Template) != "undefined") this.INObjectList.push({obj:Template, properties:["AppletName","TemplateName","Tag","Value"]});
			if (typeof(UserDrawer) != "undefined") this.INObjectList.push({obj:UserDrawer, properties:["UserID","DrawerID"]});
			if (typeof(UserProcessControl) != "undefined") this.INObjectList.push({obj:UserProcessControl, properties:["UserID","Domain","IPAddr","PortNumber","ProcessID","StartTime","SysFlag","SysMsg","LogonsEnabled","LogonsMsg","LicenseType"]});
			if (typeof(UserProfile) != "undefined") this.INObjectList.push({obj:UserProfile, properties:["UserName","UserID","UserPriv","IsAGroup","GroupMembership","AuditingOn","User_Type","State"]});
			if (typeof(WFItem) != "undefined") this.INObjectList.push({obj:WFItem, properties:["Doc_ID_0 ","Doc_ID_1 ","ItemID ","State","CurrentQID ","UserID ","LinkType","ItemType","Priority","InstanceTime","WFStartTime","QStartTime","DescriptiveName","Misc"]});
			if (typeof(Workspace) != "undefined") this.INObjectList.push({obj:Workspace, properties:["WorkspaceName","WorkspaceID","Description","Notes"]});
		}
		catch (e)
		{
			this.log("ERROR", "iScriptDebug:  Error in populateINObjectList()\n");
		}
	}
	
	/** ********************************************************************
	  * Constructor
	  *********************************************************************/
	if (typeof(INprintf) == "undefined")
	{
		// for backwards compatibility
		INprintf = function()
		{
			printf.apply("", arguments);
		};
		
		GetPrivateProfileString = function(a0, a1, a2, &a3, a4, a5)
		{
			// pull out length arguments
			a3 = getPrivateProfileString(a0, a1, a2, a5);
		};
	}
	else if(typeof(getPrivateProfileString) == "undefined")
	{
		// 6.0 -> 5.4
		global.getPrivateProfileString = function(a0, a1, a2, a5)
		{
			a2 = a2?a2:"";
			var a3 = '';
			var a4 = 40;
			GetPrivateProfileString(a0, a1, a2, a3, a4, a5);
			return a3;
		}
	}
	
	this.startTime = Clib.time();
	this.ctime = this.getDateObject();
	
	var fileSep = "";
	var wfItem = "";
	
	if (level)
	{
		this.level = level;
	}
	
	// find out how we are being ran (workflow or intool)
	if(typeof(INDocument) != "undefined")
	{
		// 6.0
		if (typeof(currentWfItem) != "undefined")
		{
			wfItem = true;
		}
	}
	else if(typeof(GetCurrentWFItemID) != "undefined")
	{
		// pre 6.0
		GetCurrentWFItemID(wfItem);
	}
	else
	{
		throw("iScriptDebug: Unable to determine WORKFLOW/INTOOL");
	}
	
	if (wfItem == "")
	{
		this.workflow = false;
	}
	
	else
	{
		this.workflow = true;
	}
	
	//populate INObjectList
	this.populateINObjectList();
	
	// initalize count vars
	this.msgCount = new Array();
	for (var i in this.levels)
	{
		this.msgCount[i] = 0;
	}
	
	if ((typeof(_WINDOWS_) != "undefined")  || typeof(_WIN32_) != "undefined" )
	{
		fileSep = "\\";
	}
	
	else if (typeof(_UNIX_) != "undefined")
	{
		fileSep = "/";
	}
	
	else
	{
		INprintf("Could not determine OS");
		this.file = stdout;
		return this;
	}
	
	this.pathSep = fileSep;
	var arrFileSplit = _argv[0].split(this.pathSep);
	this.strScriptName = arrFileSplit[arrFileSplit.length-1].replace(/\.jsh?/,'');
	
	if (header)
	{
		if (header == "USE SCRIPT FILE NAME")
		{
			try
			{
				header = SElib.splitFilename(_argv[0]).name;
			}
			
			catch (err)
			{
				INprintf("Could not determine file name!\n");
			}
		}
		
		this.header = Clib.rsprintf("%s:%02s ", header, (this.ctime.valueOf()%(36*2)).toString(36).toUpperCase());
	}
	
	if (logToFile)
	{
		// log to ../log/ with the correct file format
		// if we can't open file, log to stdout
		try
		{
			if(this.queueName != "")
			{
				this.strLogFileName = header + "_" + this.queueName.replace(/\W/g, '-') + "_" + this.GetDateYYYYMMDD() + ".log";
			}
			else
			{
				this.strLogFileName = header + "_" + this.GetDateYYYYMMDD() + ".log";
			}
			this.strLogFilePath = SElib.fullpath(".." + fileSep + "log" + fileSep + this.strLogFileName);
			this.file = Clib.fopen(this.strLogFilePath, "a");
			if(!this.file)
			{
				INprintf("iScriptDebug: Unable to open file: [%s] Clib Error: [%s]\n", this.strLogFilePath, Clib.strerror(Clib.errno.valueOf()));
			}
			else if(blnExclusive)
			{
				if(Clib.flock(this.file, LOCK_EX) !== 0)
				{
					INprintf("iScriptDebug: Unable to get exclusive lock on file: [%s] Error: [%s][%s]\n", this.strLogFilePath, Clib.errno.valueOf(), Clib.strerror(Clib.errno.valueOf()));
					this.file = null;
					return this;
				}
				this.log('DEBUG', "iScriptDebug: Exclusive log file lock!\n");
			}
			Clib.fflush(this.file);
		}
		catch (err)
		{
			INprintf("Could not open log file (%s) - using STDOUT", ToString(this.file));
			this.file = stdout;
		}
	}
	else if(blnExclusive)
	{
		this.log('CRITICAL', "iScriptDebug: Exclusive log file lock can only be used for logging to a file!\n");
		throw('Exclusive log file lock can only be used for logging to a file!');
	}
	return this;
}
//
