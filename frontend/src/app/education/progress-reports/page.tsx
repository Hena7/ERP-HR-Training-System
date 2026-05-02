"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { progressReportApi, contractApi } from "@/lib/api";
import { ProgressReport, Contract } from "@/types";
import { BarChart3, Edit, Trash2, FileText } from "lucide-react";
import GroupedTable from "@/components/GroupedTable";

const fieldClass =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5";

export default function ProgressReportsPage() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ reportMonth: "", description: "" });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [repRes, conRes] = await Promise.all([
        progressReportApi.getAll(0, 20),
        contractApi.getAll(0, 50),
      ]);
      setReports(repRes.data.content || []);
      setContracts(conRes.data.content || []);
    } catch { /* API not available */ }
  };

  const selectedContract = contracts.find((c) => c.id === selectedContractId) || null;

  const handleSelectContract = (id: number) => {
    setSelectedContractId((prev) => (prev === id ? null : id));
    setEditId(null);
    setForm({ reportMonth: "", description: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractId) return;
    setLoading(true);
    try {
      const payload = {
        contractId: selectedContractId,
        reportMonth: form.reportMonth,
        description: form.description,
      };
      if (editId) {
        await progressReportApi.update(editId, payload);
      } else {
        await progressReportApi.create(payload);
      }
      setEditId(null);
      setForm({ reportMonth: "", description: "" });
      loadData();
    } catch { alert("Failed to save report"); }
    finally { setLoading(false); }
  };

  const handleEdit = (r: ProgressReport) => {
    setSelectedContractId(r.contractId);
    setForm({ reportMonth: r.reportMonth || "", description: r.description || "" });
    setEditId(r.id);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this report?")) {
      try { await progressReportApi.delete(id); loadData(); }
      catch { alert("Failed to delete report"); }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("progressReports")}</h1>
            <p className="text-sm text-gray-500 font-medium italic">
              Select a contract below to submit or edit a progress report.
            </p>
          </div>
        </div>

        {/* Contracts Picker Table */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Education Contracts
            </h2>
          </div>
          <GroupedTable
            rows={contracts}
            groupBy={(c: any) => c.program || c.award || "General"}
            subGroupBy={(c: any) => c.employeeDepartment || "—"}
            rowKey={(c: any) => c.id}
            columns={[
              {
                header: "ID",
                render: (c: any) => <span className="font-bold text-blue-600">CTR-{c.id.toString().slice(-6)}</span>,
              },
              {
                header: t("fullName"),
                render: (c: any) => <span className="font-bold text-gray-900">{c.employeeName || "—"}</span>,
              },
              {
                header: t("contractSignedDate"),
                render: (c: any) => <span className="text-gray-500">{c.contractSignedDate ? new Date(c.contractSignedDate).toLocaleDateString() : "—"}</span>,
              },
            ]}
            renderActions={(c: any) => {
              const isSelected = selectedContractId === c.id;
              return (
                <button
                  onClick={() => handleSelectContract(c.id)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all shadow-sm ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-blue-200"
                      : "bg-gray-50 text-gray-700 border border-gray-100 hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  {isSelected ? "Selected" : "Select"}
                </button>
              );
            }}
            emptyMessage={t("noData")}
          />
        </div>

        {/* Selection Banner */}
        {selectedContract && (
          <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3">
            <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
            <p className="text-sm font-bold text-blue-800">
              Selected contract: <span className="text-blue-600">CTR-{selectedContract.id.toString().slice(-6)}</span> — {selectedContract.employeeName}
            </p>
          </div>
        )}

        {/* Report Form */}
        {selectedContract ? (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-gray-400">
              {editId ? "Edit Progress Report" : "Submit Progress Report"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="reportMonth" className={labelClass}>{t("reportMonth")}</label>
                <input
                  id="reportMonth"
                  type="date"
                  name="reportMonth"
                  autoComplete="off"
                  required
                  value={form.reportMonth}
                  onChange={(e) =>
                    setForm({ ...form, reportMonth: e.target.value })
                  }
                  className={fieldClass}
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="reportDescription" className={labelClass}>{t("description")}</label>
                <textarea
                  id="reportDescription"
                  name="description"
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className={fieldClass}
                />
              </div>
              <div className="flex gap-3 md:col-span-2">
                <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all">
                  {loading ? t("loading") : t("submit")}
                </button>
                <button type="button" onClick={() => { setEditId(null); setForm({ reportMonth: "", description: "" }); }} className="rounded-lg border border-gray-200 px-8 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
            Select a contract above to submit a progress report.
          </div>
        )}

        {/* Existing Reports Table */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Submitted Reports
            </h2>
          </div>
          <GroupedTable
            rows={reports}
            groupBy={(r) => {
              const c = contracts.find(c => c.id === r.contractId);
              return (c as any)?.program || (c as any)?.award || "General";
            }}
            subGroupBy={(r) => {
              const c = contracts.find(c => c.id === r.contractId);
              return (c as any)?.employeeDepartment || "—";
            }}
            rowKey={(r) => r.id}
            columns={[
              {
                header: "ID",
                render: (r) => <span className="font-bold text-blue-600">RPT-{r.id.toString().slice(-6)}</span>,
              },
              {
                header: t("fullName"),
                render: (r) => {
                  const c = contracts.find(c => c.id === r.contractId);
                  return <span className="font-bold text-gray-900">{(c as any)?.employeeName || `CTR-${r.contractId?.toString().slice(-6)}`}</span>;
                },
              },
              {
                header: t("reportMonth"),
                render: (r) => <span className="font-medium text-gray-700">{r.reportMonth}</span>,
              },
              {
                header: t("description"),
                render: (r) => <span className="text-gray-600 max-w-xs truncate block">{r.description}</span>,
              },
            ]}
            renderActions={(r) => (
              <div className="flex justify-end gap-2">
                <button onClick={() => handleEdit(r)} className="rounded-lg border border-gray-100 p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(r.id)} className="rounded-lg border border-gray-100 p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
            emptyMessage={t("noData")}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
