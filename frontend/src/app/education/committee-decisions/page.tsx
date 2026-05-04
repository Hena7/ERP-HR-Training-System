"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  committeeDecisionApi,
  educationRequestApi,
  cdcScoringApi,
  educationOpportunityApi,
} from "@/lib/api";
import { CommitteeDecision, EducationRequest, CDCScoring, EducationOpportunity } from "@/types";
import {
  Users,
  Edit,
  Trash2,
  BarChart3,
  ClipboardList,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function CommitteeDecisionsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<CommitteeDecision[]>([]);
  const [scoredRequests, setScoredRequests] = useState<EducationRequest[]>([]);
  const [allRequests, setAllRequests] = useState<Record<number, EducationRequest>>({});
  const [opportunities, setOpportunities] = useState<EducationOpportunity[]>([]);
  
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
      const [decRes, scoredRes, reviewRes, allReqRes, oppRes] = await Promise.all([
        committeeDecisionApi.getAll(0, 500),
        educationRequestApi.getByStatus("SCORED", 0, 500),
        educationRequestApi.getByStatus("COMMITTEE_REVIEW", 0, 500),
        educationRequestApi.getAll(0, 1000),
        educationOpportunityApi.getAll(0, 200),
      ]);

      const scReqs = [
        ...(scoredRes.data.content || []),
        ...(reviewRes.data.content || []),
      ].sort((a: any, b: any) => (b.totalScore || 0) - (a.totalScore || 0));
      setDecisions(decRes.data.content || []);
      setScoredRequests(scReqs);
      setOpportunities(oppRes.data.content || []);

      const reqMap: Record<number, EducationRequest> = {};
      (allReqRes.data.content || []).forEach((r: EducationRequest) => {
        reqMap[r.id] = r;
      });
      setAllRequests(reqMap);
    } catch {
      // API not available
    }
  };

  const toggleDecision = async (req: EducationRequest, decision: string) => {
    try {
      setLoading(true);
      await committeeDecisionApi.decide({
        requestId: req.id,
        decision,
        comment: `Committee member voted: ${decision}`,
      });
      await loadData();
    } catch {
      alert("Failed to submit vote.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkReport = async (groupIds: number[]) => {
    if (groupIds.length === 0) return;
    if (!confirm(`Are you sure you want to forward these ${groupIds.length} candidates to the Director?`)) return;

    setLoading(true);
    try {
      await educationRequestApi.reportByCommitteeBulk(groupIds);
      await loadData();
      alert("Report successfully sent to Director for final approval.");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to send report";
      alert(msg);
    } finally {
      setLoading(false);
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSelectedScoring(null);
    }
  };

  // Group by dept + opportunity
  const grouped: Record<string, EducationRequest[]> = {};
  scoredRequests.forEach((req) => {
    const dept = req.employeeDepartment || "Unknown";
    const oppStr = req.fieldOfStudy || (req as any).educationType || "Unknown";
    const key = `${dept}|||${oppStr}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(req);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Committee Decisions
            </h1>
            <p className="text-sm text-gray-500 font-medium italic">
              Rank candidates per department, vote, and forward to Director (requires 4/7 approvals).
            </p>
          </div>
        </div>

        {/* Grouped Candidates */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-amber-500" />
              Ranked Scored Candidates
            </h2>
            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Within Quota
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-gray-300"></span> Over Quota
              </div>
            </div>
          </div>

          {Object.keys(grouped).length > 0 ? (
            Object.entries(grouped).map(([key, groupReqs]) => {
              const [dept, oppStr] = key.split("|||");
              
              // Find matching opportunity to get dynamic quota
              const opp = opportunities.find(o => o.educationType === oppStr);
              let candidatesQuota = 3;
              let standbyQuota = 2;
              
              if (opp && (opp as any).departmentQuotas && (opp as any).departmentQuotas[dept]) {
                const q = (opp as any).departmentQuotas[dept];
                candidatesQuota = q.candidates || 0;
                standbyQuota = q.standby || 0;
              }
              const totalQuota = candidatesQuota + standbyQuota;

              // Sort by score
              const sortedReqs = [...groupReqs].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

              // Determine which candidates can be forwarded (>= 4 approvals AND within quota)
              const forwardableIds = sortedReqs
                .filter((r, idx) => {
                  const isWithinQuota = idx < totalQuota;
                  const approvals = r.committeeApprovalCount || 0;
                  return isWithinQuota && approvals >= 4;
                })
                .map(r => r.id);

              return (
                <div key={key} className="border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/40 px-6 py-3 border-b border-blue-100/60">
                    <span className="inline-flex items-center rounded-lg bg-blue-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                      {dept}
                    </span>
                    <span className="text-xs font-bold italic text-gray-700">{oppStr}</span>
                    <span className="ml-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Quota: {totalQuota} <span className="lowercase text-gray-400">({candidatesQuota} cand. + {standbyQuota} standby)</span>
                    </span>
                    <div className="ml-auto">
                      <button
                        onClick={() => handleBulkReport(forwardableIds)}
                        disabled={forwardableIds.length === 0 || loading}
                        className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Forward to Director ({forwardableIds.length})
                      </button>
                    </div>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      <tr>
                        <th className="px-6 py-3">Rank</th>
                        <th className="px-6 py-3">Employee</th>
                        <th className="px-6 py-3 text-blue-600">Score</th>
                        <th className="px-6 py-3 text-center">Approvals (4/7)</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-gray-600">
                      {sortedReqs.map((r, idx) => {
                        const isWithinQuota = idx < totalQuota;
                        const myDecision = decisions.find(d => d.requestId === r.id && d.decidedBy === user?.username);
                        const approvals = r.committeeApprovalCount || 0;
                        const rejections = decisions.filter(d => d.requestId === r.id && d.decision === "REJECTED").length;
                        const canForward = isWithinQuota && approvals >= 4;

                        return (
                          <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${isWithinQuota ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                                {idx + 1}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-900">{r.employeeName}</td>
                            <td className="px-6 py-4 font-bold text-blue-700">
                              <span className={isWithinQuota ? "text-emerald-600 font-black" : ""}>
                                {r.totalScore ? `${r.totalScore}%` : "-"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[10px] font-black ${approvals >= 4 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                                  {approvals}/7
                                </span>
                                {rejections > 0 && <span className="text-[9px] text-red-500 font-bold">{rejections} rejections</span>}
                                {canForward && <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest">Ready</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleReview(r)}
                                  className="rounded-lg bg-gray-50 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100"
                                  title="View Details"
                                >
                                  <BarChart3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => toggleDecision(r, "APPROVED")}
                                  disabled={loading || myDecision?.decision === "APPROVED"}
                                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-50 ${myDecision?.decision === "APPROVED" ? "bg-emerald-100 text-emerald-700" : "bg-gray-50 text-emerald-600 border border-gray-200 hover:bg-emerald-600 hover:text-white"}`}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => toggleDecision(r, "REJECTED")}
                                  disabled={loading || myDecision?.decision === "REJECTED"}
                                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-50 ${myDecision?.decision === "REJECTED" ? "bg-red-100 text-red-700" : "bg-gray-50 text-red-600 border border-gray-200 hover:bg-red-600 hover:text-white"}`}
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center text-gray-400 italic">
              No scored requests available for ranking.
            </div>
          )}
        </div>

        {/* Form and History ... (keeping detail view modal style below if showForm is true) */}
        {showForm && selectedScoring && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-8">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-4 mb-4">Detailed Scoring</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Experience</p>
                  <p className="text-xl font-black text-gray-900">{selectedScoring.experienceScore.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Performance</p>
                  <p className="text-xl font-black text-gray-900">{selectedScoring.performanceScore.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Discipline</p>
                  <p className="text-xl font-black text-gray-900">{selectedScoring.disciplineScore.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Total Score</p>
                  <p className="text-xl font-black text-blue-700">{selectedScoring.totalScore.toFixed(2)}%</p>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => { setShowForm(false); setSelectedScoring(null); }}
                  className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
