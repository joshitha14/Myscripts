d:
cd \inserver\bin64

intool --cmd run-iscript --file GS_RefreshQ_No_TU_ID.js

intool --cmd run-iscript --file GS_Refresh_TRANS_Checklist.js

intool --cmd run-iscript --file GS_Refresh_PLAN_Checklist.js

rem The below script updates two queues
intool --cmd run-iscript --file GS_RefreshQ_Forms.js

intool --cmd run-iscript --file GS_RefreshQ_Plan_Incomplete.js

intool --cmd run-iscript --file GS_RefreshQ_DecisionPending.js

intool --cmd run-iscript --file GS_RefreshQ_TOEFL_Checklist.js

intool --cmd run-iscript --file GS_RefreshQ_CRDEVL_Checklist.js

rem Below section is for Financial Services scripts - TechHelp 137520 & 117455 & 136122 & 138228
intool --cmd run-iscript --file FS_Voucher_Archive_Old.js

intool --cmd run-iscript --file FS_Vouchers_UserSync.js

rem Below is for Undergrad Admissions Parchment Transcript Import 
intool --cmd run-iscript --file TU_ADM_ImportTranscripts_Parchment_StoreDoc.js 

REM TechHelp 276673 - UGRD No TU ID has separate drawer and not in workflow
intool --cmd run-iscript --file TU_ADM_NO_ID_DRAWER_Index.js

REM 02/26/2019 TH 281217 Add below script to run once a day. Companion to script above.
intool --cmd run-iscript --file TU_ADM_NO_ID_DRAWER_Index_DocID.js

cd \inserver\script