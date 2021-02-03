var hashQueuesToShowRadioButtons =
{
	"EP HR Approve Manual Update": true,
	"EP HR Add Job Record": true,
	/* Jay Taffel 12/14/2011 - Added 2 error queues to list showing the New/Existing radio buttons */
	"EP Error": true,
	"EP Error PSoft Update": true
};

var gLastElemIdFailedValidation = null;

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

/** ****************************************************************************
  *****************************************************************************/
function setHidden(hdnEle, val)
{
	document.getElementById(hdnEle).value = val;
}

/** ****************************************************************************
  *****************************************************************************/
function setSubmitDate()
{
	var submitDateObj = document.getElementById("hdnSubmissionDate");
	if (submitDateObj.value == "")
	{
		var now = new Date();
		var dateStr  = now.getFullYear()
		    dateStr += "-";
		    dateStr += (now.getMonth()+1 >= 10)?(now.getMonth()+1):("0"+(now.getMonth()+1));
		    dateStr += "-";
		    dateStr += (now.getDate() >= 10)?now.getDate():("0"+now.getDate());
		
		submitDateObj.value = dateStr;
	}
}

/** ****************************************************************************
  *****************************************************************************/
function showRecordTypeTable()
{
	HashKeysToUpperCase(hashQueuesToShowRadioButtons);
	var queueName = document.getElementById("hdnCurrentQueueName").value;
	//alert("[" + queueName.toUpperCase() + "]");
	//if (queueName != "")
	if (hashQueuesToShowRadioButtons[queueName.toUpperCase()])
	{
		document.getElementById("tblRecordType").style.display="table";
	}
/*****BEGIN Jay Taffel 11/18/2011 ****/
	//section to hide personal data row
	//if (queueName.endsWith("(EP Hiring Dept Approval)"))  // seems the action is not supported
	//the dept approval subqueue has the dept name first and then the super queue name. Dept name is 3 or 4 chars.
	if (queueName.substr(5,99) == "(EP Hiring Dept Approval)" | queueName.substr(4,99) == "(EP Hiring Dept Approval)" )
	{
		document.getElementById("tblPersonalData").style.display="none";
	}
/*****END Jay Taffel 11/18/2011 ****/
}

/** ****************************************************************************
  *****************************************************************************/
function showHideLastLogin()
{
	var issuedNetId = document.getElementById("hdnIssuedNetId").value;
	if (issuedNetId == "Yes")
	{
		document.getElementById("trLastLogin").style.display="table-row";
	}
	else
	{
		document.getElementById("trLastLogin").style.display="none";
	}
}

//**************************** Function Validation Definitions ****************************

function chkKeys(e,type)
{
	var keynum = e.keyCode;
	var keychar = String.fromCharCode(keynum);

	switch (type)
	{
		case 'A':	/* alpha */
			valChk = /[a-zA-Z]/;
			return valChk.test(keychar);
			break;
		case 'N':	/* numeric */
			valChk = /\d/;
			return valChk.test(keychar);
			break;
		case 'AN':	/* alphanumeric */
			valChk = /[a-zA-Z0-9\s\-]/;
			return valChk.test(keychar);
			break;
		case 'C':	/* currency ($, numbers, .) */
			valChk = /[0-9\$\.]/;
			return valChk.test(keychar);
			break;
		case 'DT': /*date with / delim*/
			valChk = /\d|\//;
			return valChk.test(keychar);
			break;
		case 'S': /*SSN*/
			//valChk = /\d|-/;
			valChk = /\d/;
			return valChk.test(keychar);
			break;
		case 'DP': /*phone number*/
			valChk = /[()0-9. -]/;
			return valChk.test(keychar);
			break;
		default	:
			break;
	}
}

function validatePhone(elem)
{
	if (gLastElemIdFailedValidation && gLastElemIdFailedValidation != elem.id)
	{
		document.getElementById(gLastElemIdFailedValidation).focus();
		return true;
	}
	
	gLastElemIdFailedValidation = null;
	
	if (elem.value == "") return true;
	
	var valChk1 = /^\d{10}$/;
	var valChk2 = /^\d{3}-\d{3}-\d{4}$/;
	var valChk3 = /^\(\d{3}\) ?\d{3}-\d{4}$/;
	
	if (!valChk1.test(elem.value) && !valChk2.test(elem.value) && !valChk3.test(elem.value))
	{
		alert("Invalid Phone Number.");
		gLastElemIdFailedValidation = elem.id;
		//elem.focus();
	}
}

