//TU_ADM_LIB_SQL_Queries.js

//UPDATE HISTORY
//02/24/2014 IN Team - New queries for GRAD only checklist items
//04/02/2014 JMT - Move GS queries here. Like above but use ADM_APPL_NBR instead of Admit_Term to retrieve from PS
//07/09/2014 JMT - added two queries for MaxDateLoaded for SAT & ACT
//09/09/2014 JMT - UGRD queries updated for 2015 applications. TechHelp 81151
//09/18/2014 JMT - Needed to change QUERY_TU_IM_TRANSCRIPT_INFO to exclude HS records. Only keep if CEEB code length = 4. TechHelp 82814.
//08/31/2015 ECB - UGRD queries updated for 2016 applications. TechHelp 129185
//10/21/2015 JMT & ECB - TechHelp 136423. For QUERY_TU_IM_BIO_DEMO, exclude addresses of 8000 York Rd used for intl students.
//10/26/2015 JMT - TechHelp 136423. For QUERY_TU_IM_BIO_DEMO, changed to "Not Like" instead of <> for variations in TU address.
//08/26/2016 JMT & ECB - TechHelp 173296. Change the UG16 to UG17
//09/08/2017 ECB - UGRD queries updated for 2018 applications, change the UG17 to UG18. TechHelp 214153
//02/22/2018 JMT - Techhelp 231610 - A college transcript will update a TRN% value and change it to R in PeopleSoft. (not the normal C)
//10/30/2018 ECB - Change over Admissions processing to 2019
//09/05/2019 ECB - Change over Admissions processing to 2020
//09/26/2019 JMT - TH 307854 New queries for checklist ADMP / TREVAL. Replacing _TRN series of queries.
//01/27/2020 JM - TechHelp 322287 New queries for routing logic for TREVAL items

#define CHECKLIST_CDS_FOR_QUERY "'UG20TR','UG20FR','GRAD'"  //###
#define CHECKLIST_FRESHMAN_CDS "'UG20FR'" 

/******************* NOTE ***********************************************/
//   If you change the order of the sql columns or add additional fields 
//   the script logic will need to be modified to handle these changes
/******************* NOTE ***********************************************/
//BEGIN TechHelp 136423. For QUERY_TU_IM_BIO_DEMO, exclude addresses of 8000 York Rd used for intl students.
var QUERY_TU_IM_BIO_DEMO = "SELECT DISTINCT A.EMPLID, A.ADM_APPL_NBR, A.ADMIT_TERM, A.NAME, A.ADMIT_TYPE, A.ADDRESS1, A.CITY, A.STATE, A.POSTAL, A.COUNTY, A.SEX, A.ACAD_PROG, A.RESIDENCY, A.ACAD_PLAN, A.ACAD_SUB_PLAN FROM SYSADM.PS_TU_IM_BIODEM_VW A WHERE (A.EMPLID = '%s' AND A.ADMIT_TERM = '%s' AND A.ADDRESS1 Not Like '8000 York R%%')";
//var QUERY_TU_IM_BIO_DEMO = "SELECT DISTINCT A.EMPLID, A.ADM_APPL_NBR, A.ADMIT_TERM, A.NAME, A.ADMIT_TYPE, A.ADDRESS1, A.CITY, A.STATE, A.POSTAL, A.COUNTY, A.SEX, A.ACAD_PROG, A.RESIDENCY, A.ACAD_PLAN, A.ACAD_SUB_PLAN FROM SYSADM.PS_TU_IM_BIODEM_VW A WHERE (A.EMPLID = '%s' AND A.ADMIT_TERM = '%s' AND A.ADDRESS1 <> '8000 York Rd')";
//var QUERY_TU_IM_BIO_DEMO = "SELECT DISTINCT A.EMPLID, A.ADM_APPL_NBR, A.ADMIT_TERM, A.NAME, A.ADMIT_TYPE, A.ADDRESS1, A.CITY, A.STATE, A.POSTAL, A.COUNTY, A.SEX, A.ACAD_PROG, A.RESIDENCY, A.ACAD_PLAN, A.ACAD_SUB_PLAN FROM SYSADM.PS_TU_IM_BIODEM_VW A WHERE ( A.EMPLID = '%s'AND A.ADMIT_TERM = '%s' )";
//END TechHelp 136423. For QUERY_TU_IM_BIO_DEMO, exclude addresses of 8000 York Rd used for intl students.

