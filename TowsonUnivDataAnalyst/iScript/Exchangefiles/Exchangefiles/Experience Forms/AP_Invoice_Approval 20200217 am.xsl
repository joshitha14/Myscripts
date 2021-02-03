<?xml version="1.0" encoding="utf-8"?>

<!-- Created JMT WB 05/22/2012    -->

<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:template match="/">
		<html>
			<head>
			<!--	<link href="NA_UG_Evaluation.css" rel="stylesheet" type="text/css" /> -->
				<script src="AP_Invoice_Approval.js" language="javascript" type="text/javascript"/>
				<script src="AP_Invoice_Approval_ReasonCodes.js" language="javascript" type="text/javascript"/>
				<script src="wScriptDebug.js" language="javascript" type="text/javascript"/>
			<!--	<title>Towson Admissions</title> -->
				<style type="text/css">
				.sectiontitle {
					font: 12pt tahoma, sans-serif;
					color: #000000;
					font-weight: bold;
					/*font-size: 16px;*/
					text-align: left;
					padding-top: 0px;
				}
				.contentsection {
					background: #E0E0E0;
					font-weight: bold;
					width: 100%;
				}
				.comments {
					background: white;
					border:none;
					font: 11px verdana, arial, helvetica, sans-serif;
					font-weight: bold;
				}
				</style>
				<script language="JavaScript">
					var sData = new Object();  /* container for iScript dynamic data */
				</script>
			</head>
			<body onload="worksheetLoad();">
				<form name="frmWorksheet">
				<div id="container">


						<div class="sectiontitle">
							Invoice Information
						</div>
						<table class="contentsection" style="border:2px solid black; width:auto; text-align:left;">
						<tr>
							<td class="labelcell" style="text-align:left;width:70px" nowrap="true" >Invoice #: </td>
							<td class="labelcell">
