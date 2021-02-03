function worksheetLoad()
{
	// Load the comments section of the form
	displayComments('hdnDecUser');

 	calcTotalAmount('0');  //skip speedtype warning messages on load
	MakeFieldsReadOnly();

}

/** ****************************************************************************
  *****************************************************************************/
function MakeFieldsReadOnly()
{
	HashKeysToUpperCase(hashQueuesAPReadOnly);
//	var queueName = document.getElementById("hdnCurrentQueueName").value;
	var queueName = hdnCurrentQueueName;
//	alert("[" + queueName.toUpperCase() + "]");
	//alert("[" + hdnCurrentQueueName + "]/n" + currentUser);
	//if (queueName != "")
	if (hashQueuesAPReadOnly[queueName.toUpperCase()])
	{
		//document.getElementById("txtInvoiceDate").style.display="none";
		document.getElementById("txtInvoiceDate").readOnly=true;
		document.getElementById("txtInvoiceNbr").readOnly=true;
		document.getElementById("txtPONum").readOnly=true;
		document.getElementById("uxPartComp").disabled=true;
		document.getElementById("txtDept1").readOnly=true;
		document.getElementById("txtAccount1").readOnly=true;
		document.getElementById("txtInit1").readOnly=true;
		document.getElementById("txtAmount1").readOnly=true;
		document.getElementById("txtDept2").readOnly=true;
		document.getElementById("txtAccount2").readOnly=true;
		document.getElementById("txtInit2").readOnly=true;
		document.getElementById("txtAmount2").readOnly=true;
		document.getElementById("txtDept3").readOnly=true;
		document.getElementById("txtAccount3").readOnly=true;
		document.getElementById("txtInit3").readOnly=true;
		document.getElementById("txtAmount3").readOnly=true;
		document.getElementById("txtDept4").readOnly=true;
		document.getElementById("txtAccount4").readOnly=true;
		document.getElementById("txtInit4").readOnly=true;
		document.getElementById("txtAmount4").readOnly=true;
		document.getElementById("txtDept5").readOnly=true;
		document.getElementById("txtAccount5").readOnly=true;
		document.getElementById("txtInit5").readOnly=true;
		document.getElementById("txtAmount5").readOnly=true;
		document.getElementById("txtDept6").readOnly=true;
		document.getElementById("txtAccount6").readOnly=true;
		document.getElementById("txtInit6").readOnly=true;
		document.getElementById("txtAmount6").readOnly=true;
		document.getElementById("txtDept7").readOnly=true;
		document.getElementById("txtAccount7").readOnly=true;
		document.getElementById("txtInit7").readOnly=true;
		document.getElementById("txtAmount7").readOnly=true;
		document.getElementById("txtDept8").readOnly=true;
		document.getElementById("txtAccount8").readOnly=true;
		document.getElementById("txtInit8").readOnly=true;
		document.getElementById("txtAmount8").readOnly=true;
		document.getElementById("btnDecAdd").disabled=true;

	}
}
var hashQueuesAPReadOnly =
{
//	"Dept._Reject": true,
	"Dept._Approved/AP_Review": true,
	"AP_Voucher_Create": true,
	"Linda Pending": true,
	"Bill Pending": true,
	"DAFR": true,
	"Voucher Complete": true,
	"Voucher Final": true,
	"FMGT_Complete": true,
	"": true
	//"EP HR Add Job Record": true
};

/** ****************************************************************************
  *    Changes the name of all properties in a given object to uppercase to
  *    so that there are no case issues when a lookup is performed.  hash is
  *    passed by reference
  *    $Rev: 1579 $
  *
  * @param {Object} hash Hash/Associative Array with keys
  * @param {Boolean} delOrigKey Optional parameter - if defined and true
  *    the original mixed case key is removed;
  * @return {void} parameter is modifed
  *****************************************************************************/
