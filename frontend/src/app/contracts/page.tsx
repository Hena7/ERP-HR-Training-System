"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { contractApi, educationRequestApi } from "@/lib/api";
import { Contract, EducationRequest } from "@/types";
import { FileSignature, Plus, Edit, Trash2 } from "lucide-react";

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
    requestId: "",
    university: "",
    program: "",
    studyCountry: "",
    studyCity: "",
    durationYears: "",
    studyMode: "ON_JOB",
    estimatedCost: "",
    contractSignedDate: "",
  });
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
      setForm({
        ...form,
        requestId,
        employeeId: String(req.employeeId),
        university: req.institution || "",
        studyCountry: "",
        studyMode: "ON_JOB",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        employeeId: Number(form.employeeId),
        requestId: Number(form.requestId),
        university: form.university,
        program: form.program,
        studyCountry: form.studyCountry,
        studyCity: form.studyCity,
        durationYears: Number(form.durationYears),
        studyMode: form.studyMode,
        estimatedCost: Number(form.estimatedCost) || null,
        contractSignedDate: form.contractSignedDate || null,
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
        requestId: "",
        university: "",
        program: "",
        studyCountry: "",
        studyCity: "",
        durationYears: "",
        studyMode: "ON_JOB",
        estimatedCost: "",
        contractSignedDate: "",
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
      requestId: String(c.requestId),
      university: c.university || "",
      program: c.program || "",
      studyCountry: c.studyCountry || "",
      studyCity: c.studyCity || "",
      durationYears: String(c.durationYears || ""),
      studyMode: c.studyMode || "ON_JOB",
      estimatedCost: String(c.estimatedCost || ""),
      contractSignedDate: c.contractSignedDate || "",
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
          <button
            onClick={() => {
              setEditId(null);
              setForm({
                employeeId: "",
                requestId: "",
                university: "",
                program: "",
                studyCountry: "",
                studyCity: "",
                durationYears: "",
                studyMode: "ON_JOB",
                estimatedCost: "",
                contractSignedDate: "",
              });
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("createContract")}
          </button>
        </div>

        {showForm && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              {editId ? t("edit") || "Edit Contract" : t("createContract")}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("educationRequests")}
                </label>
                <select
                  required
                  value={form.requestId}
                  onChange={(e) => handleRequestSelect(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">--</option>
                  {approvedRequests.map((r) => (
                    <option key={r.id} value={r.id}>
                      #{r.id} - {r.employeeName}
                    </option>
                  ))}
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
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {contracts.length > 0 ? (
                  contracts.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{c.id}</td>
                      <td className="px-4 py-3 font-medium">
                        {c.employeeName}
                      </td>
                      <td className="px-4 py-3">{c.university}</td>
                      <td className="px-4 py-3">{c.program}</td>
                      <td className="px-4 py-3">{c.studyCountry}</td>
                      <td className="px-4 py-3">{c.durationYears}</td>
                      <td className="px-4 py-3">
                        {c.studyMode === "ON_JOB" ? t("onJob") : t("offJob")}
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
                      colSpan={8}
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
    </DashboardLayout>
  );
}
