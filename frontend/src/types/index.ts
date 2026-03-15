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
  createdAt: string;
}

export interface AuthResponse {
  id?: number;
  token: string;
  email: string;
  fullName: string;
  role: string;
  employeeId?: number;
}

export interface EducationRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  opportunityId: number;
  educationType: string;
  educationLevel: string;
  institution: string;
  country: string;
  studyMode: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface HRVerification {
  id: number;
  requestId: number;
  workExperience: number;
  performanceScore: number;
  disciplineRecord: boolean;
  verifiedBy: string;
  verifiedAt: string;
}

export interface CommitteeDecision {
  id: number;
  requestId: number;
  decision: string;
  comment: string;
  decidedBy: string;
  decisionDate: string;
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
  createdAt: string;
}

export interface Guarantor {
  id: number;
  contractId: number;
  fullName: string;
  nationalId: string;
  phone: string;
  address: string;
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
  description: string;
  createdAt: string;
  updatedAt: string;
}
