/*************************************************************************************
Name: 			TU_LIB_TU_FUNCTIONS.js
Author(s):		???	
Created:		???
Last Updated:	02/18/2020 - JMT & JM - TechHelp 326257 - New funciton to delete archived files from imports. Pass directory and number of days to keep.
For Version(s):	6.x
--------------------------------------------------------------------------------
Summary:		Compendium of common functions used in Towson IN developed scripts.
Client:			Towson University
Modifications:	
		03/22/2012 JMT send mail to IN team
		05/17/2012 JMT made into a library function
		09/05/2014 JMT New function to format date for Oracle
		02/20/2015 JMT Removed wbosma from emails
		08/14/2015 JMT  TechHelp 125729 - Change SendMail outbound SMTP to mail.towson.edu.
		10/20/2017 - LAC - Included the checkExecution, SendMail, handleError, and trim functions. Reorganized 
		10/07/2019 - JMT - TechHelp 308870. Created OHR index lookup functions to be used in many DocuSign import routines. TU_Func_LookupName_by_EmplID_OHR & SSN4.
		02/04/2020 - JMT - TechHelp 318012  - Created getFormattedDate_YYYYMMDDHHMMSS
		02/18/2020 - JMT & JM - TechHelp 326257 - New funciton to delete archived files from imports. Pass directory and number of days to keep.
**************************************************************************************/

/** ****************************************************************************
  *             checkExecution()
  *             This function compares VERSION and EXECUTION against how the 
  *             script is being executed to ensure that we are not running it 
  *             incorrectly
  * @param      {none} None
  * @return     {boolean} true/false for correct/incorrect execution attempt
  *****************************************************************************/
function checkExecution()
{
	if (typeof(VERSION) == "undefined" || typeof(EXECUTION) == "undefined") return true;
	
	//check EXECUTION
	var wfItem = "";
	if (typeof(GetCurrentWFItemID) != "undefined") GetCurrentWFItemID(wfItem);      //5.x
	else if (typeof(currentWfItem) != "undefined") wfItem = true;                   //6.x
	
	if (wfItem == "" && EXECUTION != "INTOOL") return false;
	else if (wfItem != "" && EXECUTION == "INTOOL") return false;
	
	//check VERSION
	var fileSep = ((typeof(_WINDOWS_) != "undefined")  || typeof(_WIN32_) != "undefined")?"\\":(typeof(_UNIX_) != "undefined")?"/":"";
	if (fileSep != "")
	{
		var version = ""
		if (typeof(INprintf) != "undefined") GetPrivateProfileString("General", "product.version", "", version, 40, ".." + fileSep + "etc" + fileSep + "inow.ini");
		else version = getPrivateProfileString("General", "product.version", "", ".." + fileSep + "etc" + fileSep + "inow.ini");
		
		if (version == "" && VERSION.substr(0,1) != "6") return false;
		else if (version !="" && VERSION.substr(0,1) != "5") return false;
	}
	
	return true;
}

/********************************
 * Converts IN javascript date to US human readable date
 * By Jay Taffel 05/16/2014 aka Fri May 16 00:00:00 2014
 * Input is date in javascript   
 * Output is date for Oracle as MM/DD/YYYY 05/16/2014 to be used on forms, indexes, etc.
 *********************************/
function getFormattedDate(dateStr)
{
	if(!dateStr)
	{
		return "";
	}
	var date = Date.parse(dateStr);

	if(isNaN(date))
	{
		debug.log("ERROR", "Could not get date from %s\n", dateStr);
		return dateStr;
	}

	var d = new Date(date);

	return Clib.rsprintf("%02d/%02d/%04d", d.getMonth()+1, d.getDate(), d.getFullYear());
}

/********************************
 * Converts IN javascript date to sortable YYYY-MM-DD HH:mm:ss
 * By Jay Taffel 02/04/2020 aka Mon February 2 13:51:27 2020
 * Input is date in javascript
 * Output is date as YYYY-MM-DD HH:mm:ss
 *********************************/
