"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { progressReportApi, contractApi } from "@/lib/api";
import { ProgressReport, Contract } from "@/types";
import { BarChart3, Edit, Trash2 } from "lucide-react";

export default function ProgressReportsPage() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    contractId: "",
    reportMonth: "",
    description: "",
  });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [repRes, conRes] = await Promise.all([
        progressReportApi.getAll(0, 20),
        contractApi.getAll(0, 50),
      ]);
      setReports(repRes.data.content || []);
      setContracts(conRes.data.content || []);
    } catch {
      // API not available
    }
  };

  const handleContractSelect = (c: Contract) => {
    setSelectedContract(c);
    setForm({ contractId: String(c.id), reportMonth: "", description: "" });
    setEditId(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        contractId: Number(form.contractId),
        reportMonth: form.reportMonth,
        description: form.description,
      };
      if (editId) {
        await progressReportApi.update(editId, payload);
      } else {
        await progressReportApi.create(payload);
      }
      setShowForm(false);
      setEditId(null);
      setSelectedContract(null);
      setForm({ contractId: "", reportMonth: "", description: "" });
      loadData();
    } catch {
      alert("Failed to save report");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (r: ProgressReport) => {
    const contract = contracts.find((c) => c.id === r.contractId) || null;
    setSelectedContract(contract);
    setForm({
      contractId: String(r.contractId),
      reportMonth: r.reportMonth || "",
      description: r.description || "",
    });
    setEditId(r.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this report?")) {
      try {
        await progressReportApi.delete(id);
        loadData();
      } catch {
        alert("Failed to delete report");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("progressReports")}</h1>
            <p className="text-sm text-gray-500 font-medium italic">
              Select a contract below to submit or manage progress reports.
            </p>
          </div>
        </div>

        {/* Contract Selection List */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Active Contracts — Select to Add Report
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

        {/* Report Form */}
        {showForm && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              {editId ? t("edit") || "Edit Report" : t("submitReport")}
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
                  {t("reportMonth")}
                </label>
                <input
                  type="date"
                  required
                  value={form.reportMonth}
                  onChange={(e) => setForm({ ...form, reportMonth: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("description")}
                </label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
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

        {/* Reports Table */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">{t("contracts")} ID</th>
                  <th className="px-4 py-3">{t("reportMonth")}</th>
                  <th className="px-4 py-3">{t("description")}</th>
                  <th className="px-4 py-3 text-right">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reports.length > 0 ? (
                  reports.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{r.id}</td>
                      <td className="px-4 py-3">#{r.contractId}</td>
                      <td className="px-4 py-3">{r.reportMonth}</td>
                      <td className="px-4 py-3">{r.description}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(r)}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
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
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
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
