/********************************************************************************
	Name:			TU_ADM_UpdateChecklist.js
	Author:			Perceptive Software
	Created:		01/10/2011-ADD
	Last Updated:	08/27/2018   KW   Changed all envoy web service calls to MSXML2.ServerXMLHTTP.6.0 calls. Update to the latest STL
	For Version:	7.x
	Script Version: $Id$
--------------------------------------------------------------------------------
    Summary:
		Inbound script to update checklist items in PeopleSoft to complete for
		Transcript documents.  Script will first call PeopleSoft's Find web service
		operation using document's TU ID (i.e. Folder index), 'ADMA' admin function,
		and 'UG12' (configurable) checklist code.  The find operation will return
		one or more SEQ_3C's, which are then used in a DB query to get the checklist
		items that aren't complete.  The script will then call the Update Web service
		operation to complete the checklist item.  Document is routed based on the
		following logic:
			* If document type = 'Transcript - HS Final', route document to UG_HS Tran-
			scripts Final workflow queue.
			* If the script finds a Evaluation Form document with the same TU ID and its
			Action custom property is equal to 'Admit' or 'Matriculation' the document
			is routed to UG_Transfer Evaluation queue.  If Admit is equal to something
			else, the document is routed to UG_Decision Final.
			* Else the document is left in the current queue.
		If any errors occur the document is routed to UG_DocSortError.

	Mod Summary:
		09/02/2011 - lisa wood - new CHECKLIST_CDS_FOR_QUERY to 2012
		10/30/2011 - Jay Taffel - changed mode of writing to the doc notes from overwrite to setDocNotes.APPEND
		02/01/2012 - Jay Taffel - changed statusDate from doc creation date to current date & kept hours (not set to UTC midnight)
		02/14/2012 - Jay Taffel - If no match, route to Parking queue, not error queue. Break infinite loop of docs between Doc_Sort, Update
								  Checklist and Doc_SortError.
		03/05/2012 - ECB - copied from PRODUCTION, changed var HOST_DSN = "CS9PRD"; to "CS9SAUA"
		08/01/2012 - IN TEAM (Jay, Wim, Eric) - used lib files for SQL calls, hard coded 'UG13TR','UG13FR' into TU_ADM_LIB_SQL_Queries.jsh
		12/05/2012 - Jay Taffel - more logging of Envoy calls
		01/14/2013 - 02/06/2013 - ECB & Jay Taffel - Modified script to incorporate Regi transcript and updating Regi Checklists. New code from line 430 - 671
		02/20/2013 - ECB - changed from removing documents that updated regi checklists from workflow, to routing those items to regi queues. lines 72 - 75 and 621 - 635
		01/31/2013 - ECB - Changed AlertINAdmins (line 519) file name to correct name TU_UpdateChecklistUsingEnvoy_2012.js
	    02/01/2013 - JMT better logic (than somebody & Perceptive) for no results from SQL query, skip useless Envoy call
	    05/01/2013 - JMT & ECB - If checklist person or item is already complete, route to UG Final (CSR 2282) . 2 SQL calls and routeitems. See changed TU_ADM_LIB_SQL_Queries.jsh
		05/03/2013 - ECB - Copied from DEV, changed file name stripping the "_2012", changed file name in catch to TU_UpdateChecklistUsingEnvoy.js from TU_UpdateChecklistUsingEnvoy_2012.js/DEV
		Note! This program used to be very similar to TU_UpdateChecklist_1Script_2012.js. The above two changes were NOT added to the intool script - TU_UpdateChecklist_1Script_2012.js
		12/16/2013 - ECB & JMT - Routes HS 9-12 to GRADES queue
		09/12/2014 - JMT - Use TU_ADM_LIB_SQL_Queries.js and not js for change to 2015 applications
		05/01/2016 - TechHelp 121076 - IN Team - New SAT scores for 2016 - Change some libraries to js from jsh and other standards
		06/13/2018 - JMT - Techhelp 231610 Look for TRN records. Same as EDUC above with slight variations in SQL query and webservice payload
		08/27/2018   KW   Changed all envoy web service calls to MSXML2.ServerXMLHTTP.6.0 calls. Update to the latest STL
		!!!09/26/2019 Rename of file from TU_UpdateChecklistUsingEnvoy to match all the other scripts for UGRD Admissions workspace.
		09/26/2019 JMT - TH 307854 New queries for checklist ADMP / TREVAL. Replacing _TRN series of queries.
		01/27/2020 JMT - TechHelp 322287 Change routing logic for TREVAL items

	Business Use:
		Inbound script to update checklist items in PeopleSoft to complete for
		Transcript documents.

********************************************************************************/
//******************************* LOGGING *****************************
//#include "$IMAGENOWDIR6$/script/STL/packages/Logging/iScriptDebug.js"
var LOG_TO_FILE 		= true;    // false - log to stdout if ran by intool, true - log to inserverXX/log/ directory
var DEBUG_LEVEL 		= 5;       // 0 - 5.  0 least output, 5 most verbose
var SPLIT_LOG_BY_THREAD = false;   // set to true in high volume scripts when multiple worker threads are used (workflow, external message agent, etc)
var MAX_LOG_FILE_SIZE 	= 100;     // Maximum size of log file (in MB) before a new one will be created
var debug = "";
var strThisScript = "TEST TU_ADM_UpdateChecklist.js";

//************************** INCLUDE Towson COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/TU_LIB_TU_FUNCTIONS.js"
#include "$IMAGENOWDIR6$/script/TU_LIB_DB_CONNECTION.js"  // Database configuration
#include "$IMAGENOWDIR6$/script/TU_LIB_WEB_SERVICE_CONFIG.js"  //Web service configuration

//************************** INCLUDE STL COMMON FUNCTIONS ***********************
#if defined(imagenowDir6)
	#include "$IMAGENOWDIR6$/script/STL/packages/Database/DBAccess.js"
	#include "$IMAGENOWDIR6$/script/STL/packages/Date/convertToDateStr.js"
	#include "$IMAGENOWDIR6$/script/STL/packages/Document/reindexDocument.js"
	#include "$IMAGENOWDIR6$/script/STL/packages/Document/setDocNotes.js"
	#include "$IMAGENOWDIR6$/script/STL/packages/Document/toINKeys.js"
	#include "$IMAGENOWDIR6$/script/STL/packages/Logging/iScriptDebug.js"
	#include "$IMAGENOWDIR6$/script/STL/packages/Object/toJSON.js"
	#include "$IMAGENOWDIR6$/script/STL/packages/Object/xmlToJSON.js"
	#include "$IMAGENOWDIR6$/script/STL/packages/Properties/PropertyManager.js"
	#include "$IMAGENOWDIR6$/script/STL/packages/Workflow/routeItem.js"