function getFormattedDate_YYYYMMDDHHMMSS(dateStr)
{
	if(!dateStr)
	{
		return "";
	}
	var date = Date.parse(dateStr);

	if(isNaN(date))
	{
		debug.log("ERROR", "Could not get date from %s\n", dateStr);
		return dateStr;
	}

	var d = new Date(date);

	return Clib.rsprintf("%04d-%02d-%02d %02d:%02d:%02d", d.getFullYear(), d.getMonth()+1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds() );
}

/*******************************************************************************
* Serves for processing and logging errors in the workflow queue
* @function handleError
* @param {String} str
* @return {String} cleaned up string (or whatever was passed if it wasn't a string)
*******************************************************************************/
function handleError(obj, message)
{
	message = message.replace(/[\r\n]+$/, "");
	debug.log("ERROR", "%s\n", message);
	if (QUEUE_EXCEPTION != "") routeItem(obj, QUEUE_EXCEPTION, message);
}

/** ****************************************************************************
  * Sends email. Was in place before STL iMail.
*******************************************************************************/
function SendMail(from, to, cc, bcc, subject, body, smtp, smtpFrom, errorBuffer)
{
	var email = new INMail;
	email.from = from;
	email.to = to;
	email.cc = cc;
	email.bcc = bcc;
	email.subject = subject;
	email.body = body;
	email.smtp = smtp;
	email.smtpFrom = smtpFrom;

	if(!email.send())
	errorBuffer = "Unable to send email";
} // end of SendMail

/** ****************************************************************************
  * Sends email. Was in place before STL iMail.
*******************************************************************************/
function SendMailINAdmin(from, to, cc, bcc, subject, body, smtp, smtpFrom, errorBuffer)
{
	var emailINAdmin = new INMail;
	emailINAdmin.from = from;
	emailINAdmin.to = to;
	emailINAdmin.cc = cc;
	emailINAdmin.bcc = bcc;
	emailINAdmin.subject = subject;
	emailINAdmin.body = body;
	emailINAdmin.smtp = smtp;
	emailINAdmin.smtpFrom = smtpFrom;

	if(!emailINAdmin.send())
	errorBuffer = "Unable to send email";
}

/********************************
 * Converts IN javascript date to Oracle date format for Where clause
 * By Jay Taffel 05/16/2014 aka Fri May 16 00:00:00 2014
 * Input is date in javascript   
 * Output is date for Oracle as 16-MAY-2014 to be used in SQL Where clause
 *********************************/
function ToOracleDateFromJavaDate(dateStr)
{
	if(!dateStr) return "";  //nothing to see here
	var date = Date.parse(dateStr);
	if(isNaN(date))
	{
		debug.log("ERROR", "Could not get date from %s\n", dateStr);
		return dateStr;
	}
	var d = new Date(date);
	var OracleFormatDate = Clib.rsprintf("%02d-",d.getDate());  //formDate.substr(8,2) + "-";
	switch (d.getMonth()+1)  
	{
		case 1:
			OracleFormatDate += 'JAN';
			break;
		case 2:
			OracleFormatDate += 'FEB';
			break;
		case 3:
			OracleFormatDate += 'MAR';
			break;
		case 4:
			OracleFormatDate += 'APR';
			break;
		case 5:
			OracleFormatDate += 'MAY';
			break;
		case 6:
			OracleFormatDate += 'JUN';
			break;
		case 7:
			OracleFormatDate += 'JUL';
			break;
		case 8:
			OracleFormatDate += 'AUG';
			break;
		case 9:
			OracleFormatDate += 'SEP';
			break;
		case 10:
			OracleFormatDate += 'OCT';
			break;
		case 11:
			OracleFormatDate += 'NOV';
			break;
		case 12:
			OracleFormatDate += 'DEC';
			break;
		default:
			break;
	}
	OracleFormatDate += '-' + d.getFullYear()  //formDate.substr(0,4);
	return OracleFormatDate;
}

