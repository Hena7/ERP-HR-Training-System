"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { completionApi, contractApi } from "@/lib/api";
import { EducationCompletion, Contract } from "@/types";
import { GraduationCap, Edit, Trash2 } from "lucide-react";

export default function CompletionsPage() {
  const { t } = useLanguage();
  const [completions, setCompletions] = useState<EducationCompletion[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    contractId: "",
    completionDate: "",
    returnToWorkDate: "",
    researchPresentationDate: "",
  });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [compRes, conRes] = await Promise.all([
        completionApi.getAll(0, 20),
        contractApi.getAll(0, 50),
      ]);
      setCompletions(compRes.data.content || []);
      setContracts(conRes.data.content || []);
    } catch {
      // API not available
    }
  };

  const handleContractSelect = (c: Contract) => {
    setSelectedContract(c);
    setForm({ contractId: String(c.id), completionDate: "", returnToWorkDate: "", researchPresentationDate: "" });
    setEditId(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        contractId: Number(form.contractId),
        completionDate: form.completionDate,
        returnToWorkDate: form.returnToWorkDate || null,
        researchPresentationDate: form.researchPresentationDate || null,
      };
      if (editId) {
        await completionApi.update(editId, payload);
      } else {
        await completionApi.create(payload);
      }
      setShowForm(false);
      setEditId(null);
      setSelectedContract(null);
      setForm({ contractId: "", completionDate: "", returnToWorkDate: "", researchPresentationDate: "" });
      loadData();
    } catch {
      alert("Failed to save completion");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (c: EducationCompletion) => {
    const contract = contracts.find((con) => con.id === c.contractId) || null;
    setSelectedContract(contract);
    setForm({
      contractId: String(c.contractId),
      completionDate: c.completionDate || "",
      returnToWorkDate: c.returnToWorkDate || "",
      researchPresentationDate: c.researchPresentationDate || "",
    });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this completion record?")) {
      try {
        await completionApi.delete(id);
        loadData();
      } catch {
        alert("Failed to delete completion");
      }
    }
  };

  const handleNotifyHr = async (id: number) => {
    try {
      await completionApi.update(id, { sentToHr: true });
      loadData();
    } catch {
      alert("Failed to notify HR");
    }
  };

  const handleNotifyKmc = async (id: number) => {
    try {
      await completionApi.update(id, { notifiedKmc: true });
      loadData();
    } catch {
      alert("Failed to notify KMC");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("completions")}</h1>
            <p className="text-sm text-gray-500 font-medium italic">
              Select a contract below to record completion details.
            </p>
          </div>
        </div>

        {/* Contract Selection List */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Active Contracts — Select to Record Completion
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">{t("fullName")}</th>
                  <th className="px-6 py-4">{t("university")}</th>
                  <th className="px-6 py-4">{t("program")}</th>
                  <th className="px-6 py-4 text-right">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {contracts.length > 0 ? (
                  contracts.map((c) => {
                    const isSelected = selectedContract?.id === c.id;
                    return (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-blue-600">CON-{c.id}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {c.employeeName || `EMP-${c.employeeId}`}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700">{c.university || "—"}</td>
                        <td className="px-6 py-4 font-medium text-gray-500">{c.program || "—"}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleContractSelect(c)}
                            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all shadow-sm ${
                              isSelected
                                ? "bg-blue-600 text-white shadow-blue-200"
                                : "bg-gray-50 text-gray-700 border border-gray-100 hover:bg-blue-600 hover:text-white"
                            }`}
                          >
                            {isSelected ? "Selected" : "Select"}
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

        {/* Completion Form */}
        {showForm && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              {editId ? t("edit") || "Edit Completion" : t("newCompletion")}
            </h2>
            {selectedContract && (
              <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50/40 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-0.5">
                  {t("contracts")}
                </p>
                <p className="text-sm font-bold text-gray-900">
                  CON-{selectedContract.id} —{" "}
                  {selectedContract.employeeName || `EMP-${selectedContract.employeeId}`}
                  {selectedContract.university ? ` · ${selectedContract.university}` : ""}
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("completionDate")}
                </label>
                <input
                  type="date"
                  required
                  value={form.completionDate}
                  onChange={(e) => setForm({ ...form, completionDate: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("returnToWorkDate")}
                </label>
                <input
                  type="date"
                  value={form.returnToWorkDate}
                  onChange={(e) => setForm({ ...form, returnToWorkDate: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("researchPresentationDate")}
                </label>
                <input
                  type="date"
                  value={form.researchPresentationDate}
                  onChange={(e) => setForm({ ...form, researchPresentationDate: e.target.value })}
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
                    setSelectedContract(null);
                  }}
                  className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Completions Table */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">{t("contracts")} ID</th>
                  <th className="px-4 py-3">{t("completionDate")}</th>
                  <th className="px-4 py-3">{t("returnToWorkDate")}</th>
                  <th className="px-4 py-3">{t("researchPresentationDate")}</th>
                  <th className="px-4 py-3 text-right">Notifications / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {completions.length > 0 ? (
                  completions.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{c.id}</td>
                      <td className="px-4 py-3">#{c.contractId}</td>
                      <td className="px-4 py-3">{c.completionDate}</td>
                      <td className="px-4 py-3">{c.returnToWorkDate || "—"}</td>
                      <td className="px-4 py-3">{c.researchPresentationDate || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {!c.sentToHr ? (
                            <button
                              onClick={() => handleNotifyHr(c.id)}
                              className="rounded-md bg-green-50 border border-green-100 px-2 py-1 text-[10px] font-bold text-green-700 hover:bg-green-100 uppercase tracking-wide"
                            >
                              Send to HR
                            </button>
                          ) : (
                            <span className="text-[10px] text-green-600 font-bold uppercase mr-1">HR ✓</span>
                          )}
                          
                          {!c.notifiedKmc ? (
                            <button
                              onClick={() => handleNotifyKmc(c.id)}
                              className="rounded-md bg-purple-50 border border-purple-100 px-2 py-1 text-[10px] font-bold text-purple-700 hover:bg-purple-100 uppercase tracking-wide"
                            >
                              Notify KMC
                            </button>
                          ) : (
                            <span className="text-[10px] text-purple-600 font-bold uppercase">KMC ✓</span>
                          )}
                          
                          <div className="w-px h-4 bg-gray-200 mx-1"></div>
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
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
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