function HashKeysToUpperCase(hash, delOrigKey)
{
	var newKey;
	for (var key in hash)
	{
		if( (newKey = key.toUpperCase() ) != key)
		{
			hash[newKey] = hash[key];
			if(delOrigKey)
			{
				delete(hash[key]);
			}
		}
	}
}

 function calcTotalAmount(strPos)
{
	var tempvalue = 0;

	var Amt1 = parseFloat(document.getElementById('txtAmount1').value);
	var Amt2 = parseFloat(document.getElementById('txtAmount2').value);
	var Amt3 = parseFloat(document.getElementById('txtAmount3').value);
	var Amt4 = parseFloat(document.getElementById('txtAmount4').value);
	var Amt5 = parseFloat(document.getElementById('txtAmount5').value);
	var Amt6 = parseFloat(document.getElementById('txtAmount6').value);
	var Amt7 = parseFloat(document.getElementById('txtAmount7').value);
	var Amt8 = parseFloat(document.getElementById('txtAmount8').value);
	var AmtTotal = document.getElementById('txtTotal');
	tempvalue = ((isNaN(Amt1) ? 0 : Amt1) + (isNaN(Amt2) ? 0 : Amt2) + (isNaN(Amt3) ? 0 : Amt3) + (isNaN(Amt4) ? 0 : Amt4) + (isNaN(Amt5) ? 0 : Amt5) + (isNaN(Amt6) ? 0 : Amt6) + (isNaN(Amt7) ? 0 : Amt7) + (isNaN(Amt8) ? 0 : Amt8));   //Amt2;  // + Amt2;
	AmtTotal.value = tempvalue.toFixed(2);
	
	if (strPos == "0") { return true; }   //stop here for onLoad
	
	//alert("Line is " + strPos + "/n" ); // Dept lenght is" + (document.getElementById('txtDept'+ strPos).length == 7));
	var deptStr = document.getElementById('txtDept'+ strPos).value;
	//alert("string is " + deptStr);
	var deptLen = deptStr.length;
	//alert("Length is " + deptLen);

	if (document.getElementById('txtAmount'+ strPos).value == "") { return true; }   //no checks needed
	//get to here if there is an amount

//	if (deptLen == 7) { return true; }  //no more checks for grant
	
	//get to here for non-grant or null
	//3 tests - 1) Both dept and acct are null, 2) dept only is null, 3) acct only is null
	//test 1
	if (document.getElementById('txtAccount'+ strPos).value == "" && document.getElementById('txtDept'+ strPos).value == "")
	{
		alert("Please fill in the Department and Account # for line " + strPos + ".");
		document.getElementById('txtDept'+ strPos).focus();
		return true;
	}
	//test 2
	if (document.getElementById('txtDept'+ strPos).value == "")
	{
		alert("Please fill in the Department for line " + strPos + ".");
		document.getElementById('txtDept'+ strPos).focus();
		return true;
	}
	//test 3
	if (document.getElementById('txtAccount'+ strPos).value == "")
	{
		alert("Please fill in the Account # for line " + strPos + ".");
		document.getElementById('txtAccount'+ strPos).focus();
		return true;
	}

}

//***********************************************************************
/** Removes leading and trailing space from a string.
 * <p><em>Generic Function</em> (common)</p>
 * <p>Modified:   $Revision: 1177 $ $Date: 2007-07-05 20:41:35 -0500 (Thu, 05 Jul 2007) $ $Author: trothwell $</p>
 * @function trim
 * @param {String} str
 * @return {String} cleaned up string (or whatever was passed if it wasn't a string)
 */ //*******************************************************************
function trim(str)
{
	return (str && str.replace) ? str.replace(/^\s+|\s+$/g,"") : str;
}

function chkKeys(e,type)
{
	var keynum = e.keyCode;
	var keychar = String.fromCharCode(keynum);

	switch (type)
	{
		case 'A':	/* alpha */
			valChk = /[a-zA-Z\s]/;
			return valChk.test(keychar);
			break;
		case 'N':	/* numeric */
			valChk = /[-\d\.]/;
			return valChk.test(keychar);
			break;
		case 'T':	/* time */
			valChk = /[\:\dAPM ]/;
			return valChk.test(keychar);
			break;
		case 'AN':	/* alphanumeric */
			valChk = /[a-zA-Z0-9\s\-\.\+]/;
			return valChk.test(keychar);
			break;
		case 'C':	/* currency ($, numbers, .) */
			valChk = /[0-9\$\.]/;
			return valChk.test(keychar);
			break;
		case 'D':	/* calendar */
			valChk = /[\/\d]/; 
			return valChk.test(keychar);
			break;
		default:
			break;
	}
}

