// Training Module Types

export interface TrainingRequest {
  id: number;
  department: string;
  sector?: string;
  trainingTitle: string;
  estimatedCost: number;
  numTrainees: number;
  trainingDuration: string;
  trainingLocation: "Domestic" | "Abroad";
  budgetSource: string;
  specification?: string;
  requesterName?: string;
  requesterId?: number | string;
  status: TrainingStatus;
  reviewNote?: string;
  contractId?: number;
  createdAt: string;
  updatedAt: string;
}

export type TrainingStatus =
  | "SUBMITTED"
  | "APPROVED_DIRECT"
  | "CONTRACT_REQUIRED"
  | "CONTRACT_CREATED"
  | "REJECTED";

export interface TrainingContract {
  id: number;
  requestId: number;
  employeeId: string;
  employeeName: string;
  employeeDepartment: string;
  city: string;
  houseNo?: string;
  email?: string;
  phone: string;
  trainingCountry: string;
  trainingCity: string;
  trainingType: string;
  totalCost: number;
  contractDurationMonths: number;
  signedDate: string;
  status: "ACTIVE" | "COMPLETED" | "VIOLATED";
  createdAt: string;
}

export interface TrainingGuarantor {
  id: number;
  contractId: number;
  fullName: string;
  nationalId: string;
  currentAddress: string;
  birthAddress?: string;
  phone?: string;
  scannedDocument?: string | null;
  createdAt: string;
}

export interface TrainingObligation {
  id: number;
  contractId: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  obligationMonths: number;
  status: "ACTIVE" | "COMPLETED" | "VIOLATED";
  releasedAt?: string;
  guarantorReleased?: boolean;
  createdAt: string;
  updatedAt?: string;
}
