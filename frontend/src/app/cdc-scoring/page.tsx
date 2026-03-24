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
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState({
    experienceWeight: 0.3,
    performanceWeight: 0.5,
    disciplineWeight: 0.2,
  });
  const [configForm, setConfigForm] = useState({
    experienceWeight: "0.3",
    performanceWeight: "0.5",
    disciplineWeight: "0.2",
  });

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

      const configRes = await cdcScoringApi.getScoringConfig();
      setConfig(configRes.data);
      setConfigForm({
        experienceWeight: configRes.data.experienceWeight.toString(),
        performanceWeight: configRes.data.performanceWeight.toString(),
        disciplineWeight: configRes.data.disciplineWeight.toString(),
      });
    } catch {
      // Offline resilient
    }
  };

  const selectedRequest = useMemo(
    () => requests.find((r) => r.id === form.requestId) || null,
    [requests, form.requestId]
  );

  const totalScore = useMemo(() => {
    const exp = Number(form.experienceScore);
    const perf = Number(form.performanceScore);
    const disc = Number(form.disciplineScore);

    if (Number.isNaN(exp) || Number.isNaN(perf) || Number.isNaN(disc)) {
      return "";
    }

    return (exp * config.experienceWeight + perf * config.performanceWeight + disc * config.disciplineWeight).toFixed(2);
  }, [form.experienceScore, form.performanceScore, form.disciplineScore, config]);

  const resetForm = () => {
    setForm(initialForm);
  };

  const handleRequestSelect = (request: EducationRequest) => {
    // Pre-fill performance score from HR average if available
    const hrVer = hrVerifications[request.id];
    setForm({
      requestId: request.id,
      experienceScore: "",
      performanceScore: hrVer ? hrVer.averageScore.toString() : "",
      disciplineScore: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.requestId) return;

    const exp = Number(form.experienceScore);
    const perf = Number(form.performanceScore);
    const disc = Number(form.disciplineScore);

    if (
      [exp, perf, disc].some((s) => Number.isNaN(s) || s < 0 || s > 100)
    ) {
      alert("All scores must be between 0 and 100.");
      return;
    }

    setLoading(true);
    try {
      await cdcScoringApi.score({
        requestId: form.requestId,
        experienceScore: exp,
        performanceScore: perf,
        disciplineScore: disc,
      });

      await loadData();
      resetForm();
    } catch {
      alert("Failed to save CDC scoring.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newConfig = {
        experienceWeight: Number(configForm.experienceWeight),
        performanceWeight: Number(configForm.performanceWeight),
        disciplineWeight: Number(configForm.disciplineWeight),
      };
      await cdcScoringApi.updateScoringConfig(newConfig);
      setConfig(newConfig);
      setIsConfigOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to update configuration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("cdcScoring")}</h1>
            <p className="text-sm text-gray-500">
              {t("experienceWeight")}: {config.experienceWeight * 100}% · 
              {t("performanceWeight")}: {config.performanceWeight * 100}% · 
              {t("disciplineWeight")}: {config.disciplineWeight * 100}%
            </p>
          </div>
          <button
            onClick={() => setIsConfigOpen(true)}
            className="ml-auto inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <Settings className="h-4 w-4" />
            {t("scoringConfig")}
          </button>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {t("hrVerifiedRequests")}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">{t("fullName")}</th>
                  <th className="px-4 py-3">{t("workExperience")}</th>
                  <th className="px-4 py-3">{t("averageScore")} (HR)</th>
                  <th className="px-4 py-3">{t("disciplineRecord")}</th>
                  <th className="px-4 py-3 text-right">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.length > 0 ? (
                  requests.map((request) => {
                    const isSelected = form.requestId === request.id;
                    const hrVer = hrVerifications[request.id];

                    return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">#{request.id}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {request.employeeName}
                        </td>
                        <td className="px-4 py-3">{request.workExperience}</td>
                        <td className="px-4 py-3">
                          {hrVer ? hrVer.averageScore : "-"}
                        </td>
                        <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${request.description?.toLowerCase().includes("discipline") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                {request.description?.toLowerCase().includes("discipline") ? t("hasDisciplineRecord") : t("noDisciplineRecord")}
                            </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRequestSelect(request)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                              isSelected
                                ? "bg-blue-100 text-blue-700"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {isSelected ? "Selected" : t("scoreRequest")}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
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
            {t("cdcScoringTitle")}
          </h2>

          {selectedRequest ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 rounded-lg border bg-blue-50/50 p-4 md:grid-cols-3">
                <div className="flex items-start gap-3">
                    <Info className="mt-0.5 h-4 w-4 text-blue-500" />
                    <div>
                        <p className="text-xs uppercase text-gray-500 font-bold">{t("fullName")}</p>
                        <p className="font-medium text-gray-900">{selectedRequest.employeeName}</p>
                    </div>
                </div>
                <div>
                   <p className="text-xs uppercase text-gray-500 font-bold">{t("workExperience")}</p>
                   <p className="font-medium text-gray-900">{selectedRequest.workExperience} {t("years") || "Years"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 font-bold">{t("averageScore")} (HR)</p>
                  <p className="font-medium text-gray-900">{hrVerifications[selectedRequest.id]?.averageScore || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t("experienceScore")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={form.experienceScore}
                    onChange={(e) => setForm({ ...form, experienceScore: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="0-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t("performanceScore")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                    value={form.performanceScore}
                    onChange={(e) => setForm({ ...form, performanceScore: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="0-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t("disciplineScore")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={form.disciplineScore}
                    onChange={(e) => setForm({ ...form, disciplineScore: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="0-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-gray-900 p-4 text-white">
                <div>
                  <p className="text-xs uppercase opacity-70 font-bold">{t("totalScore")}</p>
                  <p className="text-2xl font-bold">{totalScore || "0.00"}%</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !totalScore}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {loading ? t("loading") : t("submit")}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
              Select an HR-verified request above to start weighted scoring.
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="border-b px-6 py-4 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">{t("scoredRequests")}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">{t("educationRequests")} ID</th>
                  <th className="px-4 py-3">Exp%</th>
                  <th className="px-4 py-3">Perf%</th>
                  <th className="px-4 py-3">Disc%</th>
                  <th className="px-4 py-3 font-bold text-blue-600">{t("totalScore")}</th>
                  <th className="px-4 py-3">{t("gradedBy")}</th>
                  <th className="px-4 py-3">{t("verifiedAt")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {scorings.length > 0 ? (
                  scorings.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{s.id}</td>
                      <td className="px-4 py-3">#{s.requestId}</td>
                      <td className="px-4 py-3">{s.experienceScore}</td>
                      <td className="px-4 py-3">{s.performanceScore}</td>
                      <td className="px-4 py-3">{s.disciplineScore}</td>
                      <td className="px-4 py-3 font-bold text-blue-700">{s.totalScore}%</td>
                      <td className="px-4 py-3 text-xs">{s.gradedBy}</td>
                      <td className="px-4 py-3 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
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

      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{t("scoringConfig")}</h3>
              <button 
                onClick={() => setIsConfigOpen(false)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleUpdateConfig} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("experienceWeight")} (0.0 - 1.0)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  required
                  value={configForm.experienceWeight}
                  onChange={(e) => setConfigForm({ ...configForm, experienceWeight: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("performanceWeight")} (0.0 - 1.0)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  required
                  value={configForm.performanceWeight}
                  onChange={(e) => setConfigForm({ ...configForm, performanceWeight: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("disciplineWeight")} (0.0 - 1.0)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  required
                  value={configForm.disciplineWeight}
                  onChange={(e) => setConfigForm({ ...configForm, disciplineWeight: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-xs text-blue-700">
                  <Info className="mr-1 inline h-3 w-3" />
                  {t("weightSumError")}
                </p>
                <p className="mt-1 text-sm font-bold text-blue-900">
                  Total: {(Number(configForm.experienceWeight) + Number(configForm.performanceWeight) + Number(configForm.disciplineWeight)).toFixed(2)}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="flex-1 rounded-lg border py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? t("loading") : t("updateWeights")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