#else
	#include "../script/STL/packages/Database/DBAccess.js"
	#include "../script/STL/packages/Date/convertToDateStr.js"
	#include "../script/STL/packages/Document/reindexDocument.js"
	#include "../script/STL/packages/Document/setDocNotes.js"
	#include "../script/STL/packages/Document/toINKeys.js"
	#include "../script/STL/packages/Logging/iScriptDebug.js"
	#include "../script/STL/packages/Object/toJSON.js"
	#include "../script/STL/packages/Object/xmlToJSON.js"
	#include "../script/STL/packages/Properties/PropertyManager.js"
	#include "../script/STL/packages/Workflow/routeItem.js"
#endif

// *********************         Configuration        *******************

//ImageNow workflow queues
#define Q_UG_HS_TRANSCRIPTS_FINAL	"UG_HS Transcripts Final"
#define Q_UG_TRANSFER_EVALUATION	"UG_Transfer Evaluation"
#define Q_UG_DECISION_FINAL			"UG_Decision Final"
#define Q_ERROR 					"UG_DocSortError"
#define UPDATECHECKLIST_NOEVALFORM "UG_HS Transcripts Final"
#define PARKING_QUEUE "UG_Update Checklist Parking"  //02/14/2012 JMT If no match, route to Parking queue
//BEGIN MOD ECB 20130220 to add routing if Regi checklist updated
#define REGI_TRFR "Registrar Transfer Transcripts"
#define REGI_EXTERN_READMT "Registrar External Transcripts"
//END MOD ECB 20130220 to add routing if Regi checklist updated
//BEGIN MOD ECB 20131216 for Transcript HS 9-12 satisfying Grades Checklist
#define GRADES_QUEUE "UG_Grades_Script_Queue"
//END MOD ECB 20131216 for Transcript HS 9-12 satisfying Grades Checklist
//TechHelp 322287 - new college final queue
#define Q_COLLEGE_FINAL "UG_College_Final"


#define IN_VIEW_NAME  "All Documents" // ImageNow View this script will use to look for Evaluation Form documents
#define UG_ADMISSIONS_DRAWER "UG Admissions" // ImageNow drawer

//ImageNow document type configuration
#define TRANSCRIPT_DOC_TYPE_PREFIX "Transcript"
#define EVALUATION_FORM_DOCTYPE "Evaluation Form"
#define TRANSCRIPT_HS_FINAL_DOCTYPE "Transcript - HS Final"
#define TRANSCRIPT_HS_9_12_DOCTYPE "Transcript - HS 9-12"
#define TRANSCRIPT_College_DOCTYPE "Transcript - College"

// Custom property configuration
#define CP_ACTION "Action"
#define ADMIT_VALUE "Admit"
#define MATRICULATION_VALUE "Matriculation"

//Web service configuration
var WEB_SERVICE_HEADER = WEB_SERVICE_HEADER_CHK_F;
/*Replace Envoy BEGIN
#define WEB_SERVICE_NAME "Admissions PeopleSoft Checklist"
#define WS_USERNAME ""
#define WS_PASSWORD  ""
// Web service operation names
#define FIND_OPERATION_NAME "CI_TU_IMG_ADM_CHK_CI_F"
#define UPDATE_OPERATION_NAME "CI_TU_IMG_ADM_CHK_CI_UD"*/

//Web service constants
#define ADMIN_FUNCTION_VALUE "ADMA"
#define TOWSN_INSTITUTION "TOWSN"

//SQL variables for Admissions
#include "$IMAGENOWDIR6$/script/TU_ADM_LIB_SQL_Queries.js"

#define CONFIG_VERIFIED		true	// set to true when configuration values have been verified

// *********************       End  Configuration     *******************

// ********************* Initialize global variables ********************
var numOfChecklistItemsUpdated = 0;  //Start of looking for checklist items. Will be incremented when updates occur.
var numOfChecklistItemsUpdated_R = 0;  //Start of looking for checklist items. Will be incremented when updates occur.