var QUERY_TU_IM_HIGH_SCHOOL = "SELECT A.EMPLID, A.EXT_GPA, A.CLASS_RANK, A.CLASS_SIZE, A.CONVERT_GPA, A.PERCENTILE, A.EXT_ORG_ID, A.DESCR FROM SYSADM.PS_TU_IM_HIGHSH_VW A WHERE A.EMPLID = '%s' AND A.DESCR <> 'CUM GPA'";
var QUERY_TU_IM_SPECIAL_POPULATION = "SELECT A.EMPLID, A.ADMIT_TERM, A.ADM_APPL_NBR, A.TU_ATHLETE, A.TU_SECOND_BACHLOR, A.TU_TWOPLUSTWO, A.TU_SPECIAL_CONS, A.TU_PANAMA, A.TU_FINE_ARTS, A.TU_TOP_TEN_PERCENT, A.TU_ADULT_LEARN_VET, A.TU_SPECIAL_TALENT, A.TU_MDS, A.TU_GATEWAY, A.TU_JUD_ACTION FROM SYSADM.PS_TU_IM_SPCL_POPL A WHERE A.EMPLID = '%s' AND A.ADMIT_TERM = '%s'";
var QUERY_TU_IM_TEST_SCORE = "SELECT A.EMPLID, A.ACAD_CAREER, A.ADM_APPL_NBR, A.ADMIT_TERM, A.SAT_COMB_RE_MA, A.SAT_COMB_RE_MA_WR, A.SAT_MATH_MAX, A.SAT_READ_MAX, A.TU_SAT_MAX_DATE, A.TU_ACT_MAX_DATE, A.TU_TOEFL_MAX_DATE, A.SAT_WR_MAX, A.ACT_COMPOSITE, A.ACT_MATH_MAX, A.ACT_ENGL_MAX, A.ACT_WR_MAX, A.ACT_SCIE_MAX, A.ACT_READ_MAX FROM SYSADM.PS_TU_IM_TSTSCR_VW A WHERE A.EMPLID = '%s' AND A.ADMIT_TERM = '%s'";
//var QUERY_TU_IM_TRANSCRIPT_INFO = "SELECT A.EMPLID, A.EXT_ORG_ID, A.DESCR, A.UNT_ATMP_TOTAL, A.UNT_COMP_TOTAL, A.EXT_GPA FROM SYSADM.PS_TU_IM_TRNINF_VW A WHERE A.EMPLID = '%s'";
var QUERY_TU_IM_TRANSCRIPT_INFO = "SELECT A.EMPLID, A.EXT_ORG_ID, A.DESCR, A.UNT_ATMP_TOTAL, A.UNT_COMP_TOTAL, A.EXT_GPA FROM SYSADM.PS_TU_IM_TRNINF_VW A WHERE A.EMPLID = '%s' and LENGTH(A.EXT_ORG_ID)=4";
var QUERY_PS_STATUS = "SELECT CHECKLIST_STATUS FROM SYSADM.PS_PERSON_CHECKLST A WHERE A.ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD IN ("+ CHECKLIST_CDS_FOR_QUERY +") AND A.COMMON_ID = '%s'";  //will not have UGRD and GRAD in same admissions cycle
//next two added 07/2014
var QUERY_MaxDateLoad_SAT = "SELECT MAX(DATE_LOADED) FROM SYSADM.PS_STDNT_TEST_COMP WHERE EMPLID = '%s' AND TEST_ID = 'SAT I'";
var QUERY_MaxDateLoad_ACT = "SELECT MAX(DATE_LOADED) FROM SYSADM.PS_STDNT_TEST_COMP WHERE EMPLID = '%s' AND TEST_ID = 'ACT'";

