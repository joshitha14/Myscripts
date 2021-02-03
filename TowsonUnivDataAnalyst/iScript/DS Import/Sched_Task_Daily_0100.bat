d:
cd \inserver\bin64

intool --cmd run-iscript --file TU_ADM_RefreshQUpdateChecklist.js

intool --cmd run-iscript --file TU_ADM_RefreshQEnrollContract.js

REM 2/18/2019 Moved to once a day due to bug in 7.2.3 how forms are refreshed
intool --cmd run-iscript --file TU_ADM_RefreshQEvaluator.js

cd \inserver\script