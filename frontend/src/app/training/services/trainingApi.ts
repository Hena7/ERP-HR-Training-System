import { trainingApi } from "@/lib/api";

// ─────────────────────────────────────────────
// Training Request
// ─────────────────────────────────────────────
export const trainingRequestApi = {
  create: (data: any) => trainingApi.post("/api/training-requests", data),

  getAll: () => trainingApi.get("/api/training-requests"),
  
  getMyRequests: (requesterId: string) => trainingApi.get("/api/training-requests/my-requests", { params: { requesterId } }),

  getById: (id: number) => trainingApi.get(`/api/training-requests/${id}`),

  updateStatus: (id: number, status: string, note?: string) => 
    trainingApi.patch(`/api/training-requests/${id}/status`, null, {
      params: { status, note }
    }),
};

// ─────────────────────────────────────────────
// Training Contract
// ─────────────────────────────────────────────
export const trainingContractApi = {
  create: (data: any) => trainingApi.post("/api/training-contracts", data),

  getAll: () => trainingApi.get("/api/training-contracts"),

  getById: (id: number) => trainingApi.get(`/api/training-contracts/${id}`),
};

// ─────────────────────────────────────────────
// Training Guarantor
// ─────────────────────────────────────────────
export const trainingGuarantorApi = {
  create: (data: any) => trainingApi.post("/api/training-guarantors", data),

  getByContract: (contractId: number) => trainingApi.get(`/api/training-guarantors/contract/${contractId}`),

  update: (id: number, data: any) => trainingApi.put(`/api/training-guarantors/${id}`, data),

  delete: (id: number) => trainingApi.delete(`/api/training-guarantors/${id}`),
};

// ─────────────────────────────────────────────
// Obligation Tracking
// ─────────────────────────────────────────────
export const trainingObligationApi = {
  create: (data: any) => trainingApi.post("/api/training-obligations", data),

  getAll: () => trainingApi.get("/api/training-obligations"),

  updateStatus: (id: number, status: string) => 
    trainingApi.patch(`/api/training-obligations/${id}/status`, null, {
      params: { status }
    }),
};
