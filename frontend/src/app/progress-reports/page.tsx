"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { progressReportApi, contractApi } from "@/lib/api";
import { ProgressReport, Contract } from "@/types";
import { BarChart3, Plus } from "lucide-react";

export default function ProgressReportsPage() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    contractId: "",
    reportMonth: "",
    description: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await progressReportApi.create({
        contractId: Number(form.contractId),
        reportMonth: form.reportMonth,
        description: form.description,
      });
      setShowForm(false);
      setForm({ contractId: "", reportMonth: "", description: "" });
      loadData();
    } catch {
      alert("Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{t("progressReports")}</h1>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            {t("newReport")}
          </button>
        </div>

        {showForm && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">{t("submitReport")}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("contracts")}</label>
                <select required value={form.contractId} onChange={(e) => setForm({ ...form, contractId: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
                  <option value="">--</option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>#{c.id} - {c.employeeName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("reportMonth")}</label>
                <input type="date" required value={form.reportMonth} onChange={(e) => setForm({ ...form, reportMonth: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("description")}</label>
                <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="flex gap-2 md:col-span-2">
                <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">{loading ? t("loading") : t("submit")}</button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 transition-colors">{t("cancel")}</button>
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
                  <th className="px-4 py-3">{t("contracts")} ID</th>
                  <th className="px-4 py-3">{t("reportMonth")}</th>
                  <th className="px-4 py-3">{t("description")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reports.length > 0 ? reports.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{r.id}</td>
                    <td className="px-4 py-3">#{r.contractId}</td>
                    <td className="px-4 py-3">{r.reportMonth}</td>
                    <td className="px-4 py-3">{r.description}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">{t("noData")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
