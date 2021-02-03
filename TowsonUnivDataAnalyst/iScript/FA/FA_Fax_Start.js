/*************************************************************************************
Name: 		FA_Fax_Start.js
Author(s):	JMT 07/23/2007, for Fin Aid - Set index values of incoming faxes
Created:		07/23/2007
Last Updated:	07/24/2017 - LAC - Modified the file path for .jsh files to the $IMAGENOWDIR6$ directory
For Version(s):	6.x
--------------------------------------------------------------------------------
Summary:		Inbound script for FA Fax Start queue, set index values 
Business Use:	This script is attached inbound to a workflow terminal queue. Each 
					document routed into the queue is moved.
Client:			Towson University
Modifications:	
		09/17/2008 JMT to change smtpFrom to imaging.towson.edu//
		11/07/08 SLN
		Modified 11/19/2008 RH
		Modified 07/12/2012 ECB added #include functions
		MOdified 07/30/2013 ECB changed Aid Year variable from '2013' to '2014' line 63
		08/14/2015 JMT 	TechHelp 125729 - Change SendMail outbound SMTP to mail.towson.edu.
		09/16/2015 ECB 	TechHelp 132092 - Change default Aid Year to 2016
		07/24/2017 - LAC - Modified the file path for .jsh files to the $IMAGENOWDIR6$ directory
						 - Additionally refurbished syntax to match STL standards.
**************************************************************************************/

//******************************* LOGGING *****************************

#include "$IMAGENOWDIR6$/script/STL/packages/Logging/iScriptDebug.js"
#define LOG_TO_FILE true // false - log to stdout if ran by intool, wf user if inscript.
                         // true  - log to inserverXX/log/ directory
#define DEBUG_LEVEL 5    // 0 - 5.  0 least output, 5 most verbose
var debug = "";
var strThisScript = "FA_Fax_Start.js";

//************************** INCLUDE Towson COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/TU_LIB_TU_FUNCTIONS.js"

//************************** INCLUDE STL COMMON FUNCTIONS ***********************
#include "$IMAGENOWDIR6$/script/STL/packages/Document/reindexDocument.js"
#include "$IMAGENOWDIR6$/script/STL/packages/Document/toINKeys.js"

// *********************         Configuration        *******************
// set to true when configuration values have been verified
#define CONFIG_VERIFIED		true

//******************************* Global Variables *****************************
var errbuf = " ";
//ECB BEGIN TechHelp 132093
var AidYear = '2019'  //###Change me every year
//ECB END TechHelp 132093

// *********************       End  Configuration     *******************

/** ****************************************************************************
  * main()
  * Main body of script
  *****************************************************************************/

function main()
{
	debug = new iScriptDebug("USE SCRIPT FILE NAME", LOG_TO_FILE, DEBUG_LEVEL);
	debug.showINowInfo("INFO");
	try
	{
		//var wfItem =  new INWfItem(currentWfItem.id); // get current workflow item
		var wfItem = INWfItem.get(currentWfItem.id);  //LAC - Native .get method
		wfItem.getInfo();
		var wfDoc = new INDocument(wfItem.objectId); // get current document from wf item
		if(!wfDoc.getInfo())
		{
			debug.log("CRITICAL", "Couldn't get document info: %s\n", getErrMsg());
			return false;
		}

		var queueName = wfItem.queueName;

		//Create new document to copy fields
 		// LAC updated INKeys data member names to STL standard
		//Note that field3 is moved to field4. Orig fax field4 not preserved.
		var keys = new INKeys( "FinAid", wfDoc.field1, wfDoc.field2, AidYear, wfDoc.field3, wfDoc.field5, wfDoc.docTypeName );
		
		// Rename document and move on if sucessful, print error message on fail
		if(reindexDocument(wfDoc, keys))
		{

		mailstr = "A new item has arrived in the " + queueName + " queue.\nArrival time: " + wfDoc.field2;  //    \nThe current document index is: \nEmplID:   " + sourcedoc.field1 + "\nName: " + sourcedoc.field2;
		SendMail("ImageNow_Server@towson.edu", "ebaumbusch@towson.edu","", "", "New FA Fax Queue Item", mailstr, "mail.towson.edu", "imaging.towson.edu", errbuf);

		}
		else
		{
			mailstr = "FAILED new item in the Fin Aid Fax queue.";  //    \nThe current document index is: \nEmplID:   " + sourcedoc.field1 + "\nName: " + sourcedoc.field2;
			SendMail("ImageNow_Server@towson.edu", "ebaumbusch@towson.edu","jtaffel@towson.edu", "", "FAILED New Fin Aid Fax Queue Item", mailstr, "mail.towson.edu", "imaging.towson.edu", "");
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
		debug.log("CRITICAL", "\n\nThis script has failed in an unexpected way.  Please\ncontact Perceptive Software Customer Support at 800-941-7460 ext. 2\nAlternatively, you may wish to email support@imagenow.com\nPlease attach:\n - This log file\n - The associated script [%s]\n - Any supporting files that might be specific to this script\n\n", _argv[0]);
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
//
