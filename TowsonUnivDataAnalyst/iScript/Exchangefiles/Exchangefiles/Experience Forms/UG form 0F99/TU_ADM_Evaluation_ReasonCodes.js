/** Change History
	09/17/2015 TechHelp 132179 - JMT - Added value for ["Deny"]["INTL"]   -->
	03/13/2017 TechHelp 196504 - ECB - Uncommented out reasonCode NSP for Deny   -->
	09/08/2017 TechHelp 217135 - ECB - Changes to easonCodes for Defer Decision   -->
	09/08/2017 TechHelp 227497 - ECB - Changes (again) to Gateway easonCodes for Defer Decision   -->
	04/18/2018 TechHelp 242166 - ECB - Enabled "No Space" as a reason code for Withdraw Administrative decision  -->
	09/04/2019 TechHelp 301961 - All - New admit reason

*/
var reasonCodes = new Array();

reasonCodes["Admit"] = new Array();
reasonCodes["Admit"]["ATHL"] = "Athletics - talent exception";
//reasonCodes["Admit"]["COND"] = "Conditional";
reasonCodes["Admit"]["DANC"] = "Dance - talent exception";
reasonCodes["Admit"]["INTL"] = "International";
reasonCodes["Admit"]["INTP"] = "Pathway International";  //TH 301961
//reasonCodes["Admit"]["MDS"] = "Maryland Distinguished Scholar";
reasonCodes["Admit"]["MUSC"] = "Music - talent exception";
//reasonCodes["Admit"]["PAID"] = "Paid";

reasonCodes["Conditional Admit"] = new Array();
//reasonCodes["Conditional Admit"]["GATE"] = "Gateway";
reasonCodes["Conditional Admit"]["INTL"] = "International";

reasonCodes["Defer Decision"] = new Array();
//reasonCodes["Defer Decision"]["BOTH"] = "Both"; ECB - commented out per Cheryl Mannon, 03/29/2017 TechHelp 197528
reasonCodes["Defer Decision"]["GATE"] = "Gateway"; // ECB - uncommented per Amy Shive, 02/15/2013, , commented out again per Lisa Wood, TechHelp 217135, uncommented again, Ticket 227497
//reasonCodes["Defer Decision"]["HOLD"] = "Hold";
//reasonCodes["Defer Decision"]["SAT"] = "SAT"; ECB - commented out per Cheryl Mannon, 03/29/2017 TechHelp 197528
reasonCodes["Defer Decision"]["GPA"] = "GPA";

reasonCodes["Deny"] = new Array();
//reasonCodes["Deny"]["FRPP"] = "Freshman Transition";
reasonCodes["Deny"]["JA"] = "Judicial Affairs";
reasonCodes["Deny"]["INTL"] = "International";  //09/17/2015 TechHelp 132179 - JMT - Added value for ["Deny"]["INTL"]
reasonCodes["Deny"]["NSP"] = "No Space"; //03/13/2017 TechHelp 196504 - ECB - Uncommented out reasonCode NSP for Deny   -->

//reasonCodes["Matriculated"] = new Array();
//reasonCodes["Matriculated"]["FTS"] = "First Time Student";
//reasonCodes["Matriculated"]["TIN"] = "Transfer Internal";
//reasonCodes["Matriculated"]["TRN"] = "Transfer";
//reasonCodes["Matriculated"]["USB"] = "Second Bachelors";

reasonCodes["Wait List"] = new Array();
reasonCodes["Wait List"]["FTP"] = "FTP";
//reasonCodes["Wait List"]["DFTP"] = "Dual FTP/Wait List offer";

reasonCodes["Withdraw Administrative"] = new Array();
reasonCodes["Withdraw Administrative"]["CA"] = "Cancel Admin";
reasonCodes["Withdraw Administrative"]["CAA"] = "Admin Withdraw App after Admit";
//reasonCodes["Withdraw Administrative"]["CASB"] = "Cancel";
reasonCodes["Withdraw Administrative"]["FLO"] = "Fall Offer";
//reasonCodes["Withdraw Administrative"]["FTP"] = "Freshman Transition";
//reasonCodes["Withdraw Administrative"]["INC"] = "Incomplete";
reasonCodes["Withdraw Administrative"]["NSP"] = "No Space";
reasonCodes["Withdraw Administrative"]["SPO"] = "Spring Offer";
//reasonCodes["Withdraw Administrative"]["SWND"] = "Switch No Decision";
//reasonCodes["Withdraw Administrative"]["WD"] = "Withdraw";

reasonCodes["Withdraw Application"] = new Array();
//reasonCodes["Withdraw Application"]["CA"] = "Cancel Admin";
//reasonCodes["Withdraw Application"]["CAFN"] = "Cancel Financial";
//reasonCodes["Withdraw Application"]["CAML"] = "Cancel Military";
//reasonCodes["Withdraw Application"]["CANC"] = "Cancel";
//reasonCodes["Withdraw Application"]["CASW"] = "Cancel Switch";
//reasonCodes["Withdraw Application"]["CBD"] = "Cancel Before Decision";
//reasonCodes["Withdraw Application"]["SWBD"] = "Switch Before Decision";