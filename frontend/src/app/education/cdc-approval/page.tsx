"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  educationRequestApi,
  hrVerificationApi,
  cdcScoringApi,
} from "@/lib/api";
import { EducationRequest, HRVerification, CDCScoring } from "@/types";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Info,
  FileCheck,
  X,
} from "lucide-react";
import { calculateEducationScore } from "@/lib/scoring";
import GroupedTable from "@/components/GroupedTable";

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
  const [hrVerifications, setHrVerifications] = useState<
    Record<number, HRVerification>
  >({});
  const [scorings, setScorings] = useState<CDCScoring[]>([]);
  const [form, setForm] = useState<ScoringFormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [selectedViewRequest, setSelectedViewRequest] =
    useState<EducationRequest | null>(null);

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

      const verMap: Record<number, HRVerification> = {};
      (verificationRes.data.content || []).forEach((v: HRVerification) => {
        verMap[v.requestId] = v;
      });
      setHrVerifications(verMap);

      const allRequests = requestRes.data.content || [];
      setRequests(allRequests.filter((r: EducationRequest) => !!verMap[r.id]));

      setScorings(scoringRes.data.content || []);
    } catch {
      // Offline resilient
    }
  };

  const selectedRequest = useMemo(
    () => requests.find((r) => r.id === form.requestId) || null,
    [requests, form.requestId],
  );

  const resetForm = () => {
    setForm(initialForm);
  };

  const handleRequestSelect = (request: EducationRequest) => {
    const hrVer = hrVerifications[request.id];
    setForm({
      requestId: request.id,
      experienceScore: hrVer?.experienceSubScore?.toString() || "",
      performanceScore:
        hrVer?.performanceSubScore?.toString() ||
        hrVer?.averageScore?.toString() ||
        "",
      disciplineScore: hrVer?.disciplineSubScore?.toString() || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.requestId || !hrVerifications[form.requestId]) return;

    const hrVer = hrVerifications[form.requestId];
    const liveScore = liveCalculatedScore;

    setLoading(true);
    try {
      await cdcScoringApi.score({
        requestId: form.requestId,
        experienceScore:
          hrVer.experienceSubScore || liveScore?.experienceScore || 0,
        performanceScore:
          hrVer.performanceSubScore ||
          hrVer.averageScore ||
          liveScore?.performanceScore ||
          0,
        disciplineScore:
          hrVer.disciplineSubScore || liveScore?.disciplineScore || 10,
        totalScore:
          hrVer.totalCalculatedScore ||
          hrVer.averageScore ||
          liveScore?.finalTotalScore ||
          0,
      });

      await loadData();
      resetForm();
    } catch {
      alert("Failed to finalize CDC review.");
    } finally {
      setLoading(false);
    }
  };

  const liveCalculatedScore = useMemo(() => {
    if (!selectedRequest || !hrVerifications[selectedRequest.id]) return null;
    const hrVer = hrVerifications[selectedRequest.id];

    // Attempt live calculation from raw data
    return calculateEducationScore({
      experienceYears:
        hrVer.experienceYears ?? (selectedRequest.workExperience || 0),
      experienceMonths: hrVer.experienceMonths || 0,
      performance1:
        hrVer.semester1Score || selectedRequest.performanceScore || 0,
      performance2:
        hrVer.semester2Score || selectedRequest.performanceScore || 0,
      hasDiscipline: hrVer.hasDiscipline ?? false,
      gender: hrVer.gender || (selectedRequest as any).gender || "Male",
      isDisabled: hrVer.isDisabled ?? false,
    });
  }, [selectedRequest, hrVerifications]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-md">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CDC Approval</h1>
              <p className="text-sm text-gray-500 font-medium italic">
                Finalize scoring and provide institutional sign-off for top
                candidates.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Pending CDC Review
            </h2>
          </div>

          <GroupedTable
            rows={requests}
            groupBy={(req) =>
              req.fieldOfStudy || (req as any).educationType || "General"
            }
            subGroupBy={(req) => req.employeeDepartment || "Unknown Dept"}
            rowKey={(req) => req.id}
            columns={[
              {
                header: "ID",
                render: (req) => (
                  <span className="font-bold text-blue-600">
                    REQ-{req.id.toString().slice(-6)}
                  </span>
                ),
              },
              {
                header: t("fullName"),
                render: (req) => (
                  <span className="font-bold text-gray-900">
                    {req.employeeName}
                  </span>
                ),
              },
              {
                header: "Auto-Score (HR)",
                render: (req) => {
                  const hrVer = hrVerifications[req.id];
                  return (
                    <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                      {hrVer?.totalCalculatedScore?.toFixed(2) ||
                        hrVer?.averageScore ||
                        "-"}
                      %
                    </span>
                  );
                },
              },
              {
                header: "Gender",
                render: (req) => {
                  const hrVer = hrVerifications[req.id];
                  return (
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${hrVer?.gender === "Female" ? "bg-pink-50 text-pink-600 border border-pink-100" : "bg-blue-50 text-blue-600 border border-blue-100"}`}
                    >
                      {hrVer?.gender || "Male"}
                    </span>
                  );
                },
              },
            ]}
            renderActions={(request) => {
              const isSelected = form.requestId === request.id;
              return (
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
              );
            }}
            emptyMessage="No HR-verified requests pending CDC review."
          />
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
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Applicant
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {selectedRequest.employeeName}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span
                        className={`inline-flex rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${hrVerifications[selectedRequest.id]?.gender === "Female" ? "bg-pink-100 text-pink-700 border border-pink-200" : "bg-blue-100 text-blue-700 border border-blue-200"}`}
                      >
                        {hrVerifications[selectedRequest.id]?.gender || "Male"}
                      </span>
                      <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                        {hrVerifications[selectedRequest.id]?.experienceYears ||
                          selectedRequest.workExperience ||
                          0}{" "}
                        Yrs Exp
                      </span>
                      {hrVerifications[selectedRequest.id]?.isDisabled && (
                        <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                          Disabled
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Program
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {selectedRequest.fieldOfStudy ||
                        (selectedRequest as any).educationType}
                    </p>
                    <p className="text-[10px] text-gray-400 italic font-medium">
                      {(selectedRequest as any).targetEducationLevel ||
                        (selectedRequest as any).educationLevel}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      HR Score Breakdown
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-[9px] font-bold text-gray-500">
                        EXP:{" "}
                        {hrVerifications[selectedRequest.id]
                          ?.experienceSubScore ||
                          liveCalculatedScore?.experienceScore ||
                          0}
                      </span>
                      <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-[9px] font-bold text-gray-500">
                        PERF:{" "}
                        {hrVerifications[selectedRequest.id]
                          ?.performanceSubScore ||
                          liveCalculatedScore?.performanceScore ||
                          0}
                      </span>
                      <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-[9px] font-bold text-gray-500">
                        DISC:{" "}
                        {hrVerifications[selectedRequest.id]
                          ?.disciplineSubScore ||
                          liveCalculatedScore?.disciplineScore ||
                          0}
                      </span>
                      <span className="bg-white border border-indigo-200 px-2 py-0.5 rounded text-[9px] font-bold text-indigo-600">
                        BONUS: +
                        {hrVerifications[selectedRequest.id]
                          ?.affirmativeBonus ||
                          liveCalculatedScore?.affirmativeBonus ||
                          "0.00"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-1">
                      Final Calculated Result
                    </p>
                    <div className="rounded-xl bg-indigo-600 px-6 py-3 shadow-lg shadow-indigo-200 text-center">
                      <p className="text-3xl font-black text-white leading-none">
                        {(
                          hrVerifications[selectedRequest.id]
                            ?.totalCalculatedScore ||
                          hrVerifications[selectedRequest.id]?.averageScore ||
                          liveCalculatedScore?.finalTotalScore ||
                          0
                        ).toFixed(2)}
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
                  <h4 className="text-sm font-bold text-amber-900 mb-1">
                    CDC Review Notice
                  </h4>
                  <p className="text-xs text-amber-700 leading-relaxed font-medium">
                    Weighted scoring is now automated based on the HR
                    performance verification. Finalizing this request will lock
                    the score and send it to the Committee for final decision.
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
                Select an HR-verified request from the list above to review and
                finalize the score.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {t("scoredRequests")}
            </h2>
          </div>
          <GroupedTable
            rows={scorings}
            groupBy={(s) => {
              const req = requests.find(r => r.id === s.requestId);
              return req?.fieldOfStudy || (req as any)?.educationType || "General";
            }}
            rowKey={(s) => s.id}
            columns={[
              {
                header: "ID",
                render: (s) => <span className="font-bold text-blue-600">SCR-{s.id.toString().slice(-6)}</span>
              },
              {
                header: t("educationRequests") + " ID",
                render: (s) => <span className="font-bold text-gray-500 text-xs">REQ-{s.requestId.toString().slice(-6)}</span>
              },
              {
                header: "Exp%",
                key: "experienceScore" as any
              },
              {
                header: "Perf%",
                key: "performanceScore" as any
              },
              {
                header: "Disc%",
                key: "disciplineScore" as any
              },
              {
                header: t("totalScore"),
                render: (s) => <span className="font-bold text-blue-700">{s.totalScore}%</span>
              },
              {
                header: t("gradedBy"),
                render: (s) => <span className="text-xs font-medium text-gray-500">{s.gradedBy}</span>
              }
            ]}
            emptyMessage={t("noData")}
          />
        </div>
      </div>

      {/* Detail View Modal */}
      {selectedViewRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Candidate Details
                  </h3>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                    REQ-{selectedViewRequest?.id.toString().slice(-6)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedViewRequest(null)}
                className="rounded-xl p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Full Name
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedViewRequest?.employeeName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Department
                  </p>
                  <p className="text-sm font-bold text-gray-700 italic">
                    {selectedViewRequest?.employeeDepartment || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Education Goal
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedViewRequest?.fieldOfStudy ||
                      (selectedViewRequest as any)?.educationType}{" "}
                    (
                    {(selectedViewRequest as any)?.targetEducationLevel ||
                      selectedViewRequest?.educationLevel}
                    )
                  </p>
                  <p className="text-xs font-medium text-gray-500 italic">
                    {selectedViewRequest?.institution}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Final Decision
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 shadow-sm border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      CDC Approved
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Total Selection Score
                  </p>
                  <p className="text-3xl font-black text-indigo-600">
                    {selectedViewRequest?.totalScore?.toFixed(2) ||
                      (selectedViewRequest &&
                        hrVerifications[
                          selectedViewRequest.id
                        ]?.totalCalculatedScore?.toFixed(2)) ||
                      "-"}
                    <span className="text-sm ml-1 text-gray-400">%</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Study Location
                  </p>
                  <span className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-700 border border-gray-100">
                    {selectedViewRequest?.location || "Local"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 p-6 border border-gray-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                HR Automated Verification Data
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[9px] font-bold text-gray-400 uppercase">
                    Experience
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {(selectedViewRequest &&
                      hrVerifications[selectedViewRequest.id]
                        ?.experienceSubScore) ||
                      "0.00"}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[9px] font-bold text-gray-400 uppercase">
                    Performance
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {(selectedViewRequest &&
                      hrVerifications[selectedViewRequest.id]
                        ?.performanceSubScore) ||
                      "0.00"}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[9px] font-bold text-gray-400 uppercase">
                    Discipline
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {(selectedViewRequest &&
                      hrVerifications[selectedViewRequest.id]
                        ?.disciplineSubScore) ||
                      "0.00"}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[9px] font-bold text-gray-400 uppercase">
                    Bonus
                  </p>
                  <p className="text-sm font-bold text-emerald-600">
                    +
                    {(selectedViewRequest &&
                      hrVerifications[selectedViewRequest.id]
                        ?.affirmativeBonus) ||
                      "0.00"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button
                onClick={() => setSelectedViewRequest(null)}
                className="w-full rounded-2xl bg-gray-900 py-4 text-sm font-bold text-white shadow-xl hover:bg-black transition-all active:scale-[0.98]"
              >
                Close Detail View
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
