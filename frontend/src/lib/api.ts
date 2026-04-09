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
  createBulk: (data: Record<string, unknown>) =>
    api.post("/api/education-requests/bulk", data),
};

// Employee API
export const employeeApi = {
  getByDepartment: (department: string) =>
    api.get(`/api/employees/department/${department}`),
  getById: (id: number) => api.get(`/api/employees/${id}`),
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
    if (
      !users ||
      users.length === 0 ||
      !users.find((u: any) => u.email === "admin@gmail.com")
    ) {
      const defaultAdmin = {
        id: 1,
        email: "admin@gmail.com",
        password: "admin",
        fullName: "System Admin",
        role: "ADMIN",
        department: "ADMIN",
      };

      const filteredUsers = users
        ? users.filter((u: any) => u.email !== "admin")
        : [];
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
      department: data.department || "",
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
    const employees = getMockData("employees");
    const opportunities = getMockData("educationOpportunities");
    
    // Find employee (used for validation and metadata)
    const employee = employees.find((e: any) => e.id == data.employeeId);
    const opportunity = opportunities.find((o: any) => o.id == data.opportunityId);

    if (!opportunity) {
      throw new Error("Selected education opportunity was not found");
    }

    // Status and Deadline Validation
    const today = new Date().toISOString().split("T")[0];
    const isExpired = opportunity.deadline && today > opportunity.deadline;
    if (opportunity.status !== "OPEN" || isExpired) {
      throw new Error(
        opportunity.status === "CLOSED"
          ? "This education opportunity is currently CLOSED for applications"
          : "The application deadline for this opportunity has passed",
      );
    }

    // Department Validation
    if (employee) {
      const empDept = (employee.department || "").toString().trim().toLowerCase();
      const targets = (opportunity.targetDepartments || [])
        .map((d: any) => d?.toString().trim().toLowerCase())
        .filter(Boolean);
      const legacyDept = (opportunity.department || "").toString().trim().toLowerCase();
      
      const canApply = targets.includes(empDept) || (!!legacyDept && legacyDept === empDept);
      
      if (!canApply && targets.length > 0) {
        throw new Error("This education opportunity is not assigned to the employee's department");
      }
    }

    const newReq = {
      ...data,
      id: Date.now(),
      status: data.status || "DRAFT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      employeeName: data.employeeName || (employee ? employee.fullName : "Unknown Employee"),
      employeePhone: data.employeePhone || (employee ? employee.phone : "-"),
      employeeDepartment: data.employeeDepartment || (employee ? employee.department : "-"),
    };
    
    saveMockData("educationRequests", [...requests, newReq]);
    return { data: newReq };
  },

  createBulk: async (data: any) => {
    await delay(800);
    const requests = getMockData("educationRequests");
    
    // Enhanced support for the new candidates array provided by the bulk form
    if (data.candidates && Array.isArray(data.candidates)) {
      const newRequests = data.candidates.map((cand: any, index: number) => ({
        ...data,
        id: Date.now() + index,
        employeeId: cand.employeeId || Number(cand.candidateId) || index,
        employeeName: cand.name || cand.employeeName,
        employeePhone: cand.phone || "-",
        employeeDepartment: cand.dept || data.requesterDepartment || "-",
        
        // Candidate specific fields from the bulk form
        award: cand.award,
        institution: cand.institution || data.institution,
        duration: cand.duration,
        programTime: cand.program,
        location: cand.location,
        
        status: "SUBMITTED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      // Clean up the candidates array from individual record persistence
      newRequests.forEach((nr: any) => delete nr.candidates);

      saveMockData("educationRequests", [...requests, ...newRequests]);
      return { data: newRequests };
    }

    // Legacy support for employeeIds array (if any part of the app still uses it)
    const newRequests = (data.employeeIds || []).map((empId: number, index: number) => ({
      ...data,
      id: Date.now() + index,
      employeeId: empId,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      employeeName: data.employeeNames?.[index] || `Employee ${empId}`,
      employeePhone: data.employeePhones?.[index] || "-",
      employeeDepartment: data.employeeDepartment || "-",
    }));

    saveMockData("educationRequests", [...requests, ...newRequests]);
    return { data: newRequests };
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
  getByStatus: async (
    status: string | string[],
    page = 0,
    size = 10,
  ) => {
    await delay(300);
    const statuses = Array.isArray(status) ? status : [status];
    const requests = getMockData("educationRequests").filter((r: any) =>
      statuses.includes(r.status),
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
  submitToCenter: async (id: number) => {
    await delay(300);
    const requests = getMockData("educationRequests");
    const index = requests.findIndex((r: any) => r.id == id);
    if (index === -1) throw new Error("Not found");
    if (requests[index].status !== "DRAFT") {
      throw new Error(
        "Request must be in DRAFT status to submit",
      );
    }
    requests[index] = {
      ...requests[index],
      status: "SUBMITTED",
      updatedAt: new Date().toISOString(),
    };
    saveMockData("educationRequests", requests);
    return { data: requests[index] };
  },
  centerReview: async (id: number) => {
    await delay(300);
    const requests = getMockData("educationRequests");
    const index = requests.findIndex((r: any) => r.id == id);
    if (index === -1) throw new Error("Not found");
    if (requests[index].status !== "SUBMITTED") {
      throw new Error(
        "Request must be in SUBMITTED status for CDC review",
      );
    }
    requests[index] = {
      ...requests[index],
      status: "CDC_APPROVED",
      updatedAt: new Date().toISOString(),
    };
    saveMockData("educationRequests", requests);
    return { data: requests[index] };
  },

  forwardToHr: async (id: number) => {
    await delay(300);
    const requests = getMockData("educationRequests");
    const index = requests.findIndex((r: any) => r.id == id);
    if (index === -1) throw new Error("Not found");
    if (requests[index].status !== "CDC_APPROVED") {
      throw new Error(
        "Request must be in CDC_APPROVED status to forward to HR",
      );
    }
    requests[index] = {
      ...requests[index],
      status: "FORWARDED_TO_HR",
      updatedAt: new Date().toISOString(),
    };
    saveMockData("educationRequests", requests);
    return { data: requests[index] };
  },
  delete: async (id: number) => {
    await delay(300);
    const requests = getMockData("educationRequests").filter(
      (r: any) => r.id != id,
    );
    saveMockData("educationRequests", requests);
    return { data: { success: true } };
  },
};

export const employeeApi = {
  getByDepartment: async (department: string) => {
    await delay(300);
    let employees = getMockData("employees");
    if (employees.length === 0) {
      employees = [
        { id: 101, employeeId: "EMP001", fullName: "Abebe Kebede", department: "Software engineering", phone: "0911000001", workExperience: 5, performanceScore: 85, currentEducationLevel: "BSc" },
        { id: 102, employeeId: "EMP002", fullName: "Sara Tesfaye", department: "Software engineering", phone: "0911000002", workExperience: 3, performanceScore: 92, currentEducationLevel: "BSc" },
        { id: 103, employeeId: "EMP003", fullName: "Mulugeta Dawit", department: "Software engineering", phone: "0911000003", workExperience: 8, performanceScore: 78, currentEducationLevel: "MSc" },
        { id: 104, employeeId: "EMP004", fullName: "Hanna Solomon", department: "Human Resource", phone: "0911000004", workExperience: 4, performanceScore: 88, currentEducationLevel: "BA" },
      ];
      saveMockData("employees", employees);
    }
    return { data: employees.filter((e: any) => e.department.toLowerCase() === department.toLowerCase()) };
  },
  getAll: async (page = 0, size = 10) => {
    await delay(300);
    const employees = getMockData("employees");
    return {
      data: {
        content: employees,
        totalElements: employees.length,
        totalPages: Math.ceil(employees.length / size) || 1,
        size,
        number: page,
      },
    };
  },
  create: async (data: any) => {
    await delay(500);
    const employees = getMockData("employees");
    const newEmp = {
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    employees.push(newEmp);
    saveMockData("employees", employees);
    return { data: newEmp };
  },
  update: async (id: number, data: any) => {
    await delay(500);
    const employees = getMockData("employees");
    const index = employees.findIndex((e: any) => e.id == id);
    if (index !== -1) {
      employees[index] = { ...employees[index], ...data };
      saveMockData("employees", employees);
      return { data: employees[index] };
    }
    throw new Error("Employee not found");
  },
  delete: async (id: number) => {
    await delay(300);
    const employees = getMockData("employees").filter((e: any) => e.id != id);
    saveMockData("employees", employees);
    return { data: { success: true } };
  },
  getById: async (id: number) => {
    await delay(200);
    const employees = getMockData("employees");
    return { data: employees.find((e: any) => e.id == id) || null };
  },
};

export const hrVerificationApi = {
  verify: async (data: any) => {
    await delay(500);
    const verifications = getMockData("hrVerifications");

    const semester1Score = Number(data.semester1Score);
    const semester2Score = Number(data.semester2Score);

    if (Number.isNaN(semester1Score) || Number.isNaN(semester2Score)) {
      throw new Error("Semester scores are required");
    }

    if (
      semester1Score < 0 ||
      semester1Score > 100 ||
      semester2Score < 0 ||
      semester2Score > 100
    ) {
      throw new Error("Semester scores must be between 0 and 100");
    }

    const averageScore = (semester1Score + semester2Score) / 2;
    const status = data.status || "VERIFIED";

    const newVer = {
      ...data,
      semester1Score,
      semester2Score,
      averageScore,
      hasDiscipline: !!data.hasDiscipline,
      disciplineDescription: data.disciplineDescription || "",
      experienceYears: Number(data.experienceYears || 0),
      experienceMonths: Number(data.experienceMonths || 0),
      isDisabled: !!data.isDisabled,
      experienceSubScore: Number(data.experienceSubScore || 0),
      performanceSubScore: Number(data.performanceSubScore || 0),
      disciplineSubScore: Number(data.disciplineSubScore || 0),
      affirmativeBonus: Number(data.affirmativeBonus || 0),
      totalCalculatedScore: Number(data.totalCalculatedScore || 0),
      gender: data.gender || "Male",
      status,
      id: Date.now(),
      verifiedAt: new Date().toISOString(),
    };
    saveMockData("hrVerifications", [...verifications, newVer]);

    if (data.requestId) {
      const requests = getMockData("educationRequests");
      const idx = requests.findIndex((r: any) => r.id == data.requestId);
      if (idx !== -1) {
        if (status === "VERIFIED") {
          requests[idx].status = "HR_VERIFIED";
          // We also save the total score to the request for committee review
          requests[idx].totalScore = Number(data.totalCalculatedScore || 0);
        } else {
          requests[idx].status = "REJECTED";
        }
        requests[idx].updatedAt = new Date().toISOString();
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
  update: async (id: number, data: any) => {
    await delay(300);
    const verifications = getMockData("hrVerifications");
    const index = verifications.findIndex((v: any) => v.id == id);
    if (index !== -1) {
      const semester1Score = Number(
        data.semester1Score ?? verifications[index].semester1Score,
      );
      const semester2Score = Number(
        data.semester2Score ?? verifications[index].semester2Score,
      );

      if (Number.isNaN(semester1Score) || Number.isNaN(semester2Score)) {
        throw new Error("Semester scores are required");
      }

      const averageScore = (semester1Score + semester2Score) / 2;
      const status = data.status || verifications[index].status || "VERIFIED";

      verifications[index] = {
        ...verifications[index],
        ...data,
        semester1Score,
        semester2Score,
        averageScore,
        status,
      };
      saveMockData("hrVerifications", verifications);

      const requests = getMockData("educationRequests");
      const requestIndex = requests.findIndex(
        (r: any) => r.id == verifications[index].requestId,
      );
      if (requestIndex !== -1) {
        if (status === "VERIFIED") {
          requests[requestIndex].status = "HR_VERIFIED";
        } else if (status === "RETURNED_TO_DEPT") {
          requests[requestIndex].status = "RETURNED_TO_DEPT";
        } else {
          requests[requestIndex].status = "REJECTED";
        }
        requests[requestIndex].updatedAt = new Date().toISOString();
        saveMockData("educationRequests", requests);
      }

      return { data: verifications[index] };
    }
    throw new Error("Not found");
  },
  delete: async (id: number) => {
    await delay(300);
    const verifications = getMockData("hrVerifications").filter(
      (v: any) => v.id != id,
    );
    saveMockData("hrVerifications", verifications);
    return { data: { success: true } };
  },
};

export const cdcScoringApi = {
  getScoringConfig: async () => {
    await delay(300);
    const config = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("scoringConfig") || JSON.stringify({
          experienceWeight: 0.3,
          performanceWeight: 0.5,
          disciplineWeight: 0.2,
        }))
      : {
          experienceWeight: 0.3,
          performanceWeight: 0.5,
          disciplineWeight: 0.2,
        };
    return { data: config };
  },
  updateScoringConfig: async (config: any) => {
    await delay(500);
    if (typeof window !== "undefined") {
      const sum = Number(config.experienceWeight) + Number(config.performanceWeight) + Number(config.disciplineWeight);
      if (Math.abs(sum - 1) > 0.001) {
        throw new Error("Weights must sum to 1.0 (100%)");
      }
      localStorage.setItem("scoringConfig", JSON.stringify(config));
    }
    return { data: config };
  },
  score: async (data: any) => {
    await delay(500);
    const configResponse = await cdcScoringApi.getScoringConfig();
    const config = configResponse.data;
    
    const scorings = getMockData("cdcScorings");

    const experienceScore = Number(data.experienceScore);
    const performanceScore = Number(data.performanceScore);
    const disciplineScore = Number(data.disciplineScore);

    if (
      [experienceScore, performanceScore, disciplineScore].some(
        (s) => Number.isNaN(s) || s < 0 || s > 100,
      )
    ) {
      throw new Error("All scores must be numbers between 0 and 100");
    }

    // Weighted formula: Dynamic weights from config
    const totalScore =
      Math.round(
        (experienceScore * config.experienceWeight + 
         performanceScore * config.performanceWeight + 
         disciplineScore * config.disciplineWeight) * 100,
      ) / 100;

    const user = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};

    const newScoring = {
      ...data,
      experienceScore,
      performanceScore,
      disciplineScore,
      totalScore,
      id: Date.now(),
      gradedBy: user.fullName || user.email || "CDC Officer",
      createdAt: new Date().toISOString(),
    };
    saveMockData("cdcScorings", [...scorings, newScoring]);

    // Advance request status to SCORED and save totalScore
    if (data.requestId) {
      const requests = getMockData("educationRequests");
      const idx = requests.findIndex((r: any) => r.id == data.requestId);
      if (idx !== -1) {
        requests[idx].status = "SCORED";
        requests[idx].totalScore = totalScore;
        requests[idx].updatedAt = new Date().toISOString();
        saveMockData("educationRequests", requests);
      }
    }

    return { data: newScoring };
  },

  getAll: async (page = 0, size = 10) => {
    await delay(300);
    const scorings = getMockData("cdcScorings");
    return {
      data: {
        content: scorings,
        totalElements: scorings.length,
        totalPages: Math.ceil(scorings.length / size) || 1,
        size,
        number: page,
      },
    };
  },

  getByRequestId: async (requestId: number) => {
    await delay(300);
    const scorings = getMockData("cdcScorings").filter(
      (s: any) => s.requestId == requestId,
    );
    return { data: scorings[0] || null };
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
          data.decision === "APPROVED" ? "APPROVED" : "REJECTED";
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
  update: async (id: number, data: any) => {
    await delay(300);
    const decisions = getMockData("committeeDecisions");
    const index = decisions.findIndex((d: any) => d.id == id);
    if (index !== -1) {
      decisions[index] = { ...decisions[index], ...data };
      saveMockData("committeeDecisions", decisions);
      return { data: decisions[index] };
    }
    throw new Error("Not found");
  },
  delete: async (id: number) => {
    await delay(300);
    const decisions = getMockData("committeeDecisions").filter(
      (d: any) => d.id != id,
    );
    saveMockData("committeeDecisions", decisions);
    return { data: { success: true } };
  },
};

export const contractApi = {
  create: async (data: any) => {
    await delay(500);
    const contracts = getMockData("contracts");
    const newContract = {
      ...data,
      id: Date.now(),
      scannedDocument: data.scannedDocument || null,
      createdAt: new Date().toISOString(),
    };
    saveMockData("contracts", [...contracts, newContract]);

    if (data.requestId) {
      const requests = getMockData("educationRequests");
      const idx = requests.findIndex((r: any) => r.id == data.requestId);
      if (idx !== -1) {
        requests[idx].status = "CONTRACT_CREATED";
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
  update: async (id: number, data: any) => {
    await delay(300);
    const contracts = getMockData("contracts");
    const index = contracts.findIndex((c: any) => c.id == id);
    if (index !== -1) {
      contracts[index] = { ...contracts[index], ...data };
      saveMockData("contracts", contracts);
      return { data: contracts[index] };
    }
    throw new Error("Not found");
  },
  delete: async (id: number) => {
    await delay(300);
    const contracts = getMockData("contracts").filter((c: any) => c.id != id);
    saveMockData("contracts", contracts);
    return { data: { success: true } };
  },
};

export const guarantorApi = {
  // ... (existing guarantorApi code remains same)
  create: async (data: any) => {
    await delay(500);
    const guarantors = getMockData("guarantors");
    const newGuar = {
      ...data,
      id: Date.now(),
      scannedDocument: data.scannedDocument || null,
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
  update: async (id: number, data: any) => {
    await delay(300);
    const guarantors = getMockData("guarantors");
    const index = guarantors.findIndex((g: any) => g.id == id);
    if (index !== -1) {
      guarantors[index] = { ...guarantors[index], ...data };
      saveMockData("guarantors", guarantors);
      return { data: guarantors[index] };
    }
    throw new Error("Not found");
  },
  delete: async (id: number) => {
    await delay(500);
    const guarantors = getMockData("guarantors").filter((g: any) => g.id != id);
    saveMockData("guarantors", guarantors);
    return { data: { success: true } };
  },
};

export const witnessApi = {
  create: async (data: any) => {
    await delay(500);
    const witnesses = getMockData("witnesses");
    const newWitness = {
      ...data,
      id: Date.now(),
      scannedDocument: data.scannedDocument || null,
      createdAt: new Date().toISOString(),
    };
    saveMockData("witnesses", [...witnesses, newWitness]);
    return { data: newWitness };
  },
  getByContract: async (contractId: number) => {
    await delay(300);
    const witnesses = getMockData("witnesses").filter(
      (w: any) => w.contractId == contractId,
    );
    return { data: witnesses };
  },
  update: async (id: number, data: any) => {
    await delay(300);
    const witnesses = getMockData("witnesses");
    const index = witnesses.findIndex((w: any) => w.id == id);
    if (index !== -1) {
      witnesses[index] = { ...witnesses[index], ...data };
      saveMockData("witnesses", witnesses);
      return { data: witnesses[index] };
    }
    throw new Error("Not found");
  },
  delete: async (id: number) => {
    await delay(500);
    const witnesses = getMockData("witnesses").filter((w: any) => w.id != id);
    saveMockData("witnesses", witnesses);
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
  update: async (id: number, data: any) => {
    await delay(300);
    const reports = getMockData("progressReports");
    const index = reports.findIndex((r: any) => r.id == id);
    if (index !== -1) {
      reports[index] = { ...reports[index], ...data };
      saveMockData("progressReports", reports);
      return { data: reports[index] };
    }
    throw new Error("Not found");
  },
  delete: async (id: number) => {
    await delay(300);
    const reports = getMockData("progressReports").filter(
      (r: any) => r.id != id,
    );
    saveMockData("progressReports", reports);
    return { data: { success: true } };
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
  update: async (id: number, data: any) => {
    await delay(300);
    const completions = getMockData("educationCompletions");
    const index = completions.findIndex((c: any) => c.id == id);
    if (index !== -1) {
      completions[index] = { ...completions[index], ...data };
      saveMockData("educationCompletions", completions);
      return { data: completions[index] };
    }
    throw new Error("Not found");
  },
  delete: async (id: number) => {
    await delay(300);
    const completions = getMockData("educationCompletions").filter(
      (c: any) => c.id != id,
    );
    saveMockData("educationCompletions", completions);
    return { data: { success: true } };
  },
};

export const serviceObligationApi = {
  create: async (data: any) => {
    await delay(500);
    const obligations = getMockData("serviceObligations");
    const newObligation = {
      id:
        obligations.length > 0
          ? Math.max(...obligations.map((o: any) => o.id)) + 1
          : 1,
      ...data,
    };
    obligations.push(newObligation);
    saveMockData("serviceObligations", obligations);
    return { data: newObligation };
  },
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
  update: async (id: number, data: any) => {
    await delay(300);
    const obligations = getMockData("serviceObligations");
    const index = obligations.findIndex((o: any) => o.id == id);
    if (index !== -1) {
      obligations[index] = { ...obligations[index], ...data };
      saveMockData("serviceObligations", obligations);
      return { data: obligations[index] };
    }
    throw new Error("Not found");
  },
  delete: async (id: number) => {
    await delay(300);
    const obligations = getMockData("serviceObligations").filter(
      (o: any) => o.id != id,
    );
    saveMockData("serviceObligations", obligations);
    return { data: { success: true } };
  },
};

export const educationOpportunityApi = {
  create: async (data: any) => {
    await delay(500);
    const opps = getMockData("educationOpportunities");

    const normalizedTargets = Array.isArray(data.targetDepartments)
      ? data.targetDepartments
          .map((department: any) => department?.toString().trim())
          .filter(Boolean)
      : [];

    const newOpp = {
      id: opps.length > 0 ? Math.max(...opps.map((o: any) => o.id)) + 1 : 1,
      ...data,
      status: data.status || "OPEN",
      deadline: data.deadline || "",
      department: data.department || normalizedTargets[0],
      targetDepartments: normalizedTargets,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    opps.push(newOpp);
    saveMockData("educationOpportunities", opps);
    return { data: newOpp };
  },
  getById: async (id: number) => {
    await delay(300);
    const opps = getMockData("educationOpportunities");
    const opp = opps.find((o: any) => o.id == id);
    if (opp) return { data: opp };
    throw new Error("Not found");
  },
  getAll: async (page = 0, size = 10) => {
    await delay(300);
    const opps = getMockData("educationOpportunities");
    const user = typeof window !== "undefined" 
      ? JSON.parse(localStorage.getItem("user") || "{}") 
      : null;
    
    const isAdminOrCDC = user?.role === "ADMIN" || user?.role === "CYBER_DEVELOPMENT_CENTER";
    const today = new Date().toISOString().split("T")[0];

    const filteredOpps = isAdminOrCDC 
      ? opps 
      : opps.filter((o: any) => {
          const isExpired = o.deadline && today > o.deadline;
          return o.status === "OPEN" && !isExpired;
        });

    return {
      data: {
        content: filteredOpps,
        totalElements: filteredOpps.length,
        totalPages: Math.ceil(filteredOpps.length / size) || 1,
        size,
        number: page,
      },
    };
  },
  update: async (id: number, data: any) => {
    await delay(300);
    const opps = getMockData("educationOpportunities");
    const index = opps.findIndex((o: any) => o.id == id);
    if (index !== -1) {
      const normalizedTargets = Array.isArray(data.targetDepartments)
        ? data.targetDepartments
            .map((department: any) => department?.toString().trim())
            .filter(Boolean)
        : Array.isArray(opps[index].targetDepartments)
          ? opps[index].targetDepartments
          : [];

      if (normalizedTargets.length === 0) {
        throw new Error("At least one target department is required");
      }

      opps[index] = {
        ...opps[index],
        ...data,
        department: data.department || normalizedTargets[0],
        targetDepartments: normalizedTargets,
        updatedAt: new Date().toISOString(),
      };
      saveMockData("educationOpportunities", opps);
      return { data: opps[index] };
    }
    throw new Error("Not found");
  },
  delete: async (id: number) => {
    await delay(300);
    const opps = getMockData("educationOpportunities").filter(
      (o: any) => o.id != id,
    );
    saveMockData("educationOpportunities", opps);
    return { data: { success: true } };
  },
};