function validateZipCode(elem)
{
	if (gLastElemIdFailedValidation && gLastElemIdFailedValidation != elem.id)
	{
		document.getElementById(gLastElemIdFailedValidation).focus();
		return true;
	}
	
	gLastElemIdFailedValidation = null;
	
	if (elem.value == "") return true;
	
	var valChk = /^\d{5}$/;
	
	if (!valChk.test(elem.value))
	{
		alert("Invalid Zip Code.");
		gLastElemIdFailedValidation = elem.id;
		//elem.focus();
	}
}

function validateSSN(elem)
{
	if (gLastElemIdFailedValidation && gLastElemIdFailedValidation != elem.id)
	{
		document.getElementById(gLastElemIdFailedValidation).focus();
		return true;
	}
	
	gLastElemIdFailedValidation = null;
	
	if (elem.value == "") return true;	
	
	var valChk1 = /^\d\d\d\d\d\d\d\d\d$/;
	var valChk2 = /^\d\d\d-\d\d-\d\d\d\d$/;
	
	if (!valChk1.test(elem.value) && !valChk2.test(elem.value))
	{
		alert("Invalid Social Security Number.");
		gLastElemIdFailedValidation = elem.id;
		//elem.focus();
	}
	
	//elem.replace('-','');
	
}

function validateEmail(elem)
{
	if (gLastElemIdFailedValidation && gLastElemIdFailedValidation != elem.id)
	{
		document.getElementById(gLastElemIdFailedValidation).focus();
		return true;
	}
	
	gLastElemIdFailedValidation = null;
	
	if (elem.value == "") return true;
	
	//var valChk = /^[\w]+[A-Za-z0-9_.-]+[A-Za-z0-9_-]+@[A-Za-z0-9]+[A-Za-z0-9_.-]+[A-Za-z]+$/;
	var valChk = /^\b[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,6}\b$/;
	
	if (elem.id.toLowerCase().indexOf("alternate") >= 0 && elem.value == "") return true;
	
	if (!valChk.test(elem.value))
	{
		alert("Invalid email address.");
		gLastElemIdFailedValidation = elem.id;
		//elem.focus();
	}
}

function formatDate(elem)
{
	if (gLastElemIdFailedValidation && gLastElemIdFailedValidation != elem.id)
	{
		document.getElementById(gLastElemIdFailedValidation).focus();
		return true;
	}
	
	gLastElemIdFailedValidation = null;
	
	if (elem.value == "") return true;
	
	if(elem.value.match(/\d{8}/))
	{
		elem.value = elem.value.substr(0,2)+"/"+elem.value.substr(2,2)+"/"+elem.value.substr(4,4);
	}
	/*else if(elem.value.match(/\d{6}/))
	{
		elem.value = elem.value.substr(0,2)+"/"+elem.value.substr(2,2)+"/20"+elem.value.substr(4,2);
	}
	else if((elem.value.length >=8 && elem.value.length < 10) && elem.value.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/)) // prepad with zeros
	{
		var dateArr = elem.value.split("/");
		var month = (dateArr[0].length == 1 ? "0"+dateArr[0] : dateArr[0]);
		var day = (dateArr[1].length == 1 ? "0"+dateArr[1] : dateArr[1]);
		var year = (dateArr[2].length == 2 ? "20"+dateArr[2] : dateArr[2]);
		
		elem.value = month+"/"+day+"/"+year;		
	}*/
	
	checkDate(elem, 'MM/DD/YYYY', false);
	
}

function checkDate(elem, format, req)
{
	if(elem.value == "")
	{
		if(req)
		{
			alert("Please enter a date in the format "+format+".");
			//elem.focus();
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
		default:
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
		alert("Please enter a date in the format "+format+".");
		//elem.value = "";
		//elem.focus();
		gLastElemIdValidated = elem.id;
		return blnResult;
	}
	
	var now = new Date();
	
	if (objDate > now)
	{
		alert("Date can not be in the future.");
		//elem.value = "";
		gLastElemIdValidated = elem.id;
		//elem.focus();
	}
	
	return blnResult;
}

