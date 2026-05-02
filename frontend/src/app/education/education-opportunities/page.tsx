"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { EducationOpportunity } from "@/types";
import { educationOpportunityApi } from "@/lib/api";

// INSA Organizational Hierarchy
interface OrgNode {
  id: string;
  label: string;
  children?: OrgNode[];
}

const INSA_ORG_TREE: OrgNode[] = [
  {
    id: "1674",
    label: "1674--ኢመደአ አዲስ",
    children: [
      {
        id: "1691",
        label: "1691--ዋና ዳይርክተር",
        children: [
          {
            id: "1693",
            label: "1693--የኢንፎርሜሽን አሹራንስ ዘርፍ",
            children: [
              {
                id: "1693-D1",
                label: "Directorate 1",
                children: [
                  { id: "1693-Div1", label: "Division 1" },
                  { id: "1693-Div2", label: "Division 2" },
                  { id: "1693-Div3", label: "Division 3" },
                ],
              },
              { id: "1693-D2", label: "Directorate 2" },
              { id: "1693-D3", label: "Directorate 3" },
            ],
          },
          {
            id: "1694",
            label: "1694--የኢንፎርሜሽን ዋርፌር እና መረጃ ዘርፍ",
            children: [
              { id: "1694-D1", label: "Directorate 1" },
              { id: "1694-D2", label: "Directorate 2" },
              { id: "1694-D3", label: "Directorate 3" },
            ],
          },
          {
            id: "1695",
            label: "1695--ሀገራዊ የዲጂታል መሰረተ ልማት ዘርፍ",
            children: [
              { id: "1695-D1", label: "Directorate 1" },
              { id: "1695-D2", label: "Directorate 2" },
              { id: "1695-D3", label: "Directorate 3" },
            ],
          },
          {
            id: "1692",
            label: "1692--ዋና ዳይሬክተር አማካሪ(ዎች)",
          },
          {
            id: "1696",
            label: "1696--የተቀናጀ ድጋፍ ዘርፍ",
            children: [
              { id: "1696-D1", label: "Directorate 1" },
              { id: "1696-D2", label: "Directorate 2" },
              { id: "1696-D3", label: "Directorate 3" },
            ],
          },

          {
            id: "1697",
            label: "1697--ዋና ዳይሬክተር ተጠሪ",
            children: [
              { id: "1697-D1", label: "Directorate 1" },
              { id: "1697-D2", label: "Directorate 2" },
              { id: "1697-D3", label: "Directorate 3" },
            ],
          },
        ],
      },
    ],
  },
];

/** Collect all descendant IDs (inclusive of node itself) */
function getAllDescendantIds(node: OrgNode): string[] {
  const ids: string[] = [node.id];
  if (node.children) {
    node.children.forEach((child) => ids.push(...getAllDescendantIds(child)));
  }
  return ids;
}

/** Collect all leaf IDs under a node */
function getLeafIds(node: OrgNode): string[] {
  if (!node.children || node.children.length === 0) return [node.id];
  return node.children.flatMap(getLeafIds);
}

function findNodeById(nodes: OrgNode[], id: string): OrgNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

// types for form
type DeptQuota = { candidates: number; standby: number };

type OpportunityFormData = {
  educationType: string;
  educationLevel: string;
  institution: string;
  department: string;
  targetDepartments: string[];
  departmentQuotas: Record<string, DeptQuota>;
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
  departmentQuotas: {},
  description: "",
  status: "OPEN",
  deadline: "",
};

