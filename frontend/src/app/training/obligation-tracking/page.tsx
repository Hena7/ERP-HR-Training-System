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
  X,
  FileText,
} from "lucide-react";

const fieldClass =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5";

export default function ObligationTrackingPage() {
  const { t } = useLanguage();
  const [contracts, setContracts] = useState<TrainingContract[]>([]);
  const [obligations, setObligations] = useState<TrainingObligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);

  const [form, setForm] = useState({
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

  const selectedContract = contracts.find(c => c.id === selectedContractId) || null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;
    await trainingObligationApi.create({
      ...form,
      contractId: selectedContract.id,
      employeeName: selectedContract.employeeName,
      obligationMonths: parseInt(form.obligationMonths),
    });
    setShowAdd(false);
    setSelectedContractId(null);
    setForm({ startDate: "", endDate: "", obligationMonths: "" });
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
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

        {/* Add Form Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
               <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/30 px-6 py-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">New Obligation Record</h3>
                <button onClick={() => setShowAdd(false)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Scrollable Contracts Table */}
                <div className="space-y-2">
                  <label className={labelClass}>1. Select Training Contract</label>
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="max-h-[200px] overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-gray-50 font-bold uppercase tracking-widest text-gray-400">
                          <tr>
                            <th className="px-4 py-3">CTR-ID</th>
                            <th className="px-4 py-3">Employee</th>
                            <th className="px-4 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {contracts.map((c) => {
                            const isSelected = selectedContractId === c.id;
                            return (
                              <tr key={c.id} className={isSelected ? "bg-blue-50/50" : "hover:bg-gray-50"}>
                                <td className="px-4 py-3 font-bold text-blue-600">CTR-{c.id.toString().slice(-6)}</td>
                                <td className="px-4 py-3 font-semibold">{c.employeeName}</td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedContractId(isSelected ? null : c.id)}
                                    className={`rounded-lg px-3 py-1 text-[10px] font-bold transition-all ${
                                      isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-blue-600 hover:text-white"
                                    }`}
                                  >
                                    {isSelected ? "Selected" : "Select"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {selectedContract && (
                  <form onSubmit={handleCreate} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                       <p className="text-[10px] font-bold uppercase text-blue-400 tracking-widest mb-1">Selected Trainee</p>
                       <p className="text-sm font-bold text-blue-800">{selectedContract.employeeName} — {selectedContract.employeeDepartment}</p>
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
                    <div className="flex gap-3 pt-2">
                       <button type="button" onClick={() => setShowAdd(false)} className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                        {t("cancel")}
                      </button>
                      <button type="submit" className="flex-[2] rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-all">
                        Create Record
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <tr>
                {["OBL-ID", t("fullName"), t("startDate"), t("endDate"), t("obligationMonths"), t("status"), t("actions")].map((h) => (
                  <th key={h} className="px-6 py-4 text-left">{h}</th>
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
                      <FileText className="h-10 w-10 text-gray-300 mb-3" />
                      <p className="text-sm font-bold text-gray-700 uppercase tracking-widest text-[10px]">No records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                obligations.map((ob) => {
                  const sc = statusConfig[ob.status] || statusConfig.ACTIVE;
                  const Icon = sc.icon;
                  return (
                    <tr key={ob.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-blue-600">OBL-{ob.id.toString().slice(-6)}</td>
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
                                className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                              >
                                <CheckCircle2 className="inline h-3 w-3 mr-0.5" /> Complete
                              </button>
                              <button
                                onClick={() => handleStatusChange(ob.id, "VIOLATED")}
                                disabled={busyId === ob.id}
                                className="rounded-lg bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                              >
                                <AlertTriangle className="inline h-3 w-3 mr-0.5" /> Violate
                              </button>
                            </>
                          )}
                          {ob.status === "COMPLETED" && (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 opacity-60">
                              <CheckCircle2 className="h-3 w-3" /> Released
                            </span>
                          )}
                           {ob.status === "VIOLATED" && (
                            <span className="text-[10px] font-bold text-red-600 flex items-center gap-1 opacity-60">
                              <AlertTriangle className="h-3 w-3" /> Defaulted
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
