d:
cd \inserver\bin64

intool --cmd run-iscript --file TU_ADM_ImportTranscripts.js

REM 01/30/2020 TH 318012 New GS Transcript Import
intool --cmd run-iscript --file GS_Import_Transcripts.js

REM 2/19/2020 TechHelp 327310 Renaming the script filename from "FA_Import_DocuSign.js" to "DS_Import_FA_VerificationForms.js"
intool --cmd run-iscript --file DS_Import_FA_VerificationForms.js

REM 2/19/2020 TechHelp 327310 Renaming the script filename from "AP_Import_DocuSign.js" to "DS_Import_CPP_AP.js"
intool --cmd run-iscript --file DS_Import_CPP_AP.js

REM TechHelp 259814 - AP MEV DocuSign
REM 2/19/2020 TechHelp 327310 Renaming the script filename from "AP_MEV_Import_DocuSign.js" to "DS_Import_AP_MEV.js"
intool --cmd run-iscript --file DS_Import_AP_MEV.js

REM TechHelp 320684 - PBO_CanReimb_Import_DocuSign.js
REM 2/19/2020 TechHelp 327310 Renaming the script filename from "PBO_CanReimb_Import_DocuSign" to "DS_Import_PBO_CanReimb.js"
intool --cmd run-iscript --file DS_Import_PBO_CanReimb.js

REM TechHelp 291764 - FS_IC_Import_DocuSign
REM 02/19/2020 TechHelp 327310 Renaming the script filename from "FS_IC_Import_DocuSign.js" to "DS_Import_Proc_IndpContract.js"
intool --cmd run-iscript --file DS_Import_Proc_IndpContract.js

REM TechHelp 291903 - FS_Requisition_Import_DocuSign
REM 02/19/2020 TechHelp 327310 Renaming the script filename from "FS_Requisition_Import_DocuSign.js" to "DS_Import_Proc_Requisition.js"
intool --cmd run-iscript --file DS_Import_Proc_Requisition.js

REM TechHelp 295631 - FS_ProCard_Import_DocuSign
REM 02/19/2020 TechHelp 327310 Renaming the script filename from "FS_ProCard_Import_DocuSign.js" to "DS_Import_Proc_ProCard.js"
intool --cmd run-iscript --file DS_Import_Proc_ProCard.js

intool --cmd run-iscript --file TU_ADM_RefreshQAppIncomplete.js

REM 2/18/2019 Moved to once a day due to bug in 7.2.3 how forms are refreshed
REM 01/16/2020 TH 321531 back to 3 times per day. Also kept at 01:00
intool --cmd run-iscript --file TU_ADM_RefreshQEvaluator.js

REM TechHelp 276673 - UGRD No TU ID has separate drawer and not in workflow. Moved to every 3 hours.
REM What to do with below? Takes over 1.5 hours in fall. Only runs all queues after 6 PM.
REM intool --cmd run-iscript --file TU_ADM_NO_TU_ID_Index.js

cd \inserver\script