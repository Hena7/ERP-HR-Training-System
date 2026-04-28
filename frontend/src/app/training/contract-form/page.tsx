"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  trainingRequestApi,
  trainingContractApi,
} from "@/app/training/services/trainingApi";
import { employeeApi } from "@/lib/api";
import { TrainingRequest } from "@/types/training";
import {
  FileSignature,
  User,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RefreshCw,
} from "lucide-react";
import { calculateObligation } from "@/app/training/services/obligationCalculator";

const fieldClass =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5";

export default function TrainingContractFormPage() {
  const { t } = useLanguage();
  const [eligibleRequests, setEligibleRequests] = useState<TrainingRequest[]>(
    [],
  );
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<TrainingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    trainingCountry: "",
    trainingCity: "",
    trainingType: "",
    totalCost: "",
    contractDurationMonths: "",
    signedDate: new Date().toISOString().split("T")[0],
  });

  const [trainees, setTrainees] = useState<
    {
      employeeId: string;
      fullName: string;
      phone: string;
      email: string;
      department: string;
      city: string;
      houseNo: string;
    }[]
  >([]);

  useEffect(() => {
    setLoading(true);
    trainingRequestApi.getAll().then(({ data }) => {
      setEligibleRequests(
        data.filter((r: TrainingRequest) => r.status === "CONTRACT_REQUIRED"),
      );
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [success]);

  const handleSelectRequest = (r: TrainingRequest) => {
    if (selectedRequest?.id === r.id) {
      setSelectedRequest(null);
      setTrainees([]);
    } else {
      setSelectedRequest(r);
      // Initialize trainees based on numTrainees
      const count = r.numTrainees || 1;
      setTrainees(
        Array(count).fill({
          employeeId: "",
          fullName: "",
          phone: "",
          email: "",
          department: "",
          city: "",
          houseNo: "",
        }),
      );
      // Auto-fill cost and duration from requested estimate (individual basis)
      const numTrainees = r.numTrainees || 1;
      const individualCost = r.estimatedCost / numTrainees;
      const obl = calculateObligation(individualCost);
      setForm((prev) => ({
        ...prev,
        totalCost: String(individualCost),
        contractDurationMonths: obl.requiresContract ? String(obl.months) : "",
      }));
    }
    setSuccess(false);
    setError("");
  };

  const updateTrainee = (index: number, field: string, value: string) => {
    const newTrainees = [...trainees];
    newTrainees[index] = { ...newTrainees[index], [field]: value };
    setTrainees(newTrainees);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "totalCost" && value) {
      const obl = calculateObligation(parseFloat(value));
      setForm((prev) => ({
        ...prev,
        totalCost: value,
        contractDurationMonths: obl.requiresContract ? String(obl.months) : "",
      }));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setLoading(true);
    setError("");
    try {
      // Create contracts for ALL trainees
      await Promise.all(
        trainees.map((t) =>
          trainingContractApi.create({
            ...form,
            city: t.city,
            houseNo: t.houseNo,
            requestId: selectedRequest.id,
            employeeId: t.employeeId,
            employeeName: t.fullName,
            employeeDepartment: t.department || selectedRequest.department,
            email: t.email,
            phone: t.phone,
            totalCost: parseFloat(form.totalCost),
            contractDurationMonths: parseInt(form.contractDurationMonths),
          }),
        ),
      );
      setSuccess(true);
      setSelectedRequest(null);
      setTrainees([]);
      setForm({
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
              Select an eligible training request below to prepare a formal
              contract.
            </p>
          </div>
        </div>

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
              <tbody className="divide-y text-xs">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-gray-400"
                    >
                      <RefreshCw className="h-10 w-10 mx-auto mb-3 opacity-20 animate-spin" />
                      <p className="font-bold uppercase tracking-widest text-[10px]">
                        Loading eligible requests...
                      </p>
                    </td>
                  </tr>
                ) : eligibleRequests.length > 0 ? (
                  eligibleRequests.map((r) => {
                    const isSelected = selectedRequest?.id === r.id;
                    return (
                      <tr
                        key={r.id}
                        className={`transition-colors ${isSelected ? "bg-blue-50/60" : "hover:bg-gray-50/50"}`}
                      >
                        <td className="px-6 py-4 font-bold text-blue-600">
                          TRQ-{r.id.toString().slice(-6)}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {r.requesterName &&
                          r.requesterName !== "Keycloak User"
                            ? r.requesterName
                            : employees.find(
                                (e) =>
                                  String(e.employeeId) ===
                                  String(r.requesterId),
                              )?.fullName ||
                              r.requesterName ||
                              "Keycloak User"}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-600">
                          {r.department || "—"}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700 text-xs italic">
                          {r.trainingTitle}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleSelectRequest(r)}
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
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-gray-400"
                    >
                      <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="font-bold uppercase tracking-widest text-[10px]">
                        No eligible requests found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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

        {selectedRequest && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-1 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                  Linked Training Request
                </p>
              </div>
              <p className="text-sm font-bold text-blue-900 ml-4">
                TRQ-{selectedRequest.id.toString().slice(-6)} —{" "}
                {selectedRequest.trainingTitle} ({selectedRequest.department})
                <span className="block text-[10px] text-blue-400 mt-0.5">
                  Requested by:{" "}
                  {selectedRequest.requesterName &&
                  selectedRequest.requesterName !== "Keycloak User"
                    ? selectedRequest.requesterName
                    : employees.find(
                        (e) =>
                          String(e.employeeId) ===
                          String(selectedRequest.requesterId),
                      )?.fullName ||
                      selectedRequest.requesterName ||
                      "Keycloak User"}
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <User className="h-4 w-4 text-blue-600" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700">
                  Assign Participants ({trainees.length})
                </h2>
              </div>
              <div className="space-y-6">
                {trainees.map((trainee, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-4 p-4 rounded-xl bg-gray-50/50 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Trainee #{idx + 1}
                      </span>
                      {trainee.employeeId && (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Assigned:{" "}
                          {trainee.employeeId}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                      <div>
                        <label className={labelClass}>{t("employeeId")}</label>
                        <input
                          className={fieldClass}
                          value={trainee.employeeId}
                          onChange={(e) =>
                            updateTrainee(idx, "employeeId", e.target.value)
                          }
                          required
                          placeholder="EMP-001"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t("fullName")}</label>
                        <input
                          className={fieldClass}
                          value={trainee.fullName}
                          onChange={(e) =>
                            updateTrainee(idx, "fullName", e.target.value)
                          }
                          required
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t("department")}</label>
                        <input
                          className={fieldClass}
                          value={trainee.department}
                          onChange={(e) =>
                            updateTrainee(idx, "department", e.target.value)
                          }
                          required
                          placeholder="IT / HR / Finance..."
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t("email")}</label>
                        <input
                          className={fieldClass}
                          type="email"
                          value={trainee.email}
                          onChange={(e) =>
                            updateTrainee(idx, "email", e.target.value)
                          }
                          required
                          placeholder="john@insa.gov.et"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t("phone")}</label>
                        <input
                          className={fieldClass}
                          value={trainee.phone}
                          onChange={(e) =>
                            updateTrainee(idx, "phone", e.target.value)
                          }
                          required
                          placeholder="0911..."
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t("city")}</label>
                        <input
                          className={fieldClass}
                          value={trainee.city}
                          onChange={(e) =>
                            updateTrainee(idx, "city", e.target.value)
                          }
                          required
                          placeholder="Addis Ababa"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t("houseNo")}</label>
                        <input
                          className={fieldClass}
                          value={trainee.houseNo}
                          onChange={(e) =>
                            updateTrainee(idx, "houseNo", e.target.value)
                          }
                          placeholder="House No."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">
                      ETB
                    </span>
                    <input
                      name="totalCost"
                      type="number"
                      value={form.totalCost}
                      onChange={handleChange}
                      required
                      className={fieldClass + " pl-11"}
                      placeholder="0.00"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400">
                    Individual Cost per trainee.
                  </p>
                  {form.totalCost &&
                    parseFloat(form.totalCost) >= 200000 &&
                    (() => {
                      const obl = calculateObligation(
                        parseFloat(form.totalCost),
                      );
                      return (
                        <p className="mt-1.5 text-[10px] font-bold text-blue-700">
                          Auto-obligation: {obl.label} ({obl.months} months)
                        </p>
                      );
                    })()}
                </div>
                <div>
                  <label className={labelClass}>{t("contractDuration")}</label>
                  <input
                    name="contractDurationMonths"
                    type="number"
                    value={form.contractDurationMonths}
                    onChange={handleChange}
                    required
                    className={
                      fieldClass + " bg-blue-50/40 font-black text-blue-900"
                    }
                    placeholder="Auto-filled from cost"
                  />
                  <p className="mt-1 text-[10px] text-gray-400">
                    Auto-calculated per INSA obligation schedule.
                  </p>
                </div>
                <div>
                  <label className={labelClass}>
                    {t("contractSignedDate")}
                  </label>
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

            <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900">
                  Procurement Department Notification Required
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Once this contract is signed, a formal letter must be sent to
                  the Procurement Department confirming the service obligation.
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
          <div className="rounded-lg border border-dashed border-gray-200 p-12 text-center text-sm text-gray-400">
            Select an eligible request from the table above to proceed with
            contract creation.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
