export interface Employee {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  email: string;
  department: string;
  position: string;
  role: string;
  currentEducationLevel?: string;
  workExperience?: number;
  performanceScore?: number;
  createdAt: string;
}

export type UserRole =
  | "EMPLOYEE"
  | "DEPARTMENT_HEAD"
  | "HR_OFFICER"
  | "CYBER_DEVELOPMENT_CENTER"
  | "COMMITTEE_MEMBER"
  | "DIRECTOR"
  | "PROCUREMENT"
  | "ADMIN";

export interface AuthResponse {
  id?: number;
  token: string;
  email: string;
  fullName: string;
  role: UserRole;
  employeeId?: number;
  department?: string;
}

export interface EducationRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  opportunityId: number;
  educationType: string;
  educationLevel: string;
  institution: string;
  currentEducationLevel: string;
  workExperience: number;
  performanceScore: number;
  employeePhone: string;
  employeeDepartment: string;
  description: string;
  status: string;
  category?: string;
  budgetYear?: number;
  award?: string;
  duration?: number;
  programTime?: string;
  location?: string;
  totalScore?: number;
  fieldOfStudy?: string;
  candidateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HRVerification {
  id: number;
  requestId: number;
  semester1Score: number;
  semester2Score: number;
  averageScore: number;
  hasDiscipline: boolean;
  disciplineDescription?: string;
  status: "VERIFIED" | "REJECTED";
  verifiedBy: string;
  verifiedAt: string;
  // New scoring fields
  experienceYears?: number;
  experienceMonths?: number;
  isDisabled?: boolean;
  experienceSubScore?: number;
  performanceSubScore?: number;
  disciplineSubScore?: number;
  affirmativeBonus?: number;
  totalCalculatedScore?: number;
}

export interface CommitteeDecision {
  id: number;
  requestId: number;
  decision: string;
  comment: string;
  decidedBy: string;
  decisionDate: string;
}

export interface CDCScoring {
  id: number;
  requestId: number;
  experienceScore: number;
  performanceScore: number;
  disciplineScore: number;
  totalScore: number;
  gradedBy: string;
  createdAt: string;
}

export interface Contract {
  id: number;
  employeeId: number;
  employeeName: string;
  requestId: number;
  university: string;
  program: string;
  studyCountry: string;
  studyCity: string;
  durationYears: number;
  studyMode: string;
  estimatedCost: number;
  contractSignedDate: string;
  scannedDocument?: string;
  createdAt: string;
}

export interface Guarantor {
  id: number;
  contractId: number;
  fullName: string;
  nationalId: string;
  phone: string;
  address: string;
  scannedDocument?: string;
  createdAt: string;
}

export interface Witness {
  id: number;
  contractId: number;
  fullName: string;
  nationalId: string;
  phone: string;
  address: string;
  scannedDocument?: string;
  createdAt: string;
}

export interface ProgressReport {
  id: number;
  contractId: number;
  reportMonth: string;
  description: string;
  submittedAt: string;
}

export interface EducationCompletion {
  id: number;
  contractId: number;
  completionDate: string;
  returnToWorkDate: string;
  researchPresentationDate: string;
  createdAt: string;
}

export interface ServiceObligation {
  id: number;
  contractId: number;
  studyYears: number;
  requiredServiceYears: number;
  serviceStartDate: string;
  serviceEndDate: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface EducationOpportunity {
  id: number;
  educationType: string;
  educationLevel: string;
  institution: string;
  department: string;
  targetDepartments: string[];
  description: string;
  status: "OPEN" | "CLOSED" | "EXPIRED";
  deadline: string;
  createdAt: string;
  updatedAt: string;
}
