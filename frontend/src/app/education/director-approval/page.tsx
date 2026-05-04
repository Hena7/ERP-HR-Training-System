"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { educationRequestApi, hrVerificationApi } from "@/lib/api";
import { EducationRequest, HRVerification } from "@/types";
import { CheckCircle2, XCircle, ClipboardList, Award, Eye, X } from "lucide-react";

export default function DirectorApprovalPage() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState<EducationRequest[]>([]);
  const [hrVerifications, setHrVerifications] = useState<Record<number, HRVerification>>({});
  const [approvedRequests, setApprovedRequests] = useState<EducationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedView, setSelectedView] = useState<EducationRequest | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reportedRes, approvedRes, verRes] = await Promise.all([
        educationRequestApi.getByStatus("COMMITTEE_REPORTED", 0, 200),
        educationRequestApi.getByStatus("APPROVED", 0, 200),
        hrVerificationApi.getAll(0, 200),
      ]);

      const verMap: Record<number, HRVerification> = {};
      (verRes.data.content || []).forEach((v: HRVerification) => {
        verMap[v.requestId] = v;
      });
      setHrVerifications(verMap);
      setRequests(reportedRes.data.content || []);
      setApprovedRequests(approvedRes.data.content || []);
    } catch {
      // offline resilient
    }
  };

  const handleApprove = async (requestId: number) => {
    if (!confirm("Approve this candidate and forward to CDC Final Approval?")) return;
    setLoading(true);
    try {
      await educationRequestApi.directorApproval(requestId, "APPROVED");
      await loadData();
    } catch {
      alert("Failed to approve.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId: number) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    setLoading(true);
    try {
      await educationRequestApi.directorApproval(requestId, "REJECTED", reason);
      await loadData();
    } catch {
      alert("Failed to reject.");
    } finally {
      setLoading(false);
    }
  };

  // Group by dept + opportunity
  const grouped: Record<string, EducationRequest[]> = {};
  requests.forEach((req) => {
    const dept = req.employeeDepartment || "Unknown";
    const opp = req.fieldOfStudy || (req as any).educationType || "Unknown";
    const key = `${dept}|||${opp}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(req);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Director Approval</h1>
            <p className="text-sm text-gray-500 font-medium italic">
              Review committee-reported candidates and grant final director sign-off.
            </p>
          </div>
          {requests.length > 0 && (
            <span className="ml-auto rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700 border border-amber-200">
              {requests.length} pending
            </span>
          )}
        </div>

        {/* Pending Section */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-amber-500" />
              Committee-Reported Candidates — Pending Director Approval
            </h2>
          </div>

          {Object.keys(grouped).length > 0 ? (
            Object.entries(grouped).map(([key, groupReqs]) => {
              const [dept, opp] = key.split("|||");
              return (
                <div key={key} className="border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50/80 to-orange-50/40 px-6 py-3 border-b border-amber-100/60">
                    <span className="inline-flex items-center rounded-lg bg-amber-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                      {dept}
                    </span>
                    <span className="text-xs font-bold italic text-gray-700">{opp}</span>
                    <span className="ml-auto rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black text-amber-700">
                      {groupReqs.length} candidate{groupReqs.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      <tr>
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Full Name</th>
                        <th className="px-6 py-3">Score</th>
                        <th className="px-6 py-3">Gender</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {groupReqs
                        .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
                        .map((req) => {
                          const hrVer = hrVerifications[req.id];
                          const score = req.totalScore ?? hrVer?.totalCalculatedScore;
                          return (
                            <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 text-xs font-bold text-blue-600">
                                REQ-{req.id.toString().slice(-6)}
                              </td>
                              <td className="px-6 py-4 font-bold text-gray-900">{req.employeeName}</td>
                              <td className="px-6 py-4">
                                <span className="font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                                  {score?.toFixed(2) ?? "—"}%
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${hrVer?.gender === "Female" ? "bg-pink-50 text-pink-600 border border-pink-100" : "bg-blue-50 text-blue-600 border border-blue-100"}`}>
                                  {hrVer?.gender || "Male"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => setSelectedView(req)}
                                    className="rounded-lg bg-gray-50 p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all border border-gray-100"
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleApprove(req.id)}
                                    disabled={loading}
                                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(req.id)}
                                    disabled={loading}
                                    className="flex items-center gap-1.5 rounded-lg bg-red-50 px-4 py-1.5 text-xs font-bold text-red-600 border border-red-200 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
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
              No committee-reported candidates pending director approval.
            </div>
          )}
        </div>

        {/* Approved history */}
        {approvedRequests.length > 0 && (
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-50 bg-emerald-50/30 px-6 py-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                Director-Approved (Ready for Commitment)
              </h2>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-emerald-50 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Education</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white">
                {approvedRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-blue-600">REQ-{r.id.toString().slice(-6)}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{r.employeeName}</td>
                    <td className="px-6 py-4 text-xs italic text-gray-600">{r.employeeDepartment || "—"}</td>
                    <td className="px-6 py-4 text-xs italic text-gray-700">
                      {r.fieldOfStudy || (r as any).educationType} ({r.educationLevel})
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-700">
                      {r.totalScore?.toFixed(2) ?? "—"}%
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Director Approved
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedView && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h3 className="text-lg font-bold text-gray-900">Candidate Details</h3>
              <button onClick={() => setSelectedView(null)} className="rounded-xl p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4 text-sm">
              {[
                ["Full Name", selectedView.employeeName],
                ["Department", selectedView.employeeDepartment || "—"],
                ["Education Goal", `${selectedView.fieldOfStudy || (selectedView as any).educationType} (${selectedView.educationLevel})`],
                ["Institution", selectedView.institution],
                ["Score", `${selectedView.totalScore?.toFixed(2) ?? hrVerifications[selectedView.id]?.totalCalculatedScore?.toFixed(2) ?? "—"}%`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="text-gray-400 font-medium text-xs uppercase tracking-widest">{label}</span>
                  <span className="font-bold text-gray-900 text-right">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => { handleApprove(selectedView.id); setSelectedView(null); }}
                className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-all"
              >
                Approve
              </button>
              <button
                onClick={() => setSelectedView(null)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