//BEGIN 04/02/2014 Move GS queries here. Like above but use ADM_APPL_NBR instead of Admit_Term to retrieve from PS
var QUERY_GS_TU_IM_BIO_DEMO = "SELECT DISTINCT A.EMPLID, A.ADM_APPL_NBR, A.ADMIT_TERM, A.NAME, A.ADMIT_TYPE, A.ADDRESS1, A.CITY, A.STATE, A.POSTAL, A.COUNTY, A.SEX, A.ACAD_PROG, A.RESIDENCY, A.ACAD_PLAN, A.ACAD_SUB_PLAN FROM SYSADM.PS_TU_IM_BIODEM_VW A WHERE ( A.EMPLID = '%s'AND A.ADM_APPL_NBR = '%s' )";
//var QUERY_GS_TU_IM_TEST_SCORE = "SELECT A.EMPLID, A.ACAD_CAREER, A.ADM_APPL_NBR, A.ADMIT_TERM, A.SAT_COMB_RE_MA, A.SAT_COMB_RE_MA_WR, A.SAT_MATH_MAX, A.SAT_READ_MAX, A.TU_SAT_MAX_DATE, A.TU_ACT_MAX_DATE, A.TU_TOEFL_MAX_DATE, A.SAT_WR_MAX, A.ACT_COMPOSITE, A.ACT_MATH_MAX, A.ACT_ENGL_MAX, A.ACT_WR_MAX, A.ACT_SCIE_MAX, A.ACT_READ_MAX FROM SYSADM.PS_TU_IM_TSTSCR_VW A WHERE A.EMPLID = '%s' AND A.ADM_APPL_NBR = '%s'";
var QUERY_GS_TU_IM_SPECIAL_POPULATION = "SELECT A.EMPLID, A.ADMIT_TERM, A.ADM_APPL_NBR, A.TU_ATHLETE, A.TU_SECOND_BACHLOR, A.TU_TWOPLUSTWO, A.TU_SPECIAL_CONS, A.TU_PANAMA, A.TU_FINE_ARTS, A.TU_TOP_TEN_PERCENT, A.TU_ADULT_LEARN_VET, A.TU_SPECIAL_TALENT, A.TU_MDS, A.TU_GATEWAY, A.TU_JUD_ACTION FROM SYSADM.PS_TU_IM_SPCL_POPL A WHERE A.EMPLID = '%s' AND A.ADM_APPL_NBR = '%s'";
var QUERY_GS_PS_STATUS = "SELECT CHECKLIST_STATUS FROM SYSADM.PS_PERSON_CHECKLST A WHERE A.ADMIN_FUNCTION = 'ADMA' AND A.CHECKLIST_CD ='GRAD' AND A.COMMON_ID = '%s'";
//END 04/02/2014 Move GS queries here. Like above but use ADM_APPL_NBR instead of Admit_Term to retrieve from PS

//renamed 05/01/2013 for Admissions to better maintain logic
var strChecklistSEQ_A = "select B.CHECKLIST_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd like 'EDUC%'" 
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS <> 'C'"
							+ " AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD IN (" + CHECKLIST_CDS_FOR_QUERY + ")"
							+ " AND A.COMMON_ID = '<CommonID>' AND A.ASSOC_ID = '<AssocID>'";
							 
var strChecklistItemCD_A = "select A.CHKLST_ITEM_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd like 'EDUC%'" 
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS <> 'C'"
							+ " AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD IN (" + CHECKLIST_CDS_FOR_QUERY + ")"
							+ " AND A.COMMON_ID = '<CommonID>' AND A.SEQ_3C = <Seq3C> AND A.ASSOC_ID = '<AssocID>'";

