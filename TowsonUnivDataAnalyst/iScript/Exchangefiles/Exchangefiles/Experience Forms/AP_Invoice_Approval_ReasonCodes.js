var reasonCodes = new Array();

reasonCodes["Approved"] = new Array();
reasonCodes["Approved"]["ATHL"] = "Additional Approval Required";
reasonCodes["Approved"]["COND"] = "Final Approval Please Pay";
//reasonCodes["Approved"]["DANC"] = "Dance";
// reasonCodes["Approved"]["INTL"] = "International";
//reasonCodes["Approved"]["MDS"] = "Maryland Distinguished Scholar";
//reasonCodes["Approved"]["MUSC"] = "Music";
//reasonCodes["Approved"]["PAID"] = "Paid";

reasonCodes["Reject"] = new Array();
reasonCodes["Reject"]["GATE"] = "Other-See Notes for details";
reasonCodes["Reject"]["COND"] = "Paid by Visa";
reasonCodes["Reject"]["HOLD"] = "Paid by Foundation";
//reasonCodes["Defer Decision"]["SAT"] = "SAT";
//reasonCodes["Defer Decision"]["GPA"] = "GPA";

reasonCodes["Hold"] = new Array();
reasonCodes["Hold"]["BOTH"] = "Contacting Vender";
reasonCodes["Hold"]["GATE"] = "Other-See Notes for details";
//reasonCodes["Defer Decision"]["HOLD"] = "Hold";
//reasonCodes["Defer Decision"]["SAT"] = "SAT";
//reasonCodes["Defer Decision"]["GPA"] = "GPA";

reasonCodes["Deny"] = new Array();
reasonCodes["Deny"]["FRPP"] = "Freshman Transition";
reasonCodes["Deny"]["JA"] = "Judicial Affairs";
reasonCodes["Deny"]["NSP"] = "No Space";

reasonCodes["Matriculated"] = new Array();
reasonCodes["Matriculated"]["FTS"] = "First Time Student";
reasonCodes["Matriculated"]["TIN"] = "Transfer Internal";
reasonCodes["Matriculated"]["TRN"] = "Transfer";
reasonCodes["Matriculated"]["USB"] = "Second Bachelors";

reasonCodes["Wait List"] = new Array();
reasonCodes["Wait List"]["FTP"] = "FTP";
reasonCodes["Wait List"]["DFTP"] = "Dual FTP/Wait List offer";

reasonCodes["Withdraw Administrative"] = new Array();
reasonCodes["Withdraw Administrative"]["CA"] = "Cancel Admit";
reasonCodes["Withdraw Administrative"]["CASB"] = "Cancel";
reasonCodes["Withdraw Administrative"]["FLO"] = "Fall Offer";
reasonCodes["Withdraw Administrative"]["FTP"] = "Freshman Transition";
reasonCodes["Withdraw Administrative"]["INC"] = "Incomplete";
reasonCodes["Withdraw Administrative"]["NSP"] = "No Space";
reasonCodes["Withdraw Administrative"]["SPO"] = "Spring Offer";
reasonCodes["Withdraw Administrative"]["SWND"] = "Switch No Decision";
reasonCodes["Withdraw Administrative"]["WD"] = "Withdraw";

reasonCodes["Withdraw Application"] = new Array();
reasonCodes["Withdraw Application"]["CA"] = "Cancel Admit";
reasonCodes["Withdraw Application"]["CAFN"] = "Cancel Financial";
reasonCodes["Withdraw Application"]["CAML"] = "Cancel Military";
reasonCodes["Withdraw Application"]["CANC"] = "Cancel";
reasonCodes["Withdraw Application"]["CASW"] = "Cancel Switch";
reasonCodes["Withdraw Application"]["CBD"] = "Cancel Before Decision";
reasonCodes["Withdraw Application"]["SWBD"] = "Switch Before Decision";