<?xml version="1.0" encoding="utf-8"?>

<!-- ECB and JMT 20111114: Custom property list 'Adult Learning / Veteran' mis-spelled 'Vetern', corrected spelling  ONLY AFFECTS DISPLAY    -->
<!-- See TU_UpdateEvalFormUsingEnvoy.js for how the script uses the true/false value to update the custom property (line 64)    -->

<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:template match="/">
		<html>
			<head>
				<link href="stylesheet.css" rel="stylesheet" type="text/css" />
				<script src="GS_Evaluation.js" language="javascript" type="text/javascript"/>
				<script src="GS_Evaluation_ReasonCodes.js" language="javascript" type="text/javascript"/>
				<script src="wScriptDebug.js" language="javascript" type="text/javascript"/>
				<title>Towson Admissions</title>
				<style type="text/css">
				.sectiontitle {
					font: 12pt tahoma, sans-serif;
					color: #2573c1;
					font-weight: bold;
					/*font-size: 16px;*/
					text-align: left;
					padding-top: 10px;
				}
				.contentsection {
					background: #E0E0E0;
					width: 100%;
				}
				.comments {
					background: white;
					border:none;
					font: 11px verdana, arial, helvetica, sans-serif;
				}
				</style>
				<script language="JavaScript">
					var sData = new Object();  /* container for iScript dynamic data */
				</script>
			</head>
			<body onload="worksheetLoad();">
				<form name="frmWorksheet">
				<div id="container">
					<table style="border:2px solid black;" cellpadding="0" cellspacing="0" class="contentsection" width="100%">