//added 05/010/2013 if checklist item is complete, route to UG Decision Final
var strChecklistSEQ_Complete = "select B.CHECKLIST_CD, CHECKLIST_SEQ"  //similar to above query
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd like 'EDUC%'" 
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS = 'C'"  //was <> changed to =
							+ " AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD IN (" + CHECKLIST_CDS_FOR_QUERY + ")"
							+ " AND A.COMMON_ID = '<CommonID>' AND A.ASSOC_ID = '<AssocID>'";
var strChecklistItemCD_Complete = "select A.CHKLST_ITEM_CD, CHECKLIST_SEQ"  //similar to above query
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd like 'EDUC%'" 
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS = 'C'"  //was <> changed to =
							+ " AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD IN (" + CHECKLIST_CDS_FOR_QUERY + ")"
							+ " AND A.COMMON_ID = '<CommonID>' AND A.SEQ_3C = <Seq3C> AND A.ASSOC_ID = '<AssocID>'";

//added 05/01/2013 to include REGI readmits
var strChecklistSEQ_R = "select B.CHECKLIST_CD, CHECKLIST_SEQ"
						+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
						+ " where A.chklst_item_cd = 'TRNS'"
						 + " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
						 + " AND A.ITEM_STATUS <> 'C'"
						 + " AND ADMIN_FUNCTION = 'SPRG' AND CHECKLIST_CD IN ('EXTERN','TRFR','READMT')"
						 + " AND A.COMMON_ID = '<CommonID>' AND A.ASSOC_ID = '<AssocID>'";

var strChecklistItemCD_R = "select A.CHKLST_ITEM_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd = 'TRNS'"
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS <> 'C'"
							+ " AND ADMIN_FUNCTION = 'SPRG' AND CHECKLIST_CD IN ('EXTERN','TRFR','READMT')"
							+ " AND A.COMMON_ID = '<CommonID>' AND A.SEQ_3C = <Seq3C> AND A.ASSOC_ID = '<AssocID>'";

//renamed 05/10/2013 for HS Final transcript checklist item search and update
var strChecklistSEQ_HSFinal = "select B.CHECKLIST_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd = 'HSFINL'" 
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS <> 'C'"
							+ " AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD = 'HSFINL'"
							+ " AND A.COMMON_ID = '<CommonID>'";// AND A.ASSOC_ID = '<AssocID>'";
							 
var strChecklistItemCD_HSFinal = "select A.CHKLST_ITEM_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd = 'HSFINL'"  
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS <> 'C'"
							+ " AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD = 'HSFINL'"
							+ " AND A.COMMON_ID = '<CommonID>'";// AND A.SEQ_3C = <Seq3C> AND A.ASSOC_ID = '<AssocID>'";

var strChecklistSEQ_Complete_HSFinal = "select B.CHECKLIST_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd = 'HSFINL'" 
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS = 'C'"  //was <>
							+ " AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD = 'HSFINL'"
							+ " AND A.COMMON_ID = '<CommonID>'";// AND A.ASSOC_ID = '<AssocID>'";

var strChecklistItemCD_Complete_HSFinal = "select A.CHKLST_ITEM_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd = 'HSFINL'"  
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS = 'C'"  //was <> changed to =
							+ " AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD = 'HSFINL'"
							+ " AND A.COMMON_ID = '<CommonID>'";// AND A.SEQ_3C = <Seq3C> AND A.ASSOC_ID = '<AssocID>'";

//added 02/24/2014 for GRAD checklist items
var strChecklistSEQ_A_GRAD = "select B.CHECKLIST_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd like 'EDUC%'" 
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS <> 'C'"
							+ " AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD = 'GRAD'"
							+ " AND A.COMMON_ID = '<CommonID>' AND A.ASSOC_ID = '<AssocID>'";
							 