/** ****************************************************************************
  * Trim spaces around a string
*******************************************************************************/
function trim(str)
{
	var rtn = str.replace(/^\s*/, '');
	rtn = rtn.replace(/\s*$/, '');
	return rtn;
}

/** ****************************************************************************
  * Alerts the ImageNow Administrators whenever a script fails.
  * Called from the 'catch' block of scripts.
  *
  * @param {Name of script file} filename
  *
  * IMPORTANT function SendMail needs to be part of main program.
  * IT is not placed here to prevent repeated
  * Mod Summary: 
  *	03/22/2012 JMT send mail to IN team
  *	05/17/2012 JMT made into a library function
  *	09/05/2014 JMT New function to format date for Oracle
  *	02/20/2015 JMT Removed wbosma from emails
  * 08/14/2015 JMT 	TechHelp 125729 - Change SendMail outbound SMTP to mail.towson.edu.
  *****************************************************************************/
function TU_Func_AlertINAdmins(filename)
{  
	ListTo = "ebaumbusch@towson.edu,jtaffel@towson.edu";  //,wbosma@towson.edu";
	//ListTo = "jtaffel@towson.edu";
	MailSubject = "FAILED SCRIPT!! [" + filename + "] FAILED";
	MailBody = "The script [" + filename + "] FAILED!\n\n"; 
	SendMailINAdmin("ImageNow_SCRIPT_ERROR@towson.edu", ListTo, "", "", MailSubject, MailBody, "mail.towson.edu", "imaging.towson.edu", " ");
}
//Same as above for backwards compatibility. JMT 11/20/2018
function AlertINAdmins(filename)
{  
	ListTo = "ebaumbusch@towson.edu,jtaffel@towson.edu";  //,wbosma@towson.edu";
	MailSubject = "FAILED SCRIPT!! [" + filename + "] FAILED";
	MailBody = "The script [" + filename + "] FAILED!\n\n"; 
	SendMailINAdmin("ImageNow_SCRIPT_ERROR@towson.edu", ListTo, "", "", MailSubject, MailBody, "mail.towson.edu", "imaging.towson.edu", " ");
}

/** ****************************************************************************
  * Removes leading and trailing space from a string.
  * <p><em>Generic Function</em> (common)</p>
  * <p>Modified:   $Revision: 3334 $ $Date: 2007-12-24 10:03:06 -0600 (Mon, 24 Dec 2007) $ $Author: jmcwilliams $</p>
  * @function trim
  * @param {String} str
  * @return {String} cleaned up string (or whatever was passed if it wasn't a string)
  *****************************************************************************/
function TU_Func_DateMDY()
{
	var now = new Date();
	var month = (now.getMonth()+1).toString().length == 1 ? "0"+(now.getMonth()+1):(now.getMonth()+1);
	var day = now.getDate().toString().length == 1 ? "0"+now.getDate():now.getDate();
	var currentDate = month + "/" + day + "/" + now.getFullYear();

	return currentDate;
}
global.TU_Func_DateMDY = TU_Func_DateMDY;

//
/** ****************************************************************************
  *		Performs an external DB lookup (PeopleSoft) to retrieve the employees 
  *		name
  *
  * @param {String} emplId Employee ID
  * @returns {String} Name of the Employee or false
  * @requires DB_DBAccess
  * Added to Library TechHelp 308870 by JMT - Oct 2019
  *****************************************************************************/
