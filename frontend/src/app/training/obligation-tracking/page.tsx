"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  trainingContractApi,
  trainingObligationApi,
} from "@/app/training/services/trainingApi";
import { TrainingObligation, TrainingContract } from "@/types/training";
import {
  Clock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Calendar,
} from "lucide-react";

export default function ObligationTrackingPage() {
  const { t } = useLanguage();
  const [contracts, setContracts] = useState<TrainingContract[]>([]);
  const [obligations, setObligations] = useState<TrainingObligation[]>([]);
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
    ]).then(([{ data: c }, { data: o }]) => {
      setContracts(c);
      setObligations(o);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await trainingObligationApi.create({
      ...form,
      contractId: Number(form.contractId),
      obligationMonths: parseInt(form.obligationMonths),
    });
    setShowAdd(false);
    setForm({ contractId: "", employeeName: "", startDate: "", endDate: "", obligationMonths: "" });
    load();
  };

  const handleStatusChange = async (id: number, status: string) => {
    setBusyId(id);
    await trainingObligationApi.updateStatus(id, status);
    setBusyId(null);
    load();
  };

  const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    ACTIVE: { color: "bg-blue-100 text-blue-800", icon: Clock, label: "Active" },
    COMPLETED: { color: "bg-emerald-100 text-emerald-800", icon: CheckCircle2, label: "Completed" },
    VIOLATED: { color: "bg-red-100 text-red-800", icon: AlertTriangle, label: "Violated" },
  };

  const fieldClass =
    "w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all";
  const labelClass =
    "block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                {t("obligationTracking")}
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                {obligations.length} obligation record(s)
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2.5 text-sm font-black text-white hover:opacity-90 transition-all shadow-lg shadow-rose-200"
          >
            <Plus className="h-4 w-4" /> {t("startDate")} Obligation
          </button>
        </div>

        {/* Add Form Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border-2 border-gray-100 p-6 space-y-4">
              <h3 className="text-sm font-black text-gray-900">New Obligation Record</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className={labelClass}>Contract</label>
                  <select value={form.contractId} onChange={(e) => setForm({ ...form, contractId: e.target.value })} required className={fieldClass + " appearance-none"}>
                    <option value="">— Select Contract —</option>
                    {contracts.map((c) => <option key={c.id} value={c.id}>CTR-{c.id.toString().slice(-6)} — {c.employeeName}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t("fullName")}</label>
                  <input value={form.employeeName} onChange={(e) => setForm({ ...form, employeeName: e.target.value })} required className={fieldClass} placeholder="Trainee full name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t("startDate")}</label>
                    <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required className={fieldClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t("endDate")}</label>
                    <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required className={fieldClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t("obligationMonths")}</label>
                  <input type="number" value={form.obligationMonths} onChange={(e) => setForm({ ...form, obligationMonths: e.target.value })} required className={fieldClass} placeholder="e.g. 24" />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2.5 text-sm font-black text-white hover:opacity-90">
                    Create
                  </button>
                  <button type="button" onClick={() => setShowAdd(false)} className="rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50">
                    {t("cancel")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl border-2 border-gray-100 bg-white shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {["OBL-ID", t("fullName"), t("startDate"), t("endDate"), t("obligationMonths"), t("status"), t("actions")].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center text-sm text-gray-400">{t("loading")}</td></tr>
              ) : obligations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <Clock className="h-10 w-10 text-gray-300 mb-3" />
                      <p className="text-sm font-bold text-gray-700">{t("noData")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                obligations.map((ob) => {
                  const sc = statusConfig[ob.status] || statusConfig.ACTIVE;
                  const Icon = sc.icon;
                  return (
                    <tr key={ob.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 text-xs font-black text-rose-700">OBL-{ob.id.toString().slice(-6)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{ob.employeeName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{ob.startDate}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{ob.endDate}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-700">{ob.obligationMonths} mo</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${sc.color}`}>
                          <Icon className="h-3 w-3" /> {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {ob.status === "ACTIVE" && (
                            <>
                              <button
                                onClick={() => handleStatusChange(ob.id, "COMPLETED")}
                                disabled={busyId === ob.id}
                                className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all"
                              >
                                <CheckCircle2 className="inline h-3 w-3 mr-0.5" /> Complete
                              </button>
                              <button
                                onClick={() => handleStatusChange(ob.id, "VIOLATED")}
                                disabled={busyId === ob.id}
                                className="rounded-lg bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700 hover:bg-red-600 hover:text-white transition-all"
                              >
                                <AlertTriangle className="inline h-3 w-3 mr-0.5" /> Violate
                              </button>
                            </>
                          )}
                          {ob.status === "COMPLETED" && (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> {t("releaseGuarantor")}
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
    </DashboardLayout>
  );
}
