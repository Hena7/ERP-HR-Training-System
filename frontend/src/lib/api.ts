import axios from "axios";

// Helper for local storage persistence
const LS_KEYS = {
  EMPLOYEES: "mock_employees",
  REQUESTS: "mock_requests",
  OPPORTUNITIES: "mock_opportunities",
  VERIFICATIONS: "mock_verifications",
  SCORINGS: "mock_scorings",
  SCORING_CONFIG: "mock_scoring_config",
  DECISIONS: "mock_decisions",
  CONTRACTS: "mock_contracts",
  GUARANTORS: "mock_guarantors",
  WITNESSES: "mock_witnesses",
  PROGRESS_REPORTS: "mock_progress_reports",
  COMPLETIONS: "mock_completions",
  SERVICE_OBLIGATIONS: "mock_service_obligations",
  USERS: "mock_users",
};

class LocalStorageDB {
  static get(key: string) {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  static save(key: string, data: any) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  static getAll(key: string) {
    return this.get(key);
  }

  static getById(key: string, id: number) {
    return this.get(key).find((item: any) => item.id === id);
  }

  static create(key: string, data: any) {
    const items = this.get(key);
    const newItem = { 
      ...data, 
      id: data.id || Math.floor(Math.random() * 1000000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    this.save(key, items);
    return newItem;
  }

  static update(key: string, id: number, data: any) {
    const items = this.get(key);
    const index = items.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
      this.save(key, items);
      return items[index];
    }
    return null;
  }

  static delete(key: string, id: number) {
    const items = this.get(key);
    const filtered = items.filter((item: any) => item.id !== id);
    this.save(key, filtered);
  }
}

// Mock Response Helper
const mockRes = (data: any) => Promise.resolve({ data });
const mockPageRes = (content: any[]) => Promise.resolve({
  data: {
    content,
    totalPages: 1,
    totalElements: content.length,
    size: 100,
    number: 0
  }
});

// Mock Implementation
export const authApi = {
  login: (email: string) => mockRes({ token: "mock-token", email, role: "ADMIN" }),
  register: (data: any) => mockRes(data),
};

export const userApi = {
  getAll: () => mockRes(LocalStorageDB.getAll(LS_KEYS.USERS)),
  create: (data: any) => mockRes(LocalStorageDB.create(LS_KEYS.USERS, data)),
  updateRole: (id: number, role: string) => mockRes(LocalStorageDB.update(LS_KEYS.USERS, id, { role })),
  delete: (id: number) => {
    LocalStorageDB.delete(LS_KEYS.USERS, id);
    return mockRes({});
  },
};

export const employeeApi = {
  getAll: (page = 0, size = 10) => mockPageRes(LocalStorageDB.getAll(LS_KEYS.EMPLOYEES)),
  getByDepartment: (department: string) => mockRes(LocalStorageDB.getAll(LS_KEYS.EMPLOYEES).filter((e: any) => e.department === department)),
  getById: (id: number) => mockRes(LocalStorageDB.getById(LS_KEYS.EMPLOYEES, id)),
  create: (data: any) => mockRes(LocalStorageDB.create(LS_KEYS.EMPLOYEES, data)),
  update: (id: number, data: any) => mockRes(LocalStorageDB.update(LS_KEYS.EMPLOYEES, id, data)),
  delete: (id: number) => {
    LocalStorageDB.delete(LS_KEYS.EMPLOYEES, id);
    return mockRes({});
  },
};

export const educationRequestApi = {
  create: (data: any) => mockRes(LocalStorageDB.create(LS_KEYS.REQUESTS, { ...data, status: "PENDING_DEPARTMENT_SUBMISSION" })),
  createBulk: (data: any) => {
    const results = data.candidates.map((c: any) => LocalStorageDB.create(LS_KEYS.REQUESTS, { 
      ...data, 
      ...c, 
      status: "SUBMITTED_TO_CENTER",
      employeeName: c.name,
      employeeDepartment: c.dept
    }));
    return mockRes(results);
  },
  getById: (id: number) => mockRes(LocalStorageDB.getById(LS_KEYS.REQUESTS, id)),
  getAll: (page = 0, size = 10) => mockPageRes(LocalStorageDB.getAll(LS_KEYS.REQUESTS)),
  getMyRequests: (employeeId: string) => mockPageRes(LocalStorageDB.getAll(LS_KEYS.REQUESTS).filter((r: any) => r.candidateId === employeeId)),
  getByEmployee: (employeeId: number) => mockPageRes(LocalStorageDB.getAll(LS_KEYS.REQUESTS).filter((r: any) => r.employeeId === employeeId)),
  getByStatus: (status: string | string[]) => {
    const statuses = Array.isArray(status) ? status : status.split(',');
    return mockPageRes(LocalStorageDB.getAll(LS_KEYS.REQUESTS).filter((r: any) => statuses.includes(r.status)));
  },
  update: (id: number, data: any) => mockRes(LocalStorageDB.update(LS_KEYS.REQUESTS, id, data)),
  submitToCenter: (id: number) => mockRes(LocalStorageDB.update(LS_KEYS.REQUESTS, id, { status: "SUBMITTED_TO_CENTER" })),
  centerReview: (id: number) => mockRes(LocalStorageDB.update(LS_KEYS.REQUESTS, id, { status: "CENTER_REVIEWED" })),
  forwardToHr: (id: number) => mockRes(LocalStorageDB.update(LS_KEYS.REQUESTS, id, { status: "FORWARDED_TO_HR" })),
  reportByCommittee: (id: number) => {
    // Also create a decision record automatically
    LocalStorageDB.create(LS_KEYS.DECISIONS, {
      requestId: id,
      decision: "APPROVED",
      comment: "Approved via Committee Report",
      decidedBy: "Mock Committee"
    });
    return mockRes(LocalStorageDB.update(LS_KEYS.REQUESTS, id, { status: "COMMITTEE_REPORTED" }));
  },
  reportByCommitteeBulk: (ids: number[]) => {
    ids.forEach(id => {
      LocalStorageDB.create(LS_KEYS.DECISIONS, {
        requestId: id,
        decision: "APPROVED",
        comment: "Approved via Committee Bulk Report",
        decidedBy: "Mock Committee"
      });
      LocalStorageDB.update(LS_KEYS.REQUESTS, id, { status: "COMMITTEE_REPORTED" });
    });
    return mockRes({});
  },
  finalApproval: (id: number) => mockRes(LocalStorageDB.update(LS_KEYS.REQUESTS, id, { status: "CDC_APPROVED" })),
  delete: (id: number) => {
    LocalStorageDB.delete(LS_KEYS.REQUESTS, id);
    return mockRes({});
  },
};

export const educationOpportunityApi = {
  create: (data: any) => mockRes(LocalStorageDB.create(LS_KEYS.OPPORTUNITIES, data)),
  getById: (id: number) => mockRes(LocalStorageDB.getById(LS_KEYS.OPPORTUNITIES, id)),
  getAll: (page = 0, size = 10) => mockPageRes(LocalStorageDB.getAll(LS_KEYS.OPPORTUNITIES)),
  update: (id: number, data: any) => mockRes(LocalStorageDB.update(LS_KEYS.OPPORTUNITIES, id, data)),
  delete: (id: number) => {
    LocalStorageDB.delete(LS_KEYS.OPPORTUNITIES, id);
    return mockRes({});
  },
};

export const hrVerificationApi = {
  verify: (data: any) => {
    const v = LocalStorageDB.create(LS_KEYS.VERIFICATIONS, data);
    LocalStorageDB.update(LS_KEYS.REQUESTS, data.requestId, { status: "HR_VERIFIED" });
    return mockRes(v);
  },
  getAll: (page = 0, size = 10) => mockPageRes(LocalStorageDB.getAll(LS_KEYS.VERIFICATIONS)),
  getByRequestId: (requestId: number) => mockRes(LocalStorageDB.getAll(LS_KEYS.VERIFICATIONS).find((v: any) => v.requestId === requestId)),
  update: (id: number, data: any) => mockRes(LocalStorageDB.update(LS_KEYS.VERIFICATIONS, id, data)),
  delete: (id: number) => {
    LocalStorageDB.delete(LS_KEYS.VERIFICATIONS, id);
    return mockRes({});
  },
};

export const cdcScoringApi = {
  getScoringConfig: () => mockRes(LocalStorageDB.get(LS_KEYS.SCORING_CONFIG)[0] || { experienceWeight: 30, performanceWeight: 40, disciplineWeight: 30 }),
  updateScoringConfig: (config: any) => {
    LocalStorageDB.save(LS_KEYS.SCORING_CONFIG, [config]);
    return mockRes(config);
  },
  score: (data: any) => {
    const s = LocalStorageDB.create(LS_KEYS.SCORINGS, data);
    LocalStorageDB.update(LS_KEYS.REQUESTS, data.requestId, { status: "SCORED", totalScore: data.totalScore });
    return mockRes(s);
  },
  getAll: (page = 0, size = 10) => mockPageRes(LocalStorageDB.getAll(LS_KEYS.SCORINGS)),
  getByRequestId: (requestId: number) => mockRes(LocalStorageDB.getAll(LS_KEYS.SCORINGS).find((s: any) => s.requestId === requestId)),
};

export const committeeDecisionApi = {
  decide: (data: any) => mockRes(LocalStorageDB.create(LS_KEYS.DECISIONS, data)),
  getAll: (page = 0, size = 10) => mockPageRes(LocalStorageDB.getAll(LS_KEYS.DECISIONS)),
  getByRequestId: (requestId: number) => mockRes(LocalStorageDB.getAll(LS_KEYS.DECISIONS).find((d: any) => d.requestId === requestId)),
  update: (id: number, data: any) => mockRes(LocalStorageDB.update(LS_KEYS.DECISIONS, id, data)),
  delete: (id: number) => {
    LocalStorageDB.delete(LS_KEYS.DECISIONS, id);
    return mockRes({});
  },
};

export const contractApi = {
  create: (data: any) => {
    const c = LocalStorageDB.create(LS_KEYS.CONTRACTS, data);
    LocalStorageDB.update(LS_KEYS.REQUESTS, data.requestId, { status: "CONTRACT_CREATED" });
    return mockRes(c);
  },
  getById: (id: number) => mockRes(LocalStorageDB.getById(LS_KEYS.CONTRACTS, id)),
  getAll: (page = 0, size = 10) => mockPageRes(LocalStorageDB.getAll(LS_KEYS.CONTRACTS)),
  getByEmployee: (employeeId: number) => mockPageRes(LocalStorageDB.getAll(LS_KEYS.CONTRACTS).filter((c: any) => c.employeeId === employeeId)),
  update: (id: number, data: any) => mockRes(LocalStorageDB.update(LS_KEYS.CONTRACTS, id, data)),
  delete: (id: number) => {
    LocalStorageDB.delete(LS_KEYS.CONTRACTS, id);
    return mockRes({});
  },
};

export const guarantorApi = {
  create: (data: any) => mockRes(LocalStorageDB.create(LS_KEYS.GUARANTORS, data)),
  getByContract: (contractId: number) => mockRes(LocalStorageDB.getAll(LS_KEYS.GUARANTORS).filter((g: any) => g.contractId === contractId)),
  update: (id: number, data: any) => mockRes(LocalStorageDB.update(LS_KEYS.GUARANTORS, id, data)),
  delete: (id: number) => {
    LocalStorageDB.delete(LS_KEYS.GUARANTORS, id);
    return mockRes({});
  },
};

export const witnessApi = {
  create: (data: any) => mockRes(LocalStorageDB.create(LS_KEYS.WITNESSES, data)),
  getByContract: (contractId: number) => mockRes(LocalStorageDB.getAll(LS_KEYS.WITNESSES).filter((w: any) => w.contractId === contractId)),
  update: (id: number, data: any) => mockRes(LocalStorageDB.update(LS_KEYS.WITNESSES, id, data)),
  delete: (id: number) => {
    LocalStorageDB.delete(LS_KEYS.WITNESSES, id);
    return mockRes({});
  },
};

export const progressReportApi = {
  create: (data: any) => mockRes(LocalStorageDB.create(LS_KEYS.PROGRESS_REPORTS, data)),
  getByContract: (contractId: number) => mockPageRes(LocalStorageDB.getAll(LS_KEYS.PROGRESS_REPORTS).filter((p: any) => p.contractId === contractId)),
  getAll: (page = 0, size = 10) => mockPageRes(LocalStorageDB.getAll(LS_KEYS.PROGRESS_REPORTS)),
  update: (id: number, data: any) => mockRes(LocalStorageDB.update(LS_KEYS.PROGRESS_REPORTS, id, data)),
  delete: (id: number) => {
    LocalStorageDB.delete(LS_KEYS.PROGRESS_REPORTS, id);
    return mockRes({});
  },
};

export const completionApi = {
  create: (data: any) => mockRes(LocalStorageDB.create(LS_KEYS.COMPLETIONS, data)),
  getByContract: (contractId: number) => mockRes(LocalStorageDB.getAll(LS_KEYS.COMPLETIONS).find((c: any) => c.contractId === contractId)),
  getAll: (page = 0, size = 10) => mockPageRes(LocalStorageDB.getAll(LS_KEYS.COMPLETIONS)),
  update: (id: number, data: any) => mockRes(LocalStorageDB.update(LS_KEYS.COMPLETIONS, id, data)),
  delete: (id: number) => {
    LocalStorageDB.delete(LS_KEYS.COMPLETIONS, id);
    return mockRes({});
  },
};

export const serviceObligationApi = {
  create: (data: any) => mockRes(LocalStorageDB.create(LS_KEYS.SERVICE_OBLIGATIONS, data)),
  getByContract: (contractId: number) => mockRes(LocalStorageDB.getAll(LS_KEYS.SERVICE_OBLIGATIONS).find((s: any) => s.contractId === contractId)),
  getAll: (page = 0, size = 10) => mockPageRes(LocalStorageDB.getAll(LS_KEYS.SERVICE_OBLIGATIONS)),
  update: (id: number, data: any) => mockRes(LocalStorageDB.update(LS_KEYS.SERVICE_OBLIGATIONS, id, data)),
  delete: (id: number) => {
    LocalStorageDB.delete(LS_KEYS.SERVICE_OBLIGATIONS, id);
    return mockRes({});
  },
};

const api = axios.create();
export const trainingApi = axios.create();
export default api;

