<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template match="/page">
		<html>
			<head>
				<title>Towson University Early Provisioning eForm</title>
				<link href="TU_EarlyProvisioningStylesheet.css" rel="stylesheet" type="text/css" ></link>
				<script type="text/javascript" src="TU_EarlyProvisioning.js"></script>
			</head>
			<body onload="setSubmitDate();showRecordTypeTable();showHideLastLogin()">
				<form name="frmWorksheet">
					<table cellspacing="0" cellpadding="0" style="width:5px">
						<tr><td style="border-style:none">
							<table cellspacing="0" style="width:100%">
								<tr>
									<td rowspan="2" style="border:none">
										<img src="towson_university.gif"></img>
									</td>
									<td nowrap="true" class="title" style="text-align:right;vertical-align:bottom;border:none;">Early Provisioning</td>
								</tr>
								<tr>
									<td nowrap="true" style="text-align:right;vertical-align:text-top;border:none;">Office of Human Resources</td>
								</tr>
							</table>
						</td></tr>
						<tr><td style="border-style:none">
							<!--jmt	<table id="tblRecordType" cellspacing="0" cellpadding="0" style="border-top:5px solid;border-bottom:4px solid;width:100%;display:none">  -->
							<table id="tblRecordType" cellspacing="0" cellpadding="0" style="border-top:5px solid;border-bottom:4px solid;width:100%;display:none">
								<tr>
									<xsl:variable name="RecordType">
										<xsl:value-of select="RecordType"/>
									</xsl:variable>
									<td nowrap="true" class="recordType">
										<input type="radio" name="rdoRecordType" id="rdoRecordType_NewRecord" class="ChecksAndRadios" onclick="setHidden('hdnRecordType', 'NewRecord')" style="width:auto">
											<xsl:if test="$RecordType='NewRecord'">
												<xsl:attribute name="checked">true</xsl:attribute>
											</xsl:if>
										</input>
										New Record
									</td>
									<td nowrap="true" class="recordType">
										<input type="radio" name="rdoRecordType" id="rdoRecordType_ExistingRecord" class="ChecksAndRadios" onclick="setHidden('hdnRecordType', 'ExistingRecord')" style="width:auto">
											<xsl:if test="$RecordType='ExistingRecord'">
												<xsl:attribute name="checked">true</xsl:attribute>
											</xsl:if>
										</input>
										Existing Record
									</td>
									<input type="hidden" id="hdnRecordType" name="hdnRecordType">
										<xsl:attribute name="value">
											<xsl:value-of select="RecordType"/>
										</xsl:attribute>
									</input>
								</tr>
							</table>
						</td></tr>
						<!--jmt break big table into three. top row in orange as instructions, 2nd row personal info and hidden, rest is as before in one big table --> 
						<tr><td style="border-style:none">
							<table id="tblInstr" cellspacing="0" style="border:1px solid;width:100%">
								<tr>
									<td colspan="8" class="instructions">
										<b>Instructions:</b>  Please complete this form.  It facilitates access to computing resources at Towson University.
									</td>
								</tr>
							</table>
							<table id="tblPersonalData" cellspacing="0" style="border:1px solid;width:100%;display:table">
								<tr>
									<td class="firstTextColumn" nowrap="true">Social Security Number:</td>
									<td class="firstDataColumn">
										<input type="text" id="txtSSN" name="txtSSN" maxlength="9" onblur="validateSSN(this);" onkeypress="return chkKeys(event, 'S');">
											<xsl:attribute name="value">
												<xsl:value-of select="SSN"/>
											</xsl:attribute>
										</input>
									</td>
									<td colspan="2"></td>
									<td class="thirdTextColumn" nowrap="true">Date of Birth: (mm/dd/yyyy)</td>
									<td class="thirdDataColumn">
										<input type="text" id="txtDOB" name="txtDOB" maxlength="10" onkeypress="return chkKeys(event, 'DT');" onblur="formatDate(this);">
											<xsl:attribute name="value">
												<xsl:value-of select="DOB"/>
											</xsl:attribute>
										</input>
									</td>
									<td colspan="2"></td>
								</tr>
							</table>
							<table id="tblOtherData" cellspacing="0" style="border:1px solid;width:5px">
								<tr>