function validateSpeedType(elem)
{
/*	if (gLastElemIdFailedValidation && gLastElemIdFailedValidation != elem.id)
	{
		document.getElementById(gLastElemIdFailedValidation).focus();
		return true;
	}
	
	gLastElemIdFailedValidation = null;
*/
	if (elem.value == "") return true;
	//check length of speedtype code
	var valChk1 = /^\d\d\d\d\d\d\d$/;
	var valChk2 = /^\d\d\d\d\d$/;
	var valChk3 = /^\d\d\d\d$/;
	if (!valChk1.test(elem.value) && !valChk2.test(elem.value) && !valChk3.test(elem.value))
	{
		alert("Invalid Dept. or Grant Number!\nYou need 4, 5, or 7 digits.");
		//gLastElemIdFailedValidation = elem.id;
		//elem.focus();  JMT to stop alert box looping
		return false;
	}
}

function checkDate(elem, format, req)
{
	if(elem.value == "")
	{
		if(req)
		{
			alert("Please enter a date in the format DD/MM/YYYY - the format is " + format + ".");
			//elem.focus();  JMT to stop alert box looping
			return false;
		}
		return true;
	}
	
	switch(format)
	{
		case "MM-DD-YYYY":
			var arrDate = elem.value.split("-");
			day = arrDate[1];
			month = arrDate[0];
			year = arrDate[2];
			break;
		case "DD.MM.YYYY":
			var arrDate = elem.value.split(".")
			day = arrDate[0];
			month = arrDate[1];
			year = arrDate[2];
			break;
		case "YYYY/MM/DD":
			var arrDate = elem.value.split("/");
			day = arrDate[2];
			month = arrDate[1];
			year = arrDate[0];
			break;
		case "YYYYMMDD":
			year = elem.value.substr(0, 4);
			month = elem.value.substr(4, 2);
			day = elem.value.substr(6);
			break;
		case "MMDDYYYY":
			year = elem.value.substr(4);
			month = elem.value.substr(0, 2);
			day = elem.value.substr(2, 2);
			break;
		case "MMYYYY":
			year = elem.value.substr(2);
			month = elem.value.substr(0,2);
			day = "01";
		default:  //default or nothing is mm/dd/yyyy
			var arrDate = elem.value.split("/");
			day = arrDate[1];
			month = arrDate[0];
			year = arrDate[2];
			break;
	}
	
	var objDate = new Date(year,month-1,day);
	var blnResult = true;
	
	if(parseInt(month, 10) !== (objDate.getMonth()+1))
	{
		blnResult = false;
	}
	
	if (parseInt(day, 10) !== objDate.getDate())
	{
		blnResult = false;
	}
	
	//assumes 4 digit year!  
	if(parseInt(year,10) !== objDate.getFullYear())
	{
		blnResult = false;
	}
	
	if(!blnResult)
	{
		alert("Please enter a valid date in MM/DD/YYYY format.");
		//elem.value = "";
		//elem.focus();  JMT to stop alert box looping
		gLastElemIdValidated = elem.id;
		return blnResult;
	}
	
//	var now = new Date();
//	
//	if (objDate > now)
//	{
//		alert("Date can not be in the future.");
//		//elem.value = "";
//		gLastElemIdValidated = elem.id;
//		elem.focus();
//	}
	
	return blnResult;
}


function btnGetStudentInfo_click()
{
	loadCheckBoxes();
	
	// Calculates the rank in class percent
	var data = new DataSource('txtTotal');
	waitForData(data, calcRankInClass);
	
	//Calculates the total combined gpa for transcript info
	var data = new DataSource('txtTransQP');
	waitForData(data, calcTranscriptGPA);

	//Calculates the total combined gpa for transcript info
	var data = new DataSource('txtTransQP');
	waitForData(data, calcLineItemTransGPA);
	
	//Calculates the total cumulative credits
	var data = new DataSource('txtTransCredits');
	waitForData(data, calcTranscriptCredits);
	
	var data = new DataSource('hdnTranscriptData');
	waitForData(data, popTranscriptInfo);
}

