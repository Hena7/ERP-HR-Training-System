"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { educationRequestApi, hrVerificationApi } from "@/lib/api";
import { EducationRequest, HRVerification } from "@/types";
import { CheckCircle2, ClipboardCheck, XCircle, RotateCcw } from "lucide-react";

type VerificationStatus = "VERIFIED" | "REJECTED" | "RETURNED_TO_DEPT";

interface VerificationFormState {
  requestId: number | null;
  semester1Score: string;
  semester2Score: string;
  hasDiscipline: boolean;
  disciplineDescription: string;
}

const initialForm: VerificationFormState = {
  requestId: null,
  semester1Score: "",
  semester2Score: "",
  hasDiscipline: false,
  disciplineDescription: "",
};

export default function HRVerificationsPage() {
  const { t } = useLanguage();

  const [requests, setRequests] = useState<EducationRequest[]>([]);
  const [verifications, setVerifications] = useState<HRVerification[]>([]);
  const [form, setForm] = useState<VerificationFormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [submittingStatus, setSubmittingStatus] =
    useState<VerificationStatus | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    try {
      const [requestRes, verificationRes] = await Promise.all([
        educationRequestApi.getByStatus(["CDC_APPROVED", "FORWARDED_TO_HR"], 0, 100),
        hrVerificationApi.getAll(0, 100),
      ]);

      setRequests(requestRes.data.content || []);
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

  const resetForm = () => {
    setForm(initialForm);
    setSubmittingStatus(null);
  };

  const handleRequestSelect = (requestId: number) => {
    setForm({
      requestId,
      semester1Score: "",
      semester2Score: "",
      hasDiscipline: false,
      disciplineDescription: "",
    });
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
        ? "bg-green-100 text-green-800"
        : status === "RETURNED_TO_DEPT"
          ? "bg-amber-100 text-amber-800"
          : "bg-red-100 text-red-800";

    const label =
      status === "VERIFIED"
        ? t("VERIFIED")
        : status === "REJECTED"
          ? t("REJECTED_HR")
          : status === "RETURNED_TO_DEPT"
            ? t("RETURNED_TO_DEPT")
            : "-";

    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}
      >
        {label}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("hrVerifications")}
            </h1>
            <p className="text-sm text-gray-500">
              HR reviews employees forwarded by the Cyber Development Center and
              records semester-based performance scores.
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Nominated Employees from CDC
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">{t("fullName")}</th>
                  <th className="px-4 py-3">{t("department")}</th>
                  <th className="px-4 py-3">{t("educationOpportunity")}</th>
                  <th className="px-4 py-3">{t("institution")}</th>
                  <th className="px-4 py-3 text-right">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.length > 0 ? (
                  requests.map((request) => {
                    const isSelected = form.requestId === request.id;

                    return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">#{request.id}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {request.employeeName}
                        </td>
                        <td className="px-4 py-3">
                          {request.employeeDepartment}
                        </td>
                        <td className="px-4 py-3">
                          {request.educationType} ({request.educationLevel})
                        </td>
                        <td className="px-4 py-3">{request.institution}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRequestSelect(request.id)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                              isSelected
                                ? "bg-blue-100 text-blue-700"
                                : "bg-blue-600 text-white hover:bg-blue-700"
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

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            HR Performance Verification
          </h2>

          {selectedRequest ? (
            <form className="space-y-6">
              <div className="grid grid-cols-1 gap-4 rounded-lg border bg-gray-50 p-4 md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase text-gray-500">
                    {t("fullName")}
                  </p>
                  <p className="mt-1 font-medium text-gray-900">
                    {selectedRequest.employeeName}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">
                    {t("department")}
                  </p>
                  <p className="mt-1 font-medium text-gray-900">
                    {selectedRequest.employeeDepartment}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">
                    {t("educationOpportunity")}
                  </p>
                  <p className="mt-1 font-medium text-gray-900">
                    {selectedRequest.educationType} (
                    {selectedRequest.educationLevel})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t("semester1Score")}
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
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t("semester2Score")}
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
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t("averageScore")}
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={averageScore}
                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-700 focus:outline-none"
                    placeholder="Auto-calculated"
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {t("disciplineRecord")}
                  </h3>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.hasDiscipline}
                        onChange={() =>
                          setForm((prev) => ({
                            ...prev,
                            hasDiscipline: true,
                          }))
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {t("yes")}
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={!form.hasDiscipline}
                        onChange={() =>
                          setForm((prev) => ({
                            ...prev,
                            hasDiscipline: false,
                          }))
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {t("no")}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t("disciplineDescription")}
                  </label>
                  <textarea
                    rows={2}
                    value={form.disciplineDescription}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        disciplineDescription: e.target.value,
                      }))
                    }
                    placeholder="Enter details if there is a disciplinary record..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, "VERIFIED")}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
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
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  {loading && submittingStatus === "REJECTED"
                    ? t("loading")
                    : t("REJECTED_HR")}
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, "RETURNED_TO_DEPT")}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  {loading && submittingStatus === "RETURNED_TO_DEPT"
                    ? t("loading")
                    : t("RETURNED_TO_DEPT")}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
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

        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Verified / Rejected Requests
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">{t("educationRequests")} ID</th>
                  <th className="px-4 py-3">{t("semester1Score")}</th>
                  <th className="px-4 py-3">{t("semester2Score")}</th>
                  <th className="px-4 py-3">{t("averageScore")}</th>
                  <th className="px-4 py-3">{t("disciplineRecord")}</th>
                  <th className="px-4 py-3">{t("status")}</th>
                  <th className="px-4 py-3">{t("verifiedBy")}</th>
                  <th className="px-4 py-3">{t("verifiedAt")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {verifications.length > 0 ? (
                  verifications.map((verification) => (
                    <tr key={verification.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{verification.id}</td>
                      <td className="px-4 py-3">#{verification.requestId}</td>
                      <td className="px-4 py-3">
                        {verification.semester1Score}
                      </td>
                      <td className="px-4 py-3">
                        {verification.semester2Score}
                      </td>
                      <td className="px-4 py-3">{verification.averageScore}</td>
                      <td className="px-4 py-3 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-medium ${verification.hasDiscipline ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                            {verification.hasDiscipline ? t("yes") : t("no")}
                          </span>
                          {verification.disciplineDescription && (
                            <p className="max-w-[120px] truncate text-[9px] text-gray-400" title={verification.disciplineDescription}>{verification.disciplineDescription}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {renderVerificationStatus(verification.status)}
                      </td>
                      <td className="px-4 py-3">{verification.verifiedBy}</td>
                      <td className="px-4 py-3">{verification.verifiedAt}</td>
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
