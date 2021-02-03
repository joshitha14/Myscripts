<?xml version="1.0" encoding="utf-8"?>

<!-- ECB and JMT 20111114: Custom property list 'Adult Learning / Veteran' mis-spelled 'Vetern', corrected spelling  ONLY AFFECTS DISPLAY    -->
<!-- See TU_UpdateEvalFormUsingEnvoy.js for how the script uses the true/false value to update the custom property (line 64)    -->
<!-- 07/08/2014 Hid unused special pops: MDS & Fine Arts. Hid <tr rows for TOEFL.-->
<!-- 09/22/2014 ECB and JMT  Added rows for broken out TOEFL scores to match GRAD. Changed all test score fields to be read only. Changed Date Loaded fields from 'disabled' to 'read only.' -->
<!-- 10/02/2014 JMT  changed Comments section background color and set to display:none. Put Comments after Decision. Used code to show tblComments if there are any. 2X In load and add comments button. -->
<!-- 11/07/2014 ECB and JMT  Made styles of sections Comment and Decision to be similar-->
<!-- 06/15/2015 JMT - TechHelp 117184 - Add PS Comments to form. The visible value is the Short_Desc from PS. Value is the PS code.-->
<!-- 03/31/2016 JMT - TechHelp 121076 - Change in SAT scores for 2016. Now will load all scores for all tests taken.-->
<!-- 09/27/2016 JMT - TechHelp 176703 - Change #2 in SAT scores for 2016. Group pre- and post-2016 separately showing MAX in each-->
<!-- 09/05/2019 JMT - TechHelp 301959 - No SAT pre-2016,, ACT have all test scores, ACT SuperScore-->

