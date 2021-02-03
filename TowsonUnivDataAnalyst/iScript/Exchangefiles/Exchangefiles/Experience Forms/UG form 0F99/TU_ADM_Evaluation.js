//20111102 - EB - changed calcTranscriptGPA() to toFixed(3) and calcLineItemTransGPA() to toFixed(3)
//20141002 - JMT - changed Comments section background color and set to display:none. Used code to show tblComments if there are any
//20150617 - TechHelp 117184 - Added onLoad step. Take data from text field and put in textarea for display and changing.
//TechHelp 121076 - JMT 201603 - Change SAT scores to show all tests and scores. Multiple lines per person.

function worksheetLoad()
{
	// Load the comments section of the form
	displayComments('hdnUser');
	
	// Load the decision section
	displayComments('hdnDecUser');

	calcRankInClass();
	calcLineItemTransGPA();
	calcTranscriptGPA();
	calcTranscriptCredits();

	//TechHelp 117184 - take data from text field and put in textarea for display and changing.
	popPSCommentsTXA();
}

function calcRankInClass()
{
	var ric1 = document.getElementById('txtRIC1').value;
	var ric2 = document.getElementById('txtRIC2').value;
	var ric3 = document.getElementById('txtRIC3');
	var value = 0;

	if(ric1 > '' && ric2 > '' && parseFloat(ric2) > 0)
	{
		var value = ((parseFloat(ric1) / parseFloat(ric2)) * 100);
		if(isNaN(value))
		{
			value = 0;
		}
		else
		{
			value = 100 - value;
			value = value.toFixed(0);
		}
	}

	ric3.value = value;
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

//Used by btnDecAdd
function btnDecAdd_click()
{
	if(document.getElementById('cboDecisionProgAction').value == "")
	{
		alert("Please select a reason code");
		return false;
	}
	callBtn('hdnBtnDecAdd');  //('hdnBtnDecAdd');  btnDecAdd
	addDecision();
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

	userField.value = currentUser;
	dateField.value = currentDate;
	commentField.value = comment.options[comment.selectedIndex].text + " - " +  reason.options[reason.selectedIndex].text;
	decisionField.value = comment.value;
	reasonField.value = reason.value;
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
			elem.firstChild.innerHTML = elem.lastChild.value;
		}
	}
	if (users.length > 1 && elemName == "hdnUser")
	{
		//JMT only show if Comments has data
		//alert ("users.length is[" + users.length + "]");
		document.getElementById("tblComments").style.display="table";  //style.background-color=#3366FF;
	}
}

//Assigned to btnCommentAdd
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

	document.getElementById("tblComments").style.display="table";  //show the table after insert comment
}
//called by addComment
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

//Assigned to cboDecisionProgAction
function popReasonCbo(decision, reasonCode)
{
    var count = 0;
    reasonCode.length = 1;
    var selDecision = decision[decision.selectedIndex].text;
    
    for(var i in reasonCodes[selDecision])
    {
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


/****************************************************************
				G E N E R A L  F U N C T I O N S
*****************************************************************/
//click a button. Assigned to btnCommentAdd
function callBtn(id)
{
	document.getElementById(id).click();
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
//Used by all fields that verify keyboard input
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
			valChk = /[\d\.]/;
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

/** Unused functions  */
/** Unused functions
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

//Function of btnGetStudentInfo. Currently not displayed.
function btnGetStudentInfo_click()
{
	loadCheckBoxes();

	// Calculates the rank in class percent
	var data = new DataSource('txtRIC1');
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
function loadCheckBoxes()
{
	var data = new DataSource('hdnAthletics');
	waitForData(data, function() { check('chkAthletics', 'hdnAthletics', 'true'); });
	
	var data = new DataSource('hdnSecondBachelors');
	waitForData(data, function() { check('chkSecondBachelors', 'hdnSecondBachelors', 'true'); });
	
	var data = new DataSource('hdnTwoPlusTwo');
	waitForData(data, function() { check('chkTwoPlusTwo', 'hdnTwoPlusTwo', 'true'); });
	
	var data = new DataSource('hdnSpecCons');
	waitForData(data, function() { check('chkSpecCons', 'hdnSpecCons', 'true'); });
	
	var data = new DataSource('hdnPanama');
	waitForData(data, function() { check('chkPanama', 'hdnPanama', 'true'); });
	
	//var data = new DataSource('hdnFineArts');
	//waitForData(data, function() { check('chkFineArts', 'hdnFineArts', 'true'); });
	
	var data = new DataSource('hdnTopTenPercent');
	waitForData(data, function() { check('chkTopTenPercent', 'hdnTopTenPercent', 'true'); });
	
	var data = new DataSource('hdnALVets');
	waitForData(data, function() { check('chkALVets', 'hdnALVets', 'true'); });
	
	var data = new DataSource('hdnSpecialTalent');
	waitForData(data, function() { check('chkSpecialTalent', 'hdnSpecialTalent', 'true'); });
	
	//var data = new DataSource('hdnMDS');
	//waitForData(data, function() { check('chkMDS', 'hdnMDS', 'true'); });
	
	var data = new DataSource('hdnGateway');
	waitForData(data, function() { check('chkGateway', 'hdnGateway', 'true'); });
}
// check a checkbox
function check(cbId, hdnId, val)
{
	if(document.getElementById(hdnId).value == val)
	{
		document.getElementById(cbId).checked = true;
	}
}

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

function clearTestRows()
{
    var loadDatesLength = document.getElementsByName("hdnPSLoadDate").length;
    
    if(loadDatesLength > 1)
    {
        document.getElementById("hdnAddRows").value = true;
        var deleteBtn = document.getElementById("btnPSTestScoreDelete");
        deleteBtn.removeAttribute("count");
	    deleteBtn.setAttribute("count", loadDatesLength.toString());

	    deleteBtn.click();
	}
	else
		addTestRows();
}

function addTestRows()
{
    var jsonStr = document.getElementById("hdnTestScoreJson").value.replace(/&#61;/g, "=");
    
    if(jsonStr == "")
        return;
    
    eval(jsonStr);
    
    if(sData.ErrorMessage)
    {
        var currentField = document.getElementById("hdnPSError");
        currentField.innerHTML = sData.ErrorMessage;
        sData.ErrorMessage = "";
        document.getElementById("hdnTestScoreJson").value = "";
        return;
    }
    
    document.getElementById("hdnPSError").value = "";
    var lineItemLength = sData.TestScores.length;
    
    var addBtn = document.getElementById("btnPSTestScoreAdd");
    addBtn.removeAttribute("count");
	addBtn.setAttribute("count", lineItemLength.toString());

	addBtn.click();
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
//Assigned to txtACTWriting. Not used.
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
				// look for one that isn't checked -- if exists, set this one's display to none.  otherwise, just blank out data
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

function saveRadioButton(radioVal, hiddenId)
{
    var hidden = document.getElementById(hiddenId);
    hidden.value = radioVal;
}







*/