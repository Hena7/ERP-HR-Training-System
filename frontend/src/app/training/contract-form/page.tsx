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
  AlertTriangle,
} from "lucide-react";
import { calculateObligation } from "@/app/training/services/obligationCalculator";

export default function TrainingContractFormPage() {
  const { t } = useLanguage();
  const [eligibleRequests, setEligibleRequests] = useState<TrainingRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<TrainingRequest | null>(null);
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

  const handleRequestSelect = (req: TrainingRequest) => {
    setSelectedRequest(req);
    setForm((prev) => ({
      ...prev,
      requestId: String(req.id),
      employeeDepartment: req.department || "",
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    // Auto-calculate service obligation when totalCost changes
    if (name === "totalCost" && value) {
      const obl = calculateObligation(parseFloat(value));
      setForm((prev) => ({
        ...prev,
        totalCost: value,
        contractDurationMonths: obl.requiresContract ? String(obl.months) : prev.contractDurationMonths,
      }));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.requestId) {
      setError("Please select a training request from the list above.");
      return;
    }
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
      setSelectedRequest(null);
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
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
            <FileSignature className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("newTrainingContract")}
            </h1>
            <p className="text-sm text-gray-500 font-medium italic">
              Select a request below, then fill in contract details.
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

        {/* Request Selection List */}
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
                  <th className="px-6 py-4">REQ-ID</th>
                  <th className="px-6 py-4">{t("trainingTitle")}</th>
                  <th className="px-6 py-4">{t("department")}</th>
                  <th className="px-6 py-4">{t("numTrainees")}</th>
                  <th className="px-6 py-4 text-right">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {eligibleRequests.length > 0 ? (
                  eligibleRequests.map((r) => {
                    const isSelected = selectedRequest?.id === r.id;
                    return (
                      <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-blue-600">
                          TRQ-{r.id.toString().slice(-6)}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900 max-w-[180px] truncate">
                          {r.trainingTitle}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-600">{r.department}</td>
                        <td className="px-6 py-4 font-medium text-gray-500">{r.numTrainees}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRequestSelect(r)}
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
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No requests with CONTRACT_REQUIRED status found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contract Form — only visible when a request is selected */}
        {selectedRequest && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selected Request Banner */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/40 px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-0.5">
                Linked Training Request
              </p>
              <p className="text-sm font-bold text-gray-900">
                TRQ-{selectedRequest.id.toString().slice(-6)} — {selectedRequest.trainingTitle} ({selectedRequest.department})
              </p>
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
                  <input
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleChange}
                    required
                    className={fieldClass}
                    placeholder="EMP-001"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("fullName")}</label>
                  <input
                    name="employeeName"
                    value={form.employeeName}
                    onChange={handleChange}
                    required
                    className={fieldClass}
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("department")}</label>
                  <input
                    name="employeeDepartment"
                    value={form.employeeDepartment}
                    onChange={handleChange}
                    required
                    className={fieldClass}
                    placeholder="Department"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("phone")}</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className={fieldClass}
                    placeholder="+251-..."
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("email")}</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className={fieldClass}
                    placeholder="email@insa.gov.et"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("city")}</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className={fieldClass}
                    placeholder="Addis Ababa"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("houseNo")}</label>
                  <input
                    name="houseNo"
                    value={form.houseNo}
                    onChange={handleChange}
                    className={fieldClass}
                    placeholder="House No."
                  />
                </div>
              </div>
            </div>

            {/* Training & Contract Details */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="h-4 w-4 text-blue-600" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700">
                  Training &amp; Contract Details
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t("trainingCountry")}</label>
                  <input
                    name="trainingCountry"
                    value={form.trainingCountry}
                    onChange={handleChange}
                    required
                    className={fieldClass}
                    placeholder="Ethiopia / Kenya..."
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("trainingCity")}</label>
                  <input
                    name="trainingCity"
                    value={form.trainingCity}
                    onChange={handleChange}
                    required
                    className={fieldClass}
                    placeholder="Nairobi..."
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("trainingType")}</label>
                  <input
                    name="trainingType"
                    value={form.trainingType}
                    onChange={handleChange}
                    required
                    className={fieldClass}
                    placeholder="Short-term / Long-term / Workshop"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("totalCost")}</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      name="totalCost"
                      type="number"
                      value={form.totalCost}
                      onChange={handleChange}
                      required
                      className={fieldClass + " pl-10"}
                      placeholder="0.00"
                    />
                  </div>
                  {form.totalCost && parseFloat(form.totalCost) >= 200000 && (() => {
                    const obl = calculateObligation(parseFloat(form.totalCost));
                    return (
                      <p className="mt-1.5 text-[10px] font-bold text-blue-700">
                        Auto-obligation: {obl.label} ({obl.months} months)
                      </p>
                    );
                  })()}
                </div>
                <div>
                  <label className={labelClass}>{t("contractDuration")} (Months)</label>
                  <input
                    name="contractDurationMonths"
                    type="number"
                    value={form.contractDurationMonths}
                    onChange={handleChange}
                    required
                    className={fieldClass + " bg-blue-50/40 font-black text-blue-900"}
                    placeholder="Auto-filled from cost"
                  />
                  <p className="mt-1 text-[10px] text-gray-400">Auto-calculated per INSA obligation schedule. You may adjust manually.</p>
                </div>
                <div>
                  <label className={labelClass}>{t("contractSignedDate")}</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      name="signedDate"
                      type="date"
                      value={form.signedDate}
                      onChange={handleChange}
                      required
                      className={fieldClass + " pl-10"}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Procurement Letter Reminder */}
            <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900">Procurement Department Notification Required</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Once this contract is signed, a formal letter must be sent to the Procurement Department confirming that the trainee has signed the service obligation agreement.
                </p>
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
        )}

        {!selectedRequest && (
          <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
            Select a training request from the list above to begin filling in contract details.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