<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:template match="/">
		<html>
			<head>
				<link href="stylesheet.css" rel="stylesheet" type="text/css" />
				<script src="TU_ADM_Evaluation.js" language="javascript" type="text/javascript"/>
				<script src="TU_ADM_Evaluation_ReasonCodes.js" language="javascript" type="text/javascript"/>
				<script src="TU_ADM_PS_Comments.js" language="javascript" type="text/javascript"/>  <!--TechHelp 117184-->
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
					<table class="contentsection" style="display:table;border:2px solid black" width="100%">
						<tr>
							<td class="labelcell" style="text-align:right;width:180px">Adm Appl Nbr&#xa0;</td>
							<td class="labelcell" style="width:65px">
								<input class="fieldcell" type="text" name="txtAdmAppNbr" id="txtAdmAppNbr" readonly="true" style="width:120px" dbSet="TU_GetStudentInfo" dbSet_param="3">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/AdmAppNbr"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="text-align:right;width:180px">Admit&#xa0;Term&#xa0;</td>
							<td class="labelcell" style="width:65px">
								<input class="fieldcell" type="text" name="txtAdmitTerm" id="txtAdmitTerm" readonly="true" style="width:100px" dbSet="TU_GetStudentInfo" dbSet_param="4">
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
							<td class="labelcell" style="width:65px">
								<input class="fieldcell" type="text" name="txtCounty" id="txtCounty" readonly="true" style="width:260px" dbSet="TU_GetStudentInfo" dbSet_param="11">
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
								<input class="fieldcell" type="text" name="txtAcademicProgram" id="txtAcademicProgram" readonly="true" style="width:260px" dbSet="TU_GetStudentInfo" dbSet_param="13">
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
								<input class="fieldcell" type="text" name="txtAcademicPlan" id="txtAcademicPlan" readonly="true" style="width:260px" dbSet="TU_GetStudentInfo" dbSet_param="15">
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
								<input class="fieldcell" type="text" name="txtAcademicSubplan" id="txtAcademicSubplan" readonly="true" style="width:260px" dbSet="TU_GetStudentInfo" dbSet_param="16">
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
						High School Info
					</div>
					<table class="contentsection" style="display:table;border:2px solid black;">
						<tr>
							<td class="labelcell" style="width:auto;-text-align:left"><b>CEEB</b></td>
							<td class="labelcell" style="width:auto;">
								<input class="fieldcell" type="text" name="txtHSCEEB" id="txtHSCEEB" readonly="true" style="width:250px;background-color:transparent;border:0px solid;" tabindex="-1">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/HSCEEB"/>
									</xsl:attribute>
								</input>
							</td>
						</tr>
						<tr>
							<td class="labelcell" style="width:auto;-text-align:left"><b>Name</b></td>
							<td class="labelcell" style="width:auto;">
								<input class="fieldcell" type="text" name="txtHighSchoolName" id="txtHighSchoolName" readonly="true" style="width:250px;background-color:transparent;border:0px solid;" tabindex="-1">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/HighSchoolName"/>
									</xsl:attribute>
								</input>
							</td>
						</tr>
						<tr>
							<td class="labelcell" style="width:auto;text-align:Left"><b>Reported GPA</b></td>
							<td class="labelcell" style="width:auto">
								<input class="fieldcell" type="text" name="txtRepGPA" id="txtRepGPA" style="width:60px;background-color: #FFFF00" dbSet="TU_GetStudentInfo" dbSet_param="17" onkeypress="return chkKeys(event, 'N');">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/RepGPA"/>
									</xsl:attribute>
								</input>&#xa0;&#xa0;out of&#xa0;
								<input class="fieldcell" type="text" name="txtRep2GPA" id="txtRep2GPA" style="width:60px" dbSet="TU_GetStudentInfo" dbSet_param="18" onkeypress="return chkKeys(event, 'N');">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/Rep2GPA"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:auto;text-align:Left">Admissions GPA&#xa0;&#xa0;
								<input class="fieldcell" type="text" name="txtAdmGPA" id="txtAdmGPA" style="width:60px" dbSet="TU_GetStudentInfo" dbSet_param="19" onkeypress="return chkKeys(event, 'N');">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/AdmGPA"/>
									</xsl:attribute>
								</input>&#xa0;&#xa0;out of&#xa0;
								<input class="fieldcell" type="text" name="txtAdm2GPA" id="txtAdm2GPA" style="width:60px" dbSet="TU_GetStudentInfo" dbSet_param="20" onkeypress="return chkKeys(event, 'N');">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/Adm2GPA"/>
									</xsl:attribute>
								</input>
							</td>
							<td />
						</tr>
						<tr>
							<td class="labelcell" style="width:auto;text-align:left"><b>Rank in Class</b></td>
							<td class="labelcell" style="width:auto">
								<input class="fieldcell" type="text" name="txtRIC1" id="txtRIC1" style="width:60px;background-color: #FFFF00" dbSet="TU_GetStudentInfo" dbSet_param="21" onkeypress="return chkKeys(event, 'N');" onblur="calcRankInClass();">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/RIC1"/>
									</xsl:attribute>
								</input>
								of
								<input class="fieldcell" type="text" name="txtRIC2" id="txtRIC2" style="width:60px;background-color: #FFFF00" dbSet="TU_GetStudentInfo" dbSet_param="22" onkeypress="return chkKeys(event, 'N');" onblur="calcRankInClass();">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/RIC2"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:auto;text-align:left">Rank in Class Percent&#xa0;&#xa0;
								<input class="fieldcell" type="text" name="txtRIC3" id="txtRIC3" style="width:60px" readonly="readonly" onkeypress="return chkKeys(event, 'N');">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/RIC3"/>
									</xsl:attribute>
								</input>&#xa0;%
							</td>
							<td />
						</tr>
					</table>
					
					<br/>
					
					<div class="sectiontitle">
						Test Scores
					</div>
					<table class="contentsection" style="border:2px solid black;" >
						<thead>
							<tr>
								<td class="labelcell" colspan="9" style="display:none;color: red; font size: 14">SAT Changes #2</td>
							</tr>
							<tr>
								<td class="labelcell" style="width:80px"></td>
								<td class="labelcell" style="width:80px">Math</td>
								<td class="labelcell" style="width:80px">Verbal</td>
								<td class="labelcell" style="width:80px"></td>
								<td class="labelcell" style="width:80px"></td>
								<td class="labelcell" style="width:80px"></td>
								<td class="labelcell" style="width:80px">Total 2 Score</td>
								<td class="labelcell" style="width:100px">Date Loaded</td>
							</tr>
						</thead>
						
						<tr style="display:none">
							<td class="labelcell" style="width:80px">SAT pre-2016</td>
							<td class="labelcell" style="width:80px">
								<input class="fieldcell" type="text" name="txtSATMath" id="txtSATMath" style="width:80px"  dbSet="TU_GetStudentInfo" dbSet_param="25">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/SATMath"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:80px">
								<input class="fieldcell" type="text" name="txtSATVerbal" id="txtSATVerbal" style="width:80px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="26">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/SATVerbal"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:80px">
								<input class="fieldcell" type="text" name="txtSATWriting" id="txtSATWriting" style="width:80px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="26">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/SATWriting"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:80px"></td>
							<td class="labelcell" style="width:80px">
								<input class="fieldcell" type="text" name="txtSATComp2" id="txtSATComp2" style="width:80px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="23">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/SATComp2"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:80px">
								<input class="fieldcell" type="text" name="txtSATComp3" id="txtSATComp3" style="width:80px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="23">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/SATComp3"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:100px">
								<input class="fieldcell" type="text" name="txtSATDateLoaded" id="txtSATDateLoaded" style="width:100px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="28">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/SATDateLoaded"/>
									</xsl:attribute>
								</input>
							</td>
							<td />
						</tr>
						
						<tr>
							<td class="labelcell" style="width:80px">Max SAT</td>
							<td class="labelcell" style="width:80px">
								<input class="fieldcell" type="text" name="txtSAT16MaxMath" id="txtSAT16MaxMath" style="width:80px"  dbSet="TU_GetStudentInfo" dbSet_param="25">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/SAT16MaxMath"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:80px">
								<input class="fieldcell" type="text" name="txtSAT16MaxVerbal" id="txtSAT16MaxVerbal" style="width:80px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="26">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/SAT16MaxVerbal"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:80px"></td>
							<td class="labelcell" style="width:80px"></td>
							<td class="labelcell" style="width:80px"></td>
							<td class="labelcell" style="width:80px">
								<input class="fieldcell" type="text" name="txtSAT16MaxTotal" id="txtSAT16MaxTotal" style="width:80px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="23">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/SAT16MaxTotal"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:100px">
								<input class="fieldcell" type="text" name="txtSAT16MaxDateLoaded" id="txtSAT16MaxDateLoaded" style="width:100px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="28">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/SAT16MaxDateLoaded"/>
									</xsl:attribute>
								</input>
							</td>
							<td />
						</tr>

