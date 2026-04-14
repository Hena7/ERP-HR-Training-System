"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { committeeDecisionApi, educationRequestApi, cdcScoringApi } from "@/lib/api";
import { CommitteeDecision, EducationRequest, CDCScoring } from "@/types";
import { Users, Edit, Trash2, BarChart3, ClipboardList, FileText } from "lucide-react";

export default function CommitteeDecisionsPage() {
  const { t } = useLanguage();
  const [decisions, setDecisions] = useState<CommitteeDecision[]>([]);
  const [scoredRequests, setScoredRequests] = useState<EducationRequest[]>([]);
  const [allRequests, setAllRequests] = useState<Record<number, EducationRequest>>({});
  const [selectedScoring, setSelectedScoring] = useState<CDCScoring | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quota, setQuota] = useState<number>(5);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
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
      const [decRes, reqRes, allReqRes] = await Promise.all([
        committeeDecisionApi.getAll(0, 50),
        educationRequestApi.getByStatus("SCORED", 0, 100),
        educationRequestApi.getAll(0, 500),
      ]);
      
      const scReqs = (reqRes.data.content || []).sort((a: any, b: any) => (b.totalScore || 0) - (a.totalScore || 0));
      setDecisions(decRes.data.content || []);
      setScoredRequests(scReqs);
      
      const reqMap: Record<number, EducationRequest> = {};
      (allReqRes.data.content || []).forEach((r: EducationRequest) => {
        reqMap[r.id] = r;
      });
      setAllRequests(reqMap);

      // Select top candidates by default based on quota
      const topIds = scReqs.slice(0, quota).map((r: any) => r.id);
      setSelectedIds(topIds);
    } catch {
      // API not available
    }
  };

  const handleBulkReport = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to send a detailed report to CDC for ${selectedIds.length} candidates?`)) return;
    
    setLoading(true);
    try {
      await (educationRequestApi as any).committeeReport(selectedIds);
      loadData();
      setSelectedIds([]);
      alert("Report successfully sent to CDC for final approval.");
    } catch {
      alert("Failed to send report");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
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

  const handleReview = async (request: EducationRequest) => {
    setForm({
      requestId: String(request.id),
      decision: "APPROVED",
      comment: "",
    });
    setEditId(null);
    setShowForm(true);
    
    try {
      const res = await cdcScoringApi.getByRequestId(request.id);
      setSelectedScoring(res.data);
      // Auto-scroll to form
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSelectedScoring(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("committeeDecisions")}
              </h1>
              <p className="text-sm text-gray-500 font-medium italic">
                Rank candidates by score and select top picks for institutional approval.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3 shadow-sm">
             <div className="space-y-0.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-blue-600 px-1">Quota</p>
                <input 
                  type="number" 
                  value={quota} 
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setQuota(val);
                    setSelectedIds(scoredRequests.slice(0, val).map(r => r.id));
                  }}
                  className="w-16 rounded-lg border border-blue-200 bg-white px-3 py-1 text-sm font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
             </div>
             <button
               onClick={handleBulkReport}
               disabled={selectedIds.length === 0 || loading}
               className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
             >
                <FileText className="h-3.5 w-3.5" />
                Send Report ({selectedIds.length})
             </button>
          </div>
        </div>

        {showForm && (
          <div id="decision-form" className="rounded-xl border border-gray-100 bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-blue-600" />
              {editId ? t("edit") || "Edit Decision" : "Review Participation & Decide"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {t("educationRequests")}
                </label>
                <select
                  required
                  disabled={!editId}
                  value={form.requestId}
                  onChange={(e) => handleRequestChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all disabled:opacity-60"
                >
                  <option value="">--</option>
                  {scoredRequests.map((r) => (
                    <option key={r.id} value={r.id}>
                      #{r.id} - {r.employeeName}
                    </option>
                  ))}
                  {editId && (
                    <option value={form.requestId}>
                      Current Request #{form.requestId}
                    </option>
                  )}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {t("decision")}
                </label>
                <select
                  value={form.decision}
                  onChange={(e) =>
                    setForm({ ...form, decision: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                >
                  <option value="APPROVED">{t("approve")}</option>
                  <option value="REJECTED">{t("reject")}</option>
                </select>
              </div>

              {form.requestId && allRequests[Number(form.requestId)] && (
                <div className="md:col-span-2 flex flex-col gap-5 rounded-xl border border-gray-100 bg-gray-50/50 p-6">
                  <div className="flex items-center gap-2 mb-1 border-b border-gray-200/60 pb-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Request Information</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{t("fullName")}</p>
                      <p className="text-sm font-bold text-gray-900">{allRequests[Number(form.requestId)].employeeName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Education & Institution</p>
                      <p className="text-sm font-bold text-gray-900">
                        {allRequests[Number(form.requestId)].fieldOfStudy || allRequests[Number(form.requestId)].educationType}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                        @ {allRequests[Number(form.requestId)].institution || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Level & Program</p>
                      <p className="text-sm font-bold text-gray-900">
                        {allRequests[Number(form.requestId)].educationLevel}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                        {allRequests[Number(form.requestId)].programTime || "Regular"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Duration & Budget Year</p>
                      <p className="text-sm font-bold text-gray-900">
                        {allRequests[Number(form.requestId)].duration ? `${allRequests[Number(form.requestId)].duration} Years` : "-"}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                        Yr {allRequests[Number(form.requestId)].budgetYear || "-"}
                      </p>
                    </div>
                  </div>
                  {((allRequests[Number(form.requestId)] as any).remark || allRequests[Number(form.requestId)].description) && (
                    <div className="border-t border-gray-200/60 pt-4 mt-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                        Description / Remark
                      </p>
                      <p className="text-sm font-medium text-gray-700 leading-relaxed">
                        {(allRequests[Number(form.requestId)] as any).remark || allRequests[Number(form.requestId)].description}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedScoring && (
                <div className="md:col-span-2 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-blue-800">Automated Scoring Result</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        <div className="space-y-1">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Experience</p>
                            <p className="text-lg font-bold text-gray-900">{selectedScoring.experienceScore.toFixed(2)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Performance</p>
                            <p className="text-lg font-bold text-gray-900">{selectedScoring.performanceScore.toFixed(2)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Discipline</p>
                            <p className="text-lg font-bold text-gray-900">{selectedScoring.disciplineScore.toFixed(2)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Bonus</p>
                            <p className="text-lg font-bold text-indigo-600">
                                +{Math.max(0, selectedScoring.totalScore - (selectedScoring.experienceScore + selectedScoring.performanceScore + selectedScoring.disciplineScore)).toFixed(2)}
                            </p>
                        </div>
                        <div className="flex flex-col items-end justify-center sm:border-l sm:border-blue-100 sm:pl-4">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-blue-600 mb-0.5">Final Score</p>
                            <span className="rounded-lg bg-blue-600 px-4 py-1.5 text-2xl font-black text-white shadow-md shadow-blue-100">
                                {selectedScoring.totalScore}%
                            </span>
                        </div>
                    </div>
                </div>
              )}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {t("comment")}
                </label>
                <textarea
                  value={form.comment}
                  onChange={(e) =>
                    setForm({ ...form, comment: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="Enter committee remarks..."
                />
              </div>
              <div className="flex gap-4 pt-4 md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  {loading ? t("loading") : t("submit")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                  }}
                  className="rounded-lg border border-gray-200 px-8 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-amber-500" />
              Ranked Scored Candidates
            </h2>
            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
               <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Within Quota
               </div>
               <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-gray-300"></span>
                  Backup / Over Quota
               </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      onChange={(e) => setSelectedIds(e.target.checked ? scoredRequests.map(r => r.id) : [])}
                      checked={selectedIds.length === scoredRequests.length && scoredRequests.length > 0}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Education</th>
                  <th className="px-6 py-4 text-blue-600">Total Score (%)</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-600">
                {scoredRequests.length > 0 ? (
                  scoredRequests.map((r, index) => {
                    const isWithinQuota = index < quota;
                    const isSelected = selectedIds.includes(r.id);
                    return (
                      <tr 
                        key={r.id} 
                        className={`transition-colors ${isSelected ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'}`}
                      >
                        <td className="px-6 py-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => toggleSelection(r.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${isWithinQuota ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                             {index + 1}
                           </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {r.employeeName}
                        </td>
                        <td className="px-6 py-4 font-medium text-xs italic">
                          {r.educationType} ({r.educationLevel})
                        </td>
                        <td className="px-6 py-4 font-bold text-blue-700">
                          <span className={isWithinQuota ? 'text-emerald-600 font-black' : ''}>
                            {r.totalScore ? `${r.totalScore}%` : "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleReview(r)}
                            disabled={loading}
                            className="rounded-lg bg-white border border-gray-100 px-4 py-1.5 text-xs font-bold text-gray-600 shadow-sm hover:border-blue-200 hover:text-blue-600 transition-all ml-auto uppercase tracking-wider"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400 italic">
                      No scored requests available for ranking.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {t("committeeDecisionsHistory") || "Decision History"}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">{t("educationRequests")} ID</th>
                  <th className="px-6 py-4 text-blue-600">Total Score (%)</th>
                  <th className="px-6 py-4">{t("decision")}</th>
                  <th className="px-6 py-4">{t("comment")}</th>
                  <th className="px-6 py-4">{t("decidedBy")}</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {decisions.length > 0 ? (
                  decisions.map((d) => {
                    const req = allRequests[d.requestId];
                    return (
                    <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-blue-600">DEC-{d.id.toString().slice(-6)}</td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-500">REQ-{d.requestId.toString().slice(-6)}</td>
                      <td className="px-6 py-4 font-bold text-blue-700">
                        {req?.totalScore ? `${req.totalScore}%` : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider italic ${d.decision === "APPROVED" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}
                        >
                          {d.decision === "APPROVED"
                            ? t("approve")
                            : t("reject")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-600">{d.comment}</td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-400 italic">{d.decidedBy}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEdit(d)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors hover:bg-blue-50 rounded-lg"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                  <tr>
                    <td
                      colSpan={7}
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
