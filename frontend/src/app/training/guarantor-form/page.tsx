"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  trainingContractApi,
  trainingGuarantorApi,
} from "@/app/training/services/trainingApi";
import { TrainingContract, TrainingGuarantor } from "@/types/training";
import {
  Shield,
  Plus,
  Trash2,
  CheckCircle2,
  User,
  Upload,
  X,
} from "lucide-react";

export default function TrainingGuarantorFormPage() {
  const { t } = useLanguage();
  const [contracts, setContracts] = useState<TrainingContract[]>([]);
  const [selectedContract, setSelectedContract] = useState<number | "">("");
  const [guarantors, setGuarantors] = useState<TrainingGuarantor[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const emptyG = {
    fullName: "",
    nationalId: "",
    currentAddress: "",
    birthAddress: "",
    phone: "",
    scannedDocument: null as string | null,
  };
  const [form, setForm] = useState({ ...emptyG });

  useEffect(() => {
    trainingContractApi.getAll().then(({ data }) => setContracts(data));
  }, []);

  useEffect(() => {
    if (selectedContract) {
      trainingGuarantorApi
        .getByContract(Number(selectedContract))
        .then(({ data }) => setGuarantors(data));
    } else {
      setGuarantors([]);
    }
  }, [selectedContract, success]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, scannedDocument: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) { setError("Please select a contract first"); return; }
    setLoading(true);
    setError("");
    try {
      await trainingGuarantorApi.create({
        ...form,
        contractId: Number(selectedContract),
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

  const handleDelete = async (id: number) => {
    await trainingGuarantorApi.delete(id);
    setGuarantors((gs) => gs.filter((g) => g.id !== id));
  };

  const fieldClass =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all";
  const labelClass =
    "block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5";

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("navTrainingGuarantors")}
            </h1>
            <p className="text-sm text-gray-500 font-medium italic">
              {t("maxGuarantors")}
            </p>
          </div>
        </div>

        {/* Contract Selector */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <label className={labelClass}>{t("trainingContracts")}</label>
          <select
            value={selectedContract}
            onChange={(e) => setSelectedContract(e.target.value as any)}
            className={fieldClass + " appearance-none"}
          >
            <option value="">— Select Contract —</option>
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                CTR-{c.id.toString().slice(-6)} — {c.employeeName} ({c.employeeDepartment})
              </option>
            ))}
          </select>
        </div>

        {/* Existing Guarantors */}
        {guarantors.length > 0 && (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
              Current Guarantors ({guarantors.length}/2)
            </h2>
            {guarantors.map((g, i) => (
              <div key={g.id} className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{g.fullName}</p>
                    <p className="text-[10px] text-gray-500">{g.nationalId} · {g.currentAddress}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(g.id)}
                  className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Success / Error */}
        {success && (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-700">Guarantor added!</p>
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4">
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        )}

        {/* Add Form */}
        {guarantors.length < 2 && (
          <form onSubmit={handleAdd} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700">
              <Plus className="inline h-3.5 w-3.5 mr-1" /> Add Guarantor
            </h2>
            <div className="grid grid-cols-2 gap-4">
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
                <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-all select-none">
                  <Upload className="h-4 w-4" />
                  {form.scannedDocument ? "Document uploaded ✓" : "Upload signature..."}
                  <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !selectedContract}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-md disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {loading ? t("loading") : t("addGuarantor")}
            </button>
          </form>
        )}

        {guarantors.length >= 2 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm font-semibold text-amber-700">{t("maxGuarantors")}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