<!--TechHelp 301959 - BEGIN - ACT changes. SuperScore of 4 tests and list all tests taken  -->
						<tr>
							<td class="labelcell" style="width:80px"></td>
							<td class="labelcell" style="width:80px">Math</td>
							<td class="labelcell" style="width:80px">English</td>
							<td class="labelcell" style="width:80px">Science</td>
							<td class="labelcell" style="width:80px">Reading</td>
							<td class="labelcell" style="width:80px"></td>
							<td class="labelcell" style="width:80px">SuperScore</td>
							<td class="labelcell" style="width:100px">Date Loaded</td>
						</tr>
						<tr>
							<td class="labelcell" style="width:80px">Max ACT hi</td>
							<td class="labelcell" style="width:80px">
								<input class="fieldcell" type="text" name="txtACTMaxMath" id="txtACTMaxMath" style="width:80px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="125">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/ACTMaxMath"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:80px">
								<input class="fieldcell" type="text" name="txtACTMaxEnglish" id="txtACTMaxEnglish" style="width:80px" readonly="false" dbSet="TU_GetStudentInfo" dbSet_param="126">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/ACTMaxEnglish"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:80px">
								<input class="fieldcell" type="text" name="txtACTMaxScience" id="txtACTMaxScience" style="width:80px" readonly="false" dbSet="TU_GetStudentInfo" dbSet_param="127">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/ACTMaxScience"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:80px">
								<input class="fieldcell" type="text" name="txtACTMaxRead" id="txtACTMaxRead" style="width:80px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="128">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/ACTMaxRead"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:80px"></td>
							<td class="labelcell" style="width:80px">
										<!--<xsl:value-of select='//page/ACTSuper'/>  -->
								<input class="fieldcell" type="text" name="txtACTSuper" id="txtACTSuper" style="width:80px" dbSet="TU_GetStudentInfo" dbSet_param="129">
									<xsl:attribute name="value">
										<xsl:value-of select='format-number(//page/ACTSuper,"00")'/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:100px">
								<input class="fieldcell" type="text" name="txtSAT16MaxDateLoaded" id="txtSAT16MaxDateLoaded" style="width:100px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="28">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/ACTMaxDateLoaded"/>
									</xsl:attribute>
								</input>
							</td>
							<td />
						</tr>


						
						<tr><td class="labelcell" colspan="6">____________________________________________________________</td></tr>
						<tr><td class="labelcell" colspan="6">All Test Scores Below</td></tr>
						<tr>
							<td class="labelcell" style="width:80px"></td>
							<td class="labelcell" style="width:80px">Math</td>
							<td class="labelcell" style="width:80px">Verbal</td>
							<td class="labelcell" style="width:80px">Writing</td>
							<td class="labelcell" style="width:80px">Test Date</td>
							<td class="labelcell" style="width:80px"></td>
							<td class="labelcell" style="width:80px"></td>
							<td class="labelcell" style="width:100px">Date Loaded</td>
						</tr>

						<tbody>
						<!--TechHelp 121076 - BEGIN - One row for each SAT test taken. List all scores for all tests.  -->
						<xsl:for-each select="page/SAT16/row">
							<tr repeat="" delete=""> <!--<tr repeat="" delete="" style="display:none;">-->
								<td class="labelcell" rowspan="1" style="width:80px">SAT</td>
								<td class="labelcell" style="width:80px">
									<input class="fieldcell" type="text" name="txtSATMath16" id="txtSATMath16" readonly="true" style="width:80px">
										<xsl:attribute name="value">
											<xsl:value-of select="SATMath16"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:80px">
									<input class="fieldcell" type="text" name="txtSATVerb16" id="txtSATVerb16" readonly="true" style="width:80px">
										<xsl:attribute name="value">
											<xsl:value-of select="SATVerb16"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:80px">
									<input class="fieldcell" type="text" name="txtSATWrit16" id="txtSATWrit16" readonly="true" style="width:80px">
										<xsl:attribute name="value">
											<xsl:value-of select="SATWrit16"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:80px">
									<input class="fieldcell" type="text" name="txtSATTestDate16" id="txtSATTestDate16" readonly="true" style="width:80px">
										<xsl:attribute name="value">
											<xsl:value-of select="SATTestDate16"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:80px"></td>
								<td class="labelcell" style="width:80px"></td>
								<td class="labelcell" style="width:80px">
									<input class="fieldcell" type="text" name="txtSATDateLoaded16" id="txtSATDateLoaded16" readonly="true" style="width:100px">
										<xsl:attribute name="value">
											<xsl:value-of select="SATDateLoaded16"/>
										</xsl:attribute>
									</input>
								</td>
							</tr>
						</xsl:for-each>
						<!--TechHelp 121076 - END - One row for each SAT test taken. List all scores for all tests.  -->

						<tr>
							<!-- <td class="labelcell" rowspan="2" style="width:80px">ACT</td>  -->
							<td class="labelcell" style="width:80px"></td>
							<td class="labelcell" style="width:80px">Comp</td>
							<td class="labelcell" style="width:80px">Math</td>
							<td class="labelcell" style="width:80px">English</td>
							<td class="labelcell" style="width:80px">Writing</td>
							<td class="labelcell" style="width:80px">Science</td>
							<td class="labelcell" style="width:80px">Reading</td>
							<td class="labelcell" style="width:100px">Date Taken</td>
						</tr>
						<!--TechHelp 301959 - BEGIN - One row for each ACT test taken. List all scores for all tests.  -->
						<xsl:for-each select="page/ACT_Scores/row">
							<tr repeat="" delete="">
							<td class="labelcell" rowspan="1" style="width:80px">ACT</td>
								<td class="labelcell" style="width:80px">
									<input class="fieldcell" type="text" name="txtACTComp" id="txtACTComp" style="width:80px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="29" onkeypress="return chkKeys(event, 'N');">
										<xsl:attribute name="value">
											<xsl:value-of select="ACTComp"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:80px">
									<input class="fieldcell" type="text" name="txtACTMath" id="txtACTMath" style="width:80px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="31">
										<xsl:attribute name="value">
											<xsl:value-of select="ACTMath"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:80px">
									<input class="fieldcell" type="text" name="txtACTEnglish" id="txtACTEnglish" style="width:80px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="32" onkeypress="return chkKeys(event, 'N');">
										<xsl:attribute name="value">
											<xsl:value-of select="ACTEnglish"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:80px">
									<input class="fieldcell" type="text" name="txtACTWriting" id="txtACTWriting" style="width:80px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="33" onkeypress="return chkKeys(event, 'N');">
										<xsl:attribute name="value">
											<xsl:value-of select="ACTWriting"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:80px">
									<input class="fieldcell" type="text" name="txtACTScience" id="txtACTScience" style="width:80px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="30" onkeypress="return chkKeys(event, 'N');">
										<xsl:attribute name="value">
											<xsl:value-of select="ACTScience"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:80px">
									<input class="fieldcell" type="text" name="txtACTRead" id="txtACTRead" style="width:80px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="30" onkeypress="return chkKeys(event, 'N');">
										<xsl:attribute name="value">
											<xsl:value-of select="ACTRead"/>
										</xsl:attribute>
									</input>
								</td>
								<td class="labelcell" style="width:100px">
									<input class="fieldcell" type="text" name="txtACTDateTaken" id="txtACTDateTaken" style="width:100px" readonly="true" dbSet="TU_GetStudentInfo" dbSet_param="34">
										<xsl:attribute name="value">
											<xsl:value-of select="ACTDateTaken"/>
										</xsl:attribute>
									</input>
								</td>
							</tr>
						</xsl:for-each>
						<!--TechHelp 301959 - END - One row for each ACT test taken. List all scores for all tests.  -->
						
							<!-- 1.	TILIS, TIREA, TISPE, TITOT, TIWR-->
							<tr>
								<td class="labelcell" rowspan="2" style="width:80px">TOEFL</td>
								<td class="labelcell" style="width:80px">TILIS</td>
								<td class="labelcell" style="width:80px">TIREA</td>
								<td class="labelcell" style="width:80px">TISPE</td>
								<td class="labelcell" style="width:80px">TITOT</td>
								<td class="labelcell" style="width:80px">TIWR</td>
								<td class="labelcell" style="width:80px"> </td>
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
								<td class="labelcell" style="width:80px">
									<input class="fieldcell" type="text" name="txtFill" id="txtFill" style="width:80px;background-color:transparent;border:0px solid;" readonly="true">
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
							<td class="labelcell" style="width:auto;text-align:left">Total&#xa0;Combined&#xa0;GPA&#xa0;&#xa0;&#xa0;
								<input class="fieldcell" type="text" name="txtCombGPA" id="txtCombGPA" style="width:60px" readonly="readonly">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/CombGPA"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" colspan="4" style="width:auto;text-align:left">Cumulative&#xa0;Credits&#xa0;&#xa0;&#xa0;
								<input class="fieldcell" type="text" name="txtCumCredits" id="txtCumCredits" style="width:60px" readonly="readonly">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/CumCredits"/>
									</xsl:attribute>
								</input>
								<input type="hidden" name="hdnCumAttemptedCredits" id="hdnCumAttemptedCredits">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/CumAttemptedCredits"/>
									</xsl:attribute>
								</input>
							<!--<td class="labelcell" style="width:225px">Hidden(EDUC)</td> 
								TU creates a separate EDUC item in PeopleSoft to store these two values.
								ADD OR UPDATE - -->
							</td>
							<td />
							<td />
							<td />
						</tr>
						<tr>
							<td class="labelcell" colspan="2" style="width:325px"><b>Name</b></td>
							<td class="labelcell" style="width:75px"><b>CEEB</b></td>
							<td class="labelcell" style="width:80px"><b>Quality Points</b></td>
							<td class="labelcell" style="width:80px"><b>Quality Hours</b></td>
							<td class="labelcell" style="width:80px"><b>GPA</b></td>
							<td class="labelcell" style="width:80px"><b>Credits</b></td>
							<!--<td class="labelcell" style="width:225px">Hidden(EDUC)</td> -->
						</tr>
						</thead>
						<tbody>
						<xsl:for-each select="page/Transcripts/row">
						<tr repeat="transcript_row" delete="transcript_row">
							<td class="labelcell" colspan="2" style="width:325px">
							<!--20140312 ECB set school name field as read only-->
								<input class="fieldcell" type="text" name="txtTransName" id="txtTransName" readonly="true" style="width:350px;background-color:transparent;border:0px solid;" tabindex="-1">
									<xsl:attribute name="value">
										<xsl:value-of select="TransName"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:75px">
							<!--20140312 ECB set CEEB field as read only-->
								<input class="fieldcell" type="text" name="txtTransCEEB" id="txtTransCEEB" readonly="true" style="width:75px;background-color:transparent;border:0px solid;" tabindex="-1">
									<xsl:attribute name="value">
										<xsl:value-of select="TransCEEB"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:75px">
								<input class="fieldcell" type="text" name="txtTransQP" id="txtTransQP" style="width:75px;background-color: #FFFF00" onkeypress="return chkKeys(event, 'N');" onblur="calcLineItemTransGPA();calcTranscriptGPA()">
									<xsl:attribute name="value">
										<xsl:value-of select="TransQP"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:75px">
								<input class="fieldcell" type="text" name="txtTransQH" id="txtTransQH" style="width:75px;background-color: #FFFF00" onkeypress="return chkKeys(event, 'N');" onblur="calcLineItemTransGPA();calcTranscriptGPA()">
									<xsl:attribute name="value">
										<xsl:value-of select="TransQH"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:75px">
								<input class="fieldcell" type="text" name="txtTransGPA" id="txtTransGPA" style="width:75px" onkeypress="return chkKeys(event, 'N');">
									<xsl:attribute name="value">
										<xsl:value-of select="TransGPA"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:75px">
								<input class="fieldcell" type="text" name="txtTransCredits" id="txtTransCredits" style="width:75px;background-color: #FFFF00" onkeypress="return chkKeys(event, 'N');" onblur="calcTranscriptCredits();">
									<xsl:attribute name="value">
										<xsl:value-of select="TransCredits"/>
									</xsl:attribute>
								</input>
								<input type="hidden" name="hdnAttemptedCredits" id="hdnAttemptedCredits">
									<xsl:attribute name="value">
										<xsl:value-of select="AttemptedCredits"/>
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
					
					<br/>
					
					<div class="sectiontitle">
						Special Populations
					</div>
					<table class="contentsection" style="border:2px solid black;">
						<tr>
							<td class="labelcell" style="width:101px">
								<xsl:variable name="Athletics">
									<xsl:value-of select="normalize-space(//page/Athletics)"/>
								</xsl:variable>
								<xsl:choose>
									<xsl:when test="$Athletics='true'">
										<input  type="checkbox" id="chkAthletics" name="chkAthletics" CHECKED="true" class="ChecksAndRadios" onclick="nextSibling.nextSibling.value=this.checked">Athletics</input>
									</xsl:when>
									<xsl:otherwise>
										<input  type="checkbox" id="chkAthletics" name="chkAthletics" class="ChecksAndRadios" onclick="nextSibling.nextSibling.value=this.checked">Athletics</input>
									</xsl:otherwise>
								</xsl:choose>
								<input type="hidden" id="hdnAthletics" name="hdnAthletics" dbSet="TU_GetStudentInfo" dbSet_param="38">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/Athletics"/>
									</xsl:attribute>
								</input>
							</td>

							<td class="labelcell" style="width:175px">
								<xsl:variable name="SecondBachelors">
									<xsl:value-of select="normalize-space(//page/SecondBachelors)"/>
								</xsl:variable>
							<xsl:choose>
									<xsl:when test="$SecondBachelors='true'">
										<input type="checkbox" id="chkSecondBachelors" name="chkSecondBachelors" CHECKED="true" class="ChecksAndRadios" onclick="nextSibling.nextSibling.value=this.checked">Second Bachelors</input>
									</xsl:when>
									<xsl:otherwise>
										<input type="checkbox" id="chkSecondBachelors" name="chkSecondBachelors" class="ChecksAndRadios" onclick="nextSibling.nextSibling.value=this.checked">Second Bachelors</input>
									</xsl:otherwise>
								</xsl:choose>
								<input type="hidden" id="hdnSecondBachelors" name="hdnSecondBachelors" dbSet="TU_GetStudentInfo" dbSet_param="39">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/SecondBachelors"/>
									</xsl:attribute>
								</input>
							</td>

							<td class="labelcell" style="width:auto">
								<xsl:variable name="Panama">
									<xsl:value-of select="normalize-space(//page/Panama)"/>
								</xsl:variable>
								<xsl:choose>
									<xsl:when test="$Panama='true'">
										<input type="checkbox" id="chkPanama" name="chkPanama" CHECKED="true" class="ChecksAndRadios" onclick="nextSibling.nextSibling.value=this.checked">Panama</input>
									</xsl:when>
									<xsl:otherwise>
										<input type="checkbox" id="chkPanama" name="chkPanama" class="ChecksAndRadios" onclick="nextSibling.nextSibling.value=this.checked">Panama</input>
									</xsl:otherwise>
								</xsl:choose>
								<input type="hidden" id="hdnPanama" name="hdnPanama" dbSet="TU_GetStudentInfo" dbSet_param="42">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/Panama"/>
									</xsl:attribute>
								</input>
							</td>
						</tr>
						<tr>

							<td class="labelcell" style="width:101px">
								<xsl:variable name="FineArts">
									<xsl:value-of select="normalize-space(//page/FineArts)"/>
								</xsl:variable>
								<xsl:choose>
									<xsl:when test="$FineArts='true'">
										<input type="checkbox" id="chkFineArts" name="chkFineArts" CHECKED="true" class="ChecksAndRadios" onclick="nextSibling.nextSibling.value=this.checked">Fine Arts</input>
									</xsl:when>
									<xsl:otherwise>
										<input type="checkbox" id="chkFineArts" name="chkFineArts" class="ChecksAndRadios" onclick="nextSibling.nextSibling.value=this.checked">Fine Arts</input>
									</xsl:otherwise>
								</xsl:choose>
								<input type="hidden" id="hdnFineArts" name="hdnFineArts" dbSet="TU_GetStudentInfo" dbSet_param="43">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/FineArts"/>
									</xsl:attribute>
								</input>
							</td>

							<td class="labelcell" style="width:175px">
								<xsl:variable name="TopTenPercent">
									<xsl:value-of select="normalize-space(//page/TopTenPercent)"/>
								</xsl:variable>
								<xsl:choose>
									<xsl:when test="$TopTenPercent='true'">
										<input type="checkbox" id="chkTopTenPercent" name="chkTopTenPercent" CHECKED="true" class="ChecksAndRadios" onclick="nextSibling.nextSibling.value=this.checked">Top 10 %</input>
									</xsl:when>
									<xsl:otherwise>
										<input type="checkbox" id="chkTopTenPercent" name="chkTopTenPercent" class="ChecksAndRadios" onclick="nextSibling.nextSibling.value=this.checked">Top 10 %</input>
									</xsl:otherwise>
								</xsl:choose>
								<input type="hidden" id="hdnTopTenPercent" name="hdnTopTenPercent" dbSet="TU_GetStudentInfo" dbSet_param="44">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/TopTenPercent"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:auto">
								<xsl:variable name="ALVets">
									<xsl:value-of select="normalize-space(//page/ALVets)"/>
								</xsl:variable>
								<xsl:choose>
									<xsl:when test="$ALVets='true'">
										<input type="checkbox" id="chkALVets" name="chkALVets" CHECKED="true" class="ChecksAndRadios" onclick="nextSibling.nextSibling.value=this.checked">Adult Learning / Veteran</input>
									</xsl:when>
									<xsl:otherwise>
										<input type="checkbox" id="chkALVets" name="chkALVets" class="ChecksAndRadios" onclick="nextSibling.nextSibling.value=this.checked">Adult Learning / Veteran</input>
									</xsl:otherwise>
								</xsl:choose>
								<input type="hidden" id="hdnALVets" name="hdnALVets" dbSet="TU_GetStudentInfo" dbSet_param="45">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/ALVets"/>
									</xsl:attribute>
								</input>
							</td>
						</tr>
						
						<tr>
							<td class="labelcell" style="width:auto; display:none">
								<xsl:variable name="SpecialTalent">
									<xsl:value-of select="normalize-space(//page/SpecialTalent)"/>
								</xsl:variable>
								<xsl:choose>
									<xsl:when test="$SpecialTalent='true'">
										<input type="checkbox" id="chkSpecialTalent" name="chkSpecialTalent" CHECKED="true" class="ChecksAndRadios" onclick="nextSibling.nextSibling.value=this.checked">Special Talent</input>
									</xsl:when>
									<xsl:otherwise>
										<input type="checkbox" id="chkSpecialTalent" name="chkSpecialTalent" class="ChecksAndRadios" onclick="nextSibling.nextSibling.value=this.checked">Special Talent</input>
									</xsl:otherwise>
								</xsl:choose>
								<input type="hidden" id="hdnSpecialTalent" name="hdnSpecialTalent" dbSet="TU_GetStudentInfo" dbSet_param="46">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/SpecialTalent"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:101px">
								<xsl:variable name="Gateway">
									<xsl:value-of select="normalize-space(//page/Gateway)"/>
								</xsl:variable>
								<xsl:choose>
									<xsl:when test="$Gateway='true'">
										<input type="checkbox" id="chkGateway" name="chkGateway" CHECKED="true" class="ChecksAndRadios" onclick="nextSibling.nextSibling.value=this.checked">Gateway</input>
									</xsl:when>
									<xsl:otherwise>
										<input type="checkbox" id="chkGateway" name="chkGateway" class="ChecksAndRadios" onclick="nextSibling.nextSibling.value=this.checked">Gateway</input>
									</xsl:otherwise>
								</xsl:choose>
								<input type="hidden" id="hdnGateway" name="hdnGateway" dbSet="TU_GetStudentInfo" dbSet_param="48">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/Gateway"/>
									</xsl:attribute>
								</input>
							</td>
							<td class="labelcell" style="width:175px">
								<xsl:variable name="SpecCons">
									<xsl:value-of select="normalize-space(//page/SpecCons)"/>
								</xsl:variable>
								<xsl:choose>
									<xsl:when test="$SpecCons='true'">
										<input type="checkbox" id="chkSpecCons" name="chkSpecCons" CHECKED="true" class="ChecksAndRadios" onclick="nextSibling.nextSibling.value=this.checked">Special Considerations</input>
									</xsl:when>
									<xsl:otherwise>
										<input type="checkbox" id="chkSpecCons" name="chkSpecCons" class="ChecksAndRadios" onclick="nextSibling.nextSibling.value=this.checked">Special Considerations</input>
									</xsl:otherwise>
								</xsl:choose>
								<input type="hidden" id="hdnSpecCons" name="hdnSpecCons" dbSet="TU_GetStudentInfo" dbSet_param="41">
									<xsl:attribute name="value">
										<xsl:value-of select="//page/SpecCons"/>
									</xsl:attribute>
								</input>
							</td>
							<td />
						</tr>
					</table>

					<br/>

					<div class="sectiontitle">
						Evaluation Form Comments
					</div>
					<table class="contentsection" style="border:2px solid black;">
						<tbody id="tbodycomments">
						<tr>
							<td>
							<textarea id="txaComments" name="txaComments" rows="4" cols="100" class="labelcell"></textarea>
							<input type="button" id="btnCommentAdd" name="btnCommentAdd" value="Add" onclick="callBtn('btnhdnCommentAdd');addComment();"/>
							<div class="commentbox" style="height:0px; width:770px; margin-top:2px; background-color: #00FF66">
							<table id="tblComments" width="100%" cellspacing="2" style="height:10px; display:table">
								<thead>
									<tr>
										<td style="width: 35px;"><b>User</b></td>
										<td style="width: 70px;"><b>Date</b></td>
										<td style="width:665px;"><b>Comment</b></td>
									</tr>
								</thead>
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
							</table>
							</div>
							</td>
						</tr>
						</tbody>
							<tfoot>
								<tr>
									<td>
										<input type="button" id="btnhdnCommentAdd" name="btnhdnCommentAdd" value="Add" repeat="comment_row" style="display:none;"/>
									</td>
								</tr>
							</tfoot>
					</table>

					<br/>

					<!--TechHelp 117184 BEGIN - Add PS Comments to form. The visible value is the Short_Desc from PS. Value is the PS code.-->
					<div class="sectiontitle">
						PeopleSoft Comments
					</div>
					<table class="contentsection" style="border:2px solid black;">
						<tbody id="tbodyPScomments">
						<tr>
							<td>
							<div class="commentbox" style="height:10px; width:770px; margin-top:2px;">
							<table id="tblPSComments" width="100%" cellspacing="2" style="height:10px; display:table">
								<thead>
									<tr>
										<td style="width:100px;"><b>Code</b></td>
										<td style="width: 70px;"><b>User</b></td>
										<td style="width: 70px;"><b>Date</b></td>
										<td style="width:415px;"><b>Comment</b></td>
										<td style="width:25px;"><b>Ltr</b></td>
										<td style="width:25px;"><b>Trns</b></td>
									</tr>
								</thead>
								<tr>  <!--PS Comment Row 1-->
									<td>  <!--PS Comment Code-->
										<select id="cboPSCommentcde1" name="cboPSCommentcde1" onchange="popPS_Comment(this.value,1);" style="width:100px;background-color: #FFFF00">
											<xsl:attribute name="value">
												<xsl:value-of select="//page/PS_Comment_Code1"/>
											</xsl:attribute>
											<xsl:for-each select="document('TU_ADM_Evaluation_Lookups.xml')/lookups/PS_Comments/row">
												<option>
													<xsl:attribute name="value">
														<xsl:value-of select="value"/>
													</xsl:attribute>
													<xsl:value-of select="text"/>
												</option>
											</xsl:for-each>
										</select>
									</td>
									<td class="labelcell" style="width:35px">  <!--PS Comment User-->
										<input class="fieldcell" type="text" name="txtPS_Comment_User1" id="txtPS_Comment_User1" style="width:70px;background-color:transparent;border:0px solid;" readonly="true" tabindex="-1">
											<xsl:attribute name="value">
												<xsl:value-of select="//page/PS_Comment_User1"/>
											</xsl:attribute>
										</input>
									</td>
									<td class="labelcell" style="width:70px">  <!--PS Comment Date-->
										<input class="fieldcell" type="text" name="txtPS_Comment_Date1" id="txtPS_Comment_Date1" style="width:70px;background-color:transparent;border:0px solid;" readonly="true" tabindex="-1">
											<xsl:attribute name="value">
												<xsl:value-of select="//page/PS_Comment_Date1"/>
											</xsl:attribute>
										</input>
									</td>
									<td>  <!--PS Comment Text Area. This part wraps but is not addressable by xsl. JS function moves to hidden text input box-->
										<textarea rows="3" cols="70" name="txaPS_Comment_Text1" id="txaPS_Comment_Text1" onChange="popPSCommentsTXT();"></textarea>
									</td>
									<td class="labelcell" style="width:10px">  <!--PS Comment True/False prints on letter to student-->
										<input  class="fieldcell" type="text" name="txtPS_Comment_Lttr1" id="txtPS_Comment_Lttr1" style="width:10px;background-color:transparent;border:0px solid;" readonly="true" tabindex="-1">
											<xsl:attribute name="value">
												<xsl:value-of select="//page/PS_Comment_Lttr1"/>
											</xsl:attribute>
										</input>
									</td>
									<td class="labelcell" style="width:10px">  <!--PS Comment Code True/False prints on Transcript of student-->
										<input  class="fieldcell" type="text" name="txtPS_Comment_Trns1" id="txtPS_Comment_Trns1" style="width:10px;background-color:transparent;border:0px solid;" readonly="true" tabindex="-1">
											<xsl:attribute name="value">
												<xsl:value-of select="//page/PS_Comment_Trns1"/>
											</xsl:attribute>
										</input>
									</td>
									<td>  <!--PS Comment Text Area. Hidden text input box. Value copied by js function popPSCommentsTXT from text area. -->
										<input class="fieldcell" type="text" name="txtPS_Comment_Text1" id="txtPS_Comment_Text1" style="display:none">
											<xsl:attribute name="value">
												<xsl:value-of select="//page/PS_Comment_Text1"/>
											</xsl:attribute>
										</input>
									</td>
								</tr>
								<tr>  <!--PS Comment Row 2-->
									<td>
										<select id="cboPSCommentcde2" name="cboPSCommentcde2" onchange="popPS_Comment(this.value,2);" style="width:100px;background-color: #FFFF00">
											<xsl:attribute name="value">
												<xsl:value-of select="//page/PS_Comment_Code2"/>
											</xsl:attribute>
											<xsl:for-each select="document('TU_ADM_Evaluation_Lookups.xml')/lookups/PS_Comments/row">
												<option>
													<xsl:attribute name="value">
														<xsl:value-of select="value"/>
													</xsl:attribute>
													<xsl:value-of select="text"/>
												</option>
											</xsl:for-each>
										</select>
									</td>
									<td class="labelcell" style="width:35px">
										<input class="fieldcell" type="text" name="txtPS_Comment_User2" id="txtPS_Comment_User2" style="width:70px;background-color:transparent;border:0px solid;" readonly="true" tabindex="-2">
											<xsl:attribute name="value">
												<xsl:value-of select="//page/PS_Comment_User2"/>
											</xsl:attribute>
										</input>
									</td>
									<td class="labelcell" style="width:70px">
										<input class="fieldcell" type="text" name="txtPS_Comment_Date2" id="txtPS_Comment_Date2" style="width:70px;background-color:transparent;border:0px solid;" readonly="true" tabindex="-2">
											<xsl:attribute name="value">
												<xsl:value-of select="//page/PS_Comment_Date2"/>
											</xsl:attribute>
										</input>
									</td>
									<td>
										<textarea rows="3" cols="70" name="txaPS_Comment_Text2" id="txaPS_Comment_Text2" onChange="popPSCommentsTXT();"></textarea>
									</td>
									<td class="labelcell" style="width:10px">
										<input  class="fieldcell" type="text" name="txtPS_Comment_Lttr2" id="txtPS_Comment_Lttr2" style="width:10px;background-color:transparent;border:0px solid;" readonly="true" tabindex="-2">
											<xsl:attribute name="value">
												<xsl:value-of select="//page/PS_Comment_Lttr2"/>
											</xsl:attribute>
										</input>
									</td>
									<td class="labelcell" style="width:10px">
										<input  class="fieldcell" type="text" name="txtPS_Comment_Trns2" id="txtPS_Comment_Trns2" style="width:10px;background-color:transparent;border:0px solid;" readonly="true" tabindex="-2">
											<xsl:attribute name="value">
												<xsl:value-of select="//page/PS_Comment_Trns2"/>
											</xsl:attribute>
										</input>
									</td>
									<td>
										<input class="fieldcell" type="text" name="txtPS_Comment_Text2" id="txtPS_Comment_Text2" style="display:none">
											<xsl:attribute name="value">
												<xsl:value-of select="//page/PS_Comment_Text2"/>
											</xsl:attribute>
										</input>
									</td>
								</tr>
								<tr>  <!--PS Comment Row 3-->
									<td>
										<select id="cboPSCommentcde3" name="cboPSCommentcde3" onchange="popPS_Comment(this.value,3);" style="width:100px;background-color: #FFFF00">
											<xsl:attribute name="value">
												<xsl:value-of select="//page/PS_Comment_Code3"/>
											</xsl:attribute>
											<xsl:for-each select="document('TU_ADM_Evaluation_Lookups.xml')/lookups/PS_Comments/row">
												<option>
													<xsl:attribute name="value">
														<xsl:value-of select="value"/>
													</xsl:attribute>
													<xsl:value-of select="text"/>
												</option>
											</xsl:for-each>
										</select>
									</td>
									<td class="labelcell" style="width:35px">
										<input class="fieldcell" type="text" name="txtPS_Comment_User3" id="txtPS_Comment_User3" style="width:70px;background-color:transparent;border:0px solid;" readonly="true" tabindex="-3">
											<xsl:attribute name="value">
												<xsl:value-of select="//page/PS_Comment_User3"/>
											</xsl:attribute>
										</input>
									</td>
									<td class="labelcell" style="width:70px">
										<input class="fieldcell" type="text" name="txtPS_Comment_Date3" id="txtPS_Comment_Date3" style="width:70px;background-color:transparent;border:0px solid;" readonly="true" tabindex="-3">
											<xsl:attribute name="value">
												<xsl:value-of select="//page/PS_Comment_Date3"/>
											</xsl:attribute>
										</input>
									</td>
									<td>
										<textarea rows="3" cols="70" name="txaPS_Comment_Text3" id="txaPS_Comment_Text3" onChange="popPSCommentsTXT();"></textarea>
									</td>
									<td class="labelcell" style="width:10px">
										<input  class="fieldcell" type="text" name="txtPS_Comment_Lttr3" id="txtPS_Comment_Lttr3" style="width:10px;background-color:transparent;border:0px solid;" readonly="true" tabindex="-3">
											<xsl:attribute name="value">
												<xsl:value-of select="//page/PS_Comment_Lttr3"/>
											</xsl:attribute>
										</input>
									</td>
									<td class="labelcell" style="width:10px">
										<input  class="fieldcell" type="text" name="txtPS_Comment_Trns3" id="txtPS_Comment_Trns3" style="width:10px;background-color:transparent;border:0px solid;" readonly="true" tabindex="-3">
											<xsl:attribute name="value">
												<xsl:value-of select="//page/PS_Comment_Trns3"/>
											</xsl:attribute>
										</input>
									</td>
									<td>
										<input class="fieldcell" type="text" name="txtPS_Comment_Text3" id="txtPS_Comment_Text3" style="display:none">
											<xsl:attribute name="value">
												<xsl:value-of select="//page/PS_Comment_Text3"/>
											</xsl:attribute>
										</input>
									</td>
								</tr>
							</table>
							</div>
							</td>
						</tr>
						</tbody>
					</table>
					<!--TechHelp 117184 END - Add PS Comments to form. The visible value is the Short_Desc from PS. Value is the PS code.-->

					<br/>

					<div class="sectiontitle">
						Decision
					</div>
					<table class="contentsection" style="border:2px solid black;">
						<tbody>
							<tr>
								<td class="labelcell" style="text-align:left;width: 50;"><b>Decision</b></td>
								<td class="labelcell" style="text-align:left;width: 50;"><b>Reason Code</b></td>
								<td class="labelcell" style="text-align:right;width:auto"> <b>Admit&#xa0;Type&#xa0;</b>
									<select name="uxAdmitType" id="uxAdmitType" style="background-color: #FFFF00" dbSet="TU_GetStudentInfo" dbSet_param="6">
										<xsl:attribute name="value">
											<xsl:value-of select="//page/AdmitType"/>
										</xsl:attribute>
										<xsl:for-each select="document('TU_ADM_Evaluation_Lookups.xml')/lookups/AdmitTypes/row">
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
										<xsl:for-each select="document('TU_ADM_Evaluation_Lookups.xml')/lookups/Decisions/row">
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
									<div class="commentbox" style="height:10px; width:770px; margin-top:10px">
									<table width="100%">
									<thead>
										<tr>
											<td style="width: 35px;"><b>User</b></td>
											<td style="width: 70px;"><b>Date</b></td>
											<td style="width:665px;"><b>Decision</b></td>
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
		</script>
	</xsl:template>

</xsl:stylesheet>
