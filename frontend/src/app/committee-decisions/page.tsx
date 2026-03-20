"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { committeeDecisionApi, educationRequestApi, cdcScoringApi } from "@/lib/api";
import { CommitteeDecision, EducationRequest, CDCScoring } from "@/types";
import { Users, Plus, Edit, Trash2, BarChart3 } from "lucide-react";

export default function CommitteeDecisionsPage() {
  const { t } = useLanguage();
  const [decisions, setDecisions] = useState<CommitteeDecision[]>([]);
  const [scoredRequests, setScoredRequests] = useState<EducationRequest[]>([]);
  const [selectedScoring, setSelectedScoring] = useState<CDCScoring | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    requestId: "",
    decision: "APPROVED",
    comment: "",
  });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [decRes, reqRes] = await Promise.all([
        committeeDecisionApi.getAll(0, 20),
        educationRequestApi.getByStatus("SCORED", 0, 50),
      ]);
      setDecisions(decRes.data.content || []);
      setScoredRequests(reqRes.data.content || []);
    } catch {
      // API not available
    }
  };

  const handleRequestChange = async (requestId: string) => {
    setForm({ ...form, requestId });
    if (requestId) {
      try {
          const res = await cdcScoringApi.getByRequestId(Number(requestId));
          setSelectedScoring(res.data);
      } catch {
          setSelectedScoring(null);
      }
    } else {
        setSelectedScoring(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        requestId: Number(form.requestId),
        decision: form.decision,
        comment: form.comment,
      };

      if (editId) {
        await committeeDecisionApi.update(editId, payload);
      } else {
        await committeeDecisionApi.decide(payload);
      }
      setShowForm(false);
      setEditId(null);
      setForm({ requestId: "", decision: "APPROVED", comment: "" });
      setSelectedScoring(null);
      loadData();
    } catch {
      alert("Failed to save decision");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (d: CommitteeDecision) => {
    setForm({
      requestId: String(d.requestId),
      decision: d.decision || "APPROVED",
      comment: d.comment || "",
    });
    setEditId(d.id);
    setShowForm(true);
    // Load scoring for edit
    try {
        const res = await cdcScoringApi.getByRequestId(d.requestId);
        setSelectedScoring(res.data);
    } catch {
        setSelectedScoring(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this committee decision?")) {
      try {
        await committeeDecisionApi.delete(id);
        loadData();
      } catch {
        alert("Failed to delete decision");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {t("committeeDecisions")}
            </h1>
          </div>
          <button
            onClick={() => {
              setEditId(null);
              setForm({ requestId: "", decision: "APPROVED", comment: "" });
              setSelectedScoring(null);
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("committeeDecision")}
          </button>
        </div>

        {showForm && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              {editId ? t("edit") || "Edit Decision" : t("committeeDecision")}
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
                  onChange={(e) => handleRequestChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">--</option>
                  {scoredRequests.map((r) => (
                    <option key={r.id} value={r.id}>
                      #{r.id} - {r.employeeName} - {r.educationType} (
                      {r.educationLevel})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("decision")}
                </label>
                <select
                  value={form.decision}
                  onChange={(e) =>
                    setForm({ ...form, decision: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="APPROVED">{t("approve")}</option>
                  <option value="REJECTED">{t("reject")}</option>
                </select>
              </div>

              {selectedScoring && (
                <div className="md:col-span-2 rounded-lg bg-blue-50 p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-3 text-blue-800">
                        <BarChart3 className="h-4 w-4" />
                        <h3 className="text-sm font-bold uppercase tracking-wider">{t("cdcScoring")}</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                            <p className="text-[10px] uppercase text-blue-600 font-bold">{t("experienceScore")}</p>
                            <p className="text-lg font-bold text-gray-900">{selectedScoring.experienceScore}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-blue-600 font-bold">{t("performanceScore")}</p>
                            <p className="text-lg font-bold text-gray-900">{selectedScoring.performanceScore}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-blue-600 font-bold">{t("disciplineScore")}</p>
                            <p className="text-lg font-bold text-gray-900">{selectedScoring.disciplineScore}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-blue-600 font-bold italic">{t("totalScore")}</p>
                            <p className="text-2xl font-black text-blue-700">{selectedScoring.totalScore}%</p>
                        </div>
                    </div>
                </div>
              )}
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("comment")}
                </label>
                <textarea
                  value={form.comment}
                  onChange={(e) =>
                    setForm({ ...form, comment: e.target.value })
                  }
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
                  <th className="px-4 py-3">{t("educationRequests")} ID</th>
                  <th className="px-4 py-3">{t("decision")}</th>
                  <th className="px-4 py-3">{t("comment")}</th>
                  <th className="px-4 py-3">{t("decidedBy")}</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {decisions.length > 0 ? (
                  decisions.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{d.id}</td>
                      <td className="px-4 py-3">#{d.requestId}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${d.decision === "APPROVED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {d.decision === "APPROVED"
                            ? t("approve")
                            : t("reject")}
                        </span>
                      </td>
                      <td className="px-4 py-3">{d.comment}</td>
                      <td className="px-4 py-3">{d.decidedBy}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(d)}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(d.id)}
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
                      colSpan={6}
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