<!--					<tr><td><img src="Towson.jpg" /></td></tr> -->
						<tr>
							<td class="labelcell" colspan="6" style="color:red;width:auto;text-align:center;font-size:14">
								<xsl:value-of select="//page/ErrorMessage"/>
							</td>
						</tr>
						<tr>	<!-- Student ID -->
							<td class="labelcell" colspan="6" style="color:red;width:auto;text-align:center;font-size:14">
								<input type="hidden" id="hdnEmplId" name="hdnEmplId" dbSet="TU_GetStudentInfo" dbSet_param="1">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/EmplId"/>
									</xsl:attribute>
								</input>
							</td>
						</tr>
						<tr>
							<td colspan="6" style="text-align:center">Form Last Refreshed&#xa0;&#xa0;&#xa0;
								<input class="fieldcellcenter" type="text" name="txtLastRefreshed" id="txtLastRefreshed" readonly="true" style="width:120px" dbSet="TU_GetStudentInfo" dbSet_param="2">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/LastRefreshed"/>
									</xsl:attribute>
								</input> <input type="button" id="btnGetStudentInfo" name="btnGetStudentInfo" value="Refresh Data" dbCall_onclick="TU_GetStudentInfo" onclick="btnGetStudentInfo_click();" style="display:none"/>
							</td>
						</tr>
					</table>

						<div class="sectiontitle">
							Biographical and Demographic Info
						</div>
						<table class="contentsection" style="border:2px solid black;" width="100%">
						<tr>
							<td class="labelcell" style="text-align:right;width:180px">Adm Appl Nbr&#xa0;</td>
							<td class="labelcell" style="width:65px">
								<input class="fieldcell" type="text" name="txtAdmAppNbr" id="txtAdmAppNbr" readonly="true" style="width:100px" dbSet="TU_GetStudentInfo" dbSet_param="3">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/AdmAppNbr"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="text-align:right;width:180px">Admit&#xa0;Term&#xa0;</td>
							<td class="labelcell" style="width:65px">
								<!-- dbSet="TU_GetStudentInfo" dbSet_param="4"> -->
								<input class="fieldcell" type="text" name="txtAdmitTerm" id="txtAdmitTerm" readonly="true" style="width:100px">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/AdmitTerm"/>
									</xsl:attribute>
								</input>
							</td>
							<td>&#xa0;</td>
							<td>&#xa0;</td>
						</tr>
						<tr>	<!-- Combine First and Last Name in script -->
							<td class="labelcell" style="text-align:right;width:180px">Name&#xa0;</td>
							<td class="labelcell">
								<input class="fieldcell" type="text" name="txtName" id="txtName" readonly="true" style="width:260px" dbSet="TU_GetStudentInfo" dbSet_param="5">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/Name"/>
									</xsl:attribute>
								</input>
							</td>
							<td>&#xa0;</td>
							<td>&#xa0;</td>
							<td>&#xa0;</td>
							<td>&#xa0;</td>
						</tr>
						<tr>
							<td class="labelcell" style="text-align:right;width:180px">Address&#xa0;</td>
							<td class="labelcell">
								<input class="fieldcell" type="text" name="txtAddress" id="txtAddress" readonly="true" style="width:260px" dbSet="TU_GetStudentInfo" dbSet_param="7">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/Address"/>
									</xsl:attribute>
								</input>
							</td>
							<td>&#xa0;</td>
							<td>&#xa0;</td>
							<td>&#xa0;</td>
							<td>&#xa0;</td>
						</tr>
						<tr>
							<td class="labelcell" style="text-align:right;width:180px">City&#xa0;</td>
							<td class="labelcell">
								<input class="fieldcell" type="text" name="txtCity" id="txtCity" readonly="true" style="width:260px" dbSet="TU_GetStudentInfo" dbSet_param="8">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/City"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="text-align:right;width:120px">State&#xa0;</td>
							<td class="labelcell">
								<input class="fieldcell" type="text" name="txtState" id="txtState" readonly="true" style="width:100px" dbSet="TU_GetStudentInfo" dbSet_param="9">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/State"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="text-align:right;width:120px">Zip&#xa0;</td>
							<td class="labelcell">
								<input class="fieldcell" type="text" name="txtZip" id="txtZip" readonly="true" style="width:100px" dbSet="TU_GetStudentInfo" dbSet_param="10">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/Zip"/>
									</xsl:attribute>
								</input>
							</td>
						</tr>
						<tr>
							<td class="labelcell" style="text-align:right;width:180px">County&#xa0;</td>
							<td class="labelcell" style="width:15px">
								<input class="fieldcell" type="text" name="txtCounty" id="txtCounty" readonly="true" style="width:35px" dbSet="TU_GetStudentInfo" dbSet_param="11">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/County"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="text-align:right;width:120px">Gender&#xa0;</td>
							<td class="labelcell" style="width:65px">
								<input class="fieldcell" type="text" name="txtGender" id="txtGender" readonly="true" style="width:60px" dbSet="TU_GetStudentInfo" dbSet_param="12">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/Gender"/>
									</xsl:attribute>
								</input>
							</td>
							<td>&#xa0;</td>
							<td>&#xa0;</td>
						</tr>
						<tr>
							<td class="labelcell" style="text-align:right;width:200px">Academic&#xa0;Program&#xa0;</td>
							<td class="labelcell">
								<input class="fieldcell" type="text" name="txtAcademicProgram" id="txtAcademicProgram" readonly="true" style="width:100px" dbSet="TU_GetStudentInfo" dbSet_param="13">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/AcademicProgram"/>
									</xsl:attribute>
								</input>&#xa0;&#xa0;&#xa0;
							</td>
							<td class="labelcell" style="text-align:right;width:200px" >Residency&#xa0;</td>
							<td class="labelcell"  colspan="3">
								<input class="fieldcell" type="text" name="txtResidency" id="txtResidency" readonly="true" style="width:50px" dbSet="TU_GetStudentInfo" dbSet_param="14">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/Residency"/>
									</xsl:attribute>
								</input>
							</td>
						</tr>
						<tr>
							<td class="labelcell" style="text-align:right;width:160px">Academic&#xa0;Plan&#xa0;</td>
							<td class="labelcell" nowrap="true" style="width:auto">
								<input class="fieldcell" type="text" name="txtAcademicPlan" id="txtAcademicPlan" readonly="true" style="width:100px" dbSet="TU_GetStudentInfo" dbSet_param="15">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/AcademicPlan"/>
									</xsl:attribute>
								</input>
							</td>
							<td>&#xa0;</td>
							<td>&#xa0;</td>
						</tr>
						<tr>
							<td class="labelcell" style="text-align:right;width:160px">Academic&#xa0;SubPlan&#xa0;</td>
							<td>
								<input class="fieldcell" type="text" name="txtAcademicSubplan" id="txtAcademicSubplan" readonly="true" style="width:100px" dbSet="TU_GetStudentInfo" dbSet_param="16">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/AcademicSubplan"/>
									</xsl:attribute>
								</input>
							</td>
							<td>&#xa0;</td>
							<td>&#xa0;</td>
							<td>&#xa0;</td>
							<td>&#xa0;</td>
						</tr>
					</table>
					<br/>
					<div class="sectiontitle">
						Test Scores
					</div>
					<table class="contentsection" style="border:2px solid black;">
						<tbody>
							<tr>
								<td class="labelcell" rowspan="2" style="width:80px; display:none">SAT</td>
								<td class="labelcell" style="width:80px; display:none">Comp2</td>
								<td class="labelcell" style="width:80px; display:none">Comp3</td>
								<td class="labelcell" style="width:80px; display:none">Math</td>
								<td class="labelcell" style="width:80px; display:none">Verbal</td>
								<td class="labelcell" style="width:80px; display:none">Writing</td>
								<td class="labelcell" style="width:100px; display:none">Date Loaded</td>
							</tr>
							<tr>
								<td class="labelcell" rowspan="2" style="width:80px; display:none">ACT</td>
								<td class="labelcell" style="width:80px; display:none">Comp</td>
								<td class="labelcell" style="width:80px; display:none">Math</td>
								<td class="labelcell" style="width:80px; display:none">English</td>
								<td class="labelcell" style="width:80px; display:none">Writing</td>
								<td class="labelcell" style="width:80px; display:none">Science</td>
								<td class="labelcell" style="width:80px; display:none">Reading</td>
								<td class="labelcell" style="width:100px; display:none">Date Loaded</td>
							</tr>
							<!-- 1.	TILIS, TIREA, TISPE, TITOT, TIWR-->
							<tr>
								<td class="labelcell" rowspan="2" style="width:80px">TOEFL</td>
								<td class="labelcell" style="width:80px">TILIS</td>
								<td class="labelcell" style="width:80px">TIREA</td>
								<td class="labelcell" style="width:80px">TISPE</td>
								<td class="labelcell" style="width:80px">TITOT</td>
								<td class="labelcell" style="width:80px">TIWR</td>
								<td class="labelcell" style="width:100px">Date Loaded</td>
							</tr>
							<tr>
								<td class="labelcell" style="width:80px">
									<input class="fieldcell" type="text" name="txtTILIS" id="txtTILIS" style="width:80px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="35" onkeypress="return chkKeys(event, 'N');">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/TILIS"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:80px">
									<input class="fieldcell" type="text" name="txtTIREA" id="txtTIREA" style="width:80px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="31">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/TIREA"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:80px">
									<input class="fieldcell" type="text" name="txtTISPE" id="txtTISPE" style="width:80px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="32" onkeypress="return chkKeys(event, 'N');">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/TISPE"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:80px">
									<input class="fieldcell" type="text" name="txtTITOT" id="txtTITOT" style="width:80px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="33">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/TITOT"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:80px">
									<input class="fieldcell" type="text" name="txtTIWR" id="txtTIWR" style="width:80px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="30">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/TIWR"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" colspan="3" style="width:100px">
									<input class="fieldcell" type="text" name="txtToeflDateLoaded" id="txtToeflDateLoaded" style="width:100px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="36">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/ToeflDateLoaded"/>
										</xsl:attribute>
									</input>
								</td>
							</tr>
						</tbody>
					</table>
					<br/>
					<div class="sectiontitle">
						Transcript Info
					</div>
					<input type="hidden" id="hdnTranscriptData" name="hdnTranscriptData" dbSet="TU_GetStudentInfo" dbSet_param="37"/>
					<table class="contentsection" style="border:2px solid black;">
						<thead>
						<tr>
							<td class="labelcell" colspan="2" style="width:325px">Name</td>
							<td class="labelcell" style="width:75px">CEEB</td>
							<td class="labelcell" style="width:80px"><b>Overall</b></td>
							<td class="labelcell" style="width:80px"><b>Last 60</b></td>
							<td class="labelcell" style="width:240px"></td>
						</tr>
						</thead>
						<tbody>
						<xsl:for-each select="page/Transcripts/row">
						<tr repeat="transcript_row" delete="transcript_row">
							<td class="labelcell" colspan="2" style="width:325px">
								<input class="fieldcell" type="text" name="txtTransName" id="txtTransName" style="width:325px">
									<xsl:attribute name="value">
										<xsl:value-of select="TransName"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:75px">
							<!--20140312 ECB set CEEB field as read only-->
								<input class="fieldcell" type="text" name="txtTransCEEB" id="txtTransCEEB" readonly="true" style="width:75px">
									<xsl:attribute name="value">
										<xsl:value-of select="TransCEEB"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:75px">
								<!-- was TransQP and name/id was txtTransQP ****ALSO CHANGE IN GS_Evaluation.js -->
								<input class="fieldcell" type="text" name="txtGROVE" id="txtGROVE" style="width:75px;background-color: #FFFF00" onkeypress="return chkKeys(event, 'N');">
									<xsl:attribute name="value">
										<xsl:value-of select="GROVE"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:75px">
								<!-- was TransQH and name/id was txtTransQH ****ALSO CHANGE IN GS_Evaluation.js-->
								<input class="fieldcell" type="text" name="txtGF60" id="txtGF60" style="width:75px;background-color: #FFFF00" onkeypress="return chkKeys(event, 'N');">
									<xsl:attribute name="value">
										<xsl:value-of select="GF60"/>
									</xsl:attribute>
								</input>
							</td>
						</tr>
						</xsl:for-each>
						</tbody>
						<tfoot>
							<tr>
								<td>
									<!--<input type="button" id="btnAddTranscriptRow" name="btnAddTranscriptRow" repeat="transcript_row" value="Add Row"/>
									<input type="button" id="btnDelTranscriptRow" name="btnDelTranscriptRow" delete="transcript_row" value="Delete Row"/>-->
								</td>
							</tr>
						</tfoot>
					</table>
					<br/><br/>
					<table class="contentsection" style="border:2px solid black;">
						<tbody>
							<tr>
								<td class="sectiontitle" style="width: 50;">Decision</td>
								<td class="labelcell" style="text-align:left;width: 50;"><b>Reason Code</b></td>
								<td class="labelcell" style="text-align:right;width:auto"> <b>Admit&#xa0;Type&#xa0;</b>
									<select name="uxAdmitType" id="uxAdmitType" style="background-color: #FFFF00" dbSet="TU_GetStudentInfo" dbSet_param="6">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/AdmitType"/>
										</xsl:attribute>
										<xsl:for-each select="document('GS_Evaluation_Lookups.xml')/lookups/AdmitTypes/row">
											<option>
												<xsl:attribute name="value">
													<xsl:value-of select="value"/>
												</xsl:attribute>
												<xsl:value-of select="text"/>
											</option>
										</xsl:for-each>
									</select>
								</td>
								<td style="width:700px;"></td>
							</tr>
							<tr>
								<td>
									<select id="cboDecisionProgAction" name="cboDecisionProgAction" style="width:auto;background-color: #FFFF00" onchange="popReasonCbo(this, parentElement.nextSibling.firstChild);">
										<xsl:attribute name="value">
											<xsl:value-of select="DecisionProgAction"/>
										</xsl:attribute>
										<xsl:for-each select="document('GS_Evaluation_Lookups.xml')/lookups/Decisions/row">
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
									<select id="cboReasonCode" name="cboReasonCode" style="width:auto;background-color: #FFFF00">
										<xsl:attribute name="value">
											<xsl:value-of select="ReasonCode"/>
										</xsl:attribute>
										<option value="">None</option>
									</select>
								</td>
								<td>
									<input type="button" id="btnDecAdd" name="btnDecAdd" value="Add" onclick="btnDecAdd_click(this);"/>
								</td>
							</tr>
							<tr>
								<td colspan="3">
									<div class="commentbox" style="height:100%; width:770px; margin-top:10px">
									<table width="100%">
									<thead>
										<tr>
											<td style="width: 120px;"><b>User</b></td>
											<td style="width: 120px;"><b>Date</b></td>
											<td style="width:400px;"><b>Decision</b></td>
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
									<input type="button" id="hdnBtnDecAdd" name="hdnBtnDecAdd" value="Add" repeat="row_3" style="display:none;"/>
								</td>
							</tr>
						</tfoot>
					</table>
					<br/>
					<div class="sectiontitle">
						Comments
					</div>
					<table class="contentsection" style="border:2px solid black;">
						<tr>
							<td>
							<textarea id="txaComments" name="txaComments" rows="5" cols="75" class="labelcell"></textarea>
							<input type="button" id="btnCommentAdd" name="btnCommentAdd" value="Add" onclick="callBtn('btnhdnCommentAdd');addComment();"/>
						<div class="commentbox" style="height:100%; width:770px; margin-top:10px">
						<table width="100%" cellspacing="4">
						<thead>
							<tr>
								<td style="width: 120px;"><b>User</b></td>
								<td style="width: 120px;"><b>Date</b></td>
								<td style="width:400px;"><b>Comment</b></td>
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
					</table>
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
			var clientType = "<xsl:value-of select='page/StateInfo/Client/Type'/>";
		</script>
	</xsl:template>

</xsl:stylesheet>