function popTranscriptInfo()
{	
	var elems = document.getElementsByName('txtTransName');
	var rowsToDel = elems.length - 1;
	
	var delBtn = document.getElementById('btnDelTranscriptRow');
	delBtn.setAttribute('count', rowsToDel.toString());
	delBtn.click();
	
	var elem = document.getElementById('hdnTranscriptData');	
	
	var arr = elem.value.split('\02');
	
	var rowsToAdd = arr.length - 1;
	var addBtn = document.getElementById('btnAddTranscriptRow');
	addBtn.setAttribute('count', rowsToAdd.toString());
	addBtn.click();
	
	var elems = document.getElementsByName('txtTransName');
	for(var i=0; i<arr.length; i++)
	{
		var row = arr[i];
		
		var rowArr = row.split("@@");
		
		if(rowArr.length != 6)
			continue;
		
		var nameField = elems[i];
		nameField.value = rowArr[0];
		
		var CEEBField = nameField.parentElement.nextSibling.lastChild;
		CEEBField.value = rowArr[1];
		
		var QPField = CEEBField.parentElement.nextSibling.lastChild;
		QPField.value = rowArr[2];
		
		var QHField = QPField.parentElement.nextSibling.lastChild;
		QHField.value = rowArr[3];
		
		var GPAField = QHField.parentElement.nextSibling.lastChild;
		GPAField.value = rowArr[4];
		
		var CreditsField = GPAField.parentElement.nextSibling.lastChild;
		CreditsField.value = rowArr[5];
	}
	
	elem.value = "";
}

function checkReportedGPA(displayAlerts)
{
	if(displayAlerts != false)
	{
		displayAlerts = true;
	}
	var uxRepGpa = document.getElementById('txtRepGPA');
	var uxRep2Gpa = document.getElementById('txtRep2GPA');
	
	removeClass(uxRepGpa, "error");
	removeClass(uxRep2Gpa, "error");
	
	repGpa = parseFloat(uxRepGpa.value);
	rep2Gpa = parseFloat(uxRep2Gpa.value);
	
	if(!isNaN(repGpa) && !isNaN(rep2Gpa))
	{
		if(repGpa > rep2Gpa)
		{
			addClass(uxRepGpa, "error");
			addClass(uxRep2Gpa, "error");
			if(displayAlerts)
			{
				alert("The Reported GPA is greater than the maximum");
			}
		}
	}
}

function checkAdmissionsGPA(displayAlerts)
{	
	if(displayAlerts != false)
	{
		displayAlerts = true;
	}
	var uxAdmGpa = document.getElementById('txtAdmGPA');
	var uxAdm2Gpa = document.getElementById('txtAdm2GPA');
	
	removeClass(uxAdmGpa, "error");
	removeClass(uxAdm2Gpa, "error");
	
	admGpa = parseFloat(uxAdmGpa.value);
	adm2Gpa = parseFloat(uxAdm2Gpa.value);
	
	if(!isNaN(admGpa) && !isNaN(adm2Gpa))
	{
		if(admGpa > adm2Gpa)
		{
			addClass(uxAdmGpa, "error");
			addClass(uxAdm2Gpa, "error");
			if(displayAlerts)
			{
				alert("The admissions GPA is greater than the maximum");
			}
		}
	}
}

function checkRankInClass(displayAlerts)
{
	if(displayAlerts != false)
	{
		displayAlerts = true;
	}
	var uxRIC1 = document.getElementById('txtRIC1');
	var uxRIC2 = document.getElementById('txtRIC2');
	
	removeClass(uxRIC1, "error");
	removeClass(uxRIC2, "error");
	
	ric1 = parseFloat(uxRIC1.value);
	ric2 = parseFloat(uxRIC2.value);
	
	if(!isNaN(ric1) && !isNaN(ric2))
	{
		if(ric1 > ric2)
		{
			addClass(uxRIC1, "error");
			addClass(uxRIC2, "error");
			if(displayAlerts)
			{
				alert("Rank in class is greater than the total number of students");
			}
		}
	}
}

function calcTranscriptGPA()
{
	var elems = document.getElementsByName("txtTransQP");
	
	var gpaTotal = 0;
	for(var i=0 ; i< elems.length; i++)
	{
		if(elems[i].value > '')
		{
			gpaTotal += parseFloat(elems[i].value);
		}
	}
	
	var elems = document.getElementsByName("txtTransQH");
	
	var hoursTotal = 0;	
	for(var i=0 ; i< elems.length; i++)
	{
		if(elems[i].value > '')
		{
			hoursTotal += parseFloat(elems[i].value);
		}
	}
	
	if(gpaTotal > 0 && hoursTotal > 0)
	{
		var totalField = document.getElementById('txtCombGPA');
		totalField.value = (gpaTotal / hoursTotal).toFixed(3);
	}
}