var strChecklistItemCD_A_GRAD = "select A.CHKLST_ITEM_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd like 'EDUC%'" 
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS <> 'C'"
							+ " AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD = 'GRAD'"
							+ " AND A.COMMON_ID = '<CommonID>' AND A.SEQ_3C = <Seq3C> AND A.ASSOC_ID = '<AssocID>'";

//added 02/24/2014 for GRAD complete checklist items
var strChecklistSEQ_Complete_GRAD = "select B.CHECKLIST_CD, CHECKLIST_SEQ"  //similar to above query
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd like 'EDUC%'" 
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS = 'C'"  //was <> changed to =
							+ " AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD = 'GRAD'"
							+ " AND A.COMMON_ID = '<CommonID>' AND A.ASSOC_ID = '<AssocID>'";
var strChecklistItemCD_Complete_GRAD = "select A.CHKLST_ITEM_CD, CHECKLIST_SEQ"  //similar to above query
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd like 'EDUC%'" 
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS = 'C'"  //was <> changed to =
							+ " AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD = 'GRAD'"
							+ " AND A.COMMON_ID = '<CommonID>' AND A.SEQ_3C = <Seq3C> AND A.ASSOC_ID = '<AssocID>'";

//BEGIN Techhelp 307854 - New queries looking for ADMP and item code TREVAL 
var strChecklistSEQ_TREVAL = "select B.CHECKLIST_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd like 'TRN%'"
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS <> 'C'"
							+ " AND ADMIN_FUNCTION = 'ADMP' AND CHECKLIST_CD = 'TREVAL'"
							+ " AND A.COMMON_ID = '<CommonID>' AND A.ASSOC_ID = '<AssocID>'";
var strChecklistItemCD_TREVAL = "select A.CHKLST_ITEM_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd like 'TRN%'"
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS <> 'C'"
							+ " AND ADMIN_FUNCTION = 'ADMP' AND CHECKLIST_CD = 'TREVAL'"
							+ " AND A.COMMON_ID = '<CommonID>' AND A.SEQ_3C = <Seq3C> AND A.ASSOC_ID = '<AssocID>'";
var strChecklistSEQ_Complete_TREVAL = "select B.CHECKLIST_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd like 'TRN%'"
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS = 'C'"
							+ " AND ADMIN_FUNCTION = 'ADMP' AND CHECKLIST_CD = 'TREVAL'"
							+ " AND A.COMMON_ID = '<CommonID>' AND A.ASSOC_ID = '<AssocID>'";
var strChecklistItemCD_TREVAL_Complete = "select A.CHKLST_ITEM_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd like 'TRN%'"
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS = 'C'"
							+ " AND ADMIN_FUNCTION = 'ADMP' AND CHECKLIST_CD = 'TREVAL'"
							+ " AND A.COMMON_ID = '<CommonID>' AND A.SEQ_3C = <Seq3C> AND A.ASSOC_ID = '<AssocID>'";
//END Techhelp 307854 - A college transcript will update a TRN% value and change it to R in PeopleSoft. (not the normal C)

//BEGIN TechHelp 322287 New queries for routing logic for TREVAL items
var strChecklistANY_TREVAL = "select B.CHECKLIST_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd like 'TRN%'"
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							//+ " AND A.ITEM_STATUS <> 'C'"
							+ " AND ADMIN_FUNCTION = 'ADMP' AND CHECKLIST_CD = 'TREVAL'"
							+ " AND A.COMMON_ID = '<CommonID>' AND A.ASSOC_ID = '<AssocID>'";
//END TechHelp 322287 New queries for routing logic for TREVAL items

//used by TU_ADM_Defer_Inbound.js
var strGetSEQ_3C = "select CHECKLIST_CD, SEQ_3C "
				+ "from sysadm.PS_PERSON_CHECKLST "
				+ "where COMMON_ID = '<CommonID>' " 
				+ "AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_STATUS <> 'C' AND CHECKLIST_CD = " + CHECKLIST_FRESHMAN_CDS

