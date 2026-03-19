"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { educationRequestApi, educationOpportunityApi } from "@/lib/api";
import { EducationRequest, EducationOpportunity } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import {
  Plus,
  FileText,
  Edit,
  Trash2,
  Send,
  CheckCircle2,
  Forward,
} from "lucide-react";

type WorkflowStatus =
  | "PENDING_DEPARTMENT_SUBMISSION"
  | "SUBMITTED_TO_CENTER"
  | "CENTER_REVIEWED"
  | "FORWARDED_TO_HR"
  | "COMMITTEE_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CONTRACT_CREATED"
  | "PENDING"
  | "HR_VERIFIED";

export default function EducationRequestsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [requests, setRequests] = useState<EducationRequest[]>([]);
  const [opportunities, setOpportunities] = useState<EducationOpportunity[]>(
    [],
  );
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState({
    employeeId: "",
    fullName: "",
    phone: "",
    department: "",
    opportunityId: "",
    currentEducationLevel: "",
    workExperience: "",
    performanceScore: "",
    description: "",
  });

  const isDepartmentHead = user?.role === "DEPARTMENT_HEAD";
  const isCenter = user?.role === "CYBER_DEVELOPMENT_CENTER";
  const isAdmin = user?.role === "ADMIN";

  const normalizedUserDepartment = ((user as any)?.department || "")
    .toString()
    .trim()
    .toLowerCase();

  useEffect(() => {
    loadRequests();
    loadOpportunities();

    if (user && (isDepartmentHead || isAdmin)) {
      setForm((prev) => ({
        ...prev,
        employeeId: String(user.employeeId || user.id || ""),
        fullName: user.fullName || "",
        phone: (user as any).phone || "",
        department: (user as any).department || "",
      }));
    }
  }, [user, isDepartmentHead, isAdmin]);

  const loadRequests = async () => {
    try {
      const res = await educationRequestApi.getAll(0, 100);
      setRequests(res.data.content || []);
    } catch {
      // silent on mock/offline errors
    }
  };

  const loadOpportunities = async () => {
    try {
      const res = await educationOpportunityApi.getAll(0, 100);
      setOpportunities(res.data.content || []);
    } catch {
      // silent on mock/offline errors
    }
  };

  const resetForm = () => {
    setForm({
      employeeId:
        isDepartmentHead || isAdmin
          ? String(user?.employeeId || user?.id || "")
          : "",
      fullName: isDepartmentHead || isAdmin ? user?.fullName || "" : "",
      phone: isDepartmentHead || isAdmin ? (user as any)?.phone || "" : "",
      department:
        isDepartmentHead || isAdmin ? (user as any)?.department || "" : "",
      opportunityId: "",
      currentEducationLevel: "",
      workExperience: "",
      performanceScore: "",
      description: "",
    });
    setEditId(null);
    setShowForm(false);
  };

  const visibleOpportunities = useMemo(() => {
    if (!isDepartmentHead) {
      return opportunities;
    }

    return opportunities.filter((opportunity) => {
      const targets = (opportunity.targetDepartments || []).map((department) =>
        department.trim().toLowerCase(),
      );

      if (targets.length > 0) {
        return targets.includes(normalizedUserDepartment);
      }

      return (
        opportunity.department?.trim().toLowerCase() ===
        normalizedUserDepartment
      );
    });
  }, [isDepartmentHead, normalizedUserDepartment, opportunities]);

  const selectedOpportunity = useMemo(
    () => visibleOpportunities.find((o) => o.id === Number(form.opportunityId)),
    [visibleOpportunities, form.opportunityId],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!selectedOpportunity)
        throw new Error("Please select an education opportunity.");

      const payload = {
        employeeId: Number(form.employeeId),
        opportunityId: Number(form.opportunityId),
        currentEducationLevel: form.currentEducationLevel,
        workExperience: Number(form.workExperience),
        performanceScore: Number(form.performanceScore),
        description: form.description,

        // compatibility fields for mock data rendering
        employeeName: form.fullName,
        employeePhone: form.phone,
        employeeDepartment: form.department,
        educationType: selectedOpportunity.educationType,
        educationLevel: selectedOpportunity.educationLevel,
        institution: selectedOpportunity.institution,
      };

      if (editId) {
        await educationRequestApi.update(editId, payload);
      } else {
        await educationRequestApi.create(payload);
      }

      await loadRequests();
      resetForm();
    } catch (err: any) {
      alert(err?.message || "Failed to save request");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (req: EducationRequest) => {
    setEditId(req.id);
    setForm({
      employeeId: String(req.employeeId || ""),
      fullName: req.employeeName || "",
      phone: req.employeePhone || "",
      department: req.employeeDepartment || "",
      opportunityId: String(req.opportunityId || ""),
      currentEducationLevel: req.currentEducationLevel || "",
      workExperience: String(req.workExperience ?? ""),
      performanceScore: String(req.performanceScore ?? ""),
      description: req.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this request?")) return;
    try {
      await educationRequestApi.delete(id);
      await loadRequests();
    } catch {
      alert("Failed to delete request");
    }
  };

  const submitToCenter = async (id: number) => {
    setBusyId(id);
    try {
      await educationRequestApi.update(id, { status: "SUBMITTED_TO_CENTER" });
      await loadRequests();
    } catch {
      alert("Failed to submit to center.");
    } finally {
      setBusyId(null);
    }
  };

  const centerReview = async (id: number) => {
    setBusyId(id);
    try {
      await educationRequestApi.update(id, { status: "CENTER_REVIEWED" });
      await loadRequests();
    } catch {
      alert("Failed to mark center review.");
    } finally {
      setBusyId(null);
    }
  };

  const forwardToHr = async (id: number) => {
    setBusyId(id);
    try {
      await educationRequestApi.update(id, { status: "FORWARDED_TO_HR" });
      await loadRequests();
    } catch {
      alert("Failed to forward to HR.");
    } finally {
      setBusyId(null);
    }
  };

  const canCreate = isDepartmentHead || isAdmin;
  const canEditRequest = (status: WorkflowStatus) =>
    ![
      "FORWARDED_TO_HR",
      "COMMITTEE_REVIEW",
      "APPROVED",
      "REJECTED",
      "CONTRACT_CREATED",
      "HR_VERIFIED",
    ].includes(status);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {t("educationRequests")}
            </h1>
          </div>

          {canCreate && (
            <button
              onClick={() => {
                setEditId(null);
                setShowForm((v) => !v);
                if (showForm) resetForm();
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              {t("newRequest")}
            </button>
          )}
        </div>

        {showForm && canCreate && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              {editId ? t("editRequest") : t("submitRequest")}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("educationOpportunity")}
                </label>
                <select
                  required
                  value={form.opportunityId}
                  onChange={(e) =>
                    setForm({ ...form, opportunityId: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Select Opportunity --</option>
                  {visibleOpportunities.map((opp) => (
                    <option key={opp.id} value={opp.id}>
                      {opp.educationType} ({opp.educationLevel}) -{" "}
                      {opp.institution} [{opp.department}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("employeeId")}
                </label>
                <input
                  type="number"
                  required
                  value={form.employeeId}
                  onChange={(e) =>
                    setForm({ ...form, employeeId: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("fullName")}
                </label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("phone")}
                </label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("department")}
                </label>
                <input
                  type="text"
                  required
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("currentEducationLevel")}
                </label>
                <input
                  type="text"
                  required
                  value={form.currentEducationLevel}
                  onChange={(e) =>
                    setForm({ ...form, currentEducationLevel: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("workExperience")}
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={form.workExperience}
                  onChange={(e) =>
                    setForm({ ...form, workExperience: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("averagePerformanceScore")}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.performanceScore}
                  onChange={(e) =>
                    setForm({ ...form, performanceScore: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("description")}
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? t("loading") : t("submit")}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-[10px] uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-3">ID</th>
                  <th className="px-3 py-3">{t("fullName")}</th>
                  <th className="px-3 py-3">{t("selectedEducationType")}</th>
                  <th className="px-3 py-3">{t("selectedEducationLevel")}</th>
                  <th className="px-3 py-3">{t("department")}</th>
                  <th className="px-3 py-3">{t("requestStatus")}</th>
                  <th className="px-3 py-3 text-right">{t("actions")}</th>
                </tr>
              </thead>

              <tbody className="divide-y text-xs">
                {requests.length > 0 ? (
                  requests.map((req) => {
                    const status = (req.status ||
                      "PENDING_DEPARTMENT_SUBMISSION") as WorkflowStatus;
                    const canSubmit =
                      (isDepartmentHead || isAdmin) &&
                      status === "PENDING_DEPARTMENT_SUBMISSION";
                    const canCenterReview =
                      (isCenter || isAdmin) && status === "SUBMITTED_TO_CENTER";
                    const canForward =
                      (isCenter || isAdmin) && status === "CENTER_REVIEWED";
                    const canEdit =
                      (isDepartmentHead || isAdmin) && canEditRequest(status);

                    return (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 whitespace-nowrap">
                          {req.id}
                        </td>
                        <td className="px-3 py-3 font-medium whitespace-nowrap">
                          {req.employeeName}
                        </td>
                        <td className="px-3 py-3">{req.educationType}</td>
                        <td className="px-3 py-3">{req.educationLevel}</td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          {req.employeeDepartment}
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex flex-wrap justify-end gap-1">
                            {canSubmit && (
                              <button
                                onClick={() => submitToCenter(req.id)}
                                disabled={busyId === req.id}
                                className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-1 text-[11px] text-white hover:bg-indigo-700 disabled:opacity-50"
                                title="Submit to Center"
                              >
                                <Send className="h-3 w-3" />
                                Submit
                              </button>
                            )}

                            {canCenterReview && (
                              <button
                                onClick={() => centerReview(req.id)}
                                disabled={busyId === req.id}
                                className="inline-flex items-center gap-1 rounded-md bg-cyan-600 px-2 py-1 text-[11px] text-white hover:bg-cyan-700 disabled:opacity-50"
                                title="Center Review"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Review
                              </button>
                            )}

                            {canForward && (
                              <button
                                onClick={() => forwardToHr(req.id)}
                                disabled={busyId === req.id}
                                className="inline-flex items-center gap-1 rounded-md bg-sky-600 px-2 py-1 text-[11px] text-white hover:bg-sky-700 disabled:opacity-50"
                                title="Forward to HR"
                              >
                                <Forward className="h-3 w-3" />
                                Forward
                              </button>
                            )}

                            {canEdit && (
                              <button
                                onClick={() => handleEdit(req)}
                                className="rounded p-1 text-gray-500 hover:text-blue-600"
                                title={t("edit")}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {(isDepartmentHead || isAdmin) && canEdit && (
                              <button
                                onClick={() => handleDelete(req.id)}
                                className="rounded p-1 text-gray-500 hover:text-red-600"
                                title={t("delete")}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      {t("noData")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