function calcLineItemTransGPA()
{
	var uxQP = document.getElementsByName("txtTransQP");
	var uxQH = document.getElementsByName("txtTransQH");
	
	for(var i=0; i<uxQP.length; i++)
	{
		if(uxQP[i].value > '' && uxQH[i].value > '')
		{
			var uxTransGPA = getChildById(uxQP[i].parentElement.parentElement, "input", "txtTransGPA");

			var qp = parseFloat(uxQP[i].value);
			var qh = parseFloat(uxQH[i].value);

			if(isNaN(qp) || isNaN(qh) || !uxTransGPA)
			{
				return false;
			}
			
			var value = (qp / qh);
			
			if(isNaN(value))
			{
				continue;
			}
			uxTransGPA.value = value.toFixed(3);
		}
	}	
}

function calcTranscriptCredits() 
{
	var elems = document.getElementsByName("txtTransCredits");
	
	var creditsTotal = 0;	
	for(var i=0 ; i< elems.length; i++)
	{
		if(elems[i].value > '')
		{
			creditsTotal += parseFloat(elems[i].value);
		}
	}
	
	var totalField = document.getElementById('txtCumCredits');
	totalField.value = creditsTotal

	elems = document.getElementsByName('hdnAttemptedCredits');

	var attemptedCredits = 0;
	for(var i=0; i<elems.length; i++)
	{
		if(elems[i].value > '')
		{
			attemptedCredits += parseFloat(elems[i].value);
		}
	}

	var totalField = document.getElementById('hdnCumAttemptedCredits');
	totalField.value = attemptedCredits;
}

// check a checkbox
function check(cbId, hdnId, val)
{	
	if(document.getElementById(hdnId).value == val)
	{
		document.getElementById(cbId).checked = true;
	}
}


function addDecision()
{
	var comment = document.getElementById("cboDecisionProgAction");
	var reason = document.getElementById('cboReasonCode');
	var users = document.getElementsByName("hdnDecUser");	
	
	if(users.length > 2)
		shiftCommentsDown('hdnDecUser');
	
	for(var r=users.length-1; r>0; r--)
	{		
		if(users[r].value == "")
		{
			var userField = users[r];
			break;
		}
	}
	
	
	if(clientType == 'webclient')
	{
		var dateField = userField.parentElement.nextSibling.nextSibling.lastChild.previousSibling;
		var commentField = dateField.parentElement.nextSibling.nextSibling.lastChild.previousSibling;
		var decisionField = commentField.parentElement.nextSibling.nextSibling.lastChild.previousSibling;
		var reasonField = decisionField.parentElement.nextSibling.nextSibling.lastChild.previousSibling;
		var now = new Date();
		var month = (now.getMonth()+1).toString().length == 1 ? "0"+(now.getMonth()+1):(now.getMonth()+1);
		var day = now.getDate().toString().length == 1 ? "0"+now.getDate():now.getDate();
		var currentDate = month + "/" + day + "/" + now.getFullYear();

		userField.previousSibling.previousSibling.innerHTML = currentUser;
		dateField.previousSibling.previousSibling.innerHTML = currentDate;
		commentField.previousSibling.previousSibling.innerHTML = comment.options[comment.selectedIndex].text + " - " +  reason.options[reason.selectedIndex].text;
	}
	else
	{
		var dateField = userField.parentElement.nextSibling.lastChild;
		var commentField = dateField.parentElement.nextSibling.lastChild;
		var decisionField = commentField.parentElement.nextSibling.lastChild;
		var reasonField = decisionField.parentElement.nextSibling.lastChild;
		var now = new Date();
		var month = (now.getMonth()+1).toString().length == 1 ? "0"+(now.getMonth()+1):(now.getMonth()+1);
		var day = now.getDate().toString().length == 1 ? "0"+now.getDate():now.getDate();
		var currentDate = month + "/" + day + "/" + now.getFullYear();
		
		userField.previousSibling.innerHTML = currentUser;
		dateField.previousSibling.innerHTML = currentDate;
		commentField.previousSibling.innerHTML = comment.options[comment.selectedIndex].text + " - " +  reason.options[reason.selectedIndex].text;	
	}


	userField.value = currentUser;
	dateField.value = currentDate;
	commentField.value = comment.options[comment.selectedIndex].text + " - " +  reason.options[reason.selectedIndex].text;	
	decisionField.value = comment.value;
	reasonField.value = reason.value;

}

function btnDecAdd_click()
{
	if(document.getElementById('cboDecisionProgAction').value == "")
	{
		alert("Please select an Action Reason");
		return false;
	}
	callBtn('hdnBtnDecAdd');
	addDecision();
}