<!-- 								<input class="fieldcell" type="text" name="txtInvoiceNbr" id="txtInvoiceNbr" readonly="true" style="width:120px" dbSet="TU_GetStudentInfo" dbSet_param="3">  -->
								<input class="fieldcell" type="text" name="txtInvoiceNbr" id="txtInvoiceNbr" style="width:160px">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/InvoiceNbr"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="text-align:right;width:110px" nowrap="true" > Invoice Date: </td>
							<td class="labelcell" style="width:65px">
								<input class="fieldcell" type="text" name="txtInvoiceDate" id="txtInvoiceDate" style="width:75px" onblur="checkDate(this);" onkeypress="return chkKeys(event, 'D');">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/InvoiceDate"/>
									</xsl:attribute>
								</input>
							</td>
							<!--  <td class="labelcell" style="text-align:left" nowrap="true">mm/dd/yyyy</td>  -->
						</tr>
						<tr>	<!-- Combine First and Last Name in script -->
							<td class="labelcell" style="text-align:left;width:65px" nowrap="true" >P.O. #: </td>
							<td class="labelcell">
								<input class="fieldcell" type="text" name="txtPONum" id="txtPONum" style="width:160px" onkeypress="return chkKeys(event, 'AN');">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/PONum"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="text-align:right;width:100px"> Partial/Complete: </td>
							<td class="labelcell">
								<select name="uxPartComp" id="uxPartComp">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/PartComp"/>
									</xsl:attribute>
									<xsl:for-each select="document('AP_Invoice_Approval_Lookups.xml')/lookups/PartComp/row">
										<option>
											<xsl:attribute name="value">
												<xsl:value-of select="value"/>
											</xsl:attribute>
											<xsl:value-of select="text"/>
										</option>
									</xsl:for-each>
								</select>
							</td>
							<!-- <td>&#xa0;</td>  -->
						</tr>
					</table>
					<table class="contentsection" style="border:2px solid black;width:450;text-align:left;">
						<tbody>
							<tr>
							<!--	<td class="labelcell" rowspan="2" style="width:10px">1.</td> --> <!--SAT-->
								<td class="labelcell" style="width:100px">Dept/Grant #</td> <!--Comp2-->
								<td class="labelcell" style="width:80px">Account #</td> <!--Comp3-->
								<td class="labelcell" style="width:80px">Initiative</td> <!--Math-->
								<td class="labelcell" style="width:80px">Amount</td> <!--Verbal-->
							<!-- <td class="labelcell" style="width:80px">Writing</td> --> <!--Writing>-->
								<!-- <td class="labelcell" style="width:100px">Date Loaded</td> -->
							</tr>
							<tr>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtDept1" id="txtDept1" style="width:100px" onkeypress="return chkKeys(event, 'N');" onblur="validateSpeedType(this);">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Dept1"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtAccount1" id="txtAccount1" style="width:80px" onkeypress="return chkKeys(event, 'N');">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Account1"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtInit1" id="txtInit1" style="width:80px" onkeypress="return chkKeys(event, 'AN');">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Init1"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
								<p>
									<strong>$</strong>
									<input class="fieldcell" type="text" name="txtAmount1" id="txtAmount1" style="width:80px" onkeypress="return chkKeys(event, 'N');" onblur="calcTotalAmount('1');">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Amount1"/>
										</xsl:attribute>
									</input>
									</p>
								</td>
								<td />
							</tr>
							<tr>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtDept2" id="txtDept2" style="width:100px" onkeypress="return chkKeys(event, 'N');" onblur="validateSpeedType(this);"> <!-- dbSet="TU_GetStudentInfo" dbSet_param="29" onkeypress="return chkKeys(event, 'N');"> -->
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Dept2"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtAccount2" id="txtAccount2" style="width:80px" onkeypress="return chkKeys(event, 'N');">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Account2"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtInit2" id="txtInit2" style="width:80px" onkeypress="return chkKeys(event, 'AN');">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Init2"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
								<p>
									<strong>$</strong>
									<input class="fieldcell" type="text" name="txtAmount2" id="txtAmount2" style="width:80px" onkeypress="return chkKeys(event, 'N');" onblur="calcTotalAmount('2');"> <!-- onblur="verifyTestScores(this)" dbSet="TU_GetStudentInfo" dbSet_param="33" onkeypress="return chkKeys(event, 'N');"> -->
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Amount2"/>
										</xsl:attribute>
									</input>
									</p>
								</td>
							</tr>
							<!-- Cpoppy fro above starts here -->
							<tr>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtDept3" id="txtDept3" style="width:100px" onkeypress="return chkKeys(event, 'N');" onblur="validateSpeedType(this);"> <!-- dbSet="TU_GetStudentInfo" dbSet_param="29" onkeypress="return chkKeys(event, 'N');"> -->
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Dept3"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtAccount3" id="txtAccount3" style="width:80px" onkeypress="return chkKeys(event, 'N');">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Account3"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtInit3" id="txtInit3" style="width:80px" onkeypress="return chkKeys(event, 'AN');"> <!-- dbSet="TU_GetStudentInfo" dbSet_param="32" onkeypress="return chkKeys(event, 'N');"> -->
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Init3"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
								<p>
									<strong>$</strong>
									<input class="fieldcell" type="text" name="txtAmount3" id="txtAmount3" style="width:80px" onkeypress="return chkKeys(event, 'N');" onblur="calcTotalAmount('3');"> <!-- onblur="verifyTestScores(this)" dbSet="TU_GetStudentInfo" dbSet_param="33" onkeypress="return chkKeys(event, 'N');"> -->
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Amount3"/>
										</xsl:attribute>
									</input>
									</p>
								</td>
							</tr>
							<tr>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtDept4" id="txtDept4" style="width:100px" onkeypress="return chkKeys(event, 'N');" onblur="validateSpeedType(this);"> <!-- dbSet="TU_GetStudentInfo" dbSet_param="29" onkeypress="return chkKeys(event, 'N');"> -->
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Dept4"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtAccount4" id="txtAccount4" style="width:80px" onkeypress="return chkKeys(event, 'N');">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Account4"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtInit4" id="txtInit4" style="width:80px" onkeypress="return chkKeys(event, 'AN');"> <!-- dbSet="TU_GetStudentInfo" dbSet_param="32" onkeypress="return chkKeys(event, 'N');"> -->
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Init4"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
								<p>
									<strong>$</strong>
									<input class="fieldcell" type="text" name="txtAmount4" id="txtAmount4" style="width:80px" onkeypress="return chkKeys(event, 'N');" onblur="calcTotalAmount('4');"> <!-- onblur="verifyTestScores(this)" dbSet="TU_GetStudentInfo" dbSet_param="33" onkeypress="return chkKeys(event, 'N');"> -->
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Amount4"/>
										</xsl:attribute>
									</input>
									</p>
								</td>
							</tr>
							<tr>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtDept5" id="txtDept5" style="width:100px" onkeypress="return chkKeys(event, 'N');" onblur="validateSpeedType(this);"> <!-- dbSet="TU_GetStudentInfo" dbSet_param="29" onkeypress="return chkKeys(event, 'N');"> -->
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Dept5"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtAccount5" id="txtAccount5" style="width:80px" onkeypress="return chkKeys(event, 'N');">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Account5"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtInit5" id="txtInit5" style="width:80px" onkeypress="return chkKeys(event, 'AN');"> <!-- dbSet="TU_GetStudentInfo" dbSet_param="32" onkeypress="return chkKeys(event, 'N');"> -->
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Init5"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
								<p>
									<strong>$</strong>
									<input class="fieldcell" type="text" name="txtAmount5" id="txtAmount5" style="width:80px" onkeypress="return chkKeys(event, 'N');" onblur="calcTotalAmount('5');"> <!-- onblur="verifyTestScores(this)" dbSet="TU_GetStudentInfo" dbSet_param="33" onkeypress="return chkKeys(event, 'N');"> -->
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Amount5"/>
										</xsl:attribute>
									</input>
									</p>
								</td>
							</tr>
							<tr>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtDept6" id="txtDept6" style="width:100px" onkeypress="return chkKeys(event, 'N');" onblur="validateSpeedType(this);"> <!-- dbSet="TU_GetStudentInfo" dbSet_param="29" onkeypress="return chkKeys(event, 'N');"> -->
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Dept6"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtAccount6" id="txtAccount6" style="width:80px" onkeypress="return chkKeys(event, 'N');">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Account6"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtInit6" id="txtInit6" style="width:80px" onkeypress="return chkKeys(event, 'AN');"> <!-- dbSet="TU_GetStudentInfo" dbSet_param="32" onkeypress="return chkKeys(event, 'N');"> -->
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Init6"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
								<p>
									<strong>$</strong>
									<input class="fieldcell" type="text" name="txtAmount6" id="txtAmount6" style="width:80px" onkeypress="return chkKeys(event, 'N');" onblur="calcTotalAmount('6');"> <!-- onblur="verifyTestScores(this)" dbSet="TU_GetStudentInfo" dbSet_param="33" onkeypress="return chkKeys(event, 'N');"> -->
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Amount6"/>
										</xsl:attribute>
									</input>
									</p>
								</td>
							</tr>
							<tr>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtDept7" id="txtDept7" style="width:100px" onkeypress="return chkKeys(event, 'N');" onblur="validateSpeedType(this);"> <!-- dbSet="TU_GetStudentInfo" dbSet_param="29" onkeypress="return chkKeys(event, 'N');"> -->
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Dept7"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtAccount7" id="txtAccount7" style="width:80px" onkeypress="return chkKeys(event, 'N');">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Account7"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtInit7" id="txtInit7" style="width:80px" onkeypress="return chkKeys(event, 'AN');"> <!-- dbSet="TU_GetStudentInfo" dbSet_param="32" onkeypress="return chkKeys(event, 'N');"> -->
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Init7"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
								<p>
									<strong>$</strong>
									<input class="fieldcell" type="text" name="txtAmount7" id="txtAmount7" style="width:80px" onkeypress="return chkKeys(event, 'N');" onblur="calcTotalAmount('7');"> <!-- onblur="verifyTestScores(this)" dbSet="TU_GetStudentInfo" dbSet_param="33" onkeypress="return chkKeys(event, 'N');"> -->
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Amount7"/>
										</xsl:attribute>
									</input>
									</p>
								</td>
							<tr>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtDept8" id="txtDept8" style="width:100px" onkeypress="return chkKeys(event, 'N');" onblur="validateSpeedType(this);"> <!-- dbSet="TU_GetStudentInfo" dbSet_param="29" onkeypress="return chkKeys(event, 'N');"> -->
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Dept8"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtAccount8" id="txtAccount8" style="width:80px" onkeypress="return chkKeys(event, 'N');">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Account8"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtInit8" id="txtInit8" style="width:80px" onkeypress="return chkKeys(event, 'AN');"> <!-- dbSet="TU_GetStudentInfo" dbSet_param="32" onkeypress="return chkKeys(event, 'N');"> -->
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Init8"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
								<p>
									<strong>$</strong>
									<input class="fieldcell" type="text" name="txtAmount8" id="txtAmount8" style="width:80px" onkeypress="return chkKeys(event, 'N');" onblur="calcTotalAmount('8');"> <!-- onblur="verifyTestScores(this)" dbSet="TU_GetStudentInfo" dbSet_param="33" onkeypress="return chkKeys(event, 'N');"> -->
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Amount8"/>
										</xsl:attribute>
									</input>
									</p>
								</td>
							</tr>
							</tr>
							<tr>
							<td>
							</td>
							<td>
							</td>
								<td class="labelcell" rowspan="1" style="width:100px;text-align:right;">Total:</td>
								<td class="labelcell" style="width:100px">
									<strong>$</strong>
									<input class="fieldcell" type="text" name="txtTotal" id="txtTotal" style="width:80px" readonly="readonly" onkeypress="return chkKeys(event, 'N');">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/Total"/>
										</xsl:attribute>
									</input>
								</td>
							</tr>
						</tbody>
					</table>
					<div class="sectiontitle">
						Notes
					</div>
					<table style="border:2px solid black; WIDTH:570px; HEIGHT: 81px;" class="contentsection">
					<tbody>
						<tr>
							<td class="sectionheader">
								<textarea style="WIDTH: 550px; HEIGHT: 77px" cols="62">
									<xsl:value-of select="//page/Notes2"/>
								</textarea>
							</td>
						</tr>
					</tbody>
					</table>
					<br/>
					<div class="sectiontitle">Approver Actions</div>
						<table class="contentsection" style="border:2px solid black; width:570px ; text-align:left;">
						<tbody>
							<tr>
								<td class="sectiontitle" style="width: 50;">Action:</td>
								<td class="labelcell" style="width: 50;">Action Reason:</td>
								<td style="width:550px;"></td>
							</tr>
							<tr>
								<td>
									<select id="cboDecisionProgAction" name="cboDecisionProgAction" style="width:auto" onchange="popReasonCbo(this, parentElement.nextSibling.firstChild);">
										<xsl:attribute name="value">
											<xsl:value-of select="DecisionProgAction"/>
										</xsl:attribute>
										<xsl:for-each select="document('AP_Invoice_Approval_Lookups.xml')/lookups/Decisions/row">
											<option>
												<xsl:attribute name="value">
													<xsl:value-of select="value"/>
												</xsl:attribute>
												<xsl:value-of select="text"/>
											</option>
										</xsl:for-each>
									</select>
								</td>
								<td>
									<select id="cboReasonCode" name="cboReasonCode" style="width:auto">
										<xsl:attribute name="value">
											<xsl:value-of select="ReasonCode"/>
										</xsl:attribute>
								<!--		<option value="">None</option>		-->
									</select>
								</td>
								<td>
									<input type="button" id="btnDecAdd" name="btnDecAdd" value="Add" onclick="btnDecAdd_click(this);"/>
								</td>
							</tr>
							<tr>
								<td colspan="3">
									<div class="commentbox" style="height:100%; width:560px; background: white; border:2px solid black; margin-top:2px">
									<table width="100%">
									<thead>
										<tr>
											<td style="width: 120px;"><b><u>User:</u></b></td>
											<td style="width: 120px;"><b><u>Date:</u></b></td>
											<td style="width:400px;"><b><u>Action:</u></b></td>
										</tr>
									</thead>
									<xsl:for-each select="//page/DecisionRow/row">
										<tr repeat="row_3">
											<td>
												<span>
												</span>
												<input type="hidden" name="hdnDecUser" id="hdnDecUser">
													<xsl:attribute name="value">
														<xsl:value-of select="DecisionUser"/>
													</xsl:attribute>
												</input>
											</td>
											<td>
												<span>
												</span>
												<input type="hidden" name="hdnDecDate" id="hdnDecDate">
													<xsl:attribute name="value">
														<xsl:value-of select="DecisionDate"/>
													</xsl:attribute>
												</input>
											</td>
											<td>
												<span>
												</span>
												<input type="hidden" name="hdnDisplayValue" id="hdnDisplayValue">
													<xsl:attribute name="value">
														<xsl:value-of select="DecisionDisplay"/>
													</xsl:attribute>
												</input>
											</td>
											<td style="display:none">
												<span>
												</span>
												<input type="hidden" name="hdnDecision" id="hdnDecision">
													<xsl:attribute name="value">
														<xsl:value-of select="DecisionProgAction"/>
													</xsl:attribute>
												</input>
											</td>
											<td style="display:none">
												<span>
												</span>
												<input type="hidden" name="hdnReason" id="hdnReason">
													<xsl:attribute name="value">
														<xsl:value-of select="ReasonCode"/>
													</xsl:attribute>
												</input>
											</td>
										</tr>
									</xsl:for-each>
									</table>
									</div>
								</td>
							</tr>
						</tbody>
						<tfoot>
							<tr>
								<td rowspan="2">
									<input type="button" id="hdnBtnDecAdd" name="hdnBtnDecAdd" value="Add1" repeat="row_3" style="display:none;"/>
								</td>
							</tr>
						</tfoot>
					</table>
					<br/>
	<!--				<div class="sectiontitle">Accounts Payable Actions</div>
					<table class="contentsection" style="border:2px solid black; width:700px ; text-align:left;">
						<tr>
							<td>
							<textarea id="txaComments" name="txaComments" rows="5" cols="75" class="labelcell"></textarea>
							<input type="button" id="btnCommentAdd" name="btnCommentAdd" value="Add" onclick="callBtn('btnhdnCommentAdd');addComment();"/>
						<div class="commentbox" style="height:100px; width:680px; background: white; border:2px solid black; margin-top:2px">
						<table width="100%" cellspacing="4">
						<thead>
							<tr>
								<td style="width: 120px;"><b><u>User:</u></b></td>
								<td style="width: 120px;"><b><u>Date:</u></b></td>
								<td style="width:400px;" nowrap="false"><b><u>Note:</u></b></td>
							</tr>
						</thead>
						<tbody id="tbodycomments">
							<xsl:for-each select="/page/CommentsRow/row">
								<tr repeat="comment_row">
									<td>
										<span>
										</span>
										<input type="hidden" name="hdnUser" id="hdnUser" class="comments">
											<xsl:attribute name="value">
												<xsl:value-of select="User"/>
											</xsl:attribute>
										</input>
									</td>
									<td>
										<span>
										</span>
										<input type="hidden" name="hdnDate" id="hdnDate" class="comments">
											<xsl:attribute name="value">
												<xsl:value-of select="Date"/>
											</xsl:attribute>
										</input>
									</td>
									<td>
										<span>
										</span>
										<input type="hidden" name="hdnComments" id="hdnComments" class="comments">
											<xsl:attribute name="value">
												<xsl:value-of select="Comments"/>
											</xsl:attribute>
										</input>
									</td>
								</tr>
							</xsl:for-each>
						</tbody>
						<tfoot>
							<tr>
								<td>
									<input type="button" id="btnhdnCommentAdd" name="btnhdnCommentAdd" value="Add" class="green" repeat="comment_row" style="display:none;"/>&#xa0;&#xa0;
								</td>
							</tr>
						</tfoot>
					</table>
					</div>
					</td>
					</tr>
					</table> -->
					<br/>
					<input type="hidden" id="hdnDisableFields" name="hdnDisableFields">
						<xsl:attribute name="value">
							<xsl:value-of select="//page/DisableFields"/>
						</xsl:attribute>
					</input>
					</div>
				</form>
			</body>
		</html>
		<script language="JavaScript">
			var currentUser = "<xsl:value-of select='page/StateInfo/UserName'/>";
			var hdnCurrentQueueName = "<xsl:value-of select='page/StateInfo/CurrentQueueName'/>";
			var clientType = "<xsl:value-of select='page/StateInfo/Client/Type'/>";
		</script>
	</xsl:template>

</xsl:stylesheet>