// Org Tree Node Component
function OrgTreeNode({
  node,
  selectedIds,
  onToggle,
  depth = 0,
}: {
  node: OrgNode;
  selectedIds: Set<string>;
  onToggle: (node: OrgNode) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const allDescendants = getAllDescendantIds(node);
  const selectedCount = allDescendants.filter((id) =>
    selectedIds.has(id),
  ).length;
  const isFullySelected = selectedCount === allDescendants.length;
  const isPartiallySelected = selectedCount > 0 && !isFullySelected;
  const isLeaf = !hasChildren;

  return (
    <div className={`${depth > 0 ? "ml-5 border-l border-gray-100 pl-3" : ""}`}>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors ${
          isFullySelected
            ? "bg-blue-50"
            : isPartiallySelected
              ? "bg-blue-50/40"
              : "hover:bg-gray-50"
        }`}
      >
        {hasChildren && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="text-gray-400 hover:text-gray-700 flex-shrink-0"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-3.5 flex-shrink-0" />}

        <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <input
              type="checkbox"
              className="peer h-4 w-4 cursor-pointer rounded border border-gray-300 bg-white transition-all checked:border-blue-600 checked:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 indeterminate:border-blue-100 indeterminate:bg-blue-100"
              checked={isFullySelected}
              ref={(el) => {
                if (el) el.indeterminate = isPartiallySelected;
              }}
              onChange={() => onToggle(node)}
            />
          </div>
          <span
            className={`text-sm truncate ${
              isLeaf ? "text-gray-700" : "font-semibold text-gray-800"
            }`}
          >
            {node.label}
          </span>
          {isPartiallySelected && (
            <span className="flex-shrink-0 rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-600">
              {selectedCount}/{allDescendants.length}
            </span>
          )}
        </label>
      </div>

      {hasChildren && expanded && (
        <div className="mt-0.5">
          {node.children!.map((child) => (
            <OrgTreeNode
              key={child.id}
              node={child}
              selectedIds={selectedIds}
              onToggle={onToggle}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState<OpportunityFormData>(emptyForm);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getDeptLabel = (id: string) => {
    const node = findNodeById(INSA_ORG_TREE, id);
    return node ? node.label : id;
  };

  const userDepartment =
    (user as { department?: string } | null)?.department || "";
  const isCenterUser =
    user?.role === "CYBER_DEVELOPMENT_CENTER" || user?.role === "ADMIN";
  const isDepartmentHead = user?.role === "DEPARTMENT_HEAD";

  // Derived: selected IDs as a Set for O(1) lookup
  const selectedIdSet = useMemo(
    () => new Set(formData.targetDepartments),
    [formData.targetDepartments],
  );

  useEffect(() => {
    void fetchOpportunities();
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

  // handle toggling a node which cascades to all descendants
  const handleNodeToggle = (node: OrgNode) => {
    const allIds = getAllDescendantIds(node);
    const isFullySelected = allIds.every((id) => selectedIdSet.has(id));

    setFormData((prev) => {
      const newSelected = new Set(prev.targetDepartments);
      const newQuotas = { ...prev.departmentQuotas };

      if (isFullySelected) {
        // Deselect all descendants
        allIds.forEach((id) => {
          newSelected.delete(id);
          delete newQuotas[id];
        });
      } else {
        // Select all descendants
        allIds.forEach((id) => {
          newSelected.add(id);
          if (!newQuotas[id]) {
            newQuotas[id] = { candidates: 1, standby: 1 };
          }
        });
      }

      const nextTargets = Array.from(newSelected);
      return {
        ...prev,
        targetDepartments: nextTargets,
        departmentQuotas: newQuotas,
        department: nextTargets[0] || "",
      };
    });
  };

  const handleQuotaChange = (
    deptId: string,
    field: "candidates" | "standby",
    value: number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      departmentQuotas: {
        ...prev.departmentQuotas,
        [deptId]: {
          ...(prev.departmentQuotas[deptId] || { candidates: 1, standby: 1 }),
          [field]: Math.max(0, value),
        },
      },
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditId(null);
    setShowForm(false);
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
      departmentQuotas: formData.departmentQuotas,
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
    const targets =
      opp.targetDepartments && opp.targetDepartments.length > 0
        ? opp.targetDepartments
        : opp.department
          ? [opp.department]
          : [];
    const quotas = (opp as any).departmentQuotas || {};
    setFormData({
      educationType: opp.educationType,
      educationLevel: opp.educationLevel,
      institution: opp.institution,
      department: opp.department || "",
      targetDepartments: targets,
      departmentQuotas: quotas,
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

  // Suggestions from existing opportunities
  const typeSuggestions = useMemo(
    () =>
      Array.from(new Set(opportunities.map((o) => o.educationType)))
        .filter(Boolean)
        .sort(),
    [opportunities],
  );
  const levelSuggestions = useMemo(
    () =>
      Array.from(new Set(opportunities.map((o) => o.educationLevel)))
        .filter(Boolean)
        .sort(),
    [opportunities],
  );
  const institutionSuggestions = useMemo(
    () =>
      Array.from(new Set(opportunities.map((o) => o.institution)))
        .filter(Boolean)
        .sort(),
    [opportunities],
  );

  // Selected leaf nodes that need quotas entered
  const selectedLeafNodes = useMemo(() => {
    const leaves: OrgNode[] = [];
    const collectLeaves = (nodes: OrgNode[]) => {
      nodes.forEach((node) => {
        if (!node.children || node.children.length === 0) {
          if (selectedIdSet.has(node.id)) leaves.push(node);
        } else {
          collectLeaves(node.children);
        }
      });
    };
    collectLeaves(INSA_ORG_TREE);
    return leaves;
  }, [selectedIdSet]);

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
                  : "View educational opportunities available for your department."}
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
            <div className="mb-6 flex items-center justify-between border-b border-gray-50 pb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editId ? t("editOpportunity") : t("addOpportunity")}
              </h2>
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

              <div className="grid grid-cols-2 gap-4">
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

              {/* â”€â”€ Hierarchical Department Tree â”€â”€ */}
              <div className="md:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Users className="h-4 w-4 text-blue-600" />
                  Target Departments
                  {formData.targetDepartments.length > 0 && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      {formData.targetDepartments.length} selected
                    </span>
                  )}
                </label>
                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 max-h-72 overflow-y-auto">
                  {INSA_ORG_TREE.map((node) => (
                    <OrgTreeNode
                      key={node.id}
                      node={node}
                      selectedIds={selectedIdSet}
                      onToggle={handleNodeToggle}
                      depth={0}
                    />
                  ))}
                </div>
              </div>

              {/* â”€â”€ Per-Department Quotas â”€â”€ */}
              {selectedLeafNodes.length > 0 && (
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Department Quotas{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      (candidates & standby per department)
                    </span>
                  </label>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {selectedLeafNodes.map((node) => {
                      const quota = formData.departmentQuotas[node.id] || {
                        candidates: 1,
                        standby: 1,
                      };
                      return (
                        <div
                          key={node.id}
                          className="flex items-center gap-3 rounded-lg border border-blue-100 bg-white px-4 py-2.5 shadow-sm"
                        >
                          <span className="flex-1 truncate text-xs font-semibold text-gray-700">
                            {node.label}
                          </span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <label className="text-[10px] font-bold uppercase text-gray-400">
                              Cand.
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={quota.candidates}
                              onChange={(e) =>
                                handleQuotaChange(
                                  node.id,
                                  "candidates",
                                  Number(e.target.value),
                                )
                              }
                              className="w-14 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-center text-sm font-bold focus:border-blue-500 focus:outline-none"
                            />
                            <label className="text-[10px] font-bold uppercase text-gray-400">
                              Stby.
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={quota.standby}
                              onChange={(e) =>
                                handleQuotaChange(
                                  node.id,
                                  "standby",
                                  Number(e.target.value),
                                )
                              }
                              className="w-14 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-center text-sm font-bold focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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

        {/* Opportunities table */}
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
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {(expandedRows.has(opp.id)
                            ? targets
                            : targets.slice(0, 3)
                          ).map((department) => (
                            <span
                              key={`${opp.id}-${department}`}
                              className="rounded-lg bg-blue-50/50 border border-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600 uppercase tracking-widest shadow-sm"
                            >
                              {getDeptLabel(department)}
                            </span>
                          ))}
                          {targets.length > 3 && (
                            <button
                              onClick={() => toggleRow(opp.id)}
                              className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500 hover:bg-gray-200 transition-colors border border-gray-200"
                            >
                              {expandedRows.has(opp.id)
                                ? "Show Less"
                                : `+${targets.length - 3} more...`}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs font-bold text-gray-500 whitespace-nowrap">
                        {opp.deadline || "-"}
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge
                          status={
                            opp.deadline &&
                            new Date(opp.deadline) <
                              new Date(new Date().setHours(0, 0, 0, 0))
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