function displayComments(elemName)
{
	var users = document.getElementsByName(elemName);
	
	for(var r=users.length-1; r>=0; r--)
	{
		var userElement = users[r];
		var parent = userElement.parentElement.parentElement;
		for(var i=0; i<parent.childNodes.length; i++)
		{			
			var elem = parent.childNodes[i];
			if(elem && elem.firstChild && elem.lastChild)
			{
				if(elem.lastChild.value)
				{
					elem.firstChild.innerHTML = elem.lastChild.value;
				}
				else if(elem.lastChild.previousSibling && elem.lastChild.previousSibling.value)
				{
					elem.firstChild.nextSibling.innerHTML = elem.lastChild.previousSibling.value;
				}
			}
		}
	}
}

function shiftCommentsDown(elemName)
{
	var users = document.getElementsByName(elemName);
	
	for(var r=users.length-1; r>=0; r--)
	{
		var userElement = users[r];
		var parent = userElement.parentElement.parentElement;
		for(var i=0; i<parent.childNodes.length; i++)
		{
			var elem = parent.childNodes[i];
			if(clientType == 'webclient')
			{
				if(elem && elem.firstChild)
				{
					if(r==0 || r==1)
					{
						elem.lastChild.previousSibling.value = "";
						elem.firstChild.nextSibling.innerHTML = "";
					}
					else if(parent.previousSibling.childNodes[i])
					{
						elem.lastChild.previousSibling.value = parent.previousSibling.childNodes[i].lastChild.previousSibling.value;
						elem.firstChild.nextSibling.innerHTML = parent.previousSibling.childNodes[i].firstChild.nextSibling.innerHTML;
					}
					else if(parent.previousSibling.previousSibling.childNodes[i])
					{
						elem.lastChild.previousSibling.value = parent.previousSibling.previousSibling.childNodes[i].lastChild.previousSibling.value;
						elem.firstChild.nextSibling.innerHTML = parent.previousSibling.previousSibling.childNodes[i].firstChild.nextSibling.innerHTML;
					}
				}
			}
			else
			{
				if(r==0)
				{
					elem.lastChild.value = "";
					elem.firstChild.innerHTML = "";
				}
				else
				{
					elem.lastChild.value = parent.previousSibling.childNodes[i].lastChild.value;
					elem.firstChild.innerHTML = parent.previousSibling.childNodes[i].firstChild.innerHTML;
				}
			}
		}
	}
	
}

/*
function addComment()
{
	var comment = document.getElementById("txaComments");
	
	if(trim(comment.value) == "")
	{
		return false;		
	}
	
	var users = document.getElementsByName("hdnUser");	
	//
	if(users.length > 2)
		shiftCommentsDown('hdnUser');
	
	for(var r=users.length-1; r>0; r--)
	{		
		if(users[r].value == "")
		{
			var userField = users[r];
			break;
		}
	}	
	
	var dateField = userField.parentElement.nextSibling.lastChild;
	var commentField = dateField.parentElement.nextSibling.lastChild;
	var now = new Date();
	var month = (now.getMonth()+1).toString().length == 1 ? "0"+(now.getMonth()+1):(now.getMonth()+1);
	var day = now.getDate().toString().length == 1 ? "0"+now.getDate():now.getDate();
	var currentDate = month + "/" + day + "/" + now.getFullYear();

	userField.previousSibling.innerHTML = currentUser;
	dateField.previousSibling.innerHTML = currentDate;
	commentField.previousSibling.innerHTML = comment.value;	
				
	userField.value = currentUser;
	dateField.value = currentDate;
	commentField.value = comment.value;				
	
	comment.value = "";	
}
*/
/*
function loadTestRows()
{
    if(document.getElementById("hdnAddRows").value == "true")
    {
        document.getElementById("hdnAddRows").value = false;
        addTestRows();
    }   
    else
        popTestRows();
}


function popTestRows()
{
    var jsonStr = document.getElementById("hdnTestScoreJson").value.replace(/&#61;/g, "=");
    
    if(jsonStr == "")
        return;
    
    eval(jsonStr);
    var lineItemLength = sData.TestScores.length;
    var loadDates = document.getElementsByName("hdnPSLoadDate");
    document.getElementById("hdnPSError").innerHTML = "";
    
    for(var i in sData.TestScores)
    {
        var currentField = loadDates[i];
        if(sData.TestScores[i].LoadDate)
        {
            currentField.value = sData.TestScores[i].LoadDate;
            currentField.previousSibling.innerHTML = sData.TestScores[i].LoadDate;
        }
            
        currentField = currentField.parentElement.nextSibling.lastChild;
        if(sData.TestScores[i].TestDate)
        {
            currentField.value = sData.TestScores[i].TestDate;
            currentField.previousSibling.innerHTML = sData.TestScores[i].TestDate;
        }
            
        currentField = currentField.parentElement.nextSibling.lastChild;
        if(sData.TestScores[i].Test)
        {
            currentField.value = sData.TestScores[i].Test;
            currentField.previousSibling.innerHTML = sData.TestScores[i].Test;
        }
          
        currentField = currentField.parentElement.nextSibling.lastChild;
        if(sData.TestScores[i].Component)
        {
            currentField.value = sData.TestScores[i].Component;
            currentField.previousSibling.innerHTML = sData.TestScores[i].Component;
        }
            
        currentField = currentField.parentElement.nextSibling.lastChild;
        if(sData.TestScores[i].Score)
        {
            currentField.value = sData.TestScores[i].Score;
            currentField.previousSibling.innerHTML = sData.TestScores[i].Score;
        }
            
        currentField = currentField.parentElement.nextSibling.lastChild;
        if(sData.TestScores[i].Source)
        {
            currentField.value = sData.TestScores[i].Source;
            currentField.previousSibling.innerHTML = sData.TestScores[i].Source;
        }
    }
    
    document.getElementById("hdnTestScoreJson").value = "";
    document.getElementById("tblPSTestScores").style.display = "inline";
}
*/

