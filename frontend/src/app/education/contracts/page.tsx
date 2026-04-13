"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { contractApi, educationRequestApi } from "@/lib/api";
import { Contract, EducationRequest } from "@/types";
import { FileSignature, Plus, Edit, Trash2, Eye, X } from "lucide-react";

export default function ContractsPage() {
  const { t } = useLanguage();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<EducationRequest[]>(
    [],
  );
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    employeeName: "",
    requestId: "",
    isAward: false,
    studyLocation: "LOCAL",
    university: "",
    program: "",
    studyCountry: "",
    studyCity: "",
    durationYears: "",
    studyMode: "ON_JOB",
    estimatedCost: "",
    contractSignedDate: "",
    educationStartDate: "",
    educationEndDate: "",
    scannedDocument: "" as string | null,
  });
  const [viewDoc, setViewDoc] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [conRes, reqRes] = await Promise.all([
        contractApi.getAll(0, 20),
        educationRequestApi.getByStatus("APPROVED", 0, 50),
      ]);
      setContracts(conRes.data.content || []);
      setApprovedRequests(reqRes.data.content || []);
    } catch {
      // API not available
    }
  };

  const handleRequestSelect = (requestId: string) => {
    const req = approvedRequests.find((r) => r.id === Number(requestId));
    if (req) {
      setEditId(null);

      // Attempt to parse city/country from location if comma-separated
      let country = "";
      let city = "";
      if (req.location) {
        const parts = req.location.split(",");
        if (parts.length > 1) {
          city = parts[0].trim();
          country = parts[1].trim();
        } else {
          country = req.location.trim(); // default to country if only one value
        }
      }

      setForm({
        ...form,
        requestId,
        employeeId: String(req.employeeId),
        employeeName: req.employeeName || "",
        isAward: false,
        studyLocation: "LOCAL",
        university: req.institution || "",
        program: req.fieldOfStudy || req.educationType || "",
        studyCountry: country,
        studyCity: city,
        durationYears: req.duration ? String(req.duration) : "",
        estimatedCost: "",
        contractSignedDate: "",
        educationStartDate: "",
        educationEndDate: "",
        scannedDocument: null,
      });
      setShowForm(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, scannedDocument: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedReq = !form.isAward ? approvedRequests.find((r) => r.id === Number(form.requestId)) : null;
      const payload = {
        employeeId: Number(form.employeeId),
        employeeName: form.isAward ? form.employeeName : (selectedReq?.employeeName || ""),
        requestId: form.isAward ? 0 : Number(form.requestId),
        university: form.university,
        program: form.program,
        studyCountry: form.studyCountry,
        studyCity: form.studyCity,
        durationYears: Number(form.durationYears),
        studyMode: form.studyMode,
        estimatedCost: Number(form.estimatedCost) || null,
        contractSignedDate: form.contractSignedDate || null,
        educationStartDate: form.educationStartDate || null,
        educationEndDate: form.educationEndDate || null,
        scannedDocument: form.scannedDocument,
      };

      if (editId) {
        await contractApi.update(editId, payload);
      } else {
        await contractApi.create(payload);
      }
      setShowForm(false);
      setEditId(null);
      setForm({
        employeeId: "",
        employeeName: "",
        requestId: "",
        isAward: false,
        studyLocation: "LOCAL",
        university: "",
        program: "",
        studyCountry: "",
        studyCity: "",
        durationYears: "",
        studyMode: "ON_JOB",
        estimatedCost: "",
        contractSignedDate: "",
        educationStartDate: "",
        educationEndDate: "",
        scannedDocument: null,
      });
      loadData();
    } catch {
      alert("Failed to save contract");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (c: Contract) => {
    setForm({
      employeeId: String(c.employeeId),
      employeeName: c.employeeName || "",
      requestId: String(c.requestId),
      isAward: c.requestId === 0,
      studyLocation: "LOCAL",
      university: c.university || "",
      program: c.program || "",
      studyCountry: c.studyCountry || "",
      studyCity: c.studyCity || "",
      durationYears: String(c.durationYears || ""),
      studyMode: c.studyMode || "ON_JOB",
      estimatedCost: String(c.estimatedCost || ""),
      contractSignedDate: c.contractSignedDate || "",
      educationStartDate: c.educationStartDate || "",
      educationEndDate: c.educationEndDate || "",
      scannedDocument: c.scannedDocument || null,
    });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this contract?")) {
      try {
        await contractApi.delete(id);
        loadData();
      } catch {
        alert("Failed to delete contract");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSignature className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {t("contracts")}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditId(null);
                setForm({
                  employeeId: "",
                  employeeName: "",
                  requestId: "",
                  isAward: true,
                  studyLocation: "LOCAL",
                  university: "",
                  program: "",
                  studyCountry: "",
                  studyCity: "",
                  durationYears: "",
                  studyMode: "ON_JOB",
                  estimatedCost: "",
                  contractSignedDate: "",
                  educationStartDate: "",
                  educationEndDate: "",
                  scannedDocument: null,
                });
                setShowForm(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create from Award
            </button>
            <button
              onClick={() => {
                setEditId(null);
                setForm({
                  employeeId: "",
                  employeeName: "",
                  requestId: "",
                  isAward: false,
                  studyLocation: "LOCAL",
                  university: "",
                  program: "",
                  studyCountry: "",
                  studyCity: "",
                  durationYears: "",
                  studyMode: "ON_JOB",
                  estimatedCost: "",
                  contractSignedDate: "",
                  educationStartDate: "",
                  educationEndDate: "",
                  scannedDocument: null,
                });
                setShowForm(!showForm);
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              {t("createContract")}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Approved Education Requests (Pending Contracts)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">{t("fullName")}</th>
                  <th className="px-6 py-4">{t("educationOpportunity")}</th>
                  <th className="px-6 py-4">{t("institution")}</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {approvedRequests.length > 0 ? (
                  approvedRequests.map((request) => {
                    const isSelected = form.requestId === String(request.id);
                    return (
                      <tr key={request.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-blue-600">REQ-{request.id}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">{request.employeeName}</td>
                        <td className="px-6 py-4 font-medium text-gray-700 italic">
                          {request.fieldOfStudy || request.educationType} ({request.educationLevel})
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-500">{request.institution || "-"}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRequestSelect(String(request.id))}
                            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all shadow-sm ${
                              isSelected && showForm
                                ? "bg-blue-600 text-white shadow-blue-200"
                                : "bg-gray-50 text-gray-700 border border-gray-100 hover:bg-blue-600 hover:text-white"
                            }`}
                          >
                            {isSelected && showForm ? "Selected" : "Contract"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      {t("noData")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showForm && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              {editId ? t("edit") || "Edit Contract" : t("createContract")}
            </h2>
            {form.studyLocation === "ABROAD" ? (
              <div className="mb-6 rounded-lg bg-orange-50 p-4 text-sm text-orange-800 border border-orange-100">
                <strong>Note:</strong> Employees studying <em>Abroad</em> are entitled to receive <strong>half salary</strong> during the commitment period.
              </div>
            ) : (
              <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-800 border border-green-100">
                <strong>Note:</strong> Employees studying <em>Locally</em> will receive their <strong>full salary</strong> during the commitment period.
              </div>
            )}
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("fullName")}
                </label>
                {form.isAward ? (
                  <input
                    type="text"
                    required
                    value={form.employeeName}
                    onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 font-bold focus:border-blue-500 focus:outline-none bg-yellow-50/30"
                    placeholder="Enter full name"
                  />
                ) : (
                  <div className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-bold text-gray-900">
                    {approvedRequests.find((r) => String(r.id) === form.requestId)?.employeeName || "-"}
                  </div>
                )}
              </div>
              {form.isAward && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    required
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 font-bold focus:border-blue-500 focus:outline-none bg-yellow-50/30"
                    placeholder="e.g. 1001"
                  />
                </div>
              )}
              <div className={form.isAward ? "md:col-span-2" : ""}>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Study Location Rule
                </label>
                <select
                  value={form.studyLocation}
                  onChange={(e) => setForm({ ...form, studyLocation: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 font-bold text-blue-700 bg-blue-50/50 focus:border-blue-500 focus:outline-none"
                >
                  <option value="LOCAL">Local Study (Full Salary)</option>
                  <option value="ABROAD">Study Abroad (Half Salary)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("university")}
                </label>
                <input
                  type="text"
                  required
                  value={form.university}
                  onChange={(e) =>
                    setForm({ ...form, university: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("program")}
                </label>
                <input
                  type="text"
                  required
                  value={form.program}
                  onChange={(e) =>
                    setForm({ ...form, program: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("studyCountry")}
                </label>
                <input
                  type="text"
                  required
                  value={form.studyCountry}
                  onChange={(e) =>
                    setForm({ ...form, studyCountry: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("studyCity")}
                </label>
                <input
                  type="text"
                  required
                  value={form.studyCity}
                  onChange={(e) =>
                    setForm({ ...form, studyCity: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("durationYears")}
                </label>
                <input
                  type="number"
                  required
                  value={form.durationYears}
                  onChange={(e) =>
                    setForm({ ...form, durationYears: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("studyMode")}
                </label>
                <select
                  value={form.studyMode}
                  onChange={(e) =>
                    setForm({ ...form, studyMode: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="ON_JOB">{t("onJob")}</option>
                  <option value="OFF_JOB">{t("offJob")}</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("estimatedCost")}
                </label>
                <input
                  type="number"
                  value={form.estimatedCost}
                  onChange={(e) =>
                    setForm({ ...form, estimatedCost: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("contractSignedDate")}
                </label>
                <input
                  type="date"
                  value={form.contractSignedDate}
                  onChange={(e) =>
                    setForm({ ...form, contractSignedDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Education Start Date
                </label>
                <input
                  type="date"
                  value={form.educationStartDate}
                  onChange={(e) =>
                    setForm({ ...form, educationStartDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Education End Date
                </label>
                <input
                  type="date"
                  value={form.educationEndDate}
                  onChange={(e) =>
                    setForm({ ...form, educationEndDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("uploadDocument")}
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {form.scannedDocument && (
                  <p className="mt-1 text-xs text-green-600">Document uploaded</p>
                )}
              </div>
              <div className="flex gap-2 md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? t("loading") : t("submit")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                  }}
                  className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">{t("fullName")}</th>
                  <th className="px-4 py-3">{t("university")}</th>
                  <th className="px-4 py-3">{t("program")}</th>
                  <th className="px-4 py-3">{t("studyCountry")}</th>
                  <th className="px-4 py-3">{t("durationYears")}</th>
                  <th className="px-4 py-3">{t("studyMode")}</th>
                  <th className="px-4 py-3">{t("scannedDocument" as any) || "Doc"}</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {contracts.length > 0 ? (
                  contracts.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{c.id}</td>
                      <td className="px-4 py-3 font-medium">
                        {c.employeeName || approvedRequests.find((r) => r.id === c.requestId)?.employeeName || `EMP-${c.employeeId}`}
                      </td>
                      <td className="px-4 py-3">{c.university}</td>
                      <td className="px-4 py-3">{c.program}</td>
                      <td className="px-4 py-3">{c.studyCountry}</td>
                      <td className="px-4 py-3">{c.durationYears}</td>
                      <td className="px-4 py-3">
                        {c.studyMode === "ON_JOB" ? t("onJob") : t("offJob")}
                      </td>
                      <td className="px-4 py-3">
                        {c.scannedDocument ? (
                          <button
                            onClick={() => setViewDoc(c.scannedDocument!)}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            {t("viewDocument")}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">{t("noDocument")}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      {t("noData")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">{t("viewDocument")}</h3>
              <button
                onClick={() => setViewDoc(null)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100 flex items-center justify-center">
              {viewDoc?.startsWith("data:application/pdf") ? (
                <embed src={viewDoc} className="w-full h-full" type="application/pdf" />
              ) : (
                <img src={viewDoc || ""} alt="Scanned Document" className="max-w-full max-h-full object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
