/* --- ORIGINAL BACKEND API (COMMENTED OUT FOR LOCALSTORAGE TESTING) ---
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
--- END ORIGINAL BACKEND API --- */

// ==========================================
// MOCK LOCALSTORAGE API IMPLEMENTATION
// ==========================================

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const getMockData = (key: string) => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  }
  return [];
};

const saveMockData = (key: string, data: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Generic mock api instance to satisfy exports
const api = {
  interceptors: { request: { use: () => {} }, response: { use: () => {} } },
  get: async () => ({ data: {} }),
  post: async () => ({ data: {} }),
  put: async () => ({ data: {} }),
  delete: async () => ({ data: {} }),
};
export default api;

export const authApi = {
  login: async (email: string, password: string) => {
    await delay(500);
    if (!email || !password) throw new Error("Credentials required");

    let users = getMockData("users");
    if (!users || users.length === 0 || !users.find((u: any) => u.email === "admin@gmail.com")) {
      const defaultAdmin = {
        id: 1,
        email: "admin@gmail.com",
        password: "admin",
        fullName: "System Admin",
        role: "ADMIN",
      };
      
      const filteredUsers = users ? users.filter((u: any) => u.email !== "admin") : [];
      filteredUsers.push(defaultAdmin);
      saveMockData("users", filteredUsers);
      users = filteredUsers;
    }

    const user = users.find(
      (u: any) => u.email === email && u.password === password,
    );

    if (user) {
      const mockUser = {
        ...user,
        token: `mock-jwt-token-${user.id}`,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("token", mockUser.token);
        const { password, ...userWithoutPassword } = mockUser;
        localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      }

      const { password, ...userWithoutPassword } = mockUser;
      return { data: userWithoutPassword };
    }
    throw new Error("Invalid credentials");
  },
  register: async (data: Record<string, unknown>) => {
    await delay(500);
    return { data: { ...data, id: Date.now() } };
  },
};

export const userApi = {
  getAll: async () => {
    await delay(300);
    return { data: getMockData("users") };
  },
  create: async (data: any) => {
    await delay(500);
    const users = getMockData("users");
    if (users.find((u: any) => u.email === data.email)) {
      throw new Error("User already exists");
    }
    const newUser = {
      ...data,
      id: Date.now(),
    };
    saveMockData("users", [...users, newUser]);
    return { data: newUser };
  },
  updateRole: async (id: number, role: string) => {
    await delay(300);
    const users = getMockData("users");
    const index = users.findIndex((u: any) => u.id === id);
    if (index !== -1) {
      users[index].role = role;
      saveMockData("users", users);
      return { data: users[index] };
    }
    throw new Error("User not found");
  },
  delete: async (id: number) => {
    await delay(300);
    let users = getMockData("users");
    users = users.filter((u: any) => u.id !== id);
    saveMockData("users", users);
    return { data: { success: true } };
  },
};

export const educationRequestApi = {
  create: async (data: any) => {
    await delay(500);
    const requests = getMockData("educationRequests");
    const newReq = {
      ...data,
      id: Date.now(),
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    saveMockData("educationRequests", [...requests, newReq]);
    return { data: newReq };
  },
  getById: async (id: number) => {
    await delay(300);
    const requests = getMockData("educationRequests");
    const req = requests.find((r: any) => r.id == id);
    return { data: req };
  },
  getAll: async (page = 0, size = 10) => {
    await delay(300);
    const requests = getMockData("educationRequests");
    return {
      data: {
        content: requests,
        totalElements: requests.length,
        totalPages: Math.ceil(requests.length / size) || 1,
        size,
        number: page,
      },
    };
  },
  getByEmployee: async (employeeId: number, page = 0, size = 10) => {
    await delay(300);
    const requests = getMockData("educationRequests").filter(
      (r: any) => r.employeeId == employeeId,
    );
    return {
      data: {
        content: requests,
        totalElements: requests.length,
        totalPages: Math.ceil(requests.length / size) || 1,
        size,
        number: page,
      },
    };
  },
  getByStatus: async (status: string, page = 0, size = 10) => {
    await delay(300);
    const requests = getMockData("educationRequests").filter(
      (r: any) => r.status === status,
    );
    return {
      data: {
        content: requests,
        totalElements: requests.length,
        totalPages: Math.ceil(requests.length / size) || 1,
        size,
        number: page,
      },
    };
  },
  update: async (id: number, data: any) => {
    await delay(500);
    const requests = getMockData("educationRequests");
    const index = requests.findIndex((r: any) => r.id == id);
    if (index !== -1) {
      requests[index] = {
        ...requests[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveMockData("educationRequests", requests);
      return { data: requests[index] };
    }
    throw new Error("Not found");
  },
};

export const hrVerificationApi = {
  verify: async (data: any) => {
    await delay(500);
    const verifications = getMockData("hrVerifications");
    const newVer = {
      ...data,
      id: Date.now(),
      verifiedAt: new Date().toISOString(),
    };
    saveMockData("hrVerifications", [...verifications, newVer]);

    // Update request status
    if (data.requestId) {
      const requests = getMockData("educationRequests");
      const idx = requests.findIndex((r: any) => r.id == data.requestId);
      if (idx !== -1) {
        requests[idx].status = "HR_VERIFIED";
        saveMockData("educationRequests", requests);
      }
    }
    return { data: newVer };
  },
  getAll: async (page = 0, size = 10) => {
    await delay(300);
    const verifications = getMockData("hrVerifications");
    return {
      data: {
        content: verifications,
        totalElements: verifications.length,
        totalPages: Math.ceil(verifications.length / size) || 1,
        size,
        number: page,
      },
    };
  },
  getByRequestId: async (requestId: number) => {
    await delay(300);
    const verifications = getMockData("hrVerifications").filter(
      (v: any) => v.requestId == requestId,
    );
    return { data: verifications[0] || null };
  },
};

export const committeeDecisionApi = {
  decide: async (data: any) => {
    await delay(500);
    const decisions = getMockData("committeeDecisions");
    const newDec = {
      ...data,
      id: Date.now(),
      decisionDate: new Date().toISOString(),
    };
    saveMockData("committeeDecisions", [...decisions, newDec]);

    // Update request status
    if (data.requestId) {
      const requests = getMockData("educationRequests");
      const idx = requests.findIndex((r: any) => r.id == data.requestId);
      if (idx !== -1) {
        requests[idx].status =
          data.decision === "APPROVED"
            ? "COMMITTEE_APPROVED"
            : "COMMITTEE_REJECTED";
        saveMockData("educationRequests", requests);
      }
    }
    return { data: newDec };
  },
  getAll: async (page = 0, size = 10) => {
    await delay(300);
    const decisions = getMockData("committeeDecisions");
    return {
      data: {
        content: decisions,
        totalElements: decisions.length,
        totalPages: Math.ceil(decisions.length / size) || 1,
        size,
        number: page,
      },
    };
  },
  getByRequestId: async (requestId: number) => {
    await delay(300);
    const decisions = getMockData("committeeDecisions").filter(
      (d: any) => d.requestId == requestId,
    );
    return { data: decisions[0] || null };
  },
};

export const contractApi = {
  create: async (data: any) => {
    await delay(500);
    const contracts = getMockData("contracts");
    const newContract = {
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    saveMockData("contracts", [...contracts, newContract]);

    if (data.requestId) {
      const requests = getMockData("educationRequests");
      const idx = requests.findIndex((r: any) => r.id == data.requestId);
      if (idx !== -1) {
        requests[idx].status = "CONTRACT_SIGNED";
        saveMockData("educationRequests", requests);
      }
    }
    return { data: newContract };
  },
  getById: async (id: number) => {
    await delay(300);
    const contracts = getMockData("contracts");
    const c = contracts.find((c: any) => c.id == id);
    return { data: c };
  },
  getAll: async (page = 0, size = 10) => {
    await delay(300);
    const contracts = getMockData("contracts");
    return {
      data: {
        content: contracts,
        totalElements: contracts.length,
        totalPages: Math.ceil(contracts.length / size) || 1,
        size,
        number: page,
      },
    };
  },
  getByEmployee: async (employeeId: number, page = 0, size = 10) => {
    await delay(300);
    const contracts = getMockData("contracts").filter(
      (c: any) => c.employeeId == employeeId,
    );
    return {
      data: {
        content: contracts,
        totalElements: contracts.length,
        totalPages: Math.ceil(contracts.length / size) || 1,
        size,
        number: page,
      },
    };
  },
};

export const guarantorApi = {
  create: async (data: any) => {
    await delay(500);
    const guarantors = getMockData("guarantors");
    const newGuar = {
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    saveMockData("guarantors", [...guarantors, newGuar]);
    return { data: newGuar };
  },
  getByContract: async (contractId: number) => {
    await delay(300);
    const guarantors = getMockData("guarantors").filter(
      (g: any) => g.contractId == contractId,
    );
    return { data: guarantors };
  },
  delete: async (id: number) => {
    await delay(500);
    const guarantors = getMockData("guarantors").filter((g: any) => g.id != id);
    saveMockData("guarantors", guarantors);
    return { data: { success: true } };
  },
};

export const progressReportApi = {
  create: async (data: any) => {
    await delay(500);
    const reports = getMockData("progressReports");
    const newRep = {
      ...data,
      id: Date.now(),
      submittedAt: new Date().toISOString(),
    };
    saveMockData("progressReports", [...reports, newRep]);
    return { data: newRep };
  },
  getByContract: async (contractId: number, page = 0, size = 10) => {
    await delay(300);
    const reports = getMockData("progressReports").filter(
      (r: any) => r.contractId == contractId,
    );
    return {
      data: {
        content: reports,
        totalElements: reports.length,
        totalPages: Math.ceil(reports.length / size) || 1,
        size,
        number: page,
      },
    };
  },
  getAll: async (page = 0, size = 10) => {
    await delay(300);
    const reports = getMockData("progressReports");
    return {
      data: {
        content: reports,
        totalElements: reports.length,
        totalPages: Math.ceil(reports.length / size) || 1,
        size,
        number: page,
      },
    };
  },
};

export const completionApi = {
  create: async (data: any) => {
    await delay(500);
    const completions = getMockData("educationCompletions");
    const newComp = {
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    saveMockData("educationCompletions", [...completions, newComp]);

    if (data.contractId) {
      const contracts = getMockData("contracts");
      const contract = contracts.find((c: any) => c.id == data.contractId);
      if (contract && contract.requestId) {
        const requests = getMockData("educationRequests");
        const idx = requests.findIndex((r: any) => r.id == contract.requestId);
        if (idx !== -1) {
          requests[idx].status = "COMPLETED";
          saveMockData("educationRequests", requests);
        }
      }
    }
    return { data: newComp };
  },
  getByContract: async (contractId: number) => {
    await delay(300);
    const completions = getMockData("educationCompletions").filter(
      (c: any) => c.contractId == contractId,
    );
    return { data: completions[0] || null };
  },
  getAll: async (page = 0, size = 10) => {
    await delay(300);
    const completions = getMockData("educationCompletions");
    return {
      data: {
        content: completions,
        totalElements: completions.length,
        totalPages: Math.ceil(completions.length / size) || 1,
        size,
        number: page,
      },
    };
  },
};

export const serviceObligationApi = {
  getByContract: async (contractId: number) => {
    await delay(300);
    const obligations = getMockData("serviceObligations").filter(
      (o: any) => o.contractId == contractId,
    );
    return { data: obligations[0] || null };
  },
  getAll: async (page = 0, size = 10) => {
    await delay(300);
    const obligations = getMockData("serviceObligations");
    return {
      data: {
        content: obligations,
        totalElements: obligations.length,
        totalPages: Math.ceil(obligations.length / size) || 1,
        size,
        number: page,
      },
    };
  },
};