function popReasonCbo(decision, reasonCode)
{
	var reasonCode = decision.parentElement.nextSibling.firstChild;
	if(!reasonCode)
	{
		reasonCode = decision.parentElement.nextSibling.nextSibling.firstChild.nextSibling;
	}
    var count = 0;
    reasonCode.length = 1;
    var selDecision = decision[decision.selectedIndex].text;
    
    for(var i in reasonCodes[selDecision])
    {
		if(typeof(reasonCodes[selDecision][i]) == 'function')
		{
			continue;
		}
        var opt = document.createElement('option');
		opt.id = count;
		opt.text = reasonCodes[selDecision][i];
		opt.value = i;

		if(document.createEventObject)
		{
			reasonCode.add(opt);
		}
		else
		{
		    reasonCode.add(opt,null);
		}
		count++;
    }
}
/*
function verifyTestScores(score)
{
    var component = score.parentElement.previousSibling.firstChild;
    var test = component.parentElement.previousSibling.firstChild;
    
    if(test.value == "None")
    {
        alert("Please select a test from the dropdown menu");
        test.focus();
        return;
    }
    if(component.value == "")
    {
        alert("Please select a component from the dropdown menu");
        component.focus();
        return;
    }
    
    try
    {
        var testString = testScoreLimits[test.value][component.value];
    }
    catch(e)
    {
        return;
    }
    
    var scoreParts = testString.split("/");
    var maxValue = parseFloat(scoreParts[0]);
    var minValue = parseFloat(scoreParts[1]);
    var scoreValue = parseFloat(score.value);
    
    if(scoreValue > maxValue)
    {
        alert("Score cannot be greater than " + maxValue);
        score.select();
    }
    else if(scoreValue < minValue)
    {
        alert("Score cannot be less than " + minValue);
        score.select();
    }
}
*/
/*
function deleteRows()
{
	var bMultChecked = false;
	var bNotChecked = false;
	var chkFld = document.getElementsByName('chkiScriptDeleteRow');
	var chkFldLen = chkFld.length;

	for (i=0;i<frmWorksheet.elements.length;i++)
	{
		if (frmWorksheet.elements[i].id == 'chkiScriptDeleteRow')
		{
			if (frmWorksheet.elements[i].checked)
			{
				var hdnFlg = frmWorksheet.elements[i].nextSibling;
				hdnFlg.value = frmWorksheet.elements[i].checked;
				//look for one that isn't checked -- if exists, set this one's display to none.  otherwise, just blank out data
				for (j=0;j<frmWorksheet.elements.length;j++)
				{
					if (frmWorksheet.elements[j].id == 'chkiScriptDeleteRow')
					{
						if (!frmWorksheet.elements[j].checked)
						{
							bNotChecked = true;
						}
					}
				}
				if (chkFldLen > 1)
				{
					frmWorksheet.elements[i].parentNode.parentNode.style.display = 'none';
					var loadDate = frmWorksheet.elements[i].parentNode.nextSibling.firstChild;
					var testDate = frmWorksheet.elements[i].parentNode.nextSibling.nextSibling.firstChild;
					var testType = frmWorksheet.elements[i].parentNode.nextSibling.nextSibling.nextSibling.firstChild;
					var testTypeHdn = frmWorksheet.elements[i].parentNode.nextSibling.nextSibling.nextSibling.lastChild;
					var comp = frmWorksheet.elements[i].parentNode.nextSibling.nextSibling.nextSibling.nextSibling.firstChild;
					var compHdn = frmWorksheet.elements[i].parentNode.nextSibling.nextSibling.nextSibling.nextSibling.lastChild;
					var score = frmWorksheet.elements[i].parentNode.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.firstChild;
					var source = frmWorksheet.elements[i].parentNode.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.firstChild;
					loadDate.value = '';
					testDate.value = '';
					testType.selectedIndex = 0;
					testTypeHdn.value = '';
					comp.selectedIndex = 0;
					compHdn.value = '';
					score.value = '';
					source.value = '';
					chkFldLen = chkFldLen-1;
				}
				else if (chkFldLen == 1)
				{
					frmWorksheet.elements[i].checked = false;
					frmWorksheet.elements[i].nextSibling.value = false;
					var loadDate = frmWorksheet.elements[i].parentNode.nextSibling.firstChild;
					var testDate = frmWorksheet.elements[i].parentNode.nextSibling.nextSibling.firstChild;
					var testType = frmWorksheet.elements[i].parentNode.nextSibling.nextSibling.nextSibling.firstChild;
					var testTypeHdn = frmWorksheet.elements[i].parentNode.nextSibling.nextSibling.nextSibling.lastChild;
					var comp = frmWorksheet.elements[i].parentNode.nextSibling.nextSibling.nextSibling.nextSibling.firstChild;
					var compHdn = frmWorksheet.elements[i].parentNode.nextSibling.nextSibling.nextSibling.nextSibling.lastChild;
					var score = frmWorksheet.elements[i].parentNode.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.firstChild;
					var source = frmWorksheet.elements[i].parentNode.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.firstChild;
					loadDate.value = '';
					testDate.value = '';
					testType.selectedIndex = 0;
					testTypeHdn.value = '';
					comp.selectedIndex = 0;
					compHdn.value = '';
					score.value = '';
					source.value = '';
				}
			}
		}
	}
}
*/

