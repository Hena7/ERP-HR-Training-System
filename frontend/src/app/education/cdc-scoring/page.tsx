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
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("cdcScoring")}</h1>
            <p className="text-sm text-gray-500 font-medium italic">
              {t("experienceWeight")}: {(config.experienceWeight * 100).toFixed(0)}% · 
              {t("performanceWeight")}: {(config.performanceWeight * 100).toFixed(0)}% · 
              {t("disciplineWeight")}: {(config.disciplineWeight * 100).toFixed(0)}%
            </p>
          </div>
          <button
            onClick={() => setIsConfigOpen(true)}
            className="ml-auto inline-flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Settings className="h-4 w-4" />
            {t("scoringConfig")}
          </button>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {t("hrVerifiedRequests")}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">{t("fullName")}</th>
                  <th className="px-6 py-4">{t("workExperience")}</th>
                  <th className="px-6 py-4">Auto-Score (HR)</th>
                  <th className="px-6 py-4">{t("disciplineRecord")}</th>
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
                        <td className="px-6 py-4 font-medium text-gray-700">{request.workExperience} Years</td>
                        <td className="px-6 py-4 font-black text-indigo-600">
                          {hrVer?.totalCalculatedScore?.toFixed(2) || hrVer?.averageScore || "-"}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${request.description?.toLowerCase().includes("discipline") ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                                {request.description?.toLowerCase().includes("discipline") ? t("hasDisciplineRecord") : t("noDisciplineRecord")}
                            </span>
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

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-400">
            {t("cdcScoringTitle")}
          </h2>

          {selectedRequest ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-5 rounded-xl border border-blue-100 bg-blue-50/30 p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                  <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
                          <Info className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{t("fullName")}</p>
                          <p className="text-sm font-bold text-gray-900">{selectedRequest.employeeName}</p>
                      </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{t("educationOpportunity")}</p>
                    <p className="text-sm font-bold text-gray-900">
                        {selectedRequest.educationType} ({selectedRequest.educationLevel})
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                        @ {selectedRequest.institution || "-"}
                    </p>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{t("workExperience")}</p>
                     <p className="text-sm font-bold text-gray-900">{selectedRequest.workExperience} {t("years") || "Years"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Automated HR Score</p>
                    <p className="text-sm font-black text-indigo-600">{hrVerifications[selectedRequest.id]?.totalCalculatedScore?.toFixed(2) || "-"}</p>
                  </div>
                </div>
                {((selectedRequest as any).remark || selectedRequest.description) && (
                  <div className="border-t border-blue-200/50 pt-4 mt-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                      Description / Remark
                    </p>
                    <p className="text-sm font-medium text-gray-700 leading-relaxed">
                      {(selectedRequest as any).remark || selectedRequest.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {t("experienceScore")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={form.experienceScore}
                    onChange={(e) => setForm({ ...form, experienceScore: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="0-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
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
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="0-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {t("disciplineScore")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={form.disciplineScore}
                    onChange={(e) => setForm({ ...form, disciplineScore: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="0-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-blue-900 px-6 py-5 text-white shadow-xl">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">{t("totalScore")}</p>
                  <p className="text-3xl font-bold tracking-tight">{totalScore || "0.00"}<span className="text-lg ml-0.5 opacity-60">%</span></p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-bold hover:bg-white/10 transition-all"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !totalScore}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/40 hover:bg-blue-600 transition-all disabled:opacity-50"
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

      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl border border-gray-100">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{t("scoringConfig")}</h3>
              <button 
                onClick={() => setIsConfigOpen(false)}
                className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleUpdateConfig} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
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
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
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
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
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
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">
                  <Info className="mr-1 inline h-3.5 w-3.5" />
                  {t("weightSumError")}
                </p>
                <p className="text-xl font-bold text-blue-900">
                  {(Number(configForm.experienceWeight) + Number(configForm.performanceWeight) + Number(configForm.disciplineWeight)).toFixed(2)}
                </p>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? t("loading") : t("updateWeights")}
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="flex-1 rounded-lg border border-gray-200 bg-white py-3.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
