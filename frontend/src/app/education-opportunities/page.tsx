"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
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
};

const emptyForm: OpportunityFormData = {
  educationType: "",
  educationLevel: "",
  institution: "",
  department: "",
  targetDepartments: [],
  description: "",
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
      const response = await userApi.getAll();
      const users = (response.data as any[]) || [];
      const departments: string[] = Array.from(
        new Set(
          users
            .map((item: { department?: string }) =>
              (item.department || "").trim(),
            )
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b));

      setDepartmentOptions(departments);
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

  const resetForm = () => {
    setFormData(emptyForm);
    setEditId(null);
    setShowForm(false);
  };

  const handleTargetDepartmentToggle = (department: string) => {
    setFormData((prev) => {
      const exists = prev.targetDepartments.includes(department);
      const nextTargets = exists
        ? prev.targetDepartments.filter((item) => item !== department)
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

    const payload = {
      ...formData,
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
          ? opp.targetDepartments
          : opp.department
            ? [opp.department]
            : [],
      description: opp.description || "",
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("educationOpportunities")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isCenterUser
                ? "Create and target education opportunities to specific departments."
                : "View only the education opportunities assigned to your department."}
            </p>
          </div>

          {isCenterUser && (
            <button
              onClick={() => {
                setEditId(null);
                setFormData(emptyForm);
                setShowForm((prev) => !prev);
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              {t("newOpportunity")}
            </button>
          )}
        </div>

        {isDepartmentHead && !isCenterUser && userDepartment && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Your department:{" "}
            <span className="font-semibold">{userDepartment}</span>
          </div>
        )}

        {showForm && isCenterUser && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              {editId ? t("editOpportunity") : t("addOpportunity")}
            </h2>

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
                  required
                  className="w-full rounded-lg border p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={formData.educationType}
                  onChange={(e) =>
                    setFormData({ ...formData, educationType: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("educationLevel")}
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={formData.educationLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, educationLevel: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("institution")}
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={formData.institution}
                  onChange={(e) =>
                    setFormData({ ...formData, institution: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Users className="h-4 w-4" />
                  Target Departments
                </label>

                {departmentOptions.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 rounded-lg border p-3 md:grid-cols-2 lg:grid-cols-3">
                    {departmentOptions.map((department) => {
                      const checked =
                        formData.targetDepartments.includes(department);

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
                  className="w-full rounded-lg border p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2 md:col-span-2">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  {t("save")}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b border-gray-100 p-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`${t("search")}...`}
                className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4 font-medium">{t("educationType")}</th>
                  <th className="p-4 font-medium">{t("educationLevel")}</th>
                  <th className="p-4 font-medium">{t("institution")}</th>
                  <th className="p-4 font-medium">Target Departments</th>
                  {isCenterUser && (
                    <th className="p-4 font-medium">{t("actions")}</th>
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
                    <tr key={opp.id} className="hover:bg-gray-50/50">
                      <td className="p-4 font-medium text-gray-900">
                        {opp.educationType}
                      </td>
                      <td className="p-4">{opp.educationLevel}</td>
                      <td className="p-4">{opp.institution}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {targets.map((department) => (
                            <span
                              key={`${opp.id}-${department}`}
                              className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700"
                            >
                              {department}
                            </span>
                          ))}
                        </div>
                      </td>

                      {isCenterUser && (
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(opp)}
                              className="rounded p-1 text-blue-600 hover:bg-blue-50"
                              title={t("edit")}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(opp.id)}
                              className="rounded p-1 text-red-600 hover:bg-red-50"
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
                      colSpan={isCenterUser ? 5 : 4}
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
