export type Locale = "en" | "am";

export const translations = {
  en: {
    // Common
    appName: "INSA Education Module",
    orgName: "Information Network Security Administration",
    dashboard: "Dashboard",
    login: "Login",
    logout: "Logout",
    register: "Register",
    submit: "Submit",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    back: "Back",
    loading: "Loading...",
    actions: "Actions",
    status: "Status",
    search: "Search",
    noData: "No data available",
    language: "Language",
    switchLang: "Amharic",
    welcome: "Welcome",

    // Auth
    email: "Email",
    username: "Username",
    or: "or",
    password: "Password",
    loginTitle: "Sign In to Education Module",
    loginSubtitle: "Enter your credentials to access the system",
    registerTitle: "Register New Employee",
    invalidCredentials: "Invalid email or password",

    // Employee
    employeeId: "Employee ID",
    firstName: "First Name",
    lastName: "Last Name",
    fullName: "Full Name",
    gender: "Gender",
    male: "Male",
    female: "Female",
    phone: "Phone",
    department: "Department",
    position: "Position",
    role: "Role",

    // Education Opportunities
    educationOpportunities: "Education Opportunities",
    educationOpportunity: "Education Opportunity",
    newOpportunity: "New Opportunity",
    educationType: "Education Type",
    educationLevel: "Education Level",
    institution: "Institution",
    addOpportunity: "Add Opportunity",
    editOpportunity: "Edit Opportunity",

    // Education Request
    educationRequests: "Education Requests",
    newRequest: "New Education Request",
    editRequest: "Edit Education Request",
    requestedField: "Requested Field",
    requestedLevel: "Requested Level",
    university: "University",
    country: "Country",
    studyMode: "Study Mode",
    onJob: "On Job",
    offJob: "Off Job",
    description: "Description",
    requestStatus: "Request Status",
    submitRequest: "Submit Request",
    myRequests: "My Requests",

    // Status
    PENDING: "Pending",
    HR_VERIFIED: "HR Verified",
    COMMITTEE_REVIEW: "Committee Review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    CONTRACT_CREATED: "Contract Created",

    // HR Verification
    hrVerification: "HR Verification",
    hrVerifications: "HR Verifications",
    workExperience: "Work Experience (Years)",
    performanceScore: "Performance Score",
    disciplineRecord: "Discipline Record",
    hasDisciplineRecord: "Has Discipline Record",
    noDisciplineRecord: "No Discipline Record",
    verifiedBy: "Verified By",
    verifiedAt: "Verified At",
    verifyEmployee: "Verify Employee",

    // Committee
    committeeDecisions: "Committee Decisions",
    committeeDecision: "Committee Decision",
    decision: "Decision",
    comment: "Comment",
    approve: "Approve",
    reject: "Reject",
    decidedBy: "Decided By",

    // Contract
    contracts: "Education Contracts",
    newContract: "New Contract",
    program: "Program",
    studyCountry: "Study Country",
    studyCity: "Study City",
    durationYears: "Duration (Years)",
    estimatedCost: "Estimated Cost",
    contractSignedDate: "Contract Signed Date",
    createContract: "Create Contract",

    // Guarantor
    guarantors: "Guarantors",
    addGuarantor: "Add Guarantor",
    nationalId: "National ID",
    address: "Address",
    maxGuarantors: "Maximum 2 guarantors per contract",

    // Progress Report
    progressReports: "Progress Reports",
    newReport: "New Progress Report",
    reportMonth: "Report Month",
    submitReport: "Submit Report",

    // Completion
    completions: "Education Completions",
    newCompletion: "Record Completion",
    completionDate: "Completion Date",
    returnToWorkDate: "Return to Work Date",
    researchPresentationDate: "Research Presentation Date",

    // Service Obligation
    serviceObligations: "Service Obligations",
    studyYears: "Study Years",
    requiredServiceYears: "Required Service Years",
    serviceStartDate: "Service Start Date",
    serviceEndDate: "Service End Date",
    obligationRule:
      "ON_JOB: Service = Study Years | OFF_JOB: Service = Study Years x 2",

    // Dashboard
    totalRequests: "Total Requests",
    pendingRequests: "Pending Requests",
    approvedRequests: "Approved Requests",
    activeContracts: "Active Contracts",
    recentActivity: "Recent Activity",
    quickActions: "Quick Actions",

    // Roles
    EMPLOYEE: "Employee",
    HR_OFFICER: "HR Officer",
    EDUCATION_CENTER: "Education Center",
    COMMITTEE_MEMBER: "Committee Member",
    DIRECTOR: "Director",
    ADMIN: "Admin",

    // Navigation
    navDashboard: "Dashboard",
    navOpportunities: "Opportunities",
    navRequests: "Education Requests",
    navVerifications: "HR Verifications",
    navDecisions: "Committee Decisions",
    navContracts: "Contracts",
    navGuarantors: "Guarantors",
    navReports: "Progress Reports",
    navCompletions: "Completions",
    navObligations: "Service Obligations",
    navUsers: "Users",
  },
  am: {
    // Common
    appName: "የINSA የትምህርት ሞዱል",
    orgName: "የኢንፎርሜሽን ኔትወርክ ሴኪዩሪቲ አስተዳደር",
    dashboard: "ዳሽቦርድ",
    login: "ግባ",
    logout: "ውጣ",
    register: "ተመዝገብ",
    submit: "አስገባ",
    save: "አስቀምጥ",
    cancel: "ሰርዝ",
    edit: "አርትዕ",
    delete: "ሰርዝ",
    view: "ተመልከት",
    back: "ተመለስ",
    loading: "በመጫን ላይ...",
    actions: "ድርጊቶች",
    status: "ሁኔታ",
    search: "ፈልግ",
    noData: "ምንም ውሂብ የለም",
    language: "ቋንቋ",
    switchLang: "English",
    welcome: "እንኳን ደህና መጡ",

    // Auth
    email: "ኢሜይል",
    username: "የተጠቃሚ ስም",
    or: "ወይም",
    password: "የይለፍ ቃል",
    loginTitle: "ወደ የትምህርት ሞዱል ይግቡ",
    loginSubtitle: "ስርዓቱን ለመድረስ የመግቢያ መረጃዎን ያስገቡ",
    registerTitle: "አዲስ ሰራተኛ ይመዝገቡ",
    invalidCredentials: "ልክ ያልሆነ ኢሜይል ወይም የይለፍ ቃል",

    // Employee
    employeeId: "የሰራተኛ መታወቂያ",
    firstName: "ስም",
    lastName: "የአባት ስም",
    fullName: "ሙሉ ስም",
    gender: "ጾታ",
    male: "ወንድ",
    female: "ሴት",
    phone: "ስልክ",
    department: "ክፍል",
    position: "የስራ ቦታ",
    role: "ሚና",

    // Education Opportunities
    educationOpportunities: "የትምህርት እድሎች",
    educationOpportunity: "የትምህርት እድል",
    newOpportunity: "አዲስ እድል",
    educationType: "የትምህርት አይነት",
    educationLevel: "የትምህርት ደረጃ",
    institution: "ትምህርት የሚሰጥበት ተቋም",
    addOpportunity: "እድል ጨምር",
    editOpportunity: "እድል አርትዕ",

    // Education Request
    educationRequests: "የትምህርት ጥያቄዎች",
    newRequest: "አዲስ የትምህርት ጥያቄ",
    editRequest: "የትምህርት ጥያቄ አርትዕ",
    requestedField: "የተጠየቀ የትምህርት መስክ",
    requestedLevel: "የተጠየቀ ደረጃ",
    university: "ዩኒቨርሲቲ",
    country: "ሀገር",
    studyMode: "የትምህርት ሁኔታ",
    onJob: "በስራ ላይ",
    offJob: "ከስራ ውጪ",
    description: "ማብራሪያ",
    requestStatus: "የጥያቄ ሁኔታ",
    submitRequest: "ጥያቄ አስገባ",
    myRequests: "የእኔ ጥያቄዎች",

    // Status
    PENDING: "በመጠባበቅ ላይ",
    HR_VERIFIED: "በHR ተረጋግጧል",
    COMMITTEE_REVIEW: "በኮሚቴ ግምገማ ላይ",
    APPROVED: "ተፈቅዷል",
    REJECTED: "ተቀባይነት አላገኘም",
    CONTRACT_CREATED: "ውል ተፈጥሯል",

    // HR Verification
    hrVerification: "የHR ማረጋገጫ",
    hrVerifications: "የHR ማረጋገጫዎች",
    workExperience: "የስራ ልምድ (ዓመታት)",
    performanceScore: "የአፈጻጸም ውጤት",
    disciplineRecord: "የዲሲፕሊን መዝገብ",
    hasDisciplineRecord: "የዲሲፕሊን መዝገብ አለ",
    noDisciplineRecord: "የዲሲፕሊን መዝገብ የለም",
    verifiedBy: "ያረጋገጠ",
    verifiedAt: "የተረጋገጠበት ጊዜ",
    verifyEmployee: "ሰራተኛ ያረጋግጡ",

    // Committee
    committeeDecisions: "የኮሚቴ ውሳኔዎች",
    committeeDecision: "የኮሚቴ ውሳኔ",
    decision: "ውሳኔ",
    comment: "አስተያየት",
    approve: "ፈቅድ",
    reject: "አትቀበል",
    decidedBy: "ውሳኔ ሰጪ",

    // Contract
    contracts: "የትምህርት ውሎች",
    newContract: "አዲስ ውል",
    program: "ፕሮግራም",
    studyCountry: "የትምህርት ሀገር",
    studyCity: "የትምህርት ከተማ",
    durationYears: "ቆይታ (ዓመታት)",
    estimatedCost: "ግምታዊ ወጪ",
    contractSignedDate: "ውል የተፈረመበት ቀን",
    createContract: "ውል ፍጠር",

    // Guarantor
    guarantors: "ዋሶች",
    addGuarantor: "ዋስ ጨምር",
    nationalId: "ብሔራዊ መታወቂያ",
    address: "አድራሻ",
    maxGuarantors: "በአንድ ውል ቢበዛ 2 ዋሶች",

    // Progress Report
    progressReports: "የሂደት ሪፖርቶች",
    newReport: "አዲስ የሂደት ሪፖርት",
    reportMonth: "የሪፖርት ወር",
    submitReport: "ሪፖርት አስገባ",

    // Completion
    completions: "የትምህርት ማጠናቀቂያ",
    newCompletion: "ማጠናቀቅ መዝግብ",
    completionDate: "የማጠናቀቂያ ቀን",
    returnToWorkDate: "ወደ ስራ የመመለሻ ቀን",
    researchPresentationDate: "የምርምር አቀራረብ ቀን",

    // Service Obligation
    serviceObligations: "የአገልግሎት ግዴታዎች",
    studyYears: "የትምህርት ዓመታት",
    requiredServiceYears: "አስፈላጊ የአገልግሎት ዓመታት",
    serviceStartDate: "የአገልግሎት መጀመሪያ ቀን",
    serviceEndDate: "የአገልግሎት ማጠናቀቂያ ቀን",
    obligationRule:
      "በስራ ላይ: አገልግሎት = የትምህርት ዓመታት | ከስራ ውጪ: አገልግሎት = የትምህርት ዓመታት x 2",

    // Dashboard
    totalRequests: "ጠቅላላ ጥያቄዎች",
    pendingRequests: "በመጠባበቅ ላይ ያሉ ጥያቄዎች",
    approvedRequests: "የተፈቀዱ ጥያቄዎች",
    activeContracts: "ንቁ ውሎች",
    recentActivity: "የቅርብ እንቅስቃሴ",
    quickActions: "ፈጣን ድርጊቶች",

    // Roles
    EMPLOYEE: "ሰራተኛ",
    HR_OFFICER: "የHR ኦፊሰር",
    EDUCATION_CENTER: "የትምህርት ማእከል",
    COMMITTEE_MEMBER: "የኮሚቴ አባል",
    DIRECTOR: "ዳይሬክተር",
    ADMIN: "አስተዳዳሪ",

    // Navigation
    navDashboard: "ዳሽቦርድ",
    navOpportunities: "እድሎች",
    navRequests: "የትምህርት ጥያቄዎች",
    navVerifications: "የHR ማረጋገጫዎች",
    navDecisions: "የኮሚቴ ውሳኔዎች",
    navContracts: "ውሎች",
    navGuarantors: "ዋሶች",
    navReports: "የሂደት ሪፖርቶች",
    navCompletions: "ማጠናቀቂያ",
    navObligations: "የአገልግሎት ግዴታዎች",
    navUsers: "ተጠቃሚዎች",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] || translations.en[key] || key;
}
