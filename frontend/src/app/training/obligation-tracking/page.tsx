"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  trainingContractApi,
  trainingObligationApi,
  trainingRequestApi,
} from "@/app/training/services/trainingApi";
import { employeeApi } from "@/lib/api";
import {
  TrainingObligation,
  TrainingContract,
  TrainingRequest,
} from "@/types/training";
import {
  Clock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Eye,
  Users,
  X,
} from "lucide-react";
import { calculateObligation } from "@/app/training/services/obligationCalculator";
import { useMemo } from "react";

export default function ObligationTrackingPage() {
  const { t } = useLanguage();
  const [contracts, setContracts] = useState<TrainingContract[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [obligations, setObligations] = useState<TrainingObligation[]>([]);
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<any | null>(null);
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedContract, setSelectedContract] =
    useState<TrainingContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addFormTrainingId, setAddFormTrainingId] = useState<number | null>(
    null,
  );
  const [selectedCreationIds, setSelectedCreationIds] = useState<number[]>([]);

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
      trainingRequestApi.getAll(),
      employeeApi.getAll(0, 100).catch(() => ({ data: { content: [] } })),
    ]).then(([{ data: c }, { data: o }, { data: r }, { data: e }]) => {
      setContracts(c);
      setObligations(o);
      setRequests(r);
      setEmployees(e.content || []);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleContractToggle = (c: TrainingContract) => {
    setSelectedCreationIds((prev) => {
      const isSelected = prev.includes(Number(c.id));
      const next = isSelected
        ? prev.filter((id) => id !== Number(c.id))
        : [...prev, Number(c.id)];

      // If we just selected the first one, auto-fill default months based on its cost
      if (!isSelected && next.length === 1) {
        const cost = c.totalCost || 0;
        const obl = calculateObligation(cost);
        setForm((prevForm) => ({
          ...prevForm,
          obligationMonths: obl.requiresContract ? String(obl.months) : "",
        }));
      }
      return next;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await Promise.all(
        selectedCreationIds.map((cid) => {
          const contract = contracts.find((c) => c.id === cid);
          return trainingObligationApi.create({
            ...form,
            contractId: cid,
            employeeName: contract?.employeeName || "",
            obligationMonths: parseInt(form.obligationMonths),
          });
        }),
      );
      setShowAdd(false);
      setAddFormTrainingId(null);
      setSelectedCreationIds([]);
      setForm({
        contractId: "",
        employeeName: "",
        startDate: "",
        endDate: "",
        obligationMonths: "",
      });
      load();
    } catch (err) {
      console.error("Failed to create obligations", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    setBusyId(id);
    await trainingObligationApi.updateStatus(id, status);
    if (selectedTraining) {
      // If we are in the detail modal, update the local selected training state as well
      const updatedObligations = selectedTraining.participants.map((ob: any) =>
        ob.id === id ? { ...ob, status } : ob,
      );
      setSelectedTraining({
        ...selectedTraining,
        participants: updatedObligations,
      });
    }
    setBusyId(null);
    load();
  };

  const handleBulkStatusChange = async (ids: number[], status: string) => {
    setLoading(true);
    await Promise.all(
      ids.map((id) => trainingObligationApi.updateStatus(id, status)),
    );
    setSelectedIds([]);
    if (selectedTraining) {
      const updatedObligations = selectedTraining.participants.map((ob: any) =>
        ids.includes(ob.id) ? { ...ob, status } : ob,
      );
      setSelectedTraining({
        ...selectedTraining,
        participants: updatedObligations,
      });
    }
    load();
    setLoading(false);
  };

  const trainingGroups = useMemo(() => {
    const groups: any[] = [];

    // Group obligations by their Request ID via the Contract
    obligations.forEach((ob) => {
      const contract = contracts.find((c) => c.id === ob.contractId);
      if (!contract) return;

      const request = requests.find((r) => r.id === contract.requestId);
      const reqId = request?.id || contract.requestId || 0;

      let group = groups.find((g) => g.id === reqId);
      if (!group) {
        group = {
          id: reqId,
          title: request?.trainingTitle || "Unknown Training",
          department: request?.department || contract.employeeDepartment || "—",
          participants: [],
        };
        groups.push(group);
      }
      group.participants.push({
        ...ob,
        employeeName:
          ob.employeeName && ob.employeeName !== "Keycloak User"
            ? ob.employeeName
            : employees.find(
                (e) => String(e.employeeId) === String(contract.employeeId),
              )?.fullName ||
              ob.employeeName ||
              "Keycloak User",
      });
    });

    return groups.filter((g) =>
      selectedDept === "All" ? true : g.department === selectedDept,
    );
  }, [obligations, contracts, requests, employees, selectedDept]);

  const departments = useMemo(() => {
    const depts = new Set<string>();
    trainingGroups.forEach((g) => depts.add(g.department));
    return ["All", ...Array.from(depts)];
  }, [trainingGroups]);

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
                {trainingGroups.length} training event(s)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm font-bold text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <Users className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-md"
            >
              <Plus className="h-4 w-4" /> New Obligation
            </button>
          </div>
        </div>

        {/* Trainings Master Table */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <tr>
                {[
                  "TR-ID",
                  "Training Title",
                  t("department"),
                  "Participants",
                  "Status Summary",
                  "Actions",
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
                    colSpan={6}
                    className="py-16 text-center text-sm text-gray-400"
                  >
                    {t("loading")}
                  </td>
                </tr>
              ) : trainingGroups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <Clock className="h-10 w-10 text-gray-300 mb-3" />
                      <p className="text-sm font-bold text-gray-700">
                        No training data found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                trainingGroups.map((group) => {
                  const activeCount = group.participants.filter(
                    (p: any) => p.status === "ACTIVE",
                  ).length;
                  const completedCount = group.participants.filter(
                    (p: any) => p.status === "COMPLETED",
                  ).length;
                  return (
                    <tr
                      key={group.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-xs font-bold text-blue-600">
                        TR-{String(group.id).slice(-6)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900 line-clamp-1">
                          {group.title}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-600">
                        {group.department}
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                          <Users className="h-4 w-4 text-gray-400" />
                          {group.participants.length}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {activeCount > 0 && (
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                              {activeCount} Active
                            </span>
                          )}
                          {completedCount > 0 && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              {completedCount} Done
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedTraining(group)}
                          className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-blue-600 hover:text-white transition-all border border-gray-100 shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Participants
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        {/* Participants Detail Modal */}
        {selectedTraining && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-5xl rounded-xl bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/30 px-6 py-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedTraining.title}
                  </h3>
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-0.5">
                    {selectedTraining.department} —{" "}
                    {selectedTraining.participants.length} Participant(s)
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTraining(null);
                    setSelectedIds([]);
                  }}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-0">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] font-bold uppercase tracking-widest text-gray-400 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 w-12">
                        <input
                          type="checkbox"
                          disabled={
                            !selectedTraining.participants.some(
                              (p: any) => p.status === "ACTIVE",
                            )
                          }
                          checked={
                            selectedIds.length > 0 &&
                            selectedIds.length ===
                              selectedTraining.participants.filter(
                                (p: any) => p.status === "ACTIVE",
                              ).length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(
                                selectedTraining.participants
                                  .filter((p: any) => p.status === "ACTIVE")
                                  .map((p: any) => p.id),
                              );
                            } else {
                              setSelectedIds([]);
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-4">OBL-ID</th>
                      <th className="px-6 py-4">{t("fullName")}</th>
                      <th className="px-6 py-4">{t("startDate")}</th>
                      <th className="px-6 py-4">{t("endDate")}</th>
                      <th className="px-6 py-4">{t("obligationMonths")}</th>
                      <th className="px-6 py-4">{t("status")}</th>
                      <th className="px-6 py-4 text-right">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedTraining.participants.map((ob: any) => {
                      const sc = statusConfig[ob.status] || statusConfig.ACTIVE;
                      const Icon = sc.icon;
                      const isSelectable = ob.status === "ACTIVE";
                      return (
                        <tr
                          key={ob.id}
                          className={`hover:bg-gray-50/50 transition-colors ${
                            selectedIds.includes(ob.id) ? "bg-blue-50/30" : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              disabled={!isSelectable}
                              checked={selectedIds.includes(ob.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds((p) => [...p, ob.id]);
                                } else {
                                  setSelectedIds((p) =>
                                    p.filter((id) => id !== ob.id),
                                  );
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-20"
                            />
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-blue-600">
                            OBL-{String(ob.id).slice(-6)}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {ob.employeeName}
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
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {ob.status === "ACTIVE" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleStatusChange(ob.id, "COMPLETED")
                                    }
                                    disabled={busyId === ob.id}
                                    className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all outline outline-1 outline-emerald-100"
                                  >
                                    Complete
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusChange(ob.id, "VIOLATED")
                                    }
                                    disabled={busyId === ob.id}
                                    className="rounded-lg bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700 hover:bg-red-600 hover:text-white transition-all outline outline-1 outline-red-100"
                                  >
                                    Violate
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
                <div className="text-sm font-bold text-gray-500">
                  {selectedIds.length > 0 ? (
                    <span className="text-blue-600">
                      {selectedIds.length} participant(s) selected
                    </span>
                  ) : (
                    "Select participants to perform bulk actions"
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    disabled={selectedIds.length === 0 || loading}
                    onClick={() =>
                      handleBulkStatusChange(selectedIds, "COMPLETED")
                    }
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {loading ? "Processing..." : "Complete Selected"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Obligation Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50/30 px-6 py-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                  New Obligation Record
                </h3>
              </div>

              {/* Step 1: Select Training */}
              <div className="p-6 border-b border-gray-100 bg-gray-50/20">
                <label className={labelClass}>Step 1: Select Training Event</label>
                <select
                  className={fieldClass}
                  value={addFormTrainingId || ""}
                  onChange={(e) => {
                    setAddFormTrainingId(Number(e.target.value));
                    setSelectedContract(null);
                  }}
                >
                  <option value="">Select a training title...</option>
                  {requests
                    .filter((r) =>
                      contracts.some((c) => c.requestId === r.id),
                    )
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.trainingTitle} ({r.department})
                      </option>
                    ))}
                </select>
              </div>

              {/* Step 2: Select Trainee registered in those contracts */}
              <div className="overflow-x-auto border-b border-gray-100 max-h-52">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400 sticky top-0">
                    <tr>
                      <th className="px-5 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          onChange={(e) => {
                            const filtered = contracts.filter(
                              (c) => c.requestId === addFormTrainingId,
                            );
                            if (e.target.checked) {
                              setSelectedCreationIds(
                                filtered.map((c) => Number(c.id)),
                              );
                              // Auto-fill months from first participant if nothing selected yet
                              if (filtered.length > 0) {
                                const obl = calculateObligation(
                                  filtered[0].totalCost,
                                );
                                setForm((prev) => ({
                                  ...prev,
                                  obligationMonths: obl.requiresContract
                                    ? String(obl.months)
                                    : "",
                                }));
                              }
                            } else {
                              setSelectedCreationIds([]);
                            }
                          }}
                          checked={
                            addFormTrainingId !== null &&
                            contracts.filter(
                              (c) => c.requestId === addFormTrainingId,
                            ).length > 0 &&
                            selectedCreationIds.length ===
                              contracts.filter(
                                (c) => c.requestId === addFormTrainingId,
                              ).length
                          }
                        />
                      </th>
                      <th className="px-5 py-3">CTR-ID</th>
                      <th className="px-5 py-3">{t("fullName")}</th>
                      <th className="px-5 py-3">{t("department")}</th>
                      <th className="px-5 py-3 text-right">Cost (ETB)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs">
                    {addFormTrainingId ? (
                      (() => {
                        const filteredContracts = contracts.filter(
                          (c) => c.requestId === addFormTrainingId,
                        );
                        return filteredContracts.map((c) => {
                          const isSelected = selectedCreationIds.includes(
                            Number(c.id),
                          );
                          return (
                            <tr
                              key={c.id}
                              className="hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="px-5 py-3">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={isSelected}
                                  onChange={() => handleContractToggle(c)}
                                />
                              </td>
                              <td className="px-5 py-3 font-bold text-blue-600">
                                CTR-{c.id.toString().slice(-6)}
                              </td>
                              <td className="px-5 py-3 font-bold text-gray-900">
                                {c.employeeName &&
                                c.employeeName !== "Keycloak User"
                                  ? c.employeeName
                                  : employees.find(
                                      (e) =>
                                        String(e.employeeId) ===
                                        String(c.employeeId),
                                    )?.fullName ||
                                    c.employeeName ||
                                    "Keycloak User"}
                              </td>
                              <td className="px-5 py-3 font-medium text-gray-600">
                                {c.employeeDepartment || "—"}
                              </td>
                              <td className="px-5 py-3 text-right font-bold text-emerald-600">
                                {c.totalCost.toLocaleString()} Birr
                              </td>
                            </tr>
                          );
                        });
                      })()
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-8 text-center text-gray-400 italic font-medium"
                        >
                          Please select a training event first to see the
                          trainee list.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Form Fields for selected batch */}
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                {selectedCreationIds.length > 0 && (
                  <div className="rounded-lg border border-blue-100 bg-blue-50/40 px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">
                        Selected Participants
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {selectedCreationIds.length} Trainee(s) Selected
                      </p>
                    </div>
                    {selectedCreationIds.length === 1 &&
                      (() => {
                        const cid = selectedCreationIds[0];
                        const contract = contracts.find((c) => c.id === cid);
                        const cost = contract?.totalCost || 0;
                        const obl = calculateObligation(cost);
                        return (
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-amber-600 uppercase">
                              Suggested Obligation
                            </p>
                            <p className="text-xs font-black text-blue-700">
                              {obl.label}
                            </p>
                          </div>
                        );
                      })()}
                  </div>
                )}
                {/* Remove employeeName manual input since it's now bulk selected */}
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
                    disabled={selectedCreationIds.length === 0 || loading}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Records"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdd(false);
                      setAddFormTrainingId(null);
                      setSelectedCreationIds([]);
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
      </div>
    </DashboardLayout>
  );
}
