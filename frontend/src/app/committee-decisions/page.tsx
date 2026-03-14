"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { committeeDecisionApi, educationRequestApi } from "@/lib/api";
import { CommitteeDecision, EducationRequest } from "@/types";
import { Users, Plus } from "lucide-react";

export default function CommitteeDecisionsPage() {
  const { t } = useLanguage();
  const [decisions, setDecisions] = useState<CommitteeDecision[]>([]);
  const [verifiedRequests, setVerifiedRequests] = useState<EducationRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    requestId: "",
    decision: "APPROVED",
    comment: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [decRes, reqRes] = await Promise.all([
        committeeDecisionApi.getAll(0, 20),
        educationRequestApi.getByStatus("HR_VERIFIED", 0, 50),
      ]);
      setDecisions(decRes.data.content || []);
      setVerifiedRequests(reqRes.data.content || []);
    } catch {
      // API not available
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await committeeDecisionApi.decide({
        requestId: Number(form.requestId),
        decision: form.decision,
        comment: form.comment,
      });
      setShowForm(false);
      setForm({ requestId: "", decision: "APPROVED", comment: "" });
      loadData();
    } catch {
      alert("Failed to submit decision");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{t("committeeDecisions")}</h1>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            {t("committeeDecision")}
          </button>
        </div>

        {showForm && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">{t("committeeDecision")}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("educationRequests")}</label>
                <select required value={form.requestId} onChange={(e) => setForm({ ...form, requestId: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
                  <option value="">--</option>
                  {verifiedRequests.map((r) => (
                    <option key={r.id} value={r.id}>#{r.id} - {r.employeeName} - {r.requestedField}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("decision")}</label>
                <select value={form.decision} onChange={(e) => setForm({ ...form, decision: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
                  <option value="APPROVED">{t("approve")}</option>
                  <option value="REJECTED">{t("reject")}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("comment")}</label>
                <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
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
                  <th className="px-4 py-3">{t("educationRequests")} ID</th>
                  <th className="px-4 py-3">{t("decision")}</th>
                  <th className="px-4 py-3">{t("comment")}</th>
                  <th className="px-4 py-3">{t("decidedBy")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {decisions.length > 0 ? decisions.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{d.id}</td>
                    <td className="px-4 py-3">#{d.requestId}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${d.decision === "APPROVED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {d.decision === "APPROVED" ? t("approve") : t("reject")}
                      </span>
                    </td>
                    <td className="px-4 py-3">{d.comment}</td>
                    <td className="px-4 py-3">{d.decidedBy}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">{t("noData")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
