"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { trainingRequestApi, trainingContractApi } from "@/app/training/services/trainingApi";
import { TrainingRequest } from "@/types/training";
import {
  FileSignature,
  User,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export default function TrainingContractFormPage() {
  const { t } = useLanguage();
  const [eligibleRequests, setEligibleRequests] = useState<TrainingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    requestId: "",
    employeeId: "",
    employeeName: "",
    employeeDepartment: "",
    city: "",
    houseNo: "",
    email: "",
    phone: "",
    trainingCountry: "",
    trainingCity: "",
    trainingType: "",
    totalCost: "",
    contractDurationMonths: "",
    signedDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    trainingRequestApi.getAll().then(({ data }) => {
      setEligibleRequests(
        data.filter((r: TrainingRequest) => r.status === "CONTRACT_REQUIRED"),
      );
    });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await trainingContractApi.create({
        ...form,
        requestId: Number(form.requestId),
        totalCost: parseFloat(form.totalCost),
        contractDurationMonths: parseInt(form.contractDurationMonths),
      });
      setSuccess(true);
      setForm((prev) => ({
        ...prev,
        requestId: "",
        employeeId: "",
        employeeName: "",
        employeeDepartment: "",
        city: "",
        houseNo: "",
        email: "",
        phone: "",
        trainingCountry: "",
        trainingCity: "",
        trainingType: "",
        totalCost: "",
        contractDurationMonths: "",
        signedDate: new Date().toISOString().split("T")[0],
      }));
    } catch (err: any) {
      setError(err.message || "Failed to create contract");
    } finally {
      setLoading(false);
    }
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
            <FileSignature className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("newTrainingContract")}
            </h1>
            <p className="text-sm text-gray-500 font-medium italic">
              Training contracts for eligible requests
            </p>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-emerald-700">
              Training contract created successfully!
            </p>
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4">
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Link Request */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-4">
              Linked Training Request
            </h2>
            <div>
              <label className={labelClass}>Select Request (CONTRACT_REQUIRED)</label>
              <select
                name="requestId"
                value={form.requestId}
                onChange={handleChange}
                required
                className={fieldClass + " appearance-none"}
              >
                <option value="">— Select a request —</option>
                {eligibleRequests.map((r) => (
                  <option key={r.id} value={r.id}>
                    TRQ-{r.id.toString().slice(-6)} — {r.trainingTitle} ({r.department})
                  </option>
                ))}
              </select>
              {eligibleRequests.length === 0 && (
                <p className="mt-1.5 text-[10px] text-amber-600 font-bold">
                  No requests with CONTRACT_REQUIRED status found
                </p>
              )}
            </div>
          </div>

          {/* Trainee Info */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <User className="h-4 w-4 text-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700">
                Trainee Information
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("employeeId")}</label>
                <input name="employeeId" value={form.employeeId} onChange={handleChange} required className={fieldClass} placeholder="EMP-001" />
              </div>
              <div>
                <label className={labelClass}>{t("fullName")}</label>
                <input name="employeeName" value={form.employeeName} onChange={handleChange} required className={fieldClass} placeholder="Full Name" />
              </div>
              <div>
                <label className={labelClass}>{t("department")}</label>
                <input name="employeeDepartment" value={form.employeeDepartment} onChange={handleChange} required className={fieldClass} placeholder="Department" />
              </div>
              <div>
                <label className={labelClass}>{t("phone")}</label>
                <input name="phone" value={form.phone} onChange={handleChange} required className={fieldClass} placeholder="+251-..." />
              </div>
              <div>
                <label className={labelClass}>{t("email")}</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className={fieldClass} placeholder="email@insa.gov.et" />
              </div>
              <div>
                <label className={labelClass}>{t("city")}</label>
                <input name="city" value={form.city} onChange={handleChange} required className={fieldClass} placeholder="Addis Ababa" />
              </div>
              <div>
                <label className={labelClass}>{t("houseNo")}</label>
                <input name="houseNo" value={form.houseNo} onChange={handleChange} className={fieldClass} placeholder="House No." />
              </div>
            </div>
          </div>

          {/* Training Info */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="h-4 w-4 text-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700">
                Training & Contract Details
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("trainingCountry")}</label>
                <input name="trainingCountry" value={form.trainingCountry} onChange={handleChange} required className={fieldClass} placeholder="Ethiopia / Kenya..." />
              </div>
              <div>
                <label className={labelClass}>{t("trainingCity")}</label>
                <input name="trainingCity" value={form.trainingCity} onChange={handleChange} required className={fieldClass} placeholder="Nairobi..." />
              </div>
              <div>
                <label className={labelClass}>{t("trainingType")}</label>
                <input name="trainingType" value={form.trainingType} onChange={handleChange} required className={fieldClass} placeholder="Short-term / Long-term / Workshop" />
              </div>
              <div>
                <label className={labelClass}>{t("totalCost")}</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input name="totalCost" type="number" value={form.totalCost} onChange={handleChange} required className={fieldClass + " pl-10"} placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t("contractDuration")}</label>
                <input name="contractDurationMonths" type="number" value={form.contractDurationMonths} onChange={handleChange} required className={fieldClass} placeholder="e.g. 24" />
              </div>
              <div>
                <label className={labelClass}>{t("contractSignedDate")}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input name="signedDate" type="date" value={form.signedDate} onChange={handleChange} required className={fieldClass + " pl-10"} />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-md disabled:opacity-60"
          >
            <FileSignature className="h-4 w-4" />
            {loading ? t("loading") : t("createContract")}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
