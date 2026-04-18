import axios from "axios";

// Changed to match the modern backend microservice port (8081)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
const TRAINING_API_URL = process.env.NEXT_PUBLIC_TRAINING_URL || "http://localhost:8082";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const trainingApi = axios.create({
  baseURL: TRAINING_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    // Dynamically retrieve the active NextAuth session containing the Keycloak token
    const { getSession } = await import("next-auth/react");
    const session = await getSession();
    if (session && (session as any).accessToken) {
      config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
    }
  }
  return config;
});

trainingApi.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const { getSession } = await import("next-auth/react");
    const session = await getSession();
    if (session && (session as any).accessToken) {
      config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401, it might be a temporary token expiry.
    // We let the next request (which will call getSession again) handle the refresh.
    // Only logged-in pages will redirect via DashboardLayout if the session truly fails.
    if (error.response?.status === 401) {
      console.warn("Unauthorized API call detected.");
    }
    return Promise.reject(error);
  }
);

trainingApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized Training API call detected.");
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API (Legacy mock exports for backward compatibility)
export const authApi = {
  login: (email: string, password: string) => api.post("/api/auth/login", { email, password }),
  register: (data: any) => api.post("/api/auth/register", data),
};

export const userApi = {
  getAll: () => api.get("/api/users"),
  create: (data: any) => api.post("/api/users", data),
  updateRole: (id: number, role: string) => api.put(`/api/users/${id}/role`, { role }),
  delete: (id: number) => api.delete(`/api/users/${id}`),
};

export const employeeApi = {
  getAll: (page = 0, size = 10) => api.get(`/api/employees?page=${page}&size=${size}`),
  getByDepartment: (department: string) => api.get(`/api/employees/department/${department}`),
  getById: (id: number) => api.get(`/api/employees/${id}`),
  create: (data: any) => api.post("/api/employees", data),
  update: (id: number, data: any) => api.put(`/api/employees/${id}`, data),
  delete: (id: number) => api.delete(`/api/employees/${id}`),
};

export const educationRequestApi = {
  create: (data: any) => api.post("/api/education-requests", data),
  createBulk: (data: any) => api.post("/api/education-requests/bulk", data),
  getById: (id: number) => api.get(`/api/education-requests/${id}`),
  getAll: (page = 0, size = 10) => api.get(`/api/education-requests?page=${page}&size=${size}`),
  getMyRequests: (employeeId: string, page = 0, size = 10) => api.get("/api/education-requests/my-requests", { params: { employeeId, page, size } }),
  getByEmployee: (employeeId: number, page = 0, size = 10) => api.get(`/api/education-requests/employee/${employeeId}?page=${page}&size=${size}`),
  getByStatus: (status: string | string[], page = 0, size = 10) => {
    const statusParam = Array.isArray(status) ? status.join(',') : status;
    return api.get(`/api/education-requests/status/${statusParam}?page=${page}&size=${size}`);
  },
  update: (id: number, data: any) => api.put(`/api/education-requests/${id}`, data),
  submitToCenter: (id: number) => api.patch(`/api/education-requests/${id}/submit-to-center`),
  centerReview: (id: number) => api.patch(`/api/education-requests/${id}/center-review`),
  forwardToHr: (id: number) => api.patch(`/api/education-requests/${id}/forward-to-hr`),
  reportByCommittee: (id: number) => api.patch(`/api/education-requests/${id}/report-by-committee`),
  reportByCommitteeBulk: (ids: number[]) => api.post(`/api/education-requests/committee-report`, ids),
  finalApproval: (id: number) => api.patch(`/api/education-requests/${id}/final-approval`),
  delete: (id: number) => api.delete(`/api/education-requests/${id}`),
};

export const educationOpportunityApi = {
  create: (data: any) => api.post("/api/education-opportunities", data),
  getById: (id: number) => api.get(`/api/education-opportunities/${id}`),
  getAll: (page = 0, size = 10) => api.get(`/api/education-opportunities?page=${page}&size=${size}`),
  update: (id: number, data: any) => api.put(`/api/education-opportunities/${id}`, data),
  delete: (id: number) => api.delete(`/api/education-opportunities/${id}`),
};

