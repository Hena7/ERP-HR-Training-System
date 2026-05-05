"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { trainingRequestApi } from "@/app/training/services/trainingApi";
import { employeeApi } from "@/lib/api";
import {
  BookOpen,
  Building2,
  Users,
  Clock,
  MapPin,
  DollarSign,
  FileText,
  Send,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { calculateObligation } from "@/app/training/services/obligationCalculator";
const COST_THRESHOLD = 200000;

export default function TrainingRequestFormPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    department: user?.department || "",
    sector: "",
    trainingTitle: "",
    estimatedCost: "",
    numTrainees: "",
    trainingDuration: "",
    trainingLocation: "Domestic" as "Domestic" | "Abroad",
    budgetSource: "",
    specification: "",
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "numTrainees") {
      const count = parseInt(value) || 0;
      setTrainees((prev) => {
        const newTrainees = [...prev];
        if (count > prev.length) {
          for (let i = prev.length; i < count; i++) {
            newTrainees.push({
              employeeId: "",
              fullName: "",
              phone: "",
              email: "",
              department: "",
              city: "",
              houseNo: "",
            });
          }
        } else {
          return newTrainees.slice(0, count);
        }
        return newTrainees;
      });
    }
  };

  const updateTrainee = (index: number, field: string, value: string) => {
    const newTrainees = [...trainees];
    newTrainees[index] = { ...newTrainees[index], [field]: value };
    setTrainees(newTrainees);
  };

  const fetchTraineeDetails = async (index: number) => {
    const id = trainees[index].employeeId;
    if (!id) return;
    try {
      const res = await employeeApi.getByEmployeeId(id);
      if (res.data) {
        const newTrainees = [...trainees];
        newTrainees[index] = {
          ...newTrainees[index],
          fullName: `${res.data.firstName} ${res.data.lastName}`,
          phone: res.data.phone || "",
          email: res.data.email || "",
          department: res.data.department || "",
        };
        setTrainees(newTrainees);
      }
    } catch (err) {
      alert("Employee not found with ID: " + id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await trainingRequestApi.create({
        ...form,
        estimatedCost: parseFloat(form.estimatedCost),
        numTrainees: parseInt(form.numTrainees),
        requesterName: user?.fullName || user?.email,
        requesterId: user?.employeeId || user?.id,
        requesterEmail: user?.email,
        requesterPhone: user?.phone,
        requesterGender: user?.gender,
        requesterPosition: user?.position,
        trainees: trainees,
      });
      setSuccess(true);
      setTrainees([]);
      setForm({
        department: user?.department || "",
        sector: "",
        trainingTitle: "",
        estimatedCost: "",
        numTrainees: "",
        trainingDuration: "",
        trainingLocation: "Domestic",
        budgetSource: "",
        specification: "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all";
  const labelClass =
    "block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5";

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("newTrainingRequest")}
            </h1>
            <p className="text-sm text-gray-500 font-medium italic">
              {t("trainingModule")} — ስልጠና
            </p>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-emerald-700">
              Training request submitted successfully to Procurement!
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4">
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Department Info */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Building2 className="h-4 w-4 text-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700">
                {t("department")} / {t("sector")}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("department")}</label>
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                  className={fieldClass}
                  placeholder="e.g. Cyber Security"
                />
              </div>
              <div>
                <label className={labelClass}>{t("sector")}</label>
                <input
                  name="sector"
                  value={form.sector}
                  onChange={handleChange}
                  className={fieldClass}
                  placeholder="e.g. Infrastructure Directorate"
                />
              </div>
            </div>
          </div>

          {/* Training Details */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="h-4 w-4 text-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700">
                Training Details
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>{t("trainingTitle")}</label>
                <input
                  name="trainingTitle"
                  value={form.trainingTitle}
                  onChange={handleChange}
                  required
                  className={fieldClass}
                  placeholder="e.g. Advanced Network Security Training"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t("numTrainees")}</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      name="numTrainees"
                      type="number"
                      min="1"
                      value={form.numTrainees}
                      onChange={handleChange}
                      required
                      className={fieldClass + " pl-10"}
                      placeholder="0"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400">
                    Identify the employees who will be attending this training.
                  </p>
                </div>
                <div>
                  <label className={labelClass}>{t("trainingDuration")}</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      name="trainingDuration"
                      value={form.trainingDuration}
                      onChange={handleChange}
                      required
                      className={fieldClass + " pl-10"}
                      placeholder="e.g. 5 days / 2 weeks"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t("trainingLocation")}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      name="trainingLocation"
                      value={form.trainingLocation}
                      onChange={handleChange}
                      className={fieldClass + " pl-10 appearance-none"}
                    >
                      <option value="Domestic">{t("domestic")}</option>
                      <option value="Abroad">{t("abroad")}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t("estimatedCost")}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-4 text-gray-400">
                      ETB
                    </span>{" "}
                    <input
                      name="estimatedCost"
                      type="number"
                      min="0"
                      value={form.estimatedCost}
                      onChange={handleChange}
                      required
                      className={fieldClass + " pl-11"}
                      placeholder="0.00"
                    />
                  </div>
                  {form.estimatedCost && form.numTrainees && (
                    (() => {
                      const numTrainees = parseInt(form.numTrainees) || 1;
                      const individualCost = parseFloat(form.estimatedCost) / numTrainees;
                      const obl = calculateObligation(individualCost);
                      
                      if (individualCost < COST_THRESHOLD) return null;

                      return (
                        <div className="mt-2 space-y-1">
                          <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                            ⚠ Individual Cost ({individualCost.toLocaleString()} Birr) ≥ 200,000 Birr — Contract &amp; service
                            obligation required
                          </p>
                          <p className="text-[10px] font-bold text-blue-700">
                            📅 Required obligation:{" "}
                            <span className="text-blue-900">{obl.label}</span> (
                            {obl.months} months)
                          </p>
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
              <div>
                <label className={labelClass}>{t("budgetSource")}</label>
                <input
                  name="budgetSource"
                  value={form.budgetSource}
                  onChange={handleChange}
                  required
                  className={fieldClass}
                  placeholder="e.g. Annual Budget / Donor fund"
                />
              </div>
              <div>
                <label className={labelClass}>{t("specification")}</label>
                <textarea
                  name="specification"
                  value={form.specification}
                  onChange={handleChange}
                  rows={3}
                  className={fieldClass + " resize-none"}
                  placeholder="Technical specification or additional notes..."
                />
              </div>
            </div>
          </div>

          {/* Participants Section */}
          {trainees.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Users className="h-4 w-4 text-blue-600" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700">
                  Participants Details ({trainees.length})
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>{t("employeeId")}</label>
                        <div className="relative">
                          <input
                            className={fieldClass}
                            value={trainee.employeeId}
                            onChange={(e) =>
                              updateTrainee(idx, "employeeId", e.target.value)
                            }
                            required
                            placeholder="EMP-001"
                          />
                          <button
                            type="button"
                            onClick={() => fetchTraineeDetails(idx)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-blue-50 p-1.5 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Fetch details"
                          >
                            <RefreshCw className="h-4 w-4 animate-spin-hover" />
                          </button>
                        </div>
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
                      <div className="md:col-span-2 lg:col-span-1">
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
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-md disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {loading ? t("loading") : t("submit")}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