var strGetMAXSEQ_3C = "select MAX(SEQ_3C) as SEQ_3C "
							+ "from sysadm.PS_PERSON_CHECKLST "
							+ "where COMMON_ID = '<CommonID>' " 
							+ "AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD = " + CHECKLIST_FRESHMAN_CDS


//Checklist item GRADES. CSR-9999 Added 06/2013 by JMT. Next 4 queries
var strGradesSEQ_A = "select B.CHECKLIST_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd = 'GRADES'" 
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS <> 'C'"
							+ " AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD = " + CHECKLIST_FRESHMAN_CDS
							+ " AND A.COMMON_ID = '<CommonID>'";
							 
var strGradesItemCD_A = "select A.CHKLST_ITEM_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd = 'GRADES'" 
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS <> 'C'"
							+ " AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD = " + CHECKLIST_FRESHMAN_CDS
							+ " AND A.COMMON_ID = '<CommonID>' AND A.SEQ_3C = <Seq3C>";

//If GRADES checklist item is complete, route to UG Decision Final. Similar to above 2 queries
var strGradesSEQ_Complete = "select B.CHECKLIST_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd = 'GRADES'" 
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS = 'C'"  //was <> changed to =
							+ " AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD = " + CHECKLIST_FRESHMAN_CDS
							+ " AND A.COMMON_ID = '<CommonID>'";
var strGradesItemCD_Complete = "select A.CHKLST_ITEM_CD, CHECKLIST_SEQ" 
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd = 'GRADES'" 
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS = 'C'"  //was <> changed to =
							+ " AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD = " + CHECKLIST_FRESHMAN_CDS
							+ " AND A.COMMON_ID = '<CommonID>' AND A.SEQ_3C = <Seq3C>";

/**TechHelp 307854 - The below series is deprecated. 
//BEGIN Techhelp 231610 - A college transcript will update a TRN% value and change it to R in PeopleSoft. (not the normal C)
var strChecklistSEQ_TRN = "select B.CHECKLIST_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd like 'TRN%'" 
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS <> 'R'"
							+ " AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD IN (" + CHECKLIST_CDS_FOR_QUERY + ")"
							+ " AND A.COMMON_ID = '<CommonID>' AND A.ASSOC_ID = '<AssocID>'";
var strChecklistItemCD_TRN = "select A.CHKLST_ITEM_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd like 'TRN%'" 
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS <> 'R'"
							+ " AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD IN (" + CHECKLIST_CDS_FOR_QUERY + ")"
							+ " AND A.COMMON_ID = '<CommonID>' AND A.SEQ_3C = <Seq3C> AND A.ASSOC_ID = '<AssocID>'";
var strChecklistSEQ_Complete_TRN = "select B.CHECKLIST_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd like 'TRN%'" 
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS = 'R'"
							+ " AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD IN (" + CHECKLIST_CDS_FOR_QUERY + ")"
							+ " AND A.COMMON_ID = '<CommonID>' AND A.ASSOC_ID = '<AssocID>'";
var strChecklistItemCD_TRN_Complete = "select A.CHKLST_ITEM_CD, CHECKLIST_SEQ"
							+ " from sysadm.ps_person_chk_item A, sysadm.PS_PERSON_CHECKLST B"
							+ " where A.chklst_item_cd like 'TRN%'" 
							+ " AND A.COMMON_ID = B.COMMON_ID AND A.SEQ_3C = B.SEQ_3C"
							+ " AND A.ITEM_STATUS = 'R'"
							+ " AND ADMIN_FUNCTION = 'ADMA' AND CHECKLIST_CD IN (" + CHECKLIST_CDS_FOR_QUERY + ")"
							+ " AND A.COMMON_ID = '<CommonID>' AND A.SEQ_3C = <Seq3C> AND A.ASSOC_ID = '<AssocID>'";
//END Techhelp 231610 - A college transcript will update a TRN% value and change it to R in PeopleSoft. (not the normal C)
*/

