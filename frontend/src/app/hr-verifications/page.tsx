"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { hrVerificationApi, educationRequestApi } from "@/lib/api";
import { HRVerification, EducationRequest } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { ClipboardCheck, Plus } from "lucide-react";

export default function HRVerificationsPage() {
  const { t } = useLanguage();
  const [verifications, setVerifications] = useState<HRVerification[]>([]);
  const [pendingRequests, setPendingRequests] = useState<EducationRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    requestId: "",
    workExperience: "",
    performanceScore: "",
    disciplineRecord: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [verRes, reqRes] = await Promise.all([
        hrVerificationApi.getAll(0, 20),
        educationRequestApi.getByStatus("PENDING", 0, 50),
      ]);
      setVerifications(verRes.data.content || []);
      setPendingRequests(reqRes.data.content || []);
    } catch {
      // API not available
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await hrVerificationApi.verify({
        requestId: Number(form.requestId),
        workExperience: Number(form.workExperience),
        performanceScore: Number(form.performanceScore),
        disciplineRecord: form.disciplineRecord,
      });
      setShowForm(false);
      setForm({ requestId: "", workExperience: "", performanceScore: "", disciplineRecord: false });
      loadData();
    } catch {
      alert("Failed to verify");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{t("hrVerifications")}</h1>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            {t("verifyEmployee")}
          </button>
        </div>

        {showForm && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">{t("verifyEmployee")}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("educationRequests")}</label>
                <select required value={form.requestId} onChange={(e) => setForm({ ...form, requestId: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
                  <option value="">--</option>
                  {pendingRequests.map((r) => (
                    <option key={r.id} value={r.id}>#{r.id} - {r.employeeName} - {r.requestedField}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("workExperience")}</label>
                <input type="number" required value={form.workExperience} onChange={(e) => setForm({ ...form, workExperience: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("performanceScore")}</label>
                <input type="number" required value={form.performanceScore} onChange={(e) => setForm({ ...form, performanceScore: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="discipline" checked={form.disciplineRecord} onChange={(e) => setForm({ ...form, disciplineRecord: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                <label htmlFor="discipline" className="text-sm font-medium text-gray-700">{t("hasDisciplineRecord")}</label>
              </div>
              <div className="flex gap-2 md:col-span-2">
                <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {loading ? t("loading") : t("submit")}
                </button>
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
                  <th className="px-4 py-3">{t("educationRequests")} ID</th>
                  <th className="px-4 py-3">{t("workExperience")}</th>
                  <th className="px-4 py-3">{t("performanceScore")}</th>
                  <th className="px-4 py-3">{t("disciplineRecord")}</th>
                  <th className="px-4 py-3">{t("verifiedBy")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {verifications.length > 0 ? verifications.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{v.id}</td>
                    <td className="px-4 py-3">#{v.requestId}</td>
                    <td className="px-4 py-3">{v.workExperience} yrs</td>
                    <td className="px-4 py-3">{v.performanceScore}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${v.disciplineRecord ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                        {v.disciplineRecord ? t("hasDisciplineRecord") : t("noDisciplineRecord")}
                      </span>
                    </td>
                    <td className="px-4 py-3">{v.verifiedBy}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">{t("noData")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