export const hrVerificationApi = {
  verify: (data: any) => api.post("/api/hr-verifications", data),
  getAll: (page = 0, size = 10) => api.get(`/api/hr-verifications?page=${page}&size=${size}`),
  getByRequestId: (requestId: number) => api.get(`/api/hr-verifications/request/${requestId}`),
  update: (id: number, data: any) => api.put(`/api/hr-verifications/${id}`, data),
  delete: (id: number) => api.delete(`/api/hr-verifications/${id}`),
};

export const cdcScoringApi = {
  getScoringConfig: () => api.get("/api/cdc-scoring/config"),
  updateScoringConfig: (config: any) => api.put("/api/cdc-scoring/config", config),
  score: (data: any) => api.post("/api/cdc-scoring", data),
  getAll: (page = 0, size = 10) => api.get(`/api/cdc-scoring?page=${page}&size=${size}`),
  getByRequestId: (requestId: number) => api.get(`/api/cdc-scoring/request/${requestId}`),
};

export const committeeDecisionApi = {
  decide: (data: any) => api.post("/api/committee-decisions", data),
  getAll: (page = 0, size = 10) => api.get(`/api/committee-decisions?page=${page}&size=${size}`),
  getByRequestId: (requestId: number) => api.get(`/api/committee-decisions/request/${requestId}`),
  update: (id: number, data: any) => api.put(`/api/committee-decisions/${id}`, data),
  delete: (id: number) => api.delete(`/api/committee-decisions/${id}`),
};

export const contractApi = {
  create: (data: any) => api.post("/api/contracts", data),
  getById: (id: number) => api.get(`/api/contracts/${id}`),
  getAll: (page = 0, size = 10) => api.get(`/api/contracts?page=${page}&size=${size}`),
  getByEmployee: (employeeId: number, page = 0, size = 10) => api.get(`/api/contracts/employee/${employeeId}?page=${page}&size=${size}`),
  update: (id: number, data: any) => api.put(`/api/contracts/${id}`, data),
  delete: (id: number) => api.delete(`/api/contracts/${id}`),
};

export const guarantorApi = {
  create: (data: any) => api.post("/api/guarantors", data),
  getByContract: (contractId: number) => api.get(`/api/guarantors/contract/${contractId}`),
  update: (id: number, data: any) => api.put(`/api/guarantors/${id}`, data),
  delete: (id: number) => api.delete(`/api/guarantors/${id}`),
};

export const witnessApi = {
  create: (data: any) => api.post("/api/witnesses", data),
  getByContract: (contractId: number) => api.get(`/api/witnesses/contract/${contractId}`),
  update: (id: number, data: any) => api.put(`/api/witnesses/${id}`, data),
  delete: (id: number) => api.delete(`/api/witnesses/${id}`),
};

export const progressReportApi = {
  create: (data: any) => api.post("/api/progress-reports", data),
  getByContract: (contractId: number, page = 0, size = 10) => api.get(`/api/progress-reports/contract/${contractId}?page=${page}&size=${size}`),
  getAll: (page = 0, size = 10) => api.get(`/api/progress-reports?page=${page}&size=${size}`),
  update: (id: number, data: any) => api.put(`/api/progress-reports/${id}`, data),
  delete: (id: number) => api.delete(`/api/progress-reports/${id}`),
};

export const completionApi = {
  create: (data: any) => api.post("/api/education-completions", data),
  getByContract: (contractId: number) => api.get(`/api/education-completions/contract/${contractId}`),
  getAll: (page = 0, size = 10) => api.get(`/api/education-completions?page=${page}&size=${size}`),
  update: (id: number, data: any) => api.put(`/api/education-completions/${id}`, data),
  delete: (id: number) => api.delete(`/api/education-completions/${id}`),
};

export const serviceObligationApi = {
  create: (data: any) => api.post("/api/service-obligations", data),
  getByContract: (contractId: number) => api.get(`/api/service-obligations/contract/${contractId}`),
  getAll: (page = 0, size = 10) => api.get(`/api/service-obligations?page=${page}&size=${size}`),
  update: (id: number, data: any) => api.put(`/api/service-obligations/${id}`, data),
  delete: (id: number) => api.delete(`/api/service-obligations/${id}`),
};
