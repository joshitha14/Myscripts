var reasonCodes = new Array();

reasonCodes["Deny"] = new Array();
reasonCodes["Deny"]["LOWG"] = "LOWG";
reasonCodes["Deny"]["LOWT"] = "LOWT";
//reasonCodes["Deny"]["JA"] = "Judicial Affairs";

reasonCodes["Withdraw Administrative"] = new Array();
reasonCodes["Withdraw Administrative"]["CA"] = "Cancel Admin";
//reasonCodes["Withdraw Administrative"]["CAA"] = "Admin Withdraw App after Admit";

reasonCodes["Admit"] = new Array();
reasonCodes["Admit"]["ATHL"] = "Athletics";
reasonCodes["Admit"]["COND"] = "Conditional";
reasonCodes["Admit"]["DANC"] = "Dance";
reasonCodes["Admit"]["INTL"] = "International";
reasonCodes["Admit"]["MDS"] = "Maryland Distinguished Scholar";
reasonCodes["Admit"]["MUSC"] = "Music";
reasonCodes["Admit"]["PAID"] = "Paid";

reasonCodes["Conditional Admit"] = new Array();
reasonCodes["Conditional Admit"]["GATE"] = "Gateway";

reasonCodes["Defer Decision"] = new Array();
reasonCodes["Defer Decision"]["BOTH"] = "Both";
reasonCodes["Defer Decision"]["GATE"] = "Gateway"; // ECB - uncommented per Amy Shive, 02/15/2013
reasonCodes["Defer Decision"]["HOLD"] = "Hold";
reasonCodes["Defer Decision"]["SAT"] = "SAT";
reasonCodes["Defer Decision"]["GPA"] = "GPA";


reasonCodes["Matriculated"] = new Array();
reasonCodes["Matriculated"]["FTS"] = "First Time Student";
reasonCodes["Matriculated"]["TIN"] = "Transfer Internal";
reasonCodes["Matriculated"]["TRN"] = "Transfer";
reasonCodes["Matriculated"]["USB"] = "Second Bachelors";

reasonCodes["Wait List"] = new Array();
reasonCodes["Wait List"]["FTP"] = "FTP";
reasonCodes["Wait List"]["DFTP"] = "Dual FTP/Wait List offer";


reasonCodes["Withdraw Application"] = new Array();
reasonCodes["Withdraw Application"]["CA"] = "Cancel Admin";
reasonCodes["Withdraw Application"]["CAFN"] = "Cancel Financial";
reasonCodes["Withdraw Application"]["CAML"] = "Cancel Military";
reasonCodes["Withdraw Application"]["CANC"] = "Cancel";
reasonCodes["Withdraw Application"]["CASW"] = "Cancel Switch";
reasonCodes["Withdraw Application"]["CBD"] = "Cancel Before Decision";
reasonCodes["Withdraw Application"]["SWBD"] = "Switch Before Decision";