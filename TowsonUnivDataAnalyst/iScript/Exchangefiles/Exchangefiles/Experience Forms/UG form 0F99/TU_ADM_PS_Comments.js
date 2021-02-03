//06/15/2015 JMT - TechHelp 117184 - Add PS Comments to form. The displayed value is the Short_Desc from PS. Value is the PS code.
//					Two worksheet functions to move the comment value between the hidden input box and the wrappable textarea: popPSCommentsTXA and popPSCommentsTXT
//10/14/2015 ECB TechHelp 135688 - Additional comments added
//10/20/2015 ECB TechHelp 136565 - Changes to IAPL comment structure
//12/09/2015 ECB TechHelp 142533 - Changes to cohort comment codes, COCBE, COCOE and CONE
//12/18/2015 ECB TechHelp 143617 - Changes to comment codes R 11 & R MD
//12/18/2015 ECB TechHelp 145922 - Changes to comment code TRNNA
//08/05/2016 ECB TechHelp 166486 - Additional code and comment added
//10/05/2016 ECB TechHelp 178207 - Changes to comment code value for R11, RMD & RPET
//10/06/2016 ECB TechHelp 178409 - Changes to comment code value for TRN1s, RDL, RVC & RVR. Inactivate RPRG & RVSG
//11/16/2016 ECB TechHelp 183020 - Additional code and comment added
//03/10/2017 ECB TechHelp 195776 - Changes to comment code value for RGI
//04/12/2017 ECB TechHelp 199690 - Additional code and comment added
//09/01/2017 ECB TechHelp 214181 - New Comments and code changes for 2018 processing
//09/06/2017 ECB TechHelp 216806 - Corrections to comments RHR and RVC
//05/31/2018 ECB TechHelp 247527 - Additional PS Comment code added - TRNIC
//07/31/2018 ECB TechHelp 253829 - Additional PS Comment code added - RENGP
//09/10/2018 ECB TechHelp 260568 - Additional PS Comment code added - TRNLG
//09/12/2018 ECB TechHelp 260899 - Changes to comments and codes for 2018 Residency
//10/01/2018 ECB TechHelp 260899 - Changes to comment code HONOR for 2019
//10/10/2018 ECB TechHelp 264881 - Changes to comment code RGI for 2019
//12/12/2018 ECB TechHelp 271694 - Additional PS Comment code added - IAMAJ
//12/12/2018 JMT TechHelp none   - Change RGI comment
//04/15/2019 ECB TechHelp none   - Change RGI comment per Lisa, change: ckeaton@towson.edu to schaplin@towson.edu
//04/30/2019 JMT TechHelp 288492 - Change RGI comment
//09/06/2019 ECB TechHelp 304892 - Update comment codes for 2020
//09/12/2019 ECB TechHelp none   - Update TRN1S comment
//09/19/2019 ECB TechHelp 306953 - Update RPET comment, escape apostrophe's out of comments (ex. driver''s) for downstream system (PeopleSoft)
//10/10/2019 ECB TechHelp 309889 - Update HONOR comment for 2020

