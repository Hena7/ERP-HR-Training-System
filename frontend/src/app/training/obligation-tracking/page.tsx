"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  trainingContractApi,
  trainingObligationApi,
} from "@/app/training/services/trainingApi";
import { employeeApi } from "@/lib/api";
import { TrainingObligation, TrainingContract } from "@/types/training";
import {
  Clock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { calculateObligation } from "@/app/training/services/obligationCalculator";

export default function ObligationTrackingPage() {
  const { t } = useLanguage();
  const [contracts, setContracts] = useState<TrainingContract[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [obligations, setObligations] = useState<TrainingObligation[]>([]);
  const [selectedContract, setSelectedContract] =
    useState<TrainingContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const [form, setForm] = useState({
    contractId: "",
    employeeName: "",
    startDate: "",
    endDate: "",
    obligationMonths: "",
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      trainingContractApi.getAll(),
      trainingObligationApi.getAll(),
      employeeApi.getAll(0, 100).catch(() => ({ data: { content: [] } })),
    ]).then(([{ data: c }, { data: o }, { data: e }]) => {
      setContracts(c);
      setObligations(o);
      setEmployees(e.content || []);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleContractSelect = (c: TrainingContract) => {
    const cost = (c as any).estimatedCost || 0;
    const obl = calculateObligation(cost);
    setSelectedContract(c);
    setForm((prev) => ({
      ...prev,
      contractId: String(c.id),
      employeeName: c.employeeName || "",
      obligationMonths: obl.requiresContract ? String(obl.months) : "",
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await trainingObligationApi.create({
      ...form,
      contractId: Number(form.contractId),
      obligationMonths: parseInt(form.obligationMonths),
    });
    setShowAdd(false);
    setSelectedContract(null);
    setForm({
      contractId: "",
      employeeName: "",
      startDate: "",
      endDate: "",
      obligationMonths: "",
    });
    load();
  };

  const handleStatusChange = async (id: number, status: string) => {
    setBusyId(id);
    await trainingObligationApi.updateStatus(id, status);
    setBusyId(null);
    load();
  };

  const statusConfig: Record<
    string,
    { color: string; icon: any; label: string }
  > = {
    ACTIVE: {
      color: "bg-blue-100 text-blue-800",
      icon: Clock,
      label: "Active",
    },
    COMPLETED: {
      color: "bg-emerald-100 text-emerald-800",
      icon: CheckCircle2,
      label: "Completed",
    },
    VIOLATED: {
      color: "bg-red-100 text-red-800",
      icon: AlertTriangle,
      label: "Violated",
    },
  };

  const fieldClass =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all";
  const labelClass =
    "block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("obligationTracking")}
              </h1>
              <p className="text-sm text-gray-500 font-medium italic">
                {obligations.length} obligation record(s)
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-md"
          >
            <Plus className="h-4 w-4" /> New Obligation
          </button>
        </div>

        {/* Obligations Table */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <tr>
                {[
                  "OBL-ID",
                  t("fullName"),
                  t("startDate"),
                  t("endDate"),
                  t("obligationMonths"),
                  t("status"),
                  t("actions"),
                ].map((h) => (
                  <th key={h} className="px-6 py-4 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-sm text-gray-400"
                  >
                    {t("loading")}
                  </td>
                </tr>
              ) : obligations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <Clock className="h-10 w-10 text-gray-300 mb-3" />
                      <p className="text-sm font-bold text-gray-700">
                        {t("noData")}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                obligations.map((ob) => {
                  const sc = statusConfig[ob.status] || statusConfig.ACTIVE;
                  const Icon = sc.icon;
                  return (
                    <tr
                      key={ob.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-xs font-bold text-blue-600">
                        OBL-{ob.id.toString().slice(-6)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {ob.employeeName && ob.employeeName !== "Keycloak User"
                          ? ob.employeeName
                          : (() => {
                              const contract = contracts.find(
                                (c) => c.id === ob.contractId,
                              );
                              return (
                                employees.find(
                                  (e) =>
                                    String(e.employeeId) ===
                                    String(contract?.employeeId),
                                )?.fullName ||
                                ob.employeeName ||
                                "Keycloak User"
                              );
                            })()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {ob.startDate}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {ob.endDate}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-700">
                        {ob.obligationMonths} mo
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${sc.color}`}
                        >
                          <Icon className="h-3 w-3" /> {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {ob.status === "ACTIVE" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(ob.id, "COMPLETED")
                                }
                                disabled={busyId === ob.id}
                                className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all"
                              >
                                <CheckCircle2 className="inline h-3 w-3 mr-0.5" />{" "}
                                Complete
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(ob.id, "VIOLATED")
                                }
                                disabled={busyId === ob.id}
                                className="rounded-lg bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700 hover:bg-red-600 hover:text-white transition-all"
                              >
                                <AlertTriangle className="inline h-3 w-3 mr-0.5" />{" "}
                                Violate
                              </button>
                            </>
                          )}
                          {ob.status === "COMPLETED" && (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />{" "}
                              {t("releaseGuarantor")}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Obligation Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50/30 px-6 py-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                New Obligation Record
              </h3>
            </div>

            {/* Contract Selection List in Modal */}
            <div className="overflow-x-auto border-b border-gray-100 max-h-52">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400 sticky top-0">
                  <tr>
                    <th className="px-5 py-3">CTR-ID</th>
                    <th className="px-5 py-3">{t("fullName")}</th>
                    <th className="px-5 py-3">{t("department")}</th>
                    <th className="px-5 py-3 text-right">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {contracts.length > 0 ? (
                    contracts.map((c) => {
                      const isSelected = selectedContract?.id === c.id;
                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-5 py-3 font-bold text-blue-600">
                            CTR-{c.id.toString().slice(-6)}
                          </td>
                          <td className="px-5 py-3 font-bold text-gray-900">
                            {c.employeeName && c.employeeName !== "Keycloak User"
                              ? c.employeeName
                              : employees.find((e) => String(e.employeeId) === String(c.employeeId))?.fullName ||
                                c.employeeName ||
                                "Keycloak User"}
                          </td>
                          <td className="px-5 py-3 font-medium text-gray-600">
                            {c.employeeDepartment || "—"}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleContractSelect(c)}
                              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all shadow-sm ${
                                isSelected
                                  ? "bg-blue-600 text-white shadow-blue-200"
                                  : "bg-gray-50 text-gray-700 border border-gray-100 hover:bg-blue-600 hover:text-white"
                              }`}
                            >
                              {isSelected ? "Selected" : "Select"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-6 text-center text-gray-400"
                      >
                        {t("noData")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {selectedContract &&
                (() => {
                  const cost = (selectedContract as any).estimatedCost || 0;
                  const obl = calculateObligation(cost);
                  return (
                    <div className="rounded-lg border border-blue-100 bg-blue-50/40 px-4 py-3 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">
                        Selected Contract
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        CTR-{selectedContract.id.toString().slice(-6)} —{" "}
                        {selectedContract.employeeName && selectedContract.employeeName !== "Keycloak User"
                          ? selectedContract.employeeName
                          : employees.find((e) => String(e.employeeId) === String(selectedContract.employeeId))?.fullName ||
                            selectedContract.employeeName ||
                            "Keycloak User"}
                      </p>
                      {obl.requiresContract ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-amber-100 px-3 py-0.5 text-[10px] font-bold text-amber-800">
                            Cost: {cost.toLocaleString()} ETB
                          </span>
                          <span className="rounded-full bg-blue-100 px-3 py-0.5 text-[10px] font-bold text-blue-800">
                            Auto-calculated: {obl.label} ({obl.months} months)
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-bold">
                          Cost below threshold — no obligation required
                        </span>
                      )}
                    </div>
                  );
                })()}
              <div>
                <label className={labelClass}>{t("fullName")}</label>
                <input
                  value={form.employeeName}
                  onChange={(e) =>
                    setForm({ ...form, employeeName: e.target.value })
                  }
                  required
                  className={fieldClass}
                  placeholder="Trainee full name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t("startDate")}</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                    required
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("endDate")}</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                    required
                    className={fieldClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t("obligationMonths")}</label>
                <input
                  type="number"
                  value={form.obligationMonths}
                  onChange={(e) =>
                    setForm({ ...form, obligationMonths: e.target.value })
                  }
                  required
                  className={fieldClass}
                  placeholder="Auto-filled from cost — or enter manually"
                />
                <p className="mt-1 text-[10px] text-gray-400">
                  Auto-calculated from contract cost based on INSA obligation
                  schedule.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!selectedContract}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  Create Record
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdd(false);
                    setSelectedContract(null);
                    setForm({
                      contractId: "",
                      employeeName: "",
                      startDate: "",
                      endDate: "",
                      obligationMonths: "",
                    });
                  }}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
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
