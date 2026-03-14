import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
  register: (data: Record<string, unknown>) =>
    api.post("/api/auth/register", data),
};

// Education Request API
export const educationRequestApi = {
  create: (data: Record<string, unknown>) =>
    api.post("/api/education-requests", data),
  getById: (id: number) => api.get(`/api/education-requests/${id}`),
  getAll: (page = 0, size = 10) =>
    api.get(`/api/education-requests?page=${page}&size=${size}`),
  getByEmployee: (employeeId: number, page = 0, size = 10) =>
    api.get(`/api/education-requests/employee/${employeeId}?page=${page}&size=${size}`),
  getByStatus: (status: string, page = 0, size = 10) =>
    api.get(`/api/education-requests/status/${status}?page=${page}&size=${size}`),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/api/education-requests/${id}`, data),
};

// HR Verification API
export const hrVerificationApi = {
  verify: (data: Record<string, unknown>) =>
    api.post("/api/hr-verifications", data),
  getAll: (page = 0, size = 10) =>
    api.get(`/api/hr-verifications?page=${page}&size=${size}`),
  getByRequestId: (requestId: number) =>
    api.get(`/api/hr-verifications/request/${requestId}`),
};

// Committee Decision API
export const committeeDecisionApi = {
  decide: (data: Record<string, unknown>) =>
    api.post("/api/committee-decisions", data),
  getAll: (page = 0, size = 10) =>
    api.get(`/api/committee-decisions?page=${page}&size=${size}`),
  getByRequestId: (requestId: number) =>
    api.get(`/api/committee-decisions/request/${requestId}`),
};

// Contract API
export const contractApi = {
  create: (data: Record<string, unknown>) => api.post("/api/contracts", data),
  getById: (id: number) => api.get(`/api/contracts/${id}`),
  getAll: (page = 0, size = 10) =>
    api.get(`/api/contracts?page=${page}&size=${size}`),
  getByEmployee: (employeeId: number, page = 0, size = 10) =>
    api.get(`/api/contracts/employee/${employeeId}?page=${page}&size=${size}`),
};

// Guarantor API
export const guarantorApi = {
  create: (data: Record<string, unknown>) => api.post("/api/guarantors", data),
  getByContract: (contractId: number) =>
    api.get(`/api/guarantors/contract/${contractId}`),
  delete: (id: number) => api.delete(`/api/guarantors/${id}`),
};

// Progress Report API
export const progressReportApi = {
  create: (data: Record<string, unknown>) =>
    api.post("/api/progress-reports", data),
  getByContract: (contractId: number, page = 0, size = 10) =>
    api.get(`/api/progress-reports/contract/${contractId}?page=${page}&size=${size}`),
  getAll: (page = 0, size = 10) =>
    api.get(`/api/progress-reports?page=${page}&size=${size}`),
};

// Completion API
export const completionApi = {
  create: (data: Record<string, unknown>) =>
    api.post("/api/education-completions", data),
  getByContract: (contractId: number) =>
    api.get(`/api/education-completions/contract/${contractId}`),
  getAll: (page = 0, size = 10) =>
    api.get(`/api/education-completions?page=${page}&size=${size}`),
};

// Service Obligation API
export const serviceObligationApi = {
  getByContract: (contractId: number) =>
    api.get(`/api/service-obligations/contract/${contractId}`),
  getAll: (page = 0, size = 10) =>
    api.get(`/api/service-obligations?page=${page}&size=${size}`),
};
