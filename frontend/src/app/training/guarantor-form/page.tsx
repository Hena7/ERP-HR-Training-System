"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  trainingContractApi,
  trainingGuarantorApi,
  trainingWitnessApi,
} from "@/app/training/services/trainingApi";
import { TrainingContract, TrainingGuarantor, TrainingWitness } from "@/types/training";
import {
  Shield,
  Plus,
  Trash2,
  CheckCircle2,
  User,
  Upload,
  FileText,
  Users,
  Eye,
} from "lucide-react";

const fieldClass =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5";

export default function TrainingGuarantorFormPage() {
  const { t } = useLanguage();
  const [contracts, setContracts] = useState<TrainingContract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [guarantors, setGuarantors] = useState<TrainingGuarantor[]>([]);
  const [witnesses, setWitnesses] = useState<TrainingWitness[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"guarantors" | "witnesses">("guarantors");

  const emptyG = {
    fullName: "",
    nationalId: "",
    currentAddress: "",
    birthAddress: "",
    phone: "",
    scannedDocument: null as string | null,
  };
  const [form, setForm] = useState({ ...emptyG });

  const emptyW = {
    fullName: "",
    nationalId: "",
    address: "",
    phone: "",
  };
  const [witnessForm, setWitnessForm] = useState({ ...emptyW });

  useEffect(() => {
    trainingContractApi.getAll().then(({ data }) => setContracts(data));
  }, []);

  useEffect(() => {
    if (selectedContractId) {
      trainingGuarantorApi
        .getByContract(selectedContractId)
        .then(({ data }) => setGuarantors(data));
      trainingWitnessApi
        .getByContract(selectedContractId)
        .then(({ data }) => setWitnesses(data));
    } else {
      setGuarantors([]);
      setWitnesses([]);
    }
  }, [selectedContractId, success]);

  const selectedContract = contracts.find(c => c.id === selectedContractId) || null;
  const maxRequired = selectedContract && selectedContract.totalCost >= 800_000 ? 2 : 1;

  const handleSelectContract = (id: number) => {
    setSelectedContractId(prev => prev === id ? null : id);
    setSuccess(false);
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, scannedDocument: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddGuarantor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractId) { setError("Please select a contract first"); return; }
    if (guarantors.length >= maxRequired) { setError(`Maximum ${maxRequired} guarantors allowed for this contract`); return; }
    setLoading(true);
    setError("");
    try {
      await trainingGuarantorApi.create({
        ...form,
        contractId: selectedContractId,
      });
      setSuccess(true);
      setForm({ ...emptyG });
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to add guarantor");
    } finally {
      setLoading(false);
    }
  };

  const handleAddWitness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractId) { setError("Please select a contract first"); return; }
    if (witnesses.length >= maxRequired) { setError(`Maximum ${maxRequired} witnesses allowed for this contract`); return; }
    setLoading(true);
    setError("");
    try {
      await trainingWitnessApi.create({
        ...witnessForm,
        contractId: selectedContractId,
      });
      setSuccess(true);
      setWitnessForm({ ...emptyW });
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to add witness");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGuarantor = async (id: number) => {
    if (confirm("Remove this guarantor?")) {
      await trainingGuarantorApi.delete(id);
      setGuarantors((gs) => gs.filter((g) => g.id !== id));
    }
  };

  const handleDeleteWitness = async (id: number) => {
    if (confirm("Remove this witness?")) {
      await trainingWitnessApi.delete(id);
      setWitnesses((ws) => ws.filter((w) => w.id !== id));
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Training Guarantors & Witnesses
            </h1>
            <p className="text-sm text-gray-500 font-medium italic">
              Manage guarantors and witnesses for training contracts.
            </p>
          </div>
        </div>

        {/* Contracts Picker Table */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Training Contracts
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">{t("fullName")}</th>
                  <th className="px-6 py-4">{t("department")}</th>
                  <th className="px-6 py-4">Total Cost (ETB)</th>
                  <th className="px-6 py-4 text-right">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {contracts.length > 0 ? contracts.map((c) => {
                  const isSelected = selectedContractId === c.id;
                  const maxG = c.totalCost >= 800_000 ? 2 : 1;
                  return (
                    <tr key={c.id} className={`transition-colors ${isSelected ? "bg-blue-50/60" : "hover:bg-gray-50/50"}`}>
                      <td className="px-6 py-4 text-xs font-bold text-blue-600">CTR-{c.id.toString().slice(-6)}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">{c.employeeName}</td>
                      <td className="px-6 py-4 font-medium text-gray-600">{c.employeeDepartment || "—"}</td>
                      <td className="px-6 py-4 font-black text-emerald-600">
                        {c.totalCost.toLocaleString()} <span className="text-xs font-medium text-gray-400">(Max: {maxG})</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSelectContract(c.id)}
                          className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all shadow-sm ${
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
                }) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      {t("noData")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selection Content */}
        {selectedContract ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3">
              <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
              <p className="text-sm font-bold text-blue-800">
                Managing for: <span className="text-blue-600">CTR-{selectedContract.id.toString().slice(-6)}</span> — {selectedContract.employeeName}
              </p>
              <div className="ml-auto rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                Max Required: {maxRequired}
              </div>
            </div>

            {/* Status Messages */}
            {success && (
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-700">Action completed successfully!</p>
              </div>
            )}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4">
                <p className="text-sm font-semibold text-red-700">{error}</p>
              </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-1 rounded-xl bg-gray-100 p-1">
              <button
                onClick={() => setActiveTab("guarantors")}
                className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all ${
                  activeTab === "guarantors"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                }`}
              >
                <Shield className="h-4 w-4" />
                Guarantors ({guarantors.length}/{maxRequired})
              </button>
              <button
                onClick={() => setActiveTab("witnesses")}
                className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all ${
                  activeTab === "witnesses"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                }`}
              >
                <Users className="h-4 w-4" />
                Witnesses ({witnesses.length}/{maxRequired})
              </button>
            </div>

            {/* Guarantors Tab */}
            {activeTab === "guarantors" && (
              <div className="space-y-6">
                {/* Current Guarantors */}
                {guarantors.length > 0 && (
                  <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                      Current Guarantors
                    </h2>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {guarantors.map((g) => (
                        <div key={g.id} className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{g.fullName}</p>
                              <p className="text-[10px] text-gray-500 truncate max-w-[150px]">{g.nationalId} · {g.currentAddress}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {g.scannedDocument && (
                              <button
                                onClick={() => {
                                  const win = window.open();
                                  win?.document.write(`<iframe src="${g.scannedDocument}" width="100%" height="100%" style="border:none;"></iframe>`);
                                }}
                                className="rounded-lg p-1.5 text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                title="View Document"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteGuarantor(g.id)}
                              className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Guarantor Form */}
                {guarantors.length < maxRequired ? (
                  <form onSubmit={handleAddGuarantor} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 border-b border-gray-50 pb-4 mb-4">
                      <Plus className="h-4 w-4 text-blue-600" />
                      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700">Add New Guarantor</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>{t("fullName")}</label>
                        <input name="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required className={fieldClass} placeholder="Full Name" />
                      </div>
                      <div>
                        <label className={labelClass}>{t("nationalId")}</label>
                        <input name="nationalId" value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} required className={fieldClass} placeholder="National ID No." />
                      </div>
                      <div>
                        <label className={labelClass}>Current {t("address")}</label>
                        <input value={form.currentAddress} onChange={(e) => setForm({ ...form, currentAddress: e.target.value })} required className={fieldClass} placeholder="Current Address" />
                      </div>
                      <div>
                        <label className={labelClass}>Birth {t("address")}</label>
                        <input value={form.birthAddress} onChange={(e) => setForm({ ...form, birthAddress: e.target.value })} className={fieldClass} placeholder="Birth Address" />
                      </div>
                      <div>
                        <label className={labelClass}>{t("phone")}</label>
                        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={fieldClass} placeholder="+251-..." />
                      </div>
                      <div>
                        <label className={labelClass}>{t("uploadDocument")}</label>
                        <label className="flex items-center justify-center gap-2 cursor-pointer rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-500 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600 transition-all select-none">
                          <Upload className="h-4 w-4" />
                          {form.scannedDocument ? "Document uploaded ✓" : "Click to upload..."}
                          <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-md disabled:opacity-60"
                    >
                      <Plus className="h-4 w-4" />
                      {loading ? t("loading") : t("addGuarantor")}
                    </button>
                  </form>
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center">
                    <p className="text-sm font-semibold text-emerald-700">Maximum guarantors reached ({maxRequired}/{maxRequired}).</p>
                  </div>
                )}
              </div>
            )}

            {/* Witnesses Tab */}
            {activeTab === "witnesses" && (
              <div className="space-y-6">
                {/* Current Witnesses */}
                {witnesses.length > 0 && (
                  <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                      Current Witnesses
                    </h2>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {witnesses.map((w) => (
                        <div key={w.id} className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{w.fullName}</p>
                              <p className="text-[10px] text-gray-500 truncate max-w-[150px]">{w.nationalId} · {w.address}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteWitness(w.id)}
                            className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Witness Form */}
                {witnesses.length < maxRequired ? (
                  <form onSubmit={handleAddWitness} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 border-b border-gray-50 pb-4 mb-4">
                      <Plus className="h-4 w-4 text-blue-600" />
                      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700">Add New Witness</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>{t("fullName")}</label>
                        <input name="fullName" value={witnessForm.fullName} onChange={(e) => setWitnessForm({ ...witnessForm, fullName: e.target.value })} required className={fieldClass} placeholder="Full Name" />
                      </div>
                      <div>
                        <label className={labelClass}>{t("nationalId")}</label>
                        <input name="nationalId" value={witnessForm.nationalId} onChange={(e) => setWitnessForm({ ...witnessForm, nationalId: e.target.value })} required className={fieldClass} placeholder="National ID No." />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>{t("address")}</label>
                        <input value={witnessForm.address} onChange={(e) => setWitnessForm({ ...witnessForm, address: e.target.value })} required className={fieldClass} placeholder="Full Address" />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>{t("phone")}</label>
                        <input value={witnessForm.phone} onChange={(e) => setWitnessForm({ ...witnessForm, phone: e.target.value })} className={fieldClass} placeholder="+251-..." />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-md disabled:opacity-60"
                    >
                      <Plus className="h-4 w-4" />
                      {loading ? t("loading") : "Add Witness"}
                    </button>
                  </form>
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center">
                    <p className="text-sm font-semibold text-emerald-700">Maximum witnesses reached ({maxRequired}/{maxRequired}).</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 p-12 text-center text-sm text-gray-400">
            Select a training contract to manage its guarantors and witnesses.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