function TU_Func_LookupName_by_EmplID_OHR(emplId)
{
	var cursor, emplId, SQL = "", MiddleInit = "", NameSuffix = "";
	Clib.sprintf(SQL, "SELECT SYSADM.PS_PERSONAL_DATA.LAST_NAME, SYSADM.PS_PERSONAL_DATA.FIRST_NAME, SYSADM.PS_PERSONAL_DATA.MIDDLE_NAME, SYSADM.PS_PERSONAL_DATA.NAME_SUFFIX FROM SYSADM.PS_PERSONAL_DATA WHERE SYSADM.PS_PERSONAL_DATA.EMPLID='%s'", emplId);
	cursor = db.query(SQL, Database.dynamic);
	if(!cursor || !cursor.first())
	{
		debug.log("ERROR", "Could not get first row\n");
		return false;
	}
	//See if there is a middle initial or suffix
	if(cursor[2].charAt(0)!=" ")  //has middle name, get first letter and append to a period, o/w is blank from var statement above
	{
		MiddleInit = " " + cursor[2].charAt(0) + ".";
	}
	if(cursor[3].charAt(0)!=" ")  // has suffix, set variable w/ space before, o/w is blank from var statement above
	{
		NameSuffix = " " + trim(cursor[3]);
	}
	//Set the name as last suffix,first MI This is OHR's indexing scheme.
	rtn = trim(cursor[0]) + NameSuffix + ", " + trim(cursor[1]) + MiddleInit;
	//limit the result to 39 characters for long names
	rtn = rtn.substr(0,39) 

	cursor.close();
	return rtn;
}
//------------------------------------------------------------------
/** ****************************************************************************
  *		Performs an external DB lookup (PeopleSoft) to retrieve the employees 
  *		name
  *
  * @param {String} emplId Employee ID
  * @returns {String} SSN last 4 of the Employee or false
  * @requires DB_DBAccess
  * Added to Library TechHelp 308870 by JMT - Oct 2019
  *****************************************************************************/
function TU_Func_LookupSSN4_by_EmplID_OHR(emplid)
{
	var cursor, SSN, SQL = "";
	Clib.sprintf(SQL, "SELECT A.NATIONAL_ID FROM SYSADM.PS_PERS_NID A WHERE ((A.EMPLID='%s') AND (A.PRIMARY_NID='Y'))", emplid);
	debug.log(5, "SQL=%s\n", SQL);
	cursor = db.query(SQL, Database.dynamic);

	if(!cursor || !cursor.first())
	{
		debug.log("ERROR", "Could not get first row for SSN\n");
		return false;
	}
	//return ID only
	rtn = trim(cursor[0]);
	rtn = rtn.substr(-4,4);  //Last 4 digits. Might have non-numeric SSN, or other truncated value from PS
	cursor.close();

	return rtn;
}

//TechHelp 326257 BEGIN - JMT 2/18/2020
function TU_DeleteArchivedFiles(path, intDays) 
{
	//Get today
	var dteToday = new Date();
	var arrArchiveFiles = SElib.directory(path + "*.*", false, ~FATTR_SUBDIR);
	debug.logln(5,"arrArchiveFiles.length [%s]", arrArchiveFiles.length);
	for (var i = 0; i < arrArchiveFiles.length ; i++)
	{
		var dteCreate = arrArchiveFiles[i].create;
		var dteCTime = new Date(Clib.ctime(arrArchiveFiles[i].create));
		debug.logln(5,"dteCreate [%s] | ctime [%s]", dteCreate, dteCTime);
		debug.logln(5,"arrArchiveFiles [%s] | Name [%s] | Date Created [%s]", i, arrArchiveFiles[i].name, dteCreate);
		/* date2. getTime() – date1. getTime();
		Calculate the no. of days between two dates, divide the time difference of both the dates by no. of milliseconds in a day (1000*60*60*24)*/
		var intDaysOld = (dteToday.getTime() - dteCTime.getTime() ) / (1000*60*60*24)
		debug.logln(5,"intDaysOld [%s]", intDaysOld);
		if(intDaysOld <= intDays) continue;  //nothing to do here, get next file
		//Get to here> Delete this old archive file
		debug.logln(5,"would delete");
		var booDeleteArchive = advancedArchiveFile(arrArchiveFiles[i].name, path, advancedArchiveFile.DELETE)
	}  //end of for
return true;
}
//TechHelp 326257 END - JMT 2/18/2020