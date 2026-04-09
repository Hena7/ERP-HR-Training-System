"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { educationRequestApi, hrVerificationApi, cdcScoringApi } from "@/lib/api";
import { EducationRequest, HRVerification, CDCScoring } from "@/types";
import { BarChart3, CheckCircle2, ClipboardList, Info, Settings, X } from "lucide-react";

interface ScoringFormState {
  requestId: number | null;
  experienceScore: string;
  performanceScore: string;
  disciplineScore: string;
}

const initialForm: ScoringFormState = {
  requestId: null,
  experienceScore: "",
  performanceScore: "",
  disciplineScore: "",
};

export default function CDCScoringPage() {
  const { t } = useLanguage();

  const [requests, setRequests] = useState<EducationRequest[]>([]);
  const [hrVerifications, setHrVerifications] = useState<Record<number, HRVerification>>({});
  const [scorings, setScorings] = useState<CDCScoring[]>([]);
  const [form, setForm] = useState<ScoringFormState>(initialForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    try {
      const [requestRes, scoringRes, verificationRes] = await Promise.all([
        educationRequestApi.getByStatus("HR_VERIFIED", 0, 100),
        cdcScoringApi.getAll(0, 100),
        hrVerificationApi.getAll(0, 100),
      ]);

      setRequests(requestRes.data.content || []);
      setScorings(scoringRes.data.content || []);

      const verMap: Record<number, HRVerification> = {};
      (verificationRes.data.content || []).forEach((v: HRVerification) => {
        verMap[v.requestId] = v;
      });
      setHrVerifications(verMap);
    } catch {
      // Offline resilient
    }
  };

  const selectedRequest = useMemo(
    () => requests.find((r) => r.id === form.requestId) || null,
    [requests, form.requestId]
  );

  const resetForm = () => {
    setForm(initialForm);
  };

  const handleRequestSelect = (request: EducationRequest) => {
    const hrVer = hrVerifications[request.id];
    setForm({
      requestId: request.id,
      experienceScore: hrVer?.experienceSubScore?.toString() || "",
      performanceScore: hrVer?.performanceSubScore?.toString() || hrVer?.averageScore?.toString() || "",
      disciplineScore: hrVer?.disciplineSubScore?.toString() || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.requestId || !hrVerifications[form.requestId]) return;

    const hrVer = hrVerifications[form.requestId];
    
    setLoading(true);
    try {
      await cdcScoringApi.score({
        requestId: form.requestId,
        experienceScore: hrVer.experienceSubScore || 0,
        performanceScore: hrVer.performanceSubScore || hrVer.averageScore || 0,
        disciplineScore: hrVer.disciplineSubScore || 10,
        totalScore: hrVer.totalCalculatedScore || 0,
      });

      await loadData();
      resetForm();
    } catch {
      alert("Failed to finalize CDC review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-md">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CDC Final Review</h1>
            <p className="text-sm text-gray-500 font-medium italic">
              Review and finalize automated scores verified by HR.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Pending CDC Review
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">{t("fullName")}</th>
                  <th className="px-6 py-4">Education</th>
                  <th className="px-6 py-4">Auto-Score (HR)</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4 text-right">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.length > 0 ? (
                  requests.map((request) => {
                    const isSelected = form.requestId === request.id;
                    const hrVer = hrVerifications[request.id];

                    return (
                      <tr key={request.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-blue-600">REQ-{request.id.toString().slice(-6)}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {request.employeeName}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700 italic text-xs">
                          {request.educationType} ({request.educationLevel})
                        </td>
                        <td className="px-6 py-4">
                           <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                             {hrVer?.totalCalculatedScore?.toFixed(2) || hrVer?.averageScore || "-"}%
                           </span>
                        </td>
                        <td className="px-6 py-4">
                             <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${hrVer?.gender === "Female" ? "bg-pink-50 text-pink-600 border border-pink-100" : "bg-blue-50 text-blue-600 border border-blue-100"}`}>
                                {hrVer?.gender || "Male"}
                             </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRequestSelect(request)}
                            className={`rounded-lg px-5 py-2 text-xs font-bold transition-all shadow-sm uppercase tracking-widest ${
                              isSelected
                                ? "bg-indigo-600 text-white shadow-indigo-200"
                                : "bg-gray-50 text-gray-700 border border-gray-100 hover:bg-indigo-600 hover:text-white"
                            }`}
                          >
                            {isSelected ? "Reviewing..." : "Review Result"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No HR-verified requests pending CDC review.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-xl">
          <h2 className="mb-8 text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-indigo-600" />
            Selection Finalization
          </h2>

          {selectedRequest ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white p-8 shadow-sm">
                 <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Applicant</p>
                        <p className="text-base font-bold text-gray-900">{selectedRequest.employeeName}</p>
                        <p className="text-[10px] text-gray-400 italic font-medium">{selectedRequest.employeeDepartment}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Program</p>
                        <p className="text-base font-bold text-gray-900">{selectedRequest.educationType}</p>
                        <p className="text-[10px] text-gray-400 italic font-medium">{selectedRequest.educationLevel}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">HR Score Breakdown</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                           <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-[9px] font-bold text-gray-500">EXP: {hrVerifications[selectedRequest.id]?.experienceSubScore || 0}</span>
                           <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-[9px] font-bold text-gray-500">PERF: {hrVerifications[selectedRequest.id]?.performanceSubScore || 0}</span>
                           <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-[9px] font-bold text-gray-500">DISC: {hrVerifications[selectedRequest.id]?.disciplineSubScore || 0}</span>
                           <span className="bg-white border border-indigo-200 px-2 py-0.5 rounded text-[9px] font-bold text-indigo-600">BONUS: +{hrVerifications[selectedRequest.id]?.totalCalculatedScore! - (hrVerifications[selectedRequest.id]?.experienceSubScore! + hrVerifications[selectedRequest.id]?.performanceSubScore! + hrVerifications[selectedRequest.id]?.disciplineSubScore!)}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-1">Final Calculated Result</p>
                        <div className="rounded-xl bg-indigo-600 px-6 py-3 shadow-lg shadow-indigo-200 text-center">
                            <p className="text-3xl font-black text-white leading-none">
                               {hrVerifications[selectedRequest.id]?.totalCalculatedScore?.toFixed(2) || "0.00"}
                               <span className="text-sm ml-0.5 opacity-70">%</span>
                            </p>
                        </div>
                    </div>
                 </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 flex items-start gap-4">
                 <div className="bg-amber-100 p-2 rounded-lg">
                    <Info className="h-5 w-5 text-amber-600" />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-amber-900 mb-1">CDC Review Notice</h4>
                    <p className="text-xs text-amber-700 leading-relaxed font-medium">
                       Weighted scoring is now automated based on the HR performance verification. 
                       Finalizing this request will lock the score and send it to the Committee for final decision.
                    </p>
                 </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-200 px-8 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-12 py-2.5 text-sm font-bold text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {loading ? t("loading") : "Finalize & Submit Score"}
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-100 p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-300">
                  <ClipboardList className="h-8 w-8" />
              </div>
              <p className="text-sm font-medium text-gray-400">
                Select an HR-verified request from the list above to review and finalize the score.
              </p>
            </div>
          )}
        </div>


        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("scoredRequests")}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">{t("educationRequests")} ID</th>
                  <th className="px-6 py-4">Exp%</th>
                  <th className="px-6 py-4">Perf%</th>
                  <th className="px-6 py-4">Disc%</th>
                  <th className="px-6 py-4 text-blue-600">{t("totalScore")}</th>
                  <th className="px-6 py-4">{t("gradedBy")}</th>
                  <th className="px-6 py-4">{t("verifiedAt")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {scorings.length > 0 ? (
                  scorings.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-blue-600">SCR-{s.id.toString().slice(-6)}</td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-500">REQ-{s.requestId.toString().slice(-6)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">{s.experienceScore}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">{s.performanceScore}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">{s.disciplineScore}</td>
                      <td className="px-6 py-4 font-bold text-blue-700">{s.totalScore}%</td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-500">{s.gradedBy}</td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
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
