"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { educationRequestApi } from "@/lib/api";
import { EducationRequest } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { Plus, FileText } from "lucide-react";

export default function EducationRequestsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [requests, setRequests] = useState<EducationRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    requestedField: "",
    requestedLevel: "",
    university: "",
    country: "",
    studyMode: "ON_JOB",
    description: "",
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const res = await educationRequestApi.getAll(0, 20);
      setRequests(res.data.content || []);
    } catch {
      // API not available
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await educationRequestApi.create({
        ...form,
        employeeId: Number(form.employeeId) || user?.employeeId,
      });
      setShowForm(false);
      setForm({ employeeId: "", requestedField: "", requestedLevel: "", university: "", country: "", studyMode: "ON_JOB", description: "" });
      loadRequests();
    } catch {
      alert("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{t("educationRequests")}</h1>
          </div>
          {(user?.role === "EMPLOYEE" || user?.role === "ADMIN") && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t("newRequest")}
            </button>
          )}
        </div>

        {showForm && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">{t("submitRequest")}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("requestedField")}</label>
                <input type="text" required value={form.requestedField} onChange={(e) => setForm({ ...form, requestedField: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("requestedLevel")}</label>
                <select value={form.requestedLevel} onChange={(e) => setForm({ ...form, requestedLevel: e.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
                  <option value="">--</option>
                  <option value="BSc">BSc</option>
                  <option value="MSc">MSc</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("university")}</label>
                <input type="text" required value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("country")}</label>
                <input type="text" required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("studyMode")}</label>
                <select value={form.studyMode} onChange={(e) => setForm({ ...form, studyMode: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
                  <option value="ON_JOB">{t("onJob")}</option>
                  <option value="OFF_JOB">{t("offJob")}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("description")}</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="flex gap-2 md:col-span-2">
                <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {loading ? t("loading") : t("submit")}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
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
                  <th className="px-4 py-3">{t("requestedField")}</th>
                  <th className="px-4 py-3">{t("requestedLevel")}</th>
                  <th className="px-4 py-3">{t("university")}</th>
                  <th className="px-4 py-3">{t("studyMode")}</th>
                  <th className="px-4 py-3">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{req.id}</td>
                      <td className="px-4 py-3 font-medium">{req.employeeName}</td>
                      <td className="px-4 py-3">{req.requestedField}</td>
                      <td className="px-4 py-3">{req.requestedLevel}</td>
                      <td className="px-4 py-3">{req.university}</td>
                      <td className="px-4 py-3">{req.studyMode === "ON_JOB" ? t("onJob") : t("offJob")}</td>
                      <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">{t("noData")}</td>
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