function popPS_Comment(comment_value,rownum)  //The PS comment code and which of the three rows are we on
{
	//alert("You are here: [" + comment_value + "]\nAt row number: [" + rownum + "]");

	var strDefaulText = "";
	var strIN_Lttr = "Y";
	var strIN_Trns = "Y";

	//First find values for other fields based on passed comment code. The strDefaultText is what will be added to PS for the Comment. 
	switch (comment_value)
	{
		case 'COCBE':
			strDefaulText = "Admission to the Business Administration major is dependent on meeting the pre-requisite requirements. For details, please visit: http://www.towson.edu/cbe/programs/NE-MD.asp or contact Lisa Michocki, Program Director, at 410-704-3496.";
			//strDefaulText = "Please work with the Program Director for your 2 + 2 program as they will determine your eligibility for admission into this cohort.  For details, please visit: http://www.towson.edu/cbe/programs/NE-MD.asp or contact Heather McComas, Program Director, at 410-704-4753.";
			break;
		case 'COCOE':
			strDefaulText = "You must now work with the Program Director/ Coordinator for your 2+2 program and TU satellite campus. They will determine your eligibility for admission into this cohort and will notify you of this decision. Please note: Praxis scores must be sent to the Program Director/ Coordinator; official transcripts must be sent directly to University Admissions; AAT degrees must be conferred and verified.";
			//strDefaulText = "You must now work with the program coordinator for your 2+2 program and TU satellite campus. They will determine your eligibility for admission into this cohort and will notify you of this decision. Please note: Praxis scores must be sent to the program coordinator; official transcripts must be sent directly to University Admissions; AAT degrees must be conferred and verified.";
			break;
		case 'CONE':
			strDefaulText = "LETTER";
			//strDefaulText = "Please work with the Program Director for your 2 + 2 program.  To obtain contact information and details specific to your enrollment at TU in Northeastern Maryland, call 410-704-8863(TUNE) or email TUNEMD@towson.edu. The TUNEMD To-Do list is available here: http://www.towson.edu/main/admissions/transfer/NortheasternMarylandindex.asp";
			break;
		case 'GIDFR':
			strDefaulText = "If you plan to use the GI Bill, you may defer the non-refundable enrollment fee until your first semester bill. Please email admissions@towson.edu for deferral instructions. If you do not use the GI Bill or do not attend Towson University after completing the signed contract agreement, you will still be liable for this fee.";
			break;
		case 'HONOR':
			strDefaulText = "Your application to the Honors College will be assessed in a separate process from your TU admission, and you will receive a decision letter from the Honors College by early February 2020.";
			//strDefaulText = "Your application to the Honors College will be assessed in a separate process from your TU admission, and you will receive a decision letter from the Honors College by early February 2019.";
			//strDefaulText = "Your application to the Honors College will be assessed in a separate process from your TU admission, and you will receive a decision letter from the Honors College by early February 2018.";
			break;
		case 'IAPL':
			strDefaulText = "?\nReplace the ? above with one of the following numbers:\n 1 Math\n 2 Math and conditional English\n 3 Conditional English\n 4 Math and non-native English\n 5 Non-native English\n 6 Math and native English";
			break;
		case 'IASAU':
			strDefaulText = "The student has informed our office that his/her major is ????.  Towson University permits students to change their major(s) and/or minor(s) at their own discretion.";
			break;
		case 'IAMAJ':
			strDefaulText = "Your application has indicated your intention to study (major).";
			break;
		case 'IASCH':
			strDefaulText = "Please update the following information (if necessary):\n\n Amt: 8,000\n Persem: 4,000\n Duration: 8\n Maximum: 32,000\n\n End";
			//strDefaulText = "Each year, Towson awards a limited number of scholarships to new students who are identified as academically talented. Because your past academic performance indicates an outstanding level of achievement, the university is awarding you an International Student Scholarship.";
			break;
		case 'IATRN':
			strDefaulText = "";
			break;
		case 'R11':
			strDefaulText = "You indicated that you live in Maryland but selected that you do not wish to be considered for in-state tuition. If this was a mistake and you would like to be considered, please email admissionsresidency@towson.edu to obtain a residency determination form.";
			//strDefaulText = "On your application you indicated that you live in Maryland but within the residency section you selected that you do not wish to be considered for in-state tuition. If this was a mistake and you would like to be considered, please email admissionsresidency@towson.edu to obtain a residency determination form.";
			//strDefaulText = "At this time we are unable to determine your residency status, to be re-considered as a Maryland resident for tuition purposes please email TUResidency@towson.edu.";
			//strDefaulText = "If you wish to be re-considered as a Maryland resident for tuition purposes you will need to submit a new residency information form. Please email TUResidency@towson.edu to request the form. To view the requirements for in-state residency please visit www.towson.edu/residency.";
			//strDefaulText = "If you wish to be re-considered as a Maryland resident for tuition purposes you will need to submit a new residency information form. Please email Admissions@towson.edu to request the Section 11 form. To view the requirements for in-state residency please visit www.towson.edu/residency.";
			//strDefaulText = "If you wish to be re-considered as a Maryland resident for tuition purposes please submit a new residency information form: www.towson.edu/section11. To view the requirements for in-state residency please visit www.towson.edu/residency.";
			break;
		case 'R11G':
		case 'R11S':
			strDefaulText = "The enclosed Section 11 form must be filled out completely and returned to the Admissions Office if you wish to be considered for Maryland residency.";
			break;
		case 'R214G':
			strDefaulText = "You indicated that you are a child or a spouse of a veteran planning to use military benefits. To be eligible for in-state tuition please provide a copy of their DD214 (showing they were discharged within the past 3 years), your certificate of eligibility, and documentation that you live in Maryland (deed/lease) to admissionsresidency@towson.edu.";
			//strDefaulText = "Please email a copy of your spouse or parent's DD214, your certificate of eligibility, and proof that you currently reside in MD to admissionsresidency@towson.edu. You may only be eligible if your parent/spouse was discharged less than three years before your enrollment.";
			//strDefaulText = "Please email TUResidency@towson.edu a copy of your spouse or parent's DD214, your certificate of eligibility, and proof that you currently reside in MD. You may only be eligible if your parent/spouse was discharged less than 3 years before your enrollment.";
			break;
		case 'R214S':
			strDefaulText = "You indicated that you are a Veteran of the US Armed Forces. Please provide a copy of your DD214 and documentation that you live in Maryland (deed/lease) to admissionsresidency@towson.edu.";
			//strDefaulText = "Please email a copy of your DD214 and your deed/lease to your home in Maryland to admissionsresidency@towson.edu.";
			//strDefaulText = "Please email TUResidency@towson.edu a copy of your DD214. If your home of record or address is not MD also provide documentation that you currently resides in MD.";
			break;
		case 'RACTM':
			strDefaulText = "You indicated that you or a guardian/spouse is a member of the US Armed Forces stationed in Maryland or residing in Maryland. To be eligible for in-state tuition, please email active duty orders and proof that you reside in Maryland (if you are not stationed in Maryland). If you are the spouse or child of an active duty member please provide documentation of your relationship.";
			//strDefaulText = "Please email the most recent U.S. Armed Forces active duty orders for yourself or spouse/parent to admissionsresidency@towson.edu. If you/your dependent is not stationed in Maryland, please provide a copy of your deed/lease or verification that Maryland is your home of record.";
			//strDefaulText = "Please email the most recent U.S. Armed Forces active duty orders to TUResidency@towson.edu. If you/your dependent is not stationed in MD please provide a copy of your deed/lease or verification that MD is your home of residency.";
			break;
		case 'RASY':
			strDefaulText = "You indicated that you are not a US Citizen but have Asylum. Please email documentation that you have been granted Asylum to admissionsresidency@towson.edu.";
			//strDefaulText = "Please email documentation that you have been granted asylum status within the United States to admissionsresidency@towson.edu.";
			//strDefaulText = "Please email TUResidency@towson.edu with documentation that you have been granted asylum status.";
			//strDefaulText = "Please provide a copy of your approved asylum status and I-94 card to the Admissions Office.";
			strIN_Trns = "N";
			break;
		case 'RDACA':
			strDefaulText = "You indicated that you are not a US Citizen. Please email a copy of your Deferred Action for Childhood Arrivals (DACA) approval notice (I-797) for the past 12 months to admissionsresidency@towson.edu.";
			//strDefaulText = "Please email a copy of your Deferred Action for Childhood Arrivals (DACA) approval notice (I-797) for the past 12 months to admissionsresidency@towson.edu.";
			//strDefaulText = "Please email TUResidency@towson.edu a copy of your Deferred Action for Childhood Arrivals (DACA) approval notice (I-797).";
			//strDefaulText = "Please provide a copy of your approval notice for deferred action (I-797).";
			strIN_Trns = "N";
			break;
		case 'RDL':
			strDefaulText = "A question has been raised about your Maryland driver''s license, please email a copy to admissionsresidency@towson.edu.";
			//strDefaulText = "Please email a copy of your driver's license to admissionsresidency@towson.edu.";
			//strDefaulText = "Please email TUResidency@towson.edu a copy of your driver's license.";
			//strDefaulText = "Please provide a copy of your Maryland driver's license to the Admissions Office and an explanation as to why it was held for fewer than 12 months.";
			//strDefaulText = "Please provide a copy of your Maryland driver's license to the Admissions Office.  (If held for fewer than 12 months, please explain.)";
			strIN_Trns = "N";
			break;
		case 'RENGP':
			strDefaulText = "Required: Proof of English proficiency. Applicants who are non-US citizens or do not speak English as their native language must provide proof of English proficiency. Please visit www.towson.edu/admissions or email EnglProf@towson.edu for the full policy and list of acceptable requirements.";
			strIN_Trns = "N";
			break;
		case 'RGI':
			strDefaulText = "As a military student, we can defer your non-refundable enrollment fee to your first semester bill. Please be aware that veterans benefits will not cover this fee. If you do not attend Towson University after completing the signed contract agreement, you will still be liable for this fee.  Please email schaplin@towson.edu for deferral instructions.";
			//strDefaulText = "As a military student, we can defer your non-refundable enrollment fee to your first semester bill. Please be aware that veterans benefits will not cover this fee. If you do not attend Towson University after completing the signed contract agreement, you will still be liable for this fee.  Please email CKeaton@towson.edu for deferral instructions.";
			//strDefaulText = "As a military student, we can defer the $300 to your first semester bill. Please be aware that veterans benefits will not cover this fee. If you do not attend Towson University after completing the signed contract agreement, you will still be liable for this fee.  Please email admissions@towson.edu for deferral instructions.";
			//strDefaulText = "If you are using GI Bill benefits, we can defer the $300 enrollment fee to your first bill. Please email admissions@towson.edu for deferral instructions. If you later decide not to attend TU you will still be responsible to pay the $300 non-refundable enrollment fee.";
			//strDefaulText = "If you plan to use the GI Bill, you may defer the non-refundable enrollment fee until your first semester bill. Please email admissions@towson.edu for deferral instructions. If you do not use the GI Bill or do not attend Towson University after completing the signed contract agreement, you will still be liable for this fee";
			//strDefaulText = "If you plan to use the GI Bill you may defer the $300 non-refundable enrollment fee until your first semester bill. Please email admissions@towson.edu for deferral instructions. If you do not use the GI Bill or do not attend Towson University after completing the signed contract agreement, you are still liable for this $300 fee.";
			strIN_Trns = "N";
			break;
		case 'RHR':
			strDefaulText = "You indicated that you, your parent, or spouse works as a regular employee of USM or a USM institution. Please email a letter from your Office of Human Resources to verify employment to admissionsresidency@towson.edu.";
			//strDefaulText = "You indicated that you, your parent, or spouse works as a regular employee of USM or a USM college/university. Please provide a letter from your Office of Human Resources to verify employment. Letters can be emailed to admissionsresidency@towson.edu.";
			//strDefaulText = "You indicated that you, your parent, or spouse works as a full-time or part-time regular employee of USM or a USM college/university. Please provide a letter from your Office of Human Resources to verify employment. Letters can be emailed to TUResidency@towson.edu.";
			//strDefaulText = "Please provide a letter from the Office of Human Resources at your home institution verifying that you or your guardian is a regular employee of the University System of Maryland. Letters should be sent directly to the Towson University Admissions office.";
			strIN_Trns = "N";
			break;
		case 'RINT':
			strDefaulText = "You indicated that you are financially independent and have not filed Maryland taxes in the most recent year. Please email admissionsresidency@towson.edu to provide a detailed reason. If you are dependent on a parent/guardian please email us to request a new residency determination form.";
			//strDefaulText = "You indicated that you are financially independent and have not filed Maryland taxes in the most recent year. Please email admissionsresidency@towson.edu to clarify or to confirm this statement. If you are dependent on a parent/guardian please email us to request a new residency determination form.";
			strIN_Trns = "N";
			break;
		case 'RLS':
			strDefaulText = "Please email a copy of your Maryland  lease, deed, home mortgage contract, or rental agreement for the past 12 months to admissionsresidency@towson.edu.";
			//strDefaulText = "Please email a copy of your lease, deed, home mortgage contract, or rental agreement for the past 12 months to admissionsresidency@towson.edu.";
			//strDefaulText = "Please email TUResidency@towson.edu a copy of your lease, deed, home mortgage contract, or rental agreement for the past 12 months.";
			//strDefaulText = "Please provide a copy of your lease, deed, home mortgage contract, or rental agreement to the Admissions Office.";
			strIN_Trns = "N";
			break;
		case 'RMD':
			strDefaulText = "You indicated that you moved to Maryland primarily to attend an educational institution. If this is a mistake, please email admissionsresidency@towson.edu with your full name, TU ID, and a statement explaining the circumstances that brought you to MD.";
			//strDefaulText = "You indicated that you moved to MD primarily to attend an educational institution. If this is a mistake please email TUResidency@towson.edu with your full name, TU ID, and statement explaining the circumstances that brought you to MD.";
			//strDefaulText = "You indicate that your primary reason for living/moving to MD is to attend Towson University. If this is a mistake please email TUResidency@towson.edu with your full name, TU ID, and statement explaining the mistake.";
			//strDefaulText = "You indicate that your primary reason for living/moving to MD is to attend Towson University. If this is a mistake please email Admissions@towson.edu  with your full name, TU ID, and statement explaining the mistake. A counselor will get back to you within 72 hours with a second review of your residency determination.";
			//strDefaulText = "You indicate that your primary reason for living/moving to MD is to attend Towson University. If this is a mistake please email Admissions@towson.edu with your full name, TU ID (if you know it), and statement explaining the mistake. A counselor will get back to you within 72 hours with a second review of your residency determination.";
			break;
		case 'RMDNG':
			strDefaulText = "You indicated that you are a member of the Maryland National Guard. Please email documentation from your company commander proving your eligibility for the Nonresident Tuition Exemption to admissionsresidency@towson.edu.";
			//strDefaulText = "You indicated that you are a member of the Maryland National Guard. Please email admissionsresidency@towson.edu documentation from your company commander proving your eligibility for the Nonresident Tuition Exemption.";
			//strDefaulText = "You indicated that you are a member of the MD National Guard, please provide documentation from your company commander of your eligibility for Nonresident Tuition Exemption.";
			break;
		case 'RMIN':
			strDefaulText = "You indicated that you are financially independent, which means that a parent/guardian does NOT claim you on their tax return. If this is correct, please email a copy of your Maryland Income Tax Return (MD 502) to admissionsresidency@towson.edu. All sensitive information can be blacked out. If this is a mistake and you are a dependent student, please email us to request a new residency determination form.";
			//strDefaulText = "As a freshman applicant you stated that you are financially independent, which means that a parent/guardian does NOT claim you on their tax return. If this is correct, please email a copy of your Maryland Income Tax Return to admissionsresidency@towson.edu. If this is a mistake, please email us to request a new residency determination form.";
			strIN_Trns = "N";
			break;
		/**case 'RMO':
			strDefaulText = "Please provide a copy of your military orders or DD214 to the Admissions Office.";
			strIN_Trns = "N";
			break;*/
		case 'ROOSS':
			strDefaulText = "You indicated that you were attending school outside of Maryland during the application process. To verify that you are a Maryland resident, please provide proof that taxes have been filed within the most recent year. If you are dependent, please provide a copy of your guardian''s tax return (Maryland 502 and 502B). Documents can be emailed to admissionsresidency@towson.edu and sensitive information can be blacked out.";
			strIN_Trns = "N";
			break;
		case 'ROTHR':
			strDefaulText = "";
			strIN_Trns = "N";
			break;
		case 'RPA':
			strDefaulText = "You indicated that you receive public assistance from a state or local agency other than one in Maryland. If this is a mistake, please email admissionsresidency@towson.edu documentation of your public assistance.";
			//strDefaulText = "You indicated that you receive public assistance from a state or local agency other than one in Maryland. If this is a mistake, please email admissionsresidency@towson.edu documentation of your public assistance.";
			//strDefaulText = "You indicated that you receive public assistance from a state or local agency other than one in Maryland. If this is a mistake please email TUResidency@towson.edu documentation of your public assistance.";
			//strDefaulText = "You indicated that you receive public assistance from another state or local agency other than one in Maryland. If that is a mistake please provide documentation of your MD assistance to University Admission.";
			strIN_Trns = "N";
			break;
		case 'RPET':
			strDefaulText = "You do not meet all criteria for in-state consideration. Please review the full policy at www.towson.edu/residency. If you wish to petition against the initial determination, please email admissionsresidency@towson.edu to obtain a copy of the petition form and instructions.";
			//strDefaulText = "You do not meet all criteria for consideration. Please review the full policy at www.towson.edu/residency. If you wish to petition against the initial determination, please email admissionsresidency@towson.edu to obtain a copy of the petition form and instructions.";
			//strDefaulText = "Upon initial review, you do not meet all criteria of the USM Policy on Student Classification for Admission and Tuition Purposes. Please review the full policy at www.towson.edu/residency. If you wish to petition against the initial determination, please email admissionsresidency@towson.edu to obtain a copy of the petition form and instructions.";
			//strDefaulText = "Upon initial review you do not meet all criteria of the USM Policy on Student Classification for Admission and Tuition Purposes. Please review the full policy by visiting www.towson.edu/residency. If you wish to petition against the initial determination please email TUResidency@towson.edu to obtain a copy of the petition form and instructions.";
			//strDefaulText = "Upon initial review you do not meet all criteria of the USM Policy on Student Classification for Admission and Tuition Purposes. If you wish to review the full policy please visit www.towson.edu/residency. To obtain a copy of the instructions/petition form please email TUResidency@towson.edu.";
			//strDefaulText = "Upon initial review you do not meet all criteria of the USM Policy on Student Classification for Admission and Tuition Purposes. If you wish to petition against this decision, please visit: http://www.towson.edu/main/admissions/tuitionaid/residency.asp.";
			break;	
		/**case 'RPRG':
			strDefaulText = "Please provide a copy, FRONT and BACK, of your legal guardian's permanent residency card to the Admissions Office.";
			strIN_Trns = "N";
			break;*/
		case 'RPOSS':
			strDefaulText = "You indicated that all, or substantially all, of your possessions are not in Maryland. If this is a mistake and all of your possessions are in Maryland, please email admissionsresidency@towson.edu with your full name, TU ID, and short statement explaining the mistake.";
			//strDefaulText = "You indicated that all, or substantially all, of your possessions are not in Maryland. If this is a mistake and all of your possessions are in Maryland, please email admissionsresidency@towson.edu with your full name, TU ID, and short statement explaining the mistake.";
			//strDefaulText = "You indicated that all, or substantially all, of your possessions are not in MD. If this is a mistake please email TUResidency@towson.edu with your full name, TU ID, and short statement explaining the mistake.";
			break;
		case 'RPRS':
			strDefaulText = "You indicated that you are not a US citizen, but hold permanent residency. Please email a copy, front and back, of your permanent resident/green card to admissionsresidency@towson.edu.";
			//strDefaulText = "Please email a copy, front and back, of your permanent residency/green card to admissionsresidency@towson.edu.";
			//strDefaulText = "Please email a copy, front and back, of your permanent residency/green card to TUResidency@towson.edu.";
			//strDefaulText = "Please provide a copy, FRONT and BACK, of your permanent residency card to the Admissions Office.";
			strIN_Trns = "N";
			break;
		case 'RQUES':
			strDefaulText = "At this time we are unable to determine your residency status. To be re-considered as a Maryland resident for tuition purposes, please email admissionsresidency@towson.edu.";
			//strDefaulText = "At this time we are unable to determine your residency status. To be re-considered as a Maryland resident for tuition purposes, please email admissionsresidency@towson.edu.";
			strIN_Trns = "N";
			break;
		case 'RTPS':
			strDefaulText = "You indicated that you are a not a US Citizen but hold Temporary Protective Status, please email a copy of your TPS Approval Notice (I-797) to admissionsresidency@towson.edu.";
			//strDefaulText = "Please email a copy of your TPS Approval Notice (I-797) to admissionsresidency@towson.edu.";
			strIN_Trns = "N";
			break;
		case 'RTRG':
			strDefaulText = "You indicated that you are financially dependent but your guardian did not claim you or did not file taxes for the most recent year. Once filed, please email a copy of your legal guardian\'s Maryland state income tax returns (Maryland 502 & Maryland 502B forms) or extension request for the most recent year to admissionsresidency@towson.edu.  You may black out all sensitive information. If Maryland tax returns were not filed for a given year, please explain.";
			//strDefaulText = "Please email a copy of your legal guardian's Maryland state income tax returns (MD 502 & MD 502B forms) or extension request for the most recent year to admissionsresidency@towson.edu.  You may black out all sensitive information. If Maryland tax returns were not filed for a given year, please explain.";
			//strDefaulText = "Please provide a copy of your legal guardian's MD state income tax returns (MD 502 & MD 502B forms) or extension requests for the past two years.  You may black out all sensitive information. If Maryland tax returns were not filed for a given year, please explain.";
			//strDefaulText = "Please provide photocopies of your legal guardian's Maryland income tax returns (MD 502 & MD 502B forms) for the past two years.  (If Maryland tax returns were not filed for a given year, please explain.)";			
			strIN_Trns = "N";
			break;
		case 'RTRS':
			strDefaulText = "A question has been raised about your State Income Tax filing. Please email a copy of your Maryland state income tax returns (Maryland 502 form) or extension request for the past year to admissionsresidency@towson.edu.  You may black out all sensitive information. If state tax returns were not filed for a given year, please explain.";
			//strDefaulText = "Please email a copy of your Maryland state income tax returns (MD 502 form) or extension request for the past year to admissionsresidency@towson.edu.  You may black out all sensitive information. If state tax returns were not filed for a given year, please explain.";
			//strDefaulText = "Please provide a copy of your MD state income tax returns (MD 502 form) or extension requests for the past two years.  You may black out all sensitive information. If Maryland tax returns were not filed for a given year, please explain.";
			//strDefaulText = "Please provide photocopies of your Maryland income tax returns (MD 502) for the past two years.  (If Maryland tax returns were not filed for a given year, please explain.)";			
			strIN_Trns = "N";
			break;
		case 'RTWS':
			strDefaulText = "You indicated that you've filed taxes in the past 12 months, but currently income taxes are not withheld from your pay. Please provide a detailed explanation with a copy of your most recent income tax return to admissionsresidency@towson.edu.";
			strIN_Trns = "N";
			break;			
		case 'RVC':
			strDefaulText = "You indicated that you are registered to vote in another state. Please register to vote in Maryland as soon as possible and then email a copy of your new Maryland voter registration card to admissionsresidency@towson.edu.";
			//strDefaulText = "Please email a copy of your voter card to admissionsresidency@towson.edu. If you are currently registered to vote in another state, please change your voter registration over to Maryland as soon as possible and then email a copy of your new voter registration card.";
			//strDefaulText = "Please email a copy of your MD voter registration card to TUResidency@towson.edu. If you are currently registered to vote in another state please change your voter registration over to MD as soon as possible and then provide your MD voter registration card to the Admissions Office.";
			//strDefaulText = "Please provide a copy of your Maryland voter registration card to the Admissions Office and an explanation as to why it was held for fewer than 12 months.";
			//strDefaulText = "Please provide a copy of your Maryland voter registration card to the Admissions Office.  (If held for fewer than 12 months, please explain.)";
			strIN_Trns = "N";
			break;
		case 'RVNO':
			strDefaulText = "Your immigration status is not eligible for in-state residency.";
			//strDefaulText = "Your immigration visa is not eligible for in-state residency.";
			//strDefaulText = "The visa type that you hold is not eligible for in-state residency or has not been established for 12 consecutive months.";			
			strIN_Trns = "N";
			break;
		case 'RVR':
			strDefaulText = "A question has been raised about your vehicle registration, please email a copy of your registration to admissionsresidency@towson.edu for clarification.";
			//strDefaulText = "Please email a copy of your vehicle registration to admissionsresidency@towson.edu.";
			//strDefaulText = "Please email TUResidency@towson.edu a copy of your vehicle registration.";
			//strDefaulText = "Please provide a copy of your Maryland vehicle registration to the admissions office and an explanation as to why it was held for fewer than 12 months.";
			//strDefaulText = "Please provide a copy of your Maryland vehicle registration to the admissions office.  (If registered for fewer than 12 months, please explain.)";
			strIN_Trns = "N";
			break;
		/**case 'RVSG':
			strDefaulText = "Please provide a copy of your guardian's legal immigration visa to the Admissions Office.";
			break;*/
		case 'RVSS':
			strDefaulText = "You indicated that you are not a US citizen. Please provide a copy of your immigration visa to admissionsresidency@towson.edu.";
			//strDefaulText = "Please email a copy of your legal immigration visa to admissionsresidency@towson.edu.";
			//strDefaulText = "Please email a copy of your legal immigration visa to TUResidency@towson.edu";
			//strDefaulText = "Please provide a copy of your legal immigration visa to the Admissions Office.";
			break;
		/**case 'RW2':
			strDefaulText = "Please email a copy of your W-2 or paystub to verify that MD income tax is being withheld from your pay. All sensitive information can be blacked out. If you/your guardian filed a MD income tax return for the most recent year please provide that documentation instead.";
			//strDefaulText = "Please provide a copy of your W-2 or paystub to verify that MD income tax is being withheld from you pay.";
			strIN_Trns = "N";
			break;*/
		case 'RWARD':
			strDefaulText = "You indicated that you are a Ward of the State or Unaccompanied Homeless Youth residing in Maryland. Please email supporting documentation to admissionsresidency@towson.edu. If this is a mistake and you are financially dependent upon a parent/guardian please email us for a new residency determination form.";
			//strDefaulText = "Please email court documentation verifying that you are a Ward of the State of Maryland or an Unaccompanied Homeless Youth residing in Maryland to admissionsresidency@towson.edu. If you are not a Ward of the State or an Unaccompanied Homeless Youth please email us to request a new residency determination form.";
			//strDefaulText = "Please email court documentation verifying that you are a Ward of the State of Maryland or an Unaccompanied Homeless Youth residing in Maryland.";
			//strDefaulText = "Please provide a copy of your court documentation verifying that you are a ward of the state of Maryland or an unaccompanied homeless youth residing in Maryland.";
			break;
		case 'TRNCR':
			strDefaulText = "A preliminary review of your academic history to date indicates you will receive approximately XX transfer credits.";
			strIN_Trns = "N";
			break;
		case 'TRNIC':
			strDefaulText = "Your international coursework has not been evaluated by TU. Coursework completed at an international institution may be considered for transfer credit in consultation with the academic department on a case-by-case basis.  Email transfer@towson.edu to learn more about the process for submitting course information for review.";
			strIN_Trns = "N";
			break;
		case 'TRNLG':
			strDefaulText = "A preliminary review of your academic history to date indicates you will receive approximately XX transfer credits. Please be aware that your admission is contingent upon maintaining a cumulative (combined) GPA above 2.0. Should you choose to enroll, you will be required to submit your current semester transcript to University Admissions prior to orientation to verify our GPA requirement.";
			//strDefaulText = "Please be aware that your admission is contingent upon maintaining a cumulative (combined) GPA above 2.0. Should you choose to enroll, you will be required to submit your current semester transcript to University Admissions prior to orientation to verify our GPA requirement.";
			strIN_Trns = "N";
			break;
		case 'TRNNA':
			strDefaulText = "Your transfer institution is not regionally accredited.  However, coursework completed at institutions that are not regionally accredited may be considered for transfer credit in consultation with the academic department on a case-by-case basis.  Email transfer@towson.edu to learn more about the process for submitting course information for review.";			
			//strDefaulText = "Because Towson University transfers credit only from regionally accredited institutions, and because the institution you attended is not accredited by a regional association, you therefore will not receive any credits in transfer.";
			strIN_Trns = "N";
			break;
		case 'TRNVA':
			strDefaulText = "Official documentation of your military service credits must be submitted via Joint Services Transcript, available through the DoD. To request an evaluation of these credits, please contact transfer@towson.edu.";			
			strIN_Trns = "N";
			break;
		case 'TRN1S':
			strDefaulText = "You have been admitted before the completion of your first semester of college. This offer of admission is contingent upon the receipt of your final transcript from [xxCollege/Universityxx] with a 2.00 GPA or higher. Once you complete the semester, please send us an official transcript to verify. You will not be able to enroll in Spring courses without the transcript being presented to University Admissions.";
			//strDefaulText = "You have been admitted before the completion of your first semester of college. This offer of admission is contingent upon the receipt of your final transcript from [xxCollege/Universityxx] with a 2.75 GPA or higher with at least 12 transferrable credits. Once you complete the semester, please send us an official transcript to verify. You will not be able to enroll in Spring courses without the transcript being presented to University Admissions.";
			//strDefaulText = "You have been admitted before the completion of your first semester of college. This offer of admission is contingent upon the receipt of your final transcript from [XXCollege/UniversityXX] with a 2.75 GPA or higher. Once you complete the semester please send us an official transcript to verify. You will not be able to enroll in Spring courses without the transcript being presented to University Admissions.";
			break;
		case 'USB1':
			strDefaulText = "All Core requirements have been met through the coursework and academic courses taken during your previous degree.";
			strIN_Trns = "N";
			break;
		case 'USB2':
			strDefaulText = "All Core requirements have been met through the coursework taken during your previous degree, with the exception of the Advanced Composition (Core 9) course. The Advanced Composition course must be completed at TU prior to graduation.  For the complete list of Advanced Composition courses, please refer to the Towson University catalogue.  In many cases, the course may be part of your major''s curriculum requirements.";
			strIN_Trns = "N";
			break;
		case 'USB3':
			strDefaulText = "You have been admitted before the completion of your bachelor''s degree. This offer of admission is contingent upon the receipt and verification of your degree. Please send your official transcript to University Admissions upon completion of your current semester.";
			strIN_Trns = "N";
			break;
		case '':  //first empty slot selected. remove all entries on this row.
			strDefaulText = "";
			strIN_Lttr = "";
			strIN_Trns = "";
			break;
		default:  //what to do here?
			strDefaulText = "Your sign here.";
			strIN_Lttr = "";
			strIN_Trns = "";
			break;
	}  //end of switch of comment_value code

	//Get current date to put on form
	var now = new Date();
	var month = (now.getMonth()+1).toString().length == 1 ? "0"+(now.getMonth()+1):(now.getMonth()+1);
	var day = now.getDate().toString().length == 1 ? "0"+now.getDate():now.getDate();
	var currentDate = month + "/" + day + "/" + now.getFullYear();

	//Second, set form elements based on which of three rows we are on
	document.getElementById("txtPS_Comment_User" + rownum).value = currentUser;  //currentUser defined on form
	document.getElementById("txtPS_Comment_Date" + rownum).value = currentDate;
	document.getElementById("txaPS_Comment_Text" + rownum).value = strDefaulText;  //textarea that is displayed but not stored in xml
	document.getElementById("txtPS_Comment_Text" + rownum).value = strDefaulText;  //hidden input box that is stored in xml and will be copied to PS
	document.getElementById("txtPS_Comment_Lttr" + rownum).value = strIN_Lttr;
	document.getElementById("txtPS_Comment_Trns" + rownum).value = strIN_Trns;
	if (comment_value == '')
	{
		document.getElementById("txtPS_Comment_User" + rownum).value = "";
		document.getElementById("txtPS_Comment_Date" + rownum).value = "";
	}
	//set focus to comment textarea
	//document.getElementById("txaPS_Comment_Text" + rownum).focus()
}

function popPSCommentsTXA()
{  //onload of form to populate textarea 
	//TechHelp 117184 - take data from text field and put in textarea for display and changing.
	document.getElementById("txaPS_Comment_Text1").value = document.getElementById("txtPS_Comment_Text1").value;
	document.getElementById("txaPS_Comment_Text2").value = document.getElementById("txtPS_Comment_Text2").value;
	document.getElementById("txaPS_Comment_Text3").value = document.getElementById("txtPS_Comment_Text3").value;
}

function popPSCommentsTXT()
{  //onblur of textarea to populate text Input box for storage
	//TechHelp 117184 - When textarea changes put in text field.
	//alert("hi");
	document.getElementById("txtPS_Comment_Text1").value = document.getElementById("txaPS_Comment_Text1").value;
	document.getElementById("txtPS_Comment_Text2").value = document.getElementById("txaPS_Comment_Text2").value;
	document.getElementById("txtPS_Comment_Text3").value = document.getElementById("txaPS_Comment_Text3").value;
}
