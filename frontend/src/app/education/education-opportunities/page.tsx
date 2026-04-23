"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import { BookOpen, Plus, Search, Edit, Trash2, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { EducationOpportunity } from "@/types";
import { educationOpportunityApi, userApi } from "@/lib/api";

type OpportunityFormData = {
  educationType: string;
  educationLevel: string;
  institution: string;
  department: string;
  targetDepartments: string[];
  description: string;
  status: "OPEN" | "CLOSED" | "EXPIRED";
  deadline: string;
};

const emptyForm: OpportunityFormData = {
  educationType: "",
  educationLevel: "",
  institution: "",
  department: "",
  targetDepartments: [],
  description: "",
  status: "OPEN",
  deadline: "",
};

function normalizeDepartment(value: string | undefined | null): string {
  return (value || "").trim().toLowerCase();
}

function matchesDepartment(
  userDepartment: string | undefined | null,
  opportunity: EducationOpportunity,
): boolean {
  const normalizedUserDepartment = normalizeDepartment(userDepartment);
  if (!normalizedUserDepartment) return false;

  const targets = Array.isArray(opportunity.targetDepartments)
    ? opportunity.targetDepartments
    : [];

  if (
    targets.some(
      (department) =>
        normalizeDepartment(department) === normalizedUserDepartment,
    )
  ) {
    return true;
  }

  return (
    normalizeDepartment(opportunity.department) === normalizedUserDepartment
  );
}

