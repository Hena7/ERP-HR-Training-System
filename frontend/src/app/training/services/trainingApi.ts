// Training Module - localStorage Mock API
// POST /training/request → createRequest
// GET  /training/requests → getAll
// POST /training/contract → createContract
// POST /training/guarantor → createGuarantor
// PATCH /training/requests/:id → update status

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function getMock<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function saveMock<T>(key: string, data: T[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

// ─────────────────────────────────────────────
// Training Request
// ─────────────────────────────────────────────
export const trainingRequestApi = {
  create: async (data: any) => {
    await delay(600);
    const all = getMock<any>("trainingRequests");
    const record = {
      ...data,
      id: Date.now(),
      status: "SUBMITTED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveMock("trainingRequests", [...all, record]);
    return { data: record };
  },

  getAll: async () => {
    await delay(300);
    return { data: getMock<any>("trainingRequests") };
  },

  getById: async (id: number) => {
    await delay(200);
    const all = getMock<any>("trainingRequests");
    return { data: all.find((r: any) => r.id === id) || null };
  },

  updateStatus: async (id: number, status: string, note?: string) => {
    await delay(400);
    const all = getMock<any>("trainingRequests").map((r: any) =>
      r.id === id
        ? { ...r, status, reviewNote: note || "", updatedAt: new Date().toISOString() }
        : r,
    );
    saveMock("trainingRequests", all);
    return { data: all.find((r: any) => r.id === id) };
  },
};

// ─────────────────────────────────────────────
// Training Contract
// ─────────────────────────────────────────────
export const trainingContractApi = {
  create: async (data: any) => {
    await delay(600);
    const all = getMock<any>("trainingContracts");
    const record = {
      ...data,
      id: Date.now(),
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    saveMock("trainingContracts", [...all, record]);
    // Link contract to request
    const requests = getMock<any>("trainingRequests").map((r: any) =>
      r.id === data.requestId
        ? { ...r, status: "CONTRACT_CREATED", contractId: record.id }
        : r,
    );
    saveMock("trainingRequests", requests);
    return { data: record };
  },

  getAll: async () => {
    await delay(300);
    return { data: getMock<any>("trainingContracts") };
  },

  getById: async (id: number) => {
    await delay(200);
    const all = getMock<any>("trainingContracts");
    return { data: all.find((r: any) => r.id === id) || null };
  },
};

// ─────────────────────────────────────────────
// Training Guarantor
// ─────────────────────────────────────────────
export const trainingGuarantorApi = {
  create: async (data: any) => {
    await delay(500);
    const all = getMock<any>("trainingGuarantors");
    if (all.filter((g: any) => g.contractId === data.contractId).length >= 2) {
      throw new Error("Maximum 2 guarantors per training contract");
    }
    const record = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
    saveMock("trainingGuarantors", [...all, record]);
    return { data: record };
  },

  getByContract: async (contractId: number) => {
    await delay(200);
    return {
      data: getMock<any>("trainingGuarantors").filter(
        (g: any) => g.contractId === contractId,
      ),
    };
  },

  update: async (id: number, data: any) => {
    await delay(400);
    const all = getMock<any>("trainingGuarantors").map((g: any) =>
      g.id === id ? { ...g, ...data } : g,
    );
    saveMock("trainingGuarantors", all);
    return { data: all.find((g: any) => g.id === id) };
  },

  delete: async (id: number) => {
    await delay(300);
    const all = getMock<any>("trainingGuarantors").filter((g: any) => g.id !== id);
    saveMock("trainingGuarantors", all);
    return { data: { success: true } };
  },
};

// ─────────────────────────────────────────────
// Obligation Tracking
// ─────────────────────────────────────────────
export const trainingObligationApi = {
  create: async (data: any) => {
    await delay(500);
    const all = getMock<any>("trainingObligations");
    const record = {
      ...data,
      id: Date.now(),
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    saveMock("trainingObligations", [...all, record]);
    return { data: record };
  },

  getAll: async () => {
    await delay(300);
    return { data: getMock<any>("trainingObligations") };
  },

  updateStatus: async (id: number, status: string) => {
    await delay(400);
    const all = getMock<any>("trainingObligations").map((o: any) =>
      o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o,
    );
    saveMock("trainingObligations", all);
    return { data: all.find((o: any) => o.id === id) };
  },
};