// ********************* Include additional libraries *******************
#link "sedbc"
#link "secomobj" //COM object

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
		debug = new iScriptDebug("USE SCRIPT FILE NAME", LOG_TO_FILE, DEBUG_LEVEL, undefined, {splitLogByThreadID:SPLIT_LOG_BY_THREAD, maxLogFileSize:MAX_LOG_FILE_SIZE});
		debug.showINowInfo("INFO");

		if(!CONFIG_VERIFIED)
		{
			var errorStr = "Configuration not verified.  Please verify \n" +
				"the defines in the *** Configuration *** section at the top \n" +
				"of this script and set CONFIG_VERIFIED to true.  Aborting.\n\n";

			debug.log("CRITICAL", errorStr);
			printf(errorStr);
			return false;
		}
		//check script execution
		//if(typeof(currentWfItem) != "undefined")  //intool
		if(typeof(currentWfItem) == "undefined")  //workflow
		{
			//debug.log("CRITICAL", "This script is designed to run from intool.\n");  //intool
			debug.log("CRITICAL", "This script is designed to run from workflow.\n");  //workflow
			return false;
		}

		// Connect to the database
		var dbAccess = new DBAccess(dbEngine, hostDSN, hostUsername, hostPW);
		if (!dbAccess.open())
		{
			routeItem(wfItem, Q_ERROR, "Failed to connect to the database using '" + hostPW + "' data source");
			return false;
		}
		//Instantiate property manager  //moved to below
		var propMgr = new PropertyManager();

		//Instantiate INRemoteService
		//var service = new INRemoteService(WEB_SERVICE_NAME);

		//Begin of working the inbound wf item
		var wfItem = new INWfItem(currentWfItem.id);
		if (!wfItem.getInfo())
		{
			debug.log("ERROR", "Failed to get info for workflow item ID '%s'.\n", currentWfItem.id);
			return false;
		}
		if (wfItem.type != WfItemType.Document)
		{
			debug.log("INFO", "Workflow item is not a document.\n");
			return true;
		}
		//Initialize wfDoc
		var wfDoc = new INDocument(wfItem.objectId);
		if (!wfDoc.getInfo())
		{
			debug.log("ERROR", "Failed to get info for document ID '%s'\n", wfItem.objectId);
			routeItem(wfItem, Q_ERROR, "Failed to get document info");
			return false;
		}

		debug.log("INFO", "Processing: [%s]\n", wfDoc);

		//See the document is not a transcript document.  If not, exit the script
		if (wfDoc.docTypeName.toUpperCase().indexOf(TRANSCRIPT_DOC_TYPE_PREFIX.toUpperCase()) != 0)
		{
			debug.log("INFO", "Non-Transcript documents are ignored.  Exiting script now.\n");
			return;
		}

		var tuID = trim(wfDoc.field1);

		//Look for incomplete EDUC checklist items that match this transcript.
		//Get this specific CHECKLIST CODE for this person
		var strSql_EDUC = strChecklistSEQ_A.replace(/<CommonID>/, tuID);
		strSql_EDUC = strSql_EDUC.replace(/<AssocID>/, trim(wfDoc.field3));
		var cursor_EDUC = dbAccess.query(strSql_EDUC);
		if (!cursor_EDUC)
		{
			routeItem(wfItem, Q_ERROR, "Error executing query to get checklist code");
			return false;
		}
		if (cursor_EDUC.first())  //have a non-complete EDUC row for this transcript. Update PS.
		{
			debug.log("INFO", "EDUC: Now working non-complete Checklist Code '%s'\n", cursor_EDUC["CHECKLIST_CD"]);
			/*******************************
			 * Build Find Request objects
			********************************/
			var request = WS_FIND_SHELL_TOP_CHK;
			request += '<m40:Find__CompIntfc__TU_IMG_ADM_CHK_CI>';
			request += '<m40:CHECKLIST_CD>' + cursor_EDUC["CHECKLIST_CD"] + '</m40:CHECKLIST_CD>';
			request += '<m40:COMMON_ID>' + tuID + '</m40:COMMON_ID>';
			request += '<m40:ADMIN_FUNCTION>' + ADMIN_FUNCTION_VALUE + '</m40:ADMIN_FUNCTION>';
			request += '</m40:Find__CompIntfc__TU_IMG_ADM_CHK_CI>';
			request += WS_SHELL_BOTTOM;
			debug.logObject(4, request, 40, "request");  //log request
			/*******************************
			 * Call the Find operation
			********************************/
			var findOutput = new Object(), findFaults = new Object();
			findOutput = TU_callOperation(request, findFaults);
			if (!findOutput)
			{
				debug.log("ERROR", "Error calling FIND operation: %s\n", getErrMsg());
				routeItem(wfItem, Q_ERROR, "Error calling FIND Web service operation");
				return false;
			}
			debug.logObject(4, findOutput, 40, "findOutput");
			/*******************************
			 * Process the Find response
			********************************/
			if (findOutput.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"])
			{
				if (Object.prototype.toString.call(findOutput.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"]) == "[object Object]")
						findOutput.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"] = [findOutput.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"]];
				/***********************************************************
				 * Loop thru Find responses
				 ***********************************************************/
				for (var i = 0; i < findOutput.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"].length; i++)
				{
					debug.setIndent(0);
					debug.log("INFO", "EDUC: Looking at SEQ_3C sequence '%s' \n", findOutput.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"][i].SEQ_3C);
					debug.setIndent(1);
					/***********************************************************
					 * Query the DB to get Checklist Items for EDUC
					 ***********************************************************/
					var strSql_ITEM_EDUC = strChecklistItemCD_A.replace(/<CommonID>/, tuID);  //Looks for EDUC item codes
					strSql_ITEM_EDUC = strSql_ITEM_EDUC.replace(/<Seq3C>/, findOutput.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"][i].SEQ_3C);
					strSql_ITEM_EDUC = strSql_ITEM_EDUC.replace(/<AssocID>/, trim(wfDoc.field3));
					var cursor_ITEM_EDUC = dbAccess.query(strSql_ITEM_EDUC);
					if (!cursor_ITEM_EDUC)
					{
						routeItem(wfItem, Q_ERROR, "Error executing query to get checklist item");
						return false;
					}
					if (cursor_ITEM_EDUC.first())  //This transcript checklist item is not complete. Update PS.
					{
						/***********************************************************
						 * Loop thru Checklist Items returned from query
						 ***********************************************************/
						do
						{
							debug.setIndent(1);
							debug.log("INFO", "EDUC: Updating Checklist Item '%s'\n", cursor_ITEM_EDUC["CHKLST_ITEM_CD"]);
							debug.setIndent(2);
							/***********************************************************
							 * Build the Update request
							 ***********************************************************/
							var request = WS_UPDATE_SHELL_TOP_CHK;
							request += '<m95:Updatedata__CompIntfc__TU_IMG_ADM_CHK_CI>';
							request += '<m95:COMMON_ID>' + tuID + '</m95:COMMON_ID>';
							request += '<m95:SEQ_3C>' + findOutput.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"][i].SEQ_3C + '</m95:SEQ_3C>';
							request += '<m95:ADMIN_FUNCTION>' + ADMIN_FUNCTION_VALUE + '</m95:ADMIN_FUNCTION>';
							request += '<m95:CHECKLIST_CD>' + findOutput.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"][i].CHECKLIST_CD + '</m95:CHECKLIST_CD>';
							request += '<m95:INSTITUTION>' + TOWSN_INSTITUTION + '</m95:INSTITUTION>';
							request += '<m95:PERSON_CHK_ITEM>';
							request += '<m95:CHECKLIST_SEQ>' + ToNumber(cursor_ITEM_EDUC["CHECKLIST_SEQ"]) + '</m95:CHECKLIST_SEQ>';
							request += '<m95:CHKLST_ITEM_CD>' + cursor_ITEM_EDUC["CHKLST_ITEM_CD"] + '</m95:CHKLST_ITEM_CD>';
							request += '<m95:ITEM_STATUS>C</m95:ITEM_STATUS>';
							request += '<m95:STATUS_DT_0>' + convertToDateStr(new Date(), 'YYYY-MM-DD') + '</m95:STATUS_DT_0>';
							request += '</m95:PERSON_CHK_ITEM>';
							request += '</m95:Updatedata__CompIntfc__TU_IMG_ADM_CHK_CI>';
							request += WS_SHELL_BOTTOM;
							debug.logObject(4, request, 40, "Update request");  //log request
							/***********************************************************
							 * Call Update operation
							 ***********************************************************/
							var updateOutput = new Object(), updateFaults = new Object();
							updateOutput = TU_callOperation(request, updateFaults);
							//var ret = service.callOperation(UPDATE_OPERATION_NAME, updateInput, updateOutput, updateFaults, WS_USERNAME, WS_PASSWORD); // Call Web service operation
							if (!updateOutput)
							{
								debug.log("ERROR", "Error calling UPDATE operation: %s\n", getErrMsg());
								routeItem(wfItem, Q_ERROR, "Error calling UPDATE Web service operation");
								return false;
							}
							debug.logObject(4, updateOutput, 40, "updateOutput");
							//Update counter to skip next sections
							numOfChecklistItemsUpdated++;
						} // get next checklist item
						while (cursor_ITEM_EDUC.next());

						debug.setIndent(1);
					} //end of true found checklist item EDUC to update
					else  //See if EDUC checklist item is already complete
					{
						debug.log("DEBUG", "No incomplete EDUC checklists found for the following query: %s\n", strSql_ITEM_EDUC);  //bug fix JMT 20190109
						debug.log("DEBUG", "Look for Complete EDUC checklist items.\n");
						var strSql_ItemComplete = strChecklistItemCD_Complete.replace(/<CommonID>/, tuID);
						strSql_ItemComplete = strSql_ItemComplete.replace(/<Seq3C>/, findOutput.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"][i].SEQ_3C);
						strSql_ItemComplete = strSql_ItemComplete.replace(/<AssocID>/, trim(wfDoc.field3));
						var cursor_ItemComplete = dbAccess.query(strSql_ItemComplete);
						if (!cursor_ItemComplete)
						{
							routeItem(wfItem, Q_ERROR, "Error executing query to get checklist item");
							return false;
						}
						if (cursor_ItemComplete.first())  //This transcript checklist item *IS* complete. Route item to final queue.
						{
							//BEGIN MOD ECB 20131216 for Transcript HS 9-12 satisfying Grades Checklist
							if (wfDoc.docTypeName.toUpperCase() == TRANSCRIPT_HS_9_12_DOCTYPE.toUpperCase())
							{
								debug.logln(4, "Checklist item already complete, routed to GRADES_QUEUE.");
								routeItem(wfItem, GRADES_QUEUE, "Checklist item already complete, routed to GRADES_QUEUE");
								cursor_ItemComplete.close();
								return;
							}
							//this checklist item is complete, route to ug final
							debug.logln(4, "Checklist item already complete.");
							routeItem(wfItem, Q_UG_DECISION_FINAL, "Checklist item already complete");
							cursor_ItemComplete.close();
							return;
						}  //end this item is complete
					}  //closes else for no checklist item that is incomplete
					cursor_ITEM_EDUC.close();
				}  //closes for loop of Find call result

				debug.setIndent(0);
			}  //end of Find incomplete checklist was true
			else  //no checklist items returned from Find operation
			{
				debug.log("NOTIFY", "No TU_IMG_ADM_CHK_CI's returned from Find operation.\n");
			}
		}  //end of cursor_EDUC.first true
		else  //cursor_EDUC.first false - no EDUC items to update - JMT 02/01/2013
		{
			/***********************************************************
			 * See if Person Checklist is already complete  05/01/2013 - JMT & ECB
			 ***********************************************************/
			debug.logln("DEBUG", "EDUC: No incomplete EDUC checklist items.");
			var strSql_PersonComplete = strChecklistSEQ_Complete.replace(/<CommonID>/, tuID);
			strSql_PersonComplete = strSql_PersonComplete.replace(/<AssocID>/, trim(wfDoc.field3));
			var cursor_PersonComplete = dbAccess.query(strSql_PersonComplete);
			if (!cursor_PersonComplete)
			{
				routeItem(wfItem, Q_ERROR, "Error executing query to get checklist item");
				return false;
			}
			if (cursor_PersonComplete.first())  //this transcript already Complete in PS. 
			{
				debug.logln(5, "EDUC: Have complete EDUC checklist items. Check doctype for HS or College");
				//BEGIN MOD ECB 20131216 for Transcript HS 9-12 satisfying Grades Checklist
				if (wfDoc.docTypeName.toUpperCase() == TRANSCRIPT_HS_9_12_DOCTYPE.toUpperCase())
				{
					debug.logln(5,"Checklist item already complete, routed to GRADES_QUEUE");
					routeItem(wfItem, GRADES_QUEUE, "Checklist item already complete, routed to GRADES_QUEUE");
					return;
				}
				//Techhelp 307854 BEGIN New business process will ask for transcript after MATR for credit eval. Even if person complete, might need to use this 
				//college transcript for new ADMP checklist immediately below. Do NOT route here. Will be skipped 
				//routeItem(wfItem, Q_UG_DECISION_FINAL, "EDUC Checklist item already complete");
				//Techhelp 307854 END

				//TechHelp 322287 BEGIN
				//New query to see if ANY TREVAL / TRN* records in ADMP Admin Function. 
				//If have a TRN, then do nothing here and will be dealt with below.
				//If no TRN, then route to new queue UG_College_Final for holding
				debug.logln(5, "EDUC: Looking for ANY_TREVAL.");
				var strSql_ANY_TREVAL = strChecklistANY_TREVAL.replace(/<CommonID>/, tuID);
				strSql_ANY_TREVAL = strSql_ANY_TREVAL.replace(/<AssocID>/, trim(wfDoc.field3));
				var cursor_ANY_TREVAL = dbAccess.query(strSql_ANY_TREVAL);
				if (!cursor_ANY_TREVAL)
				{
					routeItem(wfItem, Q_ERROR, "Error executing query cursor_ANY_TREVAL to get checklist item");
					return false;
				}
				if (cursor_ANY_TREVAL.first())  //this HAS a TRN item, do nothing and deal with it below.
				{
					debug.logln(4, "EDUC: Found a TREVAL! [%s]", cursor_ANY_TREVAL.CHECKLIST_CD);
				}
				else
				{
					debug.logln(5, "EDUC: Did NOT find TREVAL.");
					routeItem(wfItem, Q_COLLEGE_FINAL, "EDUC Checklist item already complete");
					return;
				}
				//TechHelp 322287 END

			}  //end cursor_PersonComplete.first
		}  //end See if Person Checklist is already complete  05/01/2013 - JMT & ECB
		//End of looking for EDUC checklist items.

		/**BEGIN Techhelp 307854 Look for TRN* records in ADMP Admin Function. Same as EDUC above with slight variations in SQL query and webservice payload  */
		//If updated a checklist above, then we are done with this doc. Go to the routing logic. (Bad logic, I know, but easier to code.)
		if (numOfChecklistItemsUpdated != 0) goto RoutingSection;
		//Get this specific TREVAL CHECKLIST CODE for this person
		var strSql_TRN = strChecklistSEQ_TREVAL.replace(/<CommonID>/, tuID);
		strSql_TRN = strSql_TRN.replace(/<AssocID>/, trim(wfDoc.field3));
		var cursor_TRN = dbAccess.query(strSql_TRN);
		if (!cursor_TRN)
		{
			routeItem(wfItem, Q_ERROR, "Error executing query to get checklist code");
			return false;
		}
		if (cursor_TRN.first())  //have a non-complete TREVAL row for this transcript. Update PS.
		{
			debug.log("INFO", "TREVAL: Now working non-complete Checklist Code '%s'\n", cursor_TRN["CHECKLIST_CD"]);
			//Build Find Request objects
			var request = WS_FIND_SHELL_TOP_CHK;
			request += '<m40:Find__CompIntfc__TU_IMG_ADM_CHK_CI>';
			request += '<m40:CHECKLIST_CD>' + cursor_TRN["CHECKLIST_CD"] + '</m40:CHECKLIST_CD>';
			request += '<m40:COMMON_ID>' + tuID + '</m40:COMMON_ID>';
			request += '<m40:ADMIN_FUNCTION>ADMP</m40:ADMIN_FUNCTION>';
			request += '</m40:Find__CompIntfc__TU_IMG_ADM_CHK_CI>';
			request += WS_SHELL_BOTTOM;
			debug.logObject(4, request, 40, "TREVAL: FIND request");  //log request

			//Call the Find operation
			var findOutput = new Object(), findFaults = new Object();
			findOutput = TU_callOperation(request, findFaults);
			if (!findOutput)
			{
				debug.log("ERROR", "Error calling TREVAL FIND operation: %s\n", getErrMsg());
				routeItem(wfItem, Q_ERROR, "Error calling TREVAL FIND Web service operation");
				return false;
			}
			debug.logObject(4, updateOutput, 40, "TREVAL: updateOutput");
			
			//Process the Find response
			if (findOutput.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"])
			{
				if (Object.prototype.toString.call(findOutput.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"]) == "[object Object]")
					findOutput.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"] = [findOutput.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"]];
				/***********************************************************
				 * Loop thru Find responses
				 ***********************************************************/
				for (var i = 0; i < findOutput.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"].length; i++)
				{
					debug.setIndent(0);
					debug.log("INFO", "TREVAL: Looking at SEQ_3C sequence '%s' \n", findOutput.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"][i].SEQ_3C);
					debug.setIndent(1);
					//Query the DB to get Checklist Items for TRN*
					var strSql_ITEM_TRN = strChecklistItemCD_TREVAL.replace(/<CommonID>/, tuID);  //Looks for TREVAL item codes
					strSql_ITEM_TRN = strSql_ITEM_TRN.replace(/<Seq3C>/, findOutput.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"][i].SEQ_3C);
					strSql_ITEM_TRN = strSql_ITEM_TRN.replace(/<AssocID>/, trim(wfDoc.field3));
					var cursor_ITEM_TRN = dbAccess.query(strSql_ITEM_TRN);
					if (!cursor_ITEM_TRN)
					{
						routeItem(wfItem, Q_ERROR, "Error executing TREVAL query to get checklist item");
						return false;
					}
					if (cursor_ITEM_TRN.first())  //have a non-complete TRN row for this transcript. Update PS.
					{
						//Loop thru Checklist Items returned from query
						do
						{
							debug.setIndent(1);
							debug.log("INFO", "TREVAL: Updating Checklist Item '%s'\n", cursor_ITEM_TRN["CHKLST_ITEM_CD"]);
							debug.setIndent(2);
							/***********************************************************
							 * Build the Update request
							 ***********************************************************/
							var request = WS_UPDATE_SHELL_TOP_CHK;
							request += '<m95:Updatedata__CompIntfc__TU_IMG_ADM_CHK_CI>';
							request += '<m95:COMMON_ID>' + tuID + '</m95:COMMON_ID>';
							request += '<m95:SEQ_3C>' + findOutput.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"][i].SEQ_3C + '</m95:SEQ_3C>';
							request += '<m95:ADMIN_FUNCTION>ADMP</m95:ADMIN_FUNCTION>';
							request += '<m95:CHECKLIST_CD>' + findOutput.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"][i].CHECKLIST_CD + '</m95:CHECKLIST_CD>';
							request += '<m95:INSTITUTION>' + TOWSN_INSTITUTION + '</m95:INSTITUTION>';
							request += '<m95:PERSON_CHK_ITEM>';
							request += '<m95:CHECKLIST_SEQ>' + ToNumber(cursor_ITEM_TRN["CHECKLIST_SEQ"]) + '</m95:CHECKLIST_SEQ>';
							request += '<m95:CHKLST_ITEM_CD>' + cursor_ITEM_TRN["CHKLST_ITEM_CD"] + '</m95:CHKLST_ITEM_CD>';
							request += '<m95:ITEM_STATUS>C</m95:ITEM_STATUS>';
							request += '<m95:STATUS_DT_0>' + convertToDateStr(new Date(), 'YYYY-MM-DD') + '</m95:STATUS_DT_0>';
							request += '</m95:PERSON_CHK_ITEM>';
							request += '</m95:Updatedata__CompIntfc__TU_IMG_ADM_CHK_CI>';
							request += WS_SHELL_BOTTOM;
							debug.logObject(4, request, 40, "TREVAL: Update request");  //log request

							//Call Update operation
							var updateOutput = new Object(), updateFaults = new Object();
							updateOutput = TU_callOperation(request, updateFaults);
							if (!updateOutput)
							{
								debug.log("ERROR", "TREVAL Error calling UPDATE operation: %s\n", getErrMsg());
								routeItem(wfItem, Q_ERROR, "Error calling TREVAL UPDATE Web service operation");
								return false;
							}
							debug.logObject(4, updateOutput, 40, "TREVAL: updateOutput");
							//Update counter to skip next sections
							numOfChecklistItemsUpdated++;
						} // get next checklist item
						while (cursor_ITEM_TRN.next());

						debug.setIndent(1);
					} //end of true found checklist item TRN to update
					else  //See if TREVAL checklist item is already complete
					{
						debug.log("DEBUG", "No incomplete TREVAL checklists found for the following query: %s\n", strSql_ITEM_TRN);
						debug.log("DEBUG", "Look for Complete TREVAL checklist items.\n");
						var strSql_ItemComplete_TRN = strChecklistItemCD_TREVAL_Complete.replace(/<CommonID>/, tuID);
						strSql_ItemComplete_TRN = strSql_ItemComplete_TRN.replace(/<Seq3C>/, findOutput.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"][i].SEQ_3C);
						strSql_ItemComplete_TRN = strSql_ItemComplete_TRN.replace(/<AssocID>/, trim(wfDoc.field3));
						var cursor_ItemComplete_TRN = dbAccess.query(strSql_ItemComplete_TRN);
						if (!cursor_ItemComplete_TRN)
						{
							routeItem(wfItem, Q_ERROR, "Error executing query to get checklist item");
							return false;
						}
						if (cursor_ItemComplete_TRN.first())
						{
							//BEGIN MOD ECB 20131216 for Transcript HS 9-12 satisfying Grades Checklist
							if (wfDoc.docTypeName.toUpperCase() == TRANSCRIPT_HS_9_12_DOCTYPE.toUpperCase())
							{
								routeItem(wfItem, GRADES_QUEUE, "Checklist item already complete, routed to GRADES_QUEUE");
								cursor_ItemComplete_TRN.close();
								return;
							}
							//this checklist item is complete, route to ug final
							routeItem(wfItem, Q_UG_DECISION_FINAL, "TRN Checklist item already complete");
							cursor_ItemComplete_TRN.close();
							return;
						}  //end this TREVAL item is complete
					}  //closes else for no checklist item that is incomplete
					cursor_ITEM_TRN.close();
				}  //closes for loop of Find call result - TRN

				debug.setIndent(0);
			}  //end of Find incomplete checklist was true - TRN
			else  //no checklist items returned from Find operation
			{
				debug.log("NOTIFY", "No TREVAL TU_IMG_ADM_CHK_CI's returned from Find operation.\n");
			}
		}  //end of cursor_TRN.first true
		else  //cursor_TRN.first false - no TRN items to update
		{
			/***********************************************************
			 * See if Person Checklist is already complete
			 ***********************************************************/
			debug.log("DEBUG", "TREVAL: No incomplete TRN checklist items.\n");
			var strSql_PersonComplete_TRN = strChecklistSEQ_Complete_TREVAL.replace(/<CommonID>/, tuID);
			strSql_PersonComplete_TRN = strSql_PersonComplete_TRN.replace(/<AssocID>/, trim(wfDoc.field3));
			var cursor_PersonComplete_TRN = dbAccess.query(strSql_PersonComplete_TRN);
			if (!cursor_PersonComplete_TRN)
			{
				routeItem(wfItem, Q_ERROR, "Error executing query to get checklist item");
				return false;
			}
			if (cursor_PersonComplete_TRN.first())
			{
				//BEGIN MOD ECB 20131216 for Transcript HS 9-12 satisfying Grades Checklist
				if (wfDoc.docTypeName.toUpperCase() == TRANSCRIPT_HS_9_12_DOCTYPE.toUpperCase())
				{
					routeItem(wfItem, GRADES_QUEUE, "Checklist item already complete, routed to GRADES_QUEUE");
					return;
				}
				//this checklist item is complete, route to ug final
				routeItem(wfItem, Q_UG_DECISION_FINAL, "TREVAL Checklist item already Received");
				return;
			}
		}  //end See if Person Checklist is already complete
		//End of looking for TREVAL checklist items.
		/**END Techhelp 307854 Look for TRN records.*/

		/**********************************************************
		BEGIN TU MOD ECB 20130114 - Look for READMIT transcripts and route to Registrar workspace
		Administrative Function: ADMA = SPRG
		EDUC% = TRNS
		Check against Registrar Checklist, if match is found:
			1. Change DocType to "Transcript - Registrar"
			2. Change drawer to "Registrar"
			3. Remove from Workflow (02/20/2013 - changed to route items to Regi workflow instead of remove)

		**********************************************************/
		if (numOfChecklistItemsUpdated == 0)  //nothing updated earlier
		{
			var strSql_R1 = strChecklistSEQ_R.replace(/<CommonID>/, tuID);
			strSql_R1 = strSql_R1.replace(/<AssocID>/, trim(wfDoc.field3));
			var cursor_R1 = dbAccess.query(strSql_R1);
			if (cursor_R1.first())//does doc have a regi checklist check, has no admissions checklist
			{
				/***********************************************************
				 * Build Find Request
				 ***********************************************************/
				debug.log("INFO", "Regi Now processing Checklist Code '%s'\n", cursor_R1["CHECKLIST_CD"]);
				var request = WS_FIND_SHELL_TOP_CHK;
				request += '<m40:Find__CompIntfc__TU_IMG_ADM_CHK_CI>';
				request += '<m40:CHECKLIST_CD>' + cursor_R1["CHECKLIST_CD"] + '</m40:CHECKLIST_CD>';
				request += '<m40:COMMON_ID>' + tuID + '</m40:COMMON_ID>';
				request += '<m40:ADMIN_FUNCTION>SPRG</m40:ADMIN_FUNCTION>';
				request += '</m40:Find__CompIntfc__TU_IMG_ADM_CHK_CI>';
				request += WS_SHELL_BOTTOM;
				debug.logObject(4, request, 40, "request_R");  //log request

				// Call the Find operation
				var findOutput_R = new Object(), findFaults_R = new Object();
				findOutput_R = TU_callOperation(request, findFaults_R);
				//var ret = service.callOperation(FIND_OPERATION_NAME, findInput_R, findOutput_R, findFaults_R, WS_USERNAME, WS_PASSWORD); // Call Web service operation
				if (!findOutput_R)
				{
					debug.log("ERROR", "Regi Error calling %s operation: %s\n", FIND_OPERATION_NAME, getErrMsg());
					routeItem(wfItem, Q_ERROR, "Regi Error calling Web service operation " + FIND_OPERATION_NAME);
					return false;
				}
				debug.logObject(4, findOutput_R, 40, "findOutput_R");
				/***********************************************************
				 * Process the Find response
				 ***********************************************************/
				if (findOutput_R.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"])
				{
					if (Object.prototype.toString.call(findOutput_R.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"]) == "[object Object]")
						findOutput_R.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"] = [findOutput_R.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"]];
					/***********************************************************
					 * Loop thru Find responses
					 ***********************************************************/
					for (var i = 0; i < findOutput_R.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"].length; i++)
					{
						debug.setIndent(0);
						debug.log("INFO", "Regi Now processing '%s' SEQ_3C...\n", findOutput_R.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"][i].SEQ_3C);
						debug.setIndent(1);
						/***********************************************************
						 * Query the DB to get Checklist Items
						 ***********************************************************/
						var strSql_R2 = strChecklistItemCD_R.replace(/<CommonID>/, tuID);
						strSql_R2 = strSql_R2.replace(/<Seq3C>/, findOutput_R.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"][i].SEQ_3C);
						strSql_R2 = strSql_R2.replace(/<AssocID>/, trim(wfDoc.field3));
						var cursor_R2 = dbAccess.query(strSql_R2);
						if (cursor_R2.first())
						{
							/***********************************************************
							 * Loop thru Checklist Items returned from query
							 ***********************************************************/
							do
							{
								debug.setIndent(1);
								debug.log("INFO", "Regi Now processing Checklist Item '%s'...\n", cursor_R2["CHKLST_ITEM_CD"]);
								debug.setIndent(2);
								/***********************************************************
								 * Build the Update request
								 ***********************************************************/
								var request = WS_UPDATE_SHELL_TOP_CHK;
								request += '<m95:Updatedata__CompIntfc__TU_IMG_ADM_CHK_CI>';
								request += '<m95:COMMON_ID>' + tuID + '</m95:COMMON_ID>';
								request += '<m95:SEQ_3C>' + findOutput_R.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"][i].SEQ_3C + '</m95:SEQ_3C>';
								request += '<m95:ADMIN_FUNCTION>SPRG</m95:ADMIN_FUNCTION>';
								request += '<m95:CHECKLIST_CD>' + findOutput_R.Body.Find__CompIntfc__TU_IMG_ADM_CHK_CIResponse["TU_IMG_ADM_CHK_CI"][i].CHECKLIST_CD + '</m95:CHECKLIST_CD>';
								request += '<m95:INSTITUTION>' + TOWSN_INSTITUTION + '</m95:INSTITUTION>';
								request += '<m95:PERSON_CHK_ITEM>';
								request += '<m95:CHECKLIST_SEQ>' + ToNumber(cursor_R2["CHECKLIST_SEQ"]) + '</m95:CHECKLIST_SEQ>';
								request += '<m95:CHKLST_ITEM_CD>' + cursor_R2["CHKLST_ITEM_CD"] + '</m95:CHKLST_ITEM_CD>';
								request += '<m95:ITEM_STATUS>C</m95:ITEM_STATUS>';
								request += '<m95:STATUS_DT_0>' + convertToDateStr(new Date(), 'YYYY-MM-DD') + '</m95:STATUS_DT_0>';
								request += '</m95:PERSON_CHK_ITEM>';
								request += '</m95:Updatedata__CompIntfc__TU_IMG_ADM_CHK_CI>';
								request += WS_SHELL_BOTTOM;
								debug.logObject(4, request, 40, "request_Update_R");  //log request
								/********************************************************
								 * Call Update operation
								 ********************************************************/
								var updateOutput = new Object(), updateFaults = new Object();
								updateOutput = TU_callOperation(request, updateFaults);
								//var ret = service.callOperation(UPDATE_OPERATION_NAME, updateInput, updateOutput, updateFaults, WS_USERNAME, WS_PASSWORD); // Call Web service operation
								debug.log("DEBUG", "updateOutput:\n");
								debug.logObject(4, updateOutput, 40);
								if (!updateOutput)
								{
									cursor_R2.close();
									debug.log("ERROR", "Regi Error calling UPDATE operation: %s\n", getErrMsg());
									routeItem(wfItem, Q_ERROR, "Regi Error calling UPDATE Web service operation");
									return false;
								}
								debug.logObject(4, updateOutput, 40, "updateOutput_R");
								numOfChecklistItemsUpdated_R++;
							} // get next checklist item
							while (cursor_R2.next());

							debug.setIndent(1);
							if (numOfChecklistItemsUpdated_R != 0) //Regi checklist item was updated
							{
								debug.log(5,"Regi checklist item was updated, reindex and route.\n")
								//change index values to reflect registrar document
								var newDoc = toINKeys(wfDoc);
								newDoc.drawer = "Registrar";
								newDoc.docTypeName = "Transcript - Registrar";
								debug.log(5,"DocType changed to Transcript - Registrar.\n")
								debug.log(5,"Drawer changed to Registrar.\n")
								if(!reindexDocument(wfDoc, newDoc))
								{
									debug.log("ERROR", "Could not reindex document\n");
									//routeItem(wfItem, QUEUE_ERROR, "Could not reindex doc");
									return false;
								}
								else
								{
									debug.log("INFO", "Reindexed\n\n");
								}
								debug.log(5,"Regi doc successfully reindexed; route accordingly.\n")
								// Remove document from the workflow queue - 20130220 ECB requirment change, Regi doc should be routed instead of removed from wf.
								//BEGIN MOD ECB 20130220 to add routing if Regi checklist updated
								if (cursor_R1["CHECKLIST_CD"] == "TRFR")
								{
									debug.log("INFO", "Checklist CD = TRFR.\n");
									routeItem(wfItem, REGI_TRFR, "Route to Registrar Transfer Transcripts");
									return;
								}
								else
								{
									debug.log("INFO", "Checklist CD = EXTERN or READMT.\n");
									routeItem(wfItem, REGI_EXTERN_READMT, "Route to Registrar External Transcripts");
									return;
								}
							}  //end of (numOfChecklistItemsUpdated_R != 0) check
						} //end of true found checklist item to update
						else
						{
							debug.log("DEBUG", "Regi No incomplete checklists found for the following query: %s\n", strSql_R2);
						}

						cursor_R2.close();
					} //end of loop through envoy find results

					debug.setIndent(0);
				}//end of find for Regi READMITS
				else  //no checklist items returned from Find operation
				{
					debug.log("NOTIFY", "Regi No TU_IMG_ADM_CHK_CI's returned from Find operation.\n");
				}
			}  //end of cursor_R1.first true
			else
			{
				debug.log("DEBUG", "No cursor_R1.first; no Regi checklist \n");
			}

		} //End of numOfChecklistItemsUpdated == 0
		/**************END OF Readmit_MOD 02/06/13  *****************/

		/*************************************************************
		 ************* Routing logic *********************************
		 *************************************************************/
		RoutingSection:
		debug.log("INFO", "ROUTE: %s checklist items updated for [%s].\n", numOfChecklistItemsUpdated, wfDoc);
		//If no checklist items were updated, route to Parking
		if (numOfChecklistItemsUpdated == 0)
		{
			debug.log("INFO", "No checklist items updated.\n");
			setDocNotes(wfDoc, "No checklist items to update.", setDocNotes.APPEND, "\n");  //ws setDocNotes.OVERWRITE
			routeItem(wfItem, PARKING_QUEUE, "No checklist items to update");
			return;
		}

		//If get to here and onward, checklist items were updated. Route according to doctype.
		if (wfDoc.docTypeName.toUpperCase() == TRANSCRIPT_HS_FINAL_DOCTYPE.toUpperCase() || wfDoc.docTypeName.toUpperCase() == TRANSCRIPT_HS_9_12_DOCTYPE.toUpperCase())
		{
			if (!routeItem(wfItem, Q_UG_HS_TRANSCRIPTS_FINAL, "Script successfully updated at least 1 checklist item"))
				routeItem(wfItem, Q_ERROR, "Failed to route document to " + Q_UG_HS_TRANSCRIPTS_FINAL);
		}
		else  //not a HS transcript
		{
			//BEGIN_TU_MOD
			if (wfDoc.docTypeName.toUpperCase() == TRANSCRIPT_College_DOCTYPE.toUpperCase())
			{
				routeItem(wfItem, Q_UG_TRANSFER_EVALUATION, "Script successfully updated at least 1 checklist item");
			}
			else  //not a HS or college transcript
			{
				// Get Evaluation Form document with the same TU ID
				var evalFormDoc = FindLatestEvalutionFormDoc(tuID);
				//debug.log("ERROR", "Here evalFormDoc [%s]\n", evalFormDoc);

				if (evalFormDoc === false)
				{
					routeItem(wfItem, Q_ERROR, "Error looking for Evaluation Form in ImageNow");
				}
				else if (evalFormDoc)
				{
					// Get Action custom property
					var action = propMgr.get(evalFormDoc, CP_ACTION);
					if (action === false)
					{
						routeItem(wfItem, Q_ERROR, "Failed to get the value of " + CP_ACTION + " custom property");
						return false;
					}

					debug.log("DEBUG", "Action custom property = '%s'\n", action);

					// If Action custom property is equal to 'Admit' or 'Matriculation', route to UG_Transfer Evaluation
					if (action.toUpperCase() == ADMIT_VALUE.toUpperCase() || action.toUpperCase() == MATRICULATION_VALUE.toUpperCase())
					{
						if (!routeItem(wfItem, Q_UG_TRANSFER_EVALUATION, "Script successfully updated at least 1 checklist item"))
						routeItem(wfItem, Q_ERROR, "Failed to route document to " + Q_UG_TRANSFER_EVALUATION);
					}
					else // else route to UG_Decision Final
					{
						if (!routeItem(wfItem, Q_UG_DECISION_FINAL, "Script successfully updated at least 1 checklist item"))
						routeItem(wfItem, Q_ERROR, "Failed to route document to " + Q_UG_DECISION_FINAL);
					}
				}  //routing based on Form action
			}  //other doc
		}  //routing college trans
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
			AlertINAdmins(strThisScript);

		}
	}

	finally
	{
		if (dbAccess) dbAccess.close();

		if(debug)
		{
			debug.finish();
		}
	}
}

/************************
*****Functions***********
*************************/

/** ****************************************************************************
  *     This function retrieves the latest Evaluation Form from ImageNow with a
  *     certain TU ID.
  *
  * @param {String} tuID TU ID
  * @version 6.x
  * @return {INDocument|false|null} Evaluation Form document found, false on failure,
  *                                 or null if no document found
  *****************************************************************************/
function FindLatestEvalutionFormDoc(tuID)
{
	// Build the view filter text
	var filterText = Clib.rsprintf("[drawer] = '%s' AND [field1] = '%s' AND [docType] = '%s'", UG_ADMISSIONS_DRAWER, tuID, EVALUATION_FORM_DOCTYPE);

	var view = new INView(IN_VIEW_NAME, "DOCUMENT");
	view.filterText = filterText;

	debug.log("DEBUG", "view.filterText: %s\n", view.filterText);

	// Execute the view
	if (!view.run())
	{
		debug.log("ERROR", "Execution of the view failed: %s\n", getErrMsg());
		return false;
	}

	var evalFormDoc = null;

	// Get the first result
	if (view.NextResult())
	{
		var docId = view.CurrentResultString("Document ID");

		evalFormDoc = new INDocument(docId);
	}
	else
	{
		debug.log("NOTIFY", "No evaluation forms with matching TU ID (%s) found.\n", tuID);
		//routeItem(wfItem,UPDATECHECKLIST_NOEVALFORM, "Script successfully updated at least 1 checklist item but no eForm was present");
	}
	view.CloseResultSet();
	return evalFormDoc;
}
//
