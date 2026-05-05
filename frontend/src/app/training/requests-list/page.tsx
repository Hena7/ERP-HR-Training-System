"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import { trainingRequestApi } from "@/app/training/services/trainingApi";
import { TrainingRequest } from "@/types/training";
import GroupedTable from "@/components/GroupedTable";
import {
  BookOpen,
  Filter,
  Eye,
  X,
  Calendar,
  Building2,
  Users,
  DollarSign,
  MapPin,
  FileText,
  User,
} from "lucide-react";

const STATUS_OPTIONS = [
  "ALL",
  "SUBMITTED",
  "APPROVED_DIRECT",
  "CONTRACT_REQUIRED",
  "CONTRACT_CREATED",
  "REJECTED",
];

export default function TrainingRequestsListPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [filtered, setFiltered] = useState<TrainingRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState<TrainingRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const isEmployeeOnly =
          user?.role === "EMPLOYEE" &&
          !["DEPARTMENT_HEAD", "ADMIN"].includes(user?.role);
        const { data } =
          isEmployeeOnly && user?.employeeId
            ? await trainingRequestApi.getMyRequests(user.employeeId)
            : await trainingRequestApi.getAll();

        setRequests(data);
        setFiltered(data);
      } catch (err) {
        console.error("Failed to fetch requests", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRequests();
    }
  }, [user]);

  useEffect(() => {
    if (statusFilter === "ALL") {
      setFiltered(requests);
    } else {
      setFiltered(requests.filter((r) => r.status === statusFilter));
    }
  }, [statusFilter, requests]);

  const statusColor: Record<string, string> = {
    SUBMITTED: "bg-blue-100 text-blue-800",
    APPROVED_DIRECT: "bg-emerald-100 text-emerald-800",
    CONTRACT_REQUIRED: "bg-amber-100 text-amber-800",
    CONTRACT_CREATED: "bg-blue-100 text-blue-800 border border-blue-200",
    REJECTED: "bg-red-100 text-red-800",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("trainingRequests")}
              </h1>
              <p className="text-sm text-gray-500 font-medium italic">
                {filtered.length} record(s)
              </p>
            </div>
          </div>
          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All Statuses" : s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-400">
              {t("loading")}
            </div>
          ) : (
            <GroupedTable
              rows={filtered}
              groupBy={(r) => r.trainingTitle}
              rowKey={(r) => r.id}
              emptyMessage={t("noData")}
              columns={[
                {
                  header: "REQ-ID",
                  render: (r) => (
                    <span className="font-bold text-blue-600">
                      TRQ-{r.id.toString().slice(-6)}
                    </span>
                  ),
                },
                {
                  header: t("department"),
                  key: "department",
                  render: (r) => (
                    <span className="font-medium text-gray-900">
                      {r.department}
                    </span>
                  ),
                },
                {
                  header: t("estimatedCost") + " (Total)",
                  render: (r) => (
                    <span className="font-medium text-gray-700">
                      {r.estimatedCost.toLocaleString()} Birr
                    </span>
                  ),
                },
                {
                  header: t("numTrainees"),
                  key: "numTrainees",
                  render: (r) => (
                    <span className="text-gray-700">{r.numTrainees}</span>
                  ),
                },
                {
                  header: t("status"),
                  render: (r) => (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusColor[r.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {r.status.replace(/_/g, " ")}
                    </span>
                  ),
                },
              ]}
              renderActions={(r) => (
                <button
                  onClick={() => setSelected(r)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {t("view")}
                </button>
              )}
            />
          )}
        </div>
      </div>
      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight">
                Request Detail — TRQ-{selected.id.toString().slice(-6)}
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                {
                  icon: User,
                  label: t("requester"),
                  value:
                    selected.requesterName &&
                    selected.requesterName !== "Keycloak User"
                      ? selected.requesterName
                      : selected.requesterId || "Unknown",
                },
                {
                  icon: Building2,
                  label: t("department"),
                  value: selected.department,
                },
                {
                  icon: BookOpen,
                  label: t("trainingTitle"),
                  value: selected.trainingTitle,
                },
                {
                  icon: DollarSign,
                  label: t("estimatedCost") + " (Total)",
                  value: `${selected.estimatedCost.toLocaleString()} Birr`,
                },
                {
                  icon: Users,
                  label: t("numTrainees"),
                  value: selected.numTrainees,
                },
                {
                  icon: Calendar,
                  label: t("trainingDuration"),
                  value: selected.trainingDuration,
                },
                {
                  icon: MapPin,
                  label: t("trainingLocation"),
                  value: selected.trainingLocation,
                },
                {
                  icon: FileText,
                  label: t("budgetSource"),
                  value: selected.budgetSource,
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {label}
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {String(value || "—")}
                    </p>
                  </div>
                </div>
              ))}
              {selected.specification && (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                    {t("specification")}
                  </p>
                  <p className="text-sm text-gray-700 font-medium leading-relaxed">
                    {selected.specification}
                  </p>
                </div>
              )}
              {selected.reviewNote && (
                <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">
                    {t("reviewNote")}
                  </p>
                  <p className="text-sm text-gray-700 font-medium leading-relaxed">
                    {selected.reviewNote}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
