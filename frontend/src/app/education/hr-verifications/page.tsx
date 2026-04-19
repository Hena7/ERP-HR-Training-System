"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { educationRequestApi, hrVerificationApi, employeeApi } from "@/lib/api";
import { EducationRequest, HRVerification, Employee } from "@/types";
import {
  CheckCircle2,
  ClipboardCheck,
  XCircle,
  RotateCcw,
  Calculator,
  Award,
  User,
  AlertCircle,
} from "lucide-react";
import { calculateEducationScore } from "@/lib/scoring";

type VerificationStatus = "VERIFIED" | "REJECTED" | "RETURNED_TO_DEPT";

interface VerificationFormState {
  requestId: number | null;
  semester1Score: string;
  semester2Score: string;
  hasDiscipline: boolean;
  disciplineDescription: string;
  experienceYears: string;
  experienceMonths: string;
  isDisabled: boolean;
  gender: string;
}

const initialForm: VerificationFormState = {
  requestId: null,
  semester1Score: "",
  semester2Score: "",
  hasDiscipline: false,
  disciplineDescription: "",
  experienceYears: "",
  experienceMonths: "",
  isDisabled: false,
  gender: "Male",
};

export default function HRVerificationsPage() {
  const { t } = useLanguage();

  const [requests, setRequests] = useState<EducationRequest[]>([]);
  const [verifications, setVerifications] = useState<HRVerification[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [form, setForm] = useState<VerificationFormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [submittingStatus, setSubmittingStatus] =
    useState<VerificationStatus | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cdcApprovedRes, forwardedRes, verificationRes] = await Promise.all([
        educationRequestApi.getByStatus("CDC_APPROVED", 0, 100),
        educationRequestApi.getByStatus("FORWARDED_TO_HR", 0, 100),
        hrVerificationApi.getAll(0, 100),
      ]);

      const combinedRequests = [
        ...(cdcApprovedRes.data.content || []),
        ...(forwardedRes.data.content || [])
      ];

      setRequests(combinedRequests);
      setVerifications(verificationRes.data.content || []);
    } catch {
      // keep page resilient in mock/offline mode
    }
  };

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === form.requestId) || null,
    [requests, form.requestId],
  );

  const averageScore = useMemo(() => {
    const semester1 = Number(form.semester1Score);
    const semester2 = Number(form.semester2Score);

    if (Number.isNaN(semester1) || Number.isNaN(semester2)) {
      return "";
    }

    return ((semester1 + semester2) / 2).toFixed(2);
  }, [form.semester1Score, form.semester2Score]);

  const scoringResult = useMemo(() => {
    if (!form.requestId) return null;

    return calculateEducationScore({
      experienceYears: Number(form.experienceYears) || 0,
      experienceMonths: Number(form.experienceMonths) || 0,
      performance1: Number(form.semester1Score) || 0,
      performance2: Number(form.semester2Score) || 0,
      hasDiscipline: form.hasDiscipline,
      gender: form.gender,
      isDisabled: form.isDisabled,
    });
  }, [
    form.requestId,
    form.experienceYears,
    form.experienceMonths,
    form.semester1Score,
    form.semester2Score,
    form.hasDiscipline,
    form.gender,
    form.isDisabled,
  ]);

  const resetForm = () => {
    setForm(initialForm);
    setSelectedEmployee(null);
    setSubmittingStatus(null);
  };

  const handleRequestSelect = async (request: EducationRequest) => {
    setForm({
      ...initialForm,
      requestId: request.id,
      experienceYears: request.workExperience?.toString() || "",
      gender: "Male", // Default
    });

    // Fetch employee details for gender fallback
    try {
      const empRes = await employeeApi.getById(request.employeeId);
      if (empRes.data.gender) {
        setForm((f) => ({ ...f, gender: empRes.data.gender }));
      }
      setSelectedEmployee(empRes.data);
    } catch {
      setSelectedEmployee({ gender: "Male" } as any);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent,
    status: VerificationStatus,
  ) => {
    e.preventDefault();

    if (!form.requestId) {
      alert("Please select a nominated employee request.");
      return;
    }

    const semester1Score = Number(form.semester1Score);
    const semester2Score = Number(form.semester2Score);

    if (Number.isNaN(semester1Score) || Number.isNaN(semester2Score)) {
      alert("Please enter valid semester scores.");
      return;
    }

    if (
      semester1Score < 0 ||
      semester1Score > 100 ||
      semester2Score < 0 ||
      semester2Score > 100
    ) {
      alert("Semester scores must be between 0 and 100.");
      return;
    }

    setLoading(true);
    setSubmittingStatus(status);

    try {
      await hrVerificationApi.verify({
        requestId: form.requestId,
        semester1Score,
        semester2Score,
        averageScore: Number(averageScore),
        hasDiscipline: form.hasDiscipline,
        disciplineDescription: form.disciplineDescription,
        experienceYears: Number(form.experienceYears),
        experienceMonths: Number(form.experienceMonths),
        isDisabled: form.isDisabled,
        gender: form.gender,
        experienceSubScore: scoringResult?.experienceScore,
        performanceSubScore: scoringResult?.performanceScore,
        disciplineSubScore: scoringResult?.disciplineScore,
        affirmativeBonus: scoringResult?.affirmativeBonus,
        totalCalculatedScore: scoringResult?.finalTotalScore,
        status,
      });

      await loadData();
      resetForm();
    } catch {
      alert("Failed to save HR verification.");
    } finally {
      setLoading(false);
      setSubmittingStatus(null);
    }
  };

  const renderVerificationStatus = (status?: string) => {
    const color =
      status === "VERIFIED"
        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
        : "bg-red-50 text-red-600 border border-red-100";

    const label =
      status === "VERIFIED"
        ? t("VERIFIED")
        : status === "REJECTED"
          ? t("REJECTED_HR")
          : "-";

    return (
      <span
        className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider italic ${color}`}
      >
        {label}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
            <ClipboardCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("hrVerifications")}
            </h1>
            <p className="text-sm text-gray-500 font-medium italic">
              HR reviews employees forwarded by the Cyber Development Center and
              records semester-based performance scores.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Nominated Employees from CDC
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">{t("fullName")}</th>
                  <th className="px-6 py-4">{t("department")}</th>
                  <th className="px-6 py-4">{t("educationOpportunity")}</th>
                  <th className="px-6 py-4">{t("institution")}</th>
                  <th className="px-6 py-4 text-right">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.length > 0 ? (
                  requests.map((request) => {
                    const isSelected = form.requestId === request.id;

                    return (
                      <tr
                        key={request.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-xs font-bold text-blue-600">
                          REQ-{request.id.toString().slice(-6)}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {request.employeeName}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-600">
                          {request.employeeDepartment}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700 text-xs italic">
                          {request.fieldOfStudy || (request as any).educationType} ({(request as any).targetEducationLevel || (request as any).educationLevel})
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-500">
                          {request.institution}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRequestSelect(request)}
                            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all shadow-sm ${
                              isSelected
                                ? "bg-blue-600 text-white shadow-blue-200"
                                : "bg-gray-50 text-gray-700 border border-gray-100 hover:bg-blue-600 hover:text-white"
                            }`}
                          >
                            {isSelected ? "Selected" : "Review"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
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

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-400">
            HR Performance Verification
          </h2>

          {selectedRequest ? (
            <form className="space-y-6">
              <div className="flex flex-col gap-6 rounded-xl border border-gray-100 bg-gray-50/30 p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {t("fullName")}
                    </p>
                    <p className="font-bold text-gray-900">
                      {selectedRequest.employeeName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {t("department")}
                    </p>
                    <p className="font-bold text-gray-900">
                      {selectedRequest.employeeDepartment}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {t("educationOpportunity")}
                    </p>
                    <p className="font-bold text-gray-900">
                      {selectedRequest.fieldOfStudy || (selectedRequest as any).educationType} ({(selectedRequest as any).targetEducationLevel || (selectedRequest as any).educationLevel})
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {t("institution")} & {t("budgetYear")}
                    </p>
                    <p className="font-bold text-gray-900">
                      {selectedRequest.institution || "-"}{" "}
                      {selectedRequest.budgetYear
                        ? `(Yr ${selectedRequest.budgetYear})`
                        : ""}
                    </p>
                  </div>
                </div>
                {((selectedRequest as any).remark ||
                  selectedRequest.description) && (
                  <div className="space-y-1 border-t border-gray-200/60 pt-4 mt-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Description / Remark
                    </p>
                    <p className="text-sm font-medium text-gray-700 leading-relaxed">
                      {(selectedRequest as any).remark ||
                        selectedRequest.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {/* Performance Inputs */}
                <div className="flex flex-col space-y-4 rounded-xl border border-gray-100 bg-gray-50/20 p-5 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600">
                      Performance Data
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap">
                        Performance 1 (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        required
                        value={form.semester1Score}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            semester1Score: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap">
                        Performance 2 (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        required
                        value={form.semester2Score}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            semester2Score: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                    </div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Avg. Performance
                    </span>
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                      {averageScore || "0.00"}%
                    </span>
                  </div>
                </div>

                {/* Experience & Disability Inputs */}
                <div className="flex flex-col space-y-4 rounded-xl border border-gray-100 bg-gray-50/20 p-5 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-4 w-4 text-blue-600" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600">
                      Work Exp & Status
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap">
                        Exp. Years
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={form.experienceYears}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            experienceYears: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap">
                        Exp. Months
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="11"
                        required
                        value={form.experienceMonths}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            experienceMonths: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                    </div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Gender
                      </span>
                      <div className="flex rounded-lg border border-gray-200 bg-white p-1">
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, gender: "Male" }))
                          }
                          className={`rounded-md px-3 py-1 text-[10px] font-bold uppercase transition-all ${
                            form.gender === "Male"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          Male
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, gender: "Female" }))
                          }
                          className={`rounded-md px-3 py-1 text-[10px] font-bold uppercase transition-all ${
                            form.gender === "Female"
                              ? "bg-pink-600 text-white shadow-sm"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          Female
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Status
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, isDisabled: !f.isDisabled }))
                        }
                        className={`rounded-lg px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm ${
                          form.isDisabled
                            ? "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200"
                            : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {form.isDisabled ? "Disabled" : "Not Disabled"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Real-time Scoring Preview */}
                {scoringResult && (
                  <div className="flex flex-col rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/30 p-6 shadow-sm shadow-blue-50/50 xl:col-span-1 lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4 text-blue-800">
                      <Calculator className="h-5 w-5" />
                      <h3 className="text-sm font-bold uppercase tracking-widest">
                        Score Breakdown
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4 sm:grid-cols-4 lg:grid-cols-4">
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                          Exp (30%)
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {scoringResult.experienceScore.toFixed(2)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                          Perf (60%)
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {scoringResult.performanceScore.toFixed(2)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                          Disc (10%)
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {scoringResult.disciplineScore.toFixed(2)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                          Bonus
                        </p>
                        <p className="text-lg font-bold text-indigo-600">
                          +{scoringResult.affirmativeBonus.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto pt-6 border-t border-blue-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                          Final Total Score
                        </p>
                        <p className="text-3xl font-black text-blue-900 tracking-tighter">
                          {scoringResult.finalTotalScore.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-white/60 px-2.5 py-1.5 rounded-lg border border-blue-100 backdrop-blur-sm"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/30 p-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {t("disciplineRecord")}
                  </h3>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 bg-white transition-all checked:border-blue-600 checked:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                          checked={form.hasDiscipline}
                          onChange={() =>
                            setForm((prev) => ({
                              ...prev,
                              hasDiscipline: true,
                            }))
                          }
                        />
                        <CheckCircle2 className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5" />
                      </div>
                      <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600 transition-colors uppercase tracking-widest text-[10px]">
                        {t("yes")}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 bg-white transition-all checked:border-blue-600 checked:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                          checked={!form.hasDiscipline}
                          onChange={() =>
                            setForm((prev) => ({
                              ...prev,
                              hasDiscipline: false,
                            }))
                          }
                        />
                        <CheckCircle2 className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5" />
                      </div>
                      <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600 transition-colors uppercase tracking-widest text-[10px]">
                        {t("no")}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {t("disciplineDescription")}
                  </label>
                  <textarea
                    rows={3}
                    value={form.disciplineDescription}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        disciplineDescription: e.target.value,
                      }))
                    }
                    placeholder="Enter details if there is a disciplinary record..."
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, "VERIFIED")}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {loading && submittingStatus === "VERIFIED"
                    ? t("loading")
                    : t("VERIFIED")}
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, "REJECTED")}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-8 py-2.5 text-sm font-bold text-white shadow-md shadow-red-200 hover:bg-red-700 disabled:opacity-50 transition-all"
                >
                  <XCircle className="h-4 w-4" />
                  {loading && submittingStatus === "REJECTED"
                    ? t("loading")
                    : t("REJECTED_HR")}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-200 bg-white px-8 py-2.5 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
              Select a nominated employee request from the table above to enter
              semester 1, semester 2, and the auto-calculated average.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Verified / Rejected Requests
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">{t("educationRequests")} ID</th>
                  <th className="px-6 py-4">{t("semester1Score")}</th>
                  <th className="px-6 py-4">{t("semester2Score")}</th>
                  <th className="px-6 py-4 text-blue-600">
                    {t("averageScore")}
                  </th>
                  <th className="px-6 py-4">Calc. Score</th>
                  <th className="px-6 py-4">{t("disciplineRecord")}</th>
                  <th className="px-6 py-4">{t("status")}</th>
                  <th className="px-6 py-4">{t("verifiedBy")}</th>
                  <th className="px-6 py-4">{t("verifiedAt")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {verifications.length > 0 ? (
                  verifications.map((verification) => (
                    <tr
                      key={verification.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-xs font-bold text-blue-600 uppercase">
                        VER-{verification.id.toString().slice(-6)}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        REQ-{verification.requestId.toString().slice(-6)}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {verification.semester1Score}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {verification.semester2Score}
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-700 tracking-tight">
                        {verification.averageScore}%
                      </td>
                      <td className="px-6 py-4 font-black text-indigo-700">
                        {verification.totalCalculatedScore?.toFixed(2) || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex w-fit rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${verification.hasDiscipline ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}
                          >
                            {verification.hasDiscipline ? t("yes") : t("no")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderVerificationStatus(verification.status)}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-500 italic">
                        {verification.verifiedBy}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-400">
                        {verification.verifiedAt}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
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