<!--									<td class="firstTextColumn" nowrap="true">Date of Birth: (mm/dd/yyyy)</td>
									<td class="firstDataColumn">
										<input type="text" id="txtDOB" name="txtDOB" maxlength="10" onkeypress="return chkKeys(event, 'DT');" onblur="formatDate(this);">
											<xsl:attribute name="value">
												<xsl:value-of select="DOB"/>
											</xsl:attribute>
										</input>
									</td>
									<td colspan="2"></td>
-->
									<td class="firstTextColumn" nowrap="true">Preferred Salutation:</td>
									<td class="firstDataColumn" >
										<xsl:variable name="Salutation">
											<xsl:value-of select="normalize-space(Salutation)"/>
										</xsl:variable>
										<select name="cboSalutation" id="cboSalutation" onchange="setHidden('hdnSalutation', this.value)">
											<xsl:for-each select="document('TU_EarlyProvisioningLookups.xml')/lookups/Salutation/row">
												<xsl:variable name="salutationCode" select="shortName"/>
												<option>
													<xsl:if test="$Salutation = $salutationCode">
														<xsl:attribute name="selected">true</xsl:attribute>
													</xsl:if>
													<xsl:attribute name="value">
														<xsl:value-of select="shortName"/>
													</xsl:attribute>
													<xsl:value-of select="displayValue"/>
												</option>
											</xsl:for-each>
										</select>
										<input type="hidden" id="hdnSalutation" name="hdnSalutation">
											<xsl:attribute name="value">
												<xsl:value-of select="Salutation"/>
											</xsl:attribute>
										</input>
									</td>
									<td colspan="6"></td>
								</tr>
								<tr>
									<td class="firstTextColumn" nowrap="true">Last Name (Family Name):</td>
									<td class="firstDataColumn">
										<input type="text" id="txtLastName" name="txtLastName">
											<xsl:attribute name="value">
												<xsl:value-of select="LastName"/>
											</xsl:attribute>
										</input>
									</td>
									<td class="secondTextColumn" nowrap="true">Suffix:</td>
									<td class="secondDataColumn">
										<xsl:variable name="Suffix">
											<xsl:value-of select="normalize-space(Suffix)"/>
										</xsl:variable>
										<select name="cboSuffix" id="cboSuffix" onchange="setHidden('hdnSuffix', this.value)">
											<xsl:for-each select="document('TU_EarlyProvisioningLookups.xml')/lookups/Suffix/row">
											<xsl:variable name="suffixCode" select="shortName"/>
												<option>
													<xsl:if test="$Suffix = $suffixCode">
														<xsl:attribute name="selected">true</xsl:attribute>
													</xsl:if>
													<xsl:attribute name="value">
														<xsl:value-of select="shortName"/>
													</xsl:attribute>
													<xsl:value-of select="displayValue"/>
												</option>
											</xsl:for-each>
										</select>
										<input type="hidden" id="hdnSuffix" name="hdnSuffix">
											<xsl:attribute name="value">
												<xsl:value-of select="Suffix"/>
											</xsl:attribute>
										</input>
									</td>
									<td class="thirdTextColumn" nowrap="true">First Name (Given Name):</td>
									<td class="thirdDataColumn">
										<input type="text" id="txtFirstName" name="txtFirstName">
											<xsl:attribute name="value">
												<xsl:value-of select="FirstName"/>
											</xsl:attribute>
										</input>
									</td>
									<td colspan="2"></td>
								</tr>
								<tr>
									<td class="firstTextColumn" nowrap="true">Middle Name:</td>
									<td class="firstDataColumn">
										<input type="text" id="txtMiddleName" name="txtMiddleName">
											<xsl:attribute name="value">
												<xsl:value-of select="MiddleName"/>
											</xsl:attribute>
										</input>
									</td>
									<td colspan="2"></td>
									<td class="thirdTextColumn" nowrap="true">Maiden Name (Other Name):</td>
									<td class="thirdDataColumn">
										<input type="text" id="txtMaidenName" name="txtMaidenName">
											<xsl:attribute name="value">
												<xsl:value-of select="MaidenName"/>
											</xsl:attribute>
										</input>
									</td>
									<td colspan="2"></td>
								</tr>
								<tr>
									<td colspan="3" nowrap="true">Are you legally eligible to work in the U.S.?</td>
									<td class="secondDataColumn">
										<xsl:variable name="EligibleToWork">
											<xsl:value-of select="normalize-space(EligibleToWork)"/>
										</xsl:variable>
										<select name="cboEligibleToWork" id="cboEligibleToWork" onchange="setHidden('hdnEligibleToWork', this.value)">
											<xsl:for-each select="document('TU_EarlyProvisioningLookups.xml')/lookups/YesNo/row">
												<xsl:variable name="yesnoCode" select="shortName"/>
												<option>
													<xsl:if test="$EligibleToWork = $yesnoCode">
														<xsl:attribute name="selected">true</xsl:attribute>
													</xsl:if>
													<xsl:attribute name="value">
														<xsl:value-of select="shortName"/>
													</xsl:attribute>
													<xsl:value-of select="displayValue"/>
												</option>
											</xsl:for-each>
										</select>
										<input type="hidden" id="hdnEligibleToWork" name="hdnEligibleToWork">
											<xsl:attribute name="value">
												<xsl:value-of select="EligibleToWork"/>
											</xsl:attribute>
										</input>
									</td>
									<td colspan="4"></td>
								</tr>
								<tr>
									<td class="firstTextColumn" nowrap="true">Home Street Address:</td>
									<td class="firstDataColumn">
										<input type="text" id="txtAddress" name="txtAddress">
											<xsl:attribute name="value">
												<xsl:value-of select="Address"/>
											</xsl:attribute>
										</input>
									</td>
									<td colspan="2"></td>
									<td class="thirdTextColumn" nowrap="true">City:</td>
									<td class="thirdDataColumn">
										<input type="text" id="txtCity" name="txtCity">
											<xsl:attribute name="value">
												<xsl:value-of select="City"/>
											</xsl:attribute>
										</input>
									</td>
									<td colspan="2"></td>
								</tr>
								<tr>
									<td class="firstTextColumn" nowrap="true">State:</td>
									<td class="firstDataColumn">
										<xsl:variable name="State">
											<xsl:value-of select="normalize-space(State)"/>
										</xsl:variable>
										<select name="cboState" id="cboState" onchange="setHidden('hdnState', this.value)">
											<xsl:for-each select="document('TU_EarlyProvisioningLookups.xml')/lookups/State/row">
												<xsl:variable name="stateCode" select="shortName"/>
												<option>
													<xsl:if test="$State = $stateCode">
														<xsl:attribute name="selected">true</xsl:attribute>
													</xsl:if>
													<xsl:attribute name="value">
														<xsl:value-of select="shortName"/>
													</xsl:attribute>
													<xsl:value-of select="displayValue"/>
												</option>
											</xsl:for-each>
										</select>
										<input type="hidden" id="hdnState" name="hdnState">
											<xsl:attribute name="value">
												<xsl:value-of select="State"/>
											</xsl:attribute>
										</input>
									</td>
									<td colspan="2"></td>
									<td class="thirdTextColumn" nowrap="true">Zip Code:</td>
									<td class="thirdDataColumn">
										<input type="text" id="txtZipCode" name="txtZipCode" maxlength="5" onblur="validateZipCode(this);" onkeypress="return chkKeys(event, 'N');">
											<xsl:attribute name="value">
												<xsl:value-of select="ZipCode"/>
											</xsl:attribute>
										</input>
									</td>
									<td colspan="2"></td>
								</tr>
								<tr>
									<td class="firstTextColumn" nowrap="true">Maryland County:</td>
									<td class="firstDataColumn">
										<xsl:variable name="MDCounty">
											<xsl:value-of select="normalize-space(MDCounty)"/>
										</xsl:variable>
										<select name="cboMDCounty" id="cboMDCounty" onchange="setHidden('hdnMDCounty', this.options[this.options.selectedIndex].text)">
											<xsl:for-each select="document('TU_EarlyProvisioningLookups.xml')/lookups/MDCounty/row">
												<option>
													<xsl:if test="(value=$MDCounty) or ($MDCounty='' and value='')">
														<xsl:attribute name="selected">true</xsl:attribute>
													</xsl:if>
													<xsl:value-of select="value"/>
												</option>
											</xsl:for-each>
										</select>
										<input type="hidden" id="hdnMDCounty" name="hdnMDCounty">
											<xsl:attribute name="value">
												<xsl:value-of select="MDCounty"/>
											</xsl:attribute>
										</input>
									</td>
									<td colspan="2"></td>
									<td class="thirdTextColumn" nowrap="true">Country:</td>
									<td colspan="3">
										<xsl:variable name="Country">
											<xsl:value-of select="normalize-space(Country)"/>
										</xsl:variable>
										<select name="cboCountry" id="cboCountry" style="width:185px" onchange="setHidden('hdnCountry', this.value)">
											<xsl:for-each select="document('TU_EarlyProvisioningLookups.xml')/lookups/Country/row">
												<xsl:variable name="countryCode" select="shortName"/>
												<option>
													<xsl:if test="$Country = $countryCode">
														<xsl:attribute name="selected">true</xsl:attribute>
													</xsl:if>
													<xsl:attribute name="value">
														<xsl:value-of select="shortName"/>
													</xsl:attribute>
													<xsl:value-of select="displayValue"/>
												</option>
											</xsl:for-each>
										</select>
										<input type="hidden" id="hdnCountry" name="hdnCountry">
											<xsl:attribute name="value">
												<xsl:value-of select="Country"/>
											</xsl:attribute>
										</input>
									</td>
								</tr>
								<tr>
									<td class="firstTextColumn" nowrap="true">Current Phone:</td>
									<td class="firstDataColumn">
										<input type="text" id="txtPhone" name="txtPhone" maxlength="14" onblur="validatePhone(this);" onkeypress="return chkKeys(event, 'DP');">
											<xsl:attribute name="value">
												<xsl:value-of select="Phone"/>
											</xsl:attribute>
										</input>
									</td>
									<td class="secondTextColumn" nowrap="true">Type:</td>
									<td class="secondDataColumn">
										<xsl:variable name="PhoneType">
											<xsl:value-of select="normalize-space(PhoneType)"/>
										</xsl:variable>
										<select name="cboPhoneType" id="cboPhoneType" onchange="setHidden('hdnPhoneType', this.value)">
											<xsl:for-each select="document('TU_EarlyProvisioningLookups.xml')/lookups/PhoneType/row">
												<xsl:variable name="phoneTypeCode" select="shortName"/>
												<option>
													<xsl:if test="$PhoneType = $phoneTypeCode">
														<xsl:attribute name="selected">true</xsl:attribute>
													</xsl:if>
													<xsl:attribute name="value">
														<xsl:value-of select="shortName"/>
													</xsl:attribute>
													<xsl:value-of select="displayValue"/>
												</option>
											</xsl:for-each>
										</select>
										<input type="hidden" id="hdnPhoneType" name="hdnPhoneType">
											<xsl:attribute name="value">
												<xsl:value-of select="PhoneType"/>
											</xsl:attribute>
										</input>
									</td>
									<td class="thirdTextColumn" nowrap="true">Alternate Phone:</td>
									<td class="thirdDataColumn">
										<input type="text" id="txtAlternatePhone" name="txtAlternatePhone" onblur="validatePhone(this);" maxlength="14" onkeypress="return chkKeys(event, 'DP');">
											<xsl:attribute name="value">
												<xsl:value-of select="AlternatePhone"/>
											</xsl:attribute>
										</input>
									</td>
									<td class="fourthTextColumn" nowrap="true">Type:</td>
									<td class="fourthDataColumn">
										<xsl:variable name="AlternatePhoneType">
											<xsl:value-of select="normalize-space(AlternatePhoneType)"/>
										</xsl:variable>
										<select name="cboAlternatePhoneType" id="cboAlternatePhoneType" onchange="setHidden('hdnAlternatePhoneType', this.value)" select="Other">
											<xsl:for-each select="document('TU_EarlyProvisioningLookups.xml')/lookups/PhoneType/row">
												<xsl:variable name="AltPhoneTypeCode" select="shortName"/>
												<option>
													<xsl:if test="$AlternatePhoneType = $AltPhoneTypeCode">
														<xsl:attribute name="selected">true</xsl:attribute>
													</xsl:if>
													<xsl:attribute name="value">
														<xsl:value-of select="shortName"/>
													</xsl:attribute>
													<xsl:value-of select="displayValue"/>
												</option>
											</xsl:for-each>
										</select>
										<input type="hidden" id="hdnAlternatePhoneType" name="hdnAlternatePhoneType">
											<xsl:attribute name="value">
												<xsl:value-of select="AlternatePhoneType"/>
											</xsl:attribute>
										</input>
									</td>
								</tr>
								<tr>
									<td class="firstTextColumn" nowrap="true">Current Email Address:</td>
									<td class="firstDataColumn">
										<input type="text" id="txtEmail" name="txtEmail" onblur="validateEmail(this);">
											<xsl:attribute name="value">
												<xsl:value-of select="Email"/>
											</xsl:attribute>
										</input>
									</td>
									<td class="secondTextColumn" nowrap="true">Type:</td>
									<td class="secondDataColumn">
										<xsl:variable name="EmailType">
											<xsl:value-of select="normalize-space(EmailType)"/>
										</xsl:variable>
										<select name="cboEmailType" id="cboEmailType" onchange="setHidden('hdnEmailType', this.value)">
											<xsl:for-each select="document('TU_EarlyProvisioningLookups.xml')/lookups/EmailType/row">
												<xsl:variable name="emailTypeCode" select="shortName"/>
												<option>
													<xsl:if test="$EmailType = $emailTypeCode">
														<xsl:attribute name="selected">true</xsl:attribute>
													</xsl:if>
													<xsl:attribute name="value">
														<xsl:value-of select="shortName"/>
													</xsl:attribute>
													<xsl:value-of select="displayValue"/>
												</option>
											</xsl:for-each>
										</select>
										<input type="hidden" id="hdnEmailType" name="hdnEmailType">
											<xsl:attribute name="value">
												<xsl:value-of select="EmailType"/>
											</xsl:attribute>
										</input>
									</td>
									<td class="thirdTextColumn" nowrap="true">Alternate Email Address:</td>
									<td class="thirdDataColumn">
										<input type="text" id="txtAlternateEmail" name="txtAlternateEmail" onblur="validateEmail(this);">
											<xsl:attribute name="value">
												<xsl:value-of select="AlternateEmail"/>
											</xsl:attribute>
										</input>
									</td>
									<td class="fourthTextColumn" nowrap="true">Type:</td>
									<td class="fourthDataColumn">
										<xsl:variable name="AlternateEmailType">
											<xsl:value-of select="normalize-space(AlternateEmailType)"/>
										</xsl:variable>
										<select name="cboAlternateEmailType" id="cboAlternateEmailType" onchange="setHidden('hdnAlternateEmailType', this.value)">
											<xsl:for-each select="document('TU_EarlyProvisioningLookups.xml')/lookups/EmailType/row">
												<xsl:variable name="AltEmailTypeCode" select="shortName"/>
												<option>
													<xsl:if test="$AlternateEmailType = $AltEmailTypeCode">
														<xsl:attribute name="selected">true</xsl:attribute>
													</xsl:if>
													<xsl:attribute name="value">
														<xsl:value-of select="shortName"/>
													</xsl:attribute>
													<xsl:value-of select="displayValue"/>
												</option>
											</xsl:for-each>
										</select>
										<input type="hidden" id="hdnAlternateEmailType" name="hdnAlternateEmailType">
											<xsl:attribute name="value">
												<xsl:value-of select="AlternateEmailType"/>
											</xsl:attribute>
										</input>
									</td>
								</tr>
								<tr>
									<td colspan="3" nowrap="true">Have you signed your Towson University Contract or agreement?</td>
									<td class="secondDataColumn">
										<xsl:variable name="SignedContract">
											<xsl:value-of select="normalize-space(SignedContract)"/>
										</xsl:variable>
										<select name="cboSignedContract" id="cboSignedContract" onchange="setHidden('hdnSignedContract', this.value)">
											<xsl:for-each select="document('TU_EarlyProvisioningLookups.xml')/lookups/YesNo/row">
												<xsl:variable name="signedcontractCode" select="shortName"/>
												<option>
													<xsl:if test="$SignedContract = $signedcontractCode">
														<xsl:attribute name="selected">true</xsl:attribute>
													</xsl:if>
													<xsl:attribute name="value">
														<xsl:value-of select="shortName"/>
													</xsl:attribute>
													<xsl:value-of select="displayValue"/>
												</option>
											</xsl:for-each>
										</select>
										<input type="hidden" id="hdnSignedContract" name="hdnSignedContract">
											<xsl:attribute name="value">
												<xsl:value-of select="SignedContract"/>
											</xsl:attribute>
										</input>
									</td>
									<td class="thirdTextColumn" nowrap="true">Academic Department:</td>
									<td colspan="3">
										<xsl:variable name="AcademicDepartment">
											<xsl:value-of select="normalize-space(AcademicDepartment)"/>
										</xsl:variable>
										<select name="cboAcademicDepartment" id="cboAcademicDepartment" style="width:185px" onchange="setHidden('hdnAcademicDepartment', this.value)">
											<xsl:for-each select="document('TU_EarlyProvisioningLookups.xml')/lookups/AcademicDepartment/row">
												<xsl:variable name="optAcademicDepartment" select="shortName"/>
												<option>
													<xsl:if test="$AcademicDepartment = $optAcademicDepartment">
														<xsl:attribute name="selected">true</xsl:attribute>
													</xsl:if>
													<xsl:attribute name="value">
														<xsl:value-of select="shortName"/>
													</xsl:attribute>
													<xsl:value-of select="displayValue"/>
												</option>
											</xsl:for-each>
										</select>
										<input type="hidden" id="hdnAcademicDepartment" name="hdnAcademicDepartment">
											<xsl:attribute name="value">
												<xsl:value-of select="AcademicDepartment"/>
											</xsl:attribute>
										</input>
									</td>
								</tr>
								<tr>
									<td class="firstTextColumn" nowrap="true">Type of Faculty:</td>
									<td class="firstDataColumn">
										<xsl:variable name="FacultyType">
											<xsl:value-of select="normalize-space(FacultyType)"/>
										</xsl:variable>
										<select name="cboFacultyType" id="cboFacultyType" onchange="setHidden('hdnFacultyType', this.options[this.options.selectedIndex].text)">
											<xsl:for-each select="document('TU_EarlyProvisioningLookups.xml')/lookups/FacultyType/row">
												<option>
													<xsl:if test="(value=$FacultyType) or ($FacultyType='' and value='')">
														<xsl:attribute name="selected">true</xsl:attribute>
													</xsl:if>
													<xsl:value-of select="value"/>
												</option>
											</xsl:for-each>
										</select>
										<input type="hidden" id="hdnFacultyType" name="hdnFacultyType">
											<xsl:attribute name="value">
												<xsl:value-of select="FacultyType"/>
											</xsl:attribute>
										</input>
									</td>
									<td colspan="6"></td>
								</tr>
								<tr>
									<td colspan="5" nowrap="true">Have you ever been issued a Towson University Username (NetId) and password?</td>
									<td colspan="3" class="thirdDataColumn">
										<xsl:variable name="IssuedNetId">
											<xsl:value-of select="normalize-space(IssuedNetId)"/>
										</xsl:variable>
										<select name="cboIssuedNetId" id="cboIssuedNetId" onchange="setHidden('hdnIssuedNetId', this.options[this.options.selectedIndex].text);showHideLastLogin();">
											<xsl:for-each select="document('TU_EarlyProvisioningLookups.xml')/lookups/YesNoDoNotRecall/row">
												<option>
													<xsl:if test="(value=$IssuedNetId) or ($IssuedNetId='' and value='')">
														<xsl:attribute name="selected">true</xsl:attribute>
													</xsl:if>
													<xsl:value-of select="value"/>
												</option>
											</xsl:for-each>
										</select>
										<input type="hidden" id="hdnIssuedNetId" name="hdnIssuedNetId">
											<xsl:attribute name="value">
												<xsl:value-of select="IssuedNetId"/>
											</xsl:attribute>
										</input>
									</td>
								</tr>
								<tr id="trLastLogin" style="display:none">
									<td colspan="5" nowrap="true" style="border:none">Approximately when did you last use it to log in?  (ex. fall semester 2009):</td>
									<td colspan="3" class="thirdDataColumn" style="border:none">
										<input type="text" id="txtLastNetIdLogin" name="txtLastNetIdLogin">
											<xsl:attribute name="value">
												<xsl:value-of select="LastNetIdLogin"/>
											</xsl:attribute>
										</input>
									</td>
								</tr>
								<tr>
									<td colspan="5" nowrap="true">Have you ever been issued a Towson University email address?</td>
									<td colspan="3" class="thirdDataColumn">
										<xsl:variable name="IssuedEmail">
											<xsl:value-of select="normalize-space(IssuedEmail)"/>
										</xsl:variable>
										<select name="cboIssuedEmail" id="cboIssuedEmail" onchange="setHidden('hdnIssuedEmail', this.options[this.options.selectedIndex].text)">
											<xsl:for-each select="document('TU_EarlyProvisioningLookups.xml')/lookups/YesNoDoNotRecall/row">
												<option>
													<xsl:if test="(value=$IssuedEmail) or ($IssuedEmail='' and value='')">
														<xsl:attribute name="selected">true</xsl:attribute>
													</xsl:if>
													<xsl:value-of select="value"/>
												</option>
											</xsl:for-each>
										</select>
										<input type="hidden" id="hdnIssuedEmail" name="hdnIssuedEmail">
											<xsl:attribute name="value">
												<xsl:value-of select="IssuedEmail"/>
											</xsl:attribute>
										</input>
									</td>
								</tr>
							</table>
						</td></tr>
						<tr><td style="border-style:none">
							<table cellspacing="0" style="width:100%">
								<tr>
									<td style="width:100%;border:none">
										NOTE: <b>You <u>MUST</u> complete the Employment Eligibility Verification process</b> (Form I-9) and provide original verification documents prior to your start/hire date.  The Employment Eligibility process <b><u>MUST be completed in person</u></b> in the Office of Human Resources.  A Human Resource Associate will contact you via email to schedule you for one of our weekly/monthly New Hire Sessions.
									</td>
								</tr>
							</table>
						</td></tr>
					</table>
					<input type="hidden" id="hdnCurrentQueueName" name="hdnCurrentQueueName">
						<xsl:attribute name="value">
							<xsl:value-of select="StateInfo/CurrentQueueName"/>
						</xsl:attribute>
					</input>
					<input type="hidden" id="hdnSubmissionDate" name="hdnSubmissionDate">
						<xsl:attribute name="value">
							<xsl:value-of select="SubmissionDate"/>
						</xsl:attribute>
					</input>
				</form>
			</body>
		</html>
	</xsl:template>	
</xsl:stylesheet>