/****************************************************************
				G E N E R A L  F U N C T I O N S
*****************************************************************/
// click a button
function callBtn(id)
{
	document.getElementById(id).click();
}

function saveRadioButton(radioVal, hiddenId)
{
    var hidden = document.getElementById(hiddenId);
    hidden.value = radioVal;
}

// Holds information for db lookup to be used in the waitForData function
function DataSource(id) {	
	this.id = id
	this.interval = null;
	this.retryCount = 0;
	this.maxRetries = 5;
}

// Poll field until data is found or retry count is met
// Typically used to wait for data from a db lookup
function waitForData(data, callback)
{	
	if(document.getElementById(data.id) && document.getElementById(data.id).value > '')
	{		
		clearTimeout(data.interval);
		callback();
	}
	else if(data.retryCount >= data.maxRetries)
	{
		return false;
	}
	else
	{
		data.retryCount++;		
		data.interval = setTimeout(function() { waitForData(data,callback); }, 2000);
	}
}


function getChildById(oElm, tag, id)
{	 	
    if ( oElm == null )
            oElm = document;
    if ( tag == null )
            tag = '*';
    var els = oElm.getElementsByTagName(tag);
    var elsLen = els.length;
    var pattern = new RegExp("(^|\\s)"+id+"(\\s|$)");
    for (i = 0; i < elsLen; i++) {
            if ( pattern.test(els[i].id) ) {
                    return els[i]
            }
    }
    return null;
}

function addClass(element, value) {
	if (!element.className) {
		element.className = value;
	} else {
		var newClassName = element.className;
		newClassName += " ";
		newClassName += value;
		element.className = newClassName;
	}
}

function removeClass(element,value) {
	var reg = new RegExp('(\\s|^)' + value);
	element.className = element.className.replace(reg, '');
}