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
  FileText,
} from "lucide-react";

const fieldClass =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5";

export default function TrainingContractFormPage() {
  const { t } = useLanguage();
  const [eligibleRequests, setEligibleRequests] = useState<TrainingRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    city: "",
    houseNo: "",
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
  }, [success]);

  const selectedRequest = eligibleRequests.find(r => r.id === selectedRequestId) || null;

  const handleSelectRequest = (id: number) => {
    setSelectedRequestId(prev => prev === id ? null : id);
    setSuccess(false);
    setError("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setLoading(true);
    setError("");
    try {
      await trainingContractApi.create({
        ...form,
        requestId: selectedRequest.id,
        employeeId: selectedRequest.employeeId,
        employeeName: selectedRequest.employeeName,
        employeeDepartment: selectedRequest.department,
        email: selectedRequest.email,
        phone: selectedRequest.phone,
        totalCost: parseFloat(form.totalCost),
        contractDurationMonths: parseInt(form.contractDurationMonths),
      });
      setSuccess(true);
      setSelectedRequestId(null);
      setForm({
        city: "",
        houseNo: "",
        trainingCountry: "",
        trainingCity: "",
        trainingType: "",
        totalCost: "",
        contractDurationMonths: "",
        signedDate: new Date().toISOString().split("T")[0],
      });
    } catch (err: any) {
      setError(err.message || "Failed to create contract");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
            <FileSignature className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("newTrainingContract")}
            </h1>
            <p className="text-sm text-gray-500 font-medium italic">
              Select an eligible training request below to prepare a formal contract.
            </p>
          </div>
        </div>

        {/* Requests Picker Table */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Eligible Training Requests (CONTRACT_REQUIRED)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">{t("fullName")}</th>
                  <th className="px-6 py-4">{t("department")}</th>
                  <th className="px-6 py-4">{t("trainingTitle")}</th>
                  <th className="px-6 py-4 text-right">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {eligibleRequests.length > 0 ? eligibleRequests.map((r) => {
                  const isSelected = selectedRequestId === r.id;
                  return (
                    <tr key={r.id} className={`transition-colors ${isSelected ? "bg-blue-50/60" : "hover:bg-gray-50/50"}`}>
                      <td className="px-6 py-4 text-xs font-bold text-blue-600">TRQ-{r.id.toString().slice(-6)}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">{r.employeeName}</td>
                      <td className="px-6 py-4 font-medium text-gray-600">{r.department || "—"}</td>
                      <td className="px-6 py-4 font-medium text-gray-700 text-xs italic">{r.trainingTitle}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSelectRequest(r.id)}
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
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                      <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="font-bold uppercase tracking-widest text-[10px]">No eligible requests found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Messages */}
        {success && (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-emerald-700">Training contract created successfully!</p>
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4">
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        )}

        {/* Selection Banner & Form */}
        {selectedRequest ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3">
              <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
              <p className="text-sm font-bold text-blue-800">
                Drafting contract for: <span className="text-blue-600">TRQ-{selectedRequest.id.toString().slice(-6)}</span> — {selectedRequest.employeeName}
              </p>
            </div>

            {/* Trainee Info (Read-only Summary) */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
               <div className="flex items-center gap-2 mb-5">
                <User className="h-4 w-4 text-blue-600" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700">Trainee Summary</h2>
              </div>
              <div className="grid grid-cols-2 gap-y-4 text-sm md:grid-cols-4">
                <div><p className={labelClass}>{t("employeeId")}</p><p className="font-bold">{selectedRequest.employeeId}</p></div>
                <div><p className={labelClass}>{t("fullName")}</p><p className="font-bold">{selectedRequest.employeeName}</p></div>
                <div><p className={labelClass}>{t("department")}</p><p className="font-bold">{selectedRequest.department}</p></div>
                <div><p className={labelClass}>{t("phone")}</p><p className="font-bold">{selectedRequest.phone}</p></div>
              </div>
            </div>

            {/* Address Info */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-5">Permanent Address</h2>
              <div className="grid grid-cols-2 gap-4">
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
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700">Training & Contract Details</h2>
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
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 p-12 text-center text-sm text-gray-400">
            Select an eligible request from the table above to proceed with contract creation.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