export default function EducationOpportunitiesPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [opportunities, setOpportunities] = useState<EducationOpportunity[]>(
    [],
  );
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState<OpportunityFormData>(emptyForm);

  const userDepartment =
    (user as { department?: string } | null)?.department || "";
  const isCenterUser =
    user?.role === "CYBER_DEVELOPMENT_CENTER" || user?.role === "ADMIN";
  const isDepartmentHead = user?.role === "DEPARTMENT_HEAD";

  useEffect(() => {
    void Promise.all([fetchOpportunities(), fetchDepartments()]);
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await educationOpportunityApi.getAll(0, 100);
      setOpportunities(response.data.content || []);
    } catch (error) {
      console.error("Failed to fetch opportunities", error);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      // In a Keycloak-driven user system, departments should either be fetched from Keycloak Admin API
      // or managed as predefined categories. For now, we use a standard list of departments.
      const standardDepartments = [
        "Cyber Development Center",
        "HR & Training",
        "Finance",
        "Operations",
        "Engineering",
        "Legal",
        "Research & Development",
        "IT Support",
      ].sort((a, b) => a.localeCompare(b));

      setDepartmentOptions(standardDepartments);
    } catch (error) {
      console.error("Failed to load departments", error);
      setDepartmentOptions([]);
    }
  };

  const visibleOpportunities = useMemo(() => {
    const base =
      isDepartmentHead && !isCenterUser
        ? opportunities.filter((opportunity) =>
            matchesDepartment(userDepartment, opportunity),
          )
        : opportunities;

    const term = search.trim().toLowerCase();
    if (!term) return base;

    return base.filter((opportunity) => {
      const targets = Array.isArray(opportunity.targetDepartments)
        ? opportunity.targetDepartments.join(" ")
        : "";

      return [
        opportunity.educationType,
        opportunity.educationLevel,
        opportunity.institution,
        opportunity.department,
        opportunity.description,
        targets,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });
  }, [opportunities, isDepartmentHead, isCenterUser, userDepartment, search]);

  // Template and Suggestions logic
  const typeSuggestions = useMemo(() => {
    return Array.from(new Set(opportunities.map((o) => o.educationType)))
      .filter(Boolean)
      .sort();
  }, [opportunities]);

  const levelSuggestions = useMemo(() => {
    return Array.from(new Set(opportunities.map((o) => o.educationLevel)))
      .filter(Boolean)
      .sort();
  }, [opportunities]);

  const institutionSuggestions = useMemo(() => {
    return Array.from(new Set(opportunities.map((o) => o.institution)))
      .filter(Boolean)
      .sort();
  }, [opportunities]);

  const templates = useMemo(() => {
    const map = new Map<string, EducationOpportunity>();
    // Take the most recent one for each combination
    [...opportunities]
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .forEach((opp) => {
        const key =
          `${opp.educationType}|${opp.educationLevel}|${opp.institution}`.toLowerCase();
        if (!map.has(key)) {
          map.set(key, opp);
        }
      });
    return Array.from(map.values());
  }, [opportunities]);

  const handleApplyTemplate = (opp: EducationOpportunity) => {
    setFormData({
      educationType: opp.educationType,
      educationLevel: opp.educationLevel,
      institution: opp.institution,
      department: opp.department || "",
      targetDepartments: Array.isArray(opp.targetDepartments)
        ? [...opp.targetDepartments]
        : [],
      description: opp.description || "",
      status: "OPEN",
      deadline: opp.deadline || "",
    });
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditId(null);
    setShowForm(false);
  };

  const handleTargetDepartmentToggle = (department: string) => {
    setFormData((prev) => {
      const normalizedCurrent = department.trim().toLowerCase();
      const exists = prev.targetDepartments.some(
        (item) => item.trim().toLowerCase() === normalizedCurrent,
      );

      const nextTargets = exists
        ? prev.targetDepartments.filter(
            (item) => item.trim().toLowerCase() !== normalizedCurrent,
          )
        : [...prev.targetDepartments, department];

      return {
        ...prev,
        targetDepartments: nextTargets,
        department: nextTargets[0] || "",
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedTargets = formData.targetDepartments
      .map((item) => item.trim())
      .filter(Boolean);

    if (cleanedTargets.length === 0) {
      alert("Please select at least one target department.");
      return;
    }

    const deadlineDate = new Date(formData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let finalStatus = formData.status;
    if (deadlineDate < today) {
      finalStatus = "EXPIRED";
    }

    const payload = {
      ...formData,
      status: finalStatus,
      department: cleanedTargets[0],
      targetDepartments: cleanedTargets,
    };

    try {
      if (editId) {
        await educationOpportunityApi.update(editId, payload);
      } else {
        await educationOpportunityApi.create(payload);
      }

      resetForm();
      await fetchOpportunities();
    } catch (error) {
      console.error("Failed to save opportunity", error);
      alert("Failed to save opportunity.");
    }
  };

  const handleEdit = (opp: EducationOpportunity) => {
    setEditId(opp.id);
    setFormData({
      educationType: opp.educationType,
      educationLevel: opp.educationLevel,
      institution: opp.institution,
      department: opp.department || "",
      targetDepartments:
        opp.targetDepartments && opp.targetDepartments.length > 0
          ? opp.targetDepartments.map((d) => {
              // Try to map back to formal name from options if possible
              return (
                departmentOptions.find(
                  (opt) => opt.toLowerCase() === d.toLowerCase(),
                ) || d
              );
            })
          : opp.department
            ? [opp.department]
            : [],
      description: opp.description || "",
      status: opp.status || "OPEN",
      deadline: opp.deadline || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this opportunity?")) {
      return;
    }

    try {
      await educationOpportunityApi.delete(id);
      await fetchOpportunities();
    } catch (error) {
      console.error("Failed to delete opportunity", error);
      alert("Failed to delete opportunity.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">{t("loading")}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("educationOpportunities")}
              </h1>
              <p className="text-sm text-gray-500 font-medium italic">
                {isCenterUser
                  ? "Create and target education opportunities to specific departments."
                  : `View educational opportunities available for your department.`}
              </p>
            </div>
          </div>

          {isCenterUser && (
            <button
              onClick={() => {
                setEditId(null);
                setFormData(emptyForm);
                setShowForm((prev) => !prev);
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              {t("newOpportunity")}
            </button>
          )}
        </div>

        {isDepartmentHead && !isCenterUser && userDepartment && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Your department:{" "}
            <span className="font-semibold text-blue-900">
              {userDepartment}
            </span>
          </div>
        )}

        {showForm && isCenterUser && (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 border-b border-gray-50 pb-6 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editId ? t("editOpportunity") : t("addOpportunity")}
              </h2>

              {/* {!editId && templates.length > 0 && (
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Copy from Recent:
                  </label>
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const opp = templates.find(
                        (t) => t.id?.toString() === val,
                      );
                      if (opp) handleApplyTemplate(opp);
                    }}
                    className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 outline-none hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <option value="">-- Choose a template --</option>
                    {templates.map((t) => (
                      <option key={`template-${t.id}`} value={t.id}>
                        {t.educationType} - {t.educationLevel} ({t.institution})
                      </option>
                    ))}
                  </select>
                </div>
              )} */}
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("educationType")}
                </label>
                <input
                  type="text"
                  list="type-suggestions"
                  required
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none"
                  value={formData.educationType}
                  onChange={(e) =>
                    setFormData({ ...formData, educationType: e.target.value })
                  }
                />
                <datalist id="type-suggestions">
                  {typeSuggestions.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("educationLevel")}
                </label>
                <input
                  type="text"
                  list="level-suggestions"
                  required
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none"
                  value={formData.educationLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, educationLevel: e.target.value })
                  }
                />
                <datalist id="level-suggestions">
                  {levelSuggestions.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("institution")}
                </label>
                <input
                  type="text"
                  list="inst-suggestions"
                  required
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none"
                  value={formData.institution}
                  onChange={(e) =>
                    setFormData({ ...formData, institution: e.target.value })
                  }
                />
                <datalist id="inst-suggestions">
                  {institutionSuggestions.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t("opportunityStatus")}
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                  >
                    <option value="OPEN">{t("OPEN")}</option>
                    <option value="CLOSED">{t("CLOSED")}</option>
                    <option value="EXPIRED">{t("EXPIRED")}</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t("deadline")}
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Users className="h-4 w-4" />
                  Target Departments
                </label>

                {departmentOptions.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 rounded-lg border p-3 md:grid-cols-2 lg:grid-cols-3">
                    {departmentOptions.map((department) => {
                      const checked = formData.targetDepartments.some(
                        (item) =>
                          item.trim().toLowerCase() ===
                          department.trim().toLowerCase(),
                      );

                      return (
                        <label
                          key={department}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              handleTargetDepartmentToggle(department)
                            }
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">
                            {department}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-3 text-sm text-gray-500">
                    No department list found yet. Create users with departments
                    first.
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("description")}
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2 md:col-span-2 pt-4 border-t border-gray-50">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:-translate-y-0.5"
                >
                  {t("save")}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-200 px-6 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b border-gray-100 p-6 flex items-center justify-between bg-gray-50/30">
            <div className="relative group w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-blue-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search opportunities..."
                className="w-full rounded-xl border border-gray-100 bg-white py-2.5 pl-11 pr-4 text-sm font-medium transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-5">{t("educationType")}</th>
                  <th className="px-6 py-5">{t("educationLevel")}</th>
                  <th className="px-6 py-5">{t("institution")}</th>
                  <th className="px-6 py-5">Target Departments</th>
                  <th className="px-6 py-5">{t("deadline")}</th>
                  <th className="px-6 py-5">{t("status")}</th>
                  {isCenterUser && (
                    <th className="px-6 py-5 text-right">{t("actions")}</th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y text-gray-600">
                {visibleOpportunities.map((opp) => {
                  const targets =
                    opp.targetDepartments && opp.targetDepartments.length > 0
                      ? opp.targetDepartments
                      : opp.department
                        ? [opp.department]
                        : [];

                  return (
                    <tr
                      key={opp.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-5 font-bold text-gray-900 uppercase tracking-tight">
                        {opp.educationType}
                      </td>
                      <td className="px-6 py-5 font-medium text-gray-600 italic text-xs">
                        {opp.educationLevel}
                      </td>
                      <td className="px-6 py-5 font-medium text-gray-800">
                        {opp.institution}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          {targets.map((department) => (
                            <span
                              key={`${opp.id}-${department}`}
                              className="rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest italic"
                            >
                              {department}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs font-bold text-gray-500 whitespace-nowrap">
                        {opp.deadline || "-"}
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge
                          status={
                            opp.deadline && new Date(opp.deadline) < new Date(new Date().setHours(0, 0, 0, 0))
                              ? "EXPIRED"
                              : opp.status
                          }
                        />
                      </td>

                      {isCenterUser && (
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => handleEdit(opp)}
                              className="rounded-lg p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                              title={t("edit")}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(opp.id)}
                              className="rounded-lg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                              title={t("delete")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}

                {visibleOpportunities.length === 0 && (
                  <tr>
                    <td
                      colSpan={isCenterUser ? 7 : 6}
                      className="p-8 text-center text-gray-500"
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
