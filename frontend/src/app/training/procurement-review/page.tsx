"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  trainingRequestApi,
  trainingContractApi,
} from "@/app/training/services/trainingApi";
import { TrainingRequest } from "@/types/training";
import {
  ClipboardCheck,
  CheckCircle2,
  FileSignature,
  AlertTriangle,
  DollarSign,
  Building2,
  Users,
  X,
  Eye,
  BookOpen,
  Calendar,
  MapPin,
  User,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { calculateObligation } from "@/app/training/services/obligationCalculator";
import GroupedTable from "@/components/GroupedTable";

const THRESHOLD = 200000;

export default function ProcurementReviewPage() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [note, setNote] = useState<Record<number, string>>({});
  const [showNoteModal, setShowNoteModal] = useState<TrainingRequest | null>(
    null,
  );
  const [selected, setSelected] = useState<TrainingRequest | null>(null);

  const load = () => {
    setLoading(true);
    trainingRequestApi.getAll().then(({ data }) => {
      const filtered = data.filter((r: TrainingRequest) => r.status === "SUBMITTED");
      setRequests(filtered);
      setLoading(false);
    });
  };

  const flattenedTrainees = useMemo(() => {
    const flat: { request: TrainingRequest; trainee: any }[] = [];
    requests.forEach(req => {
      if (req.trainees && req.trainees.length > 0) {
        req.trainees.forEach(t => {
          flat.push({ request: req, trainee: t });
        });
      } else {
        // Fallback if no trainees are assigned yet (shouldn't happen with new logic but for safety)
        flat.push({ request: req, trainee: { fullName: "Not assigned", employeeId: "N/A" } });
      }
    });
    return flat;
  }, [requests]);

  useEffect(load, []);

  const handleApprove = async (req: TrainingRequest) => {
    setBusyId(req.id);
    const individualCost = req.estimatedCost / (req.numTrainees || 1);
    if (individualCost >= THRESHOLD) {
      await trainingRequestApi.updateStatus(
        req.id,
        "CONTRACT_REQUIRED",
        note[req.id],
      );
    } else {
      await trainingRequestApi.updateStatus(
        req.id,
        "APPROVED_DIRECT",
        note[req.id],
      );
    }
    setBusyId(null);
    setShowNoteModal(null);
    load();
  };

  const handleReject = async (id: number) => {
    setBusyId(id);
    await trainingRequestApi.updateStatus(id, "REJECTED", note[id]);
    setBusyId(null);
    load();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
            <ClipboardCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("procurementReview")}
            </h1>
            <p className="text-sm text-gray-500 font-medium italic">
              Requests pending procurement decision
            </p>
          </div>
        </div>

        {/* Cost Rule Banner */}
        <div className="flex items-center gap-3 rounded-xl bg-blue-50/50 border border-blue-100 px-5 py-4">
          <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm font-bold text-blue-900">
            Individual Cost &lt; 200,000 Birr → Approve Directly &nbsp;|&nbsp; Individual Cost ≥
            200,000 Birr → Require Contract &amp; Service Obligation
          </p>
          <p className="text-[10px] text-blue-700 mt-1">
            (Individual Cost = Total Estimated Cost / Number of Trainees)
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-400">
              {t("loading")}
            </div>
          ) : (
            <GroupedTable
              rows={flattenedTrainees}
              groupBy={(r) => r.request.trainingTitle}
              subGroupBy={(r) => `TRQ-${r.request.id.toString().slice(-6)} — ${r.request.department}`}
              rowKey={(r) => `${r.request.id}-${r.trainee.employeeId || Math.random()}`}
              emptyMessage="No pending requests found"
              columns={[
                {
                  header: "Employee ID",
                  render: (r) => <span className="font-mono text-[10px] font-bold text-gray-900">{r.trainee.employeeId}</span>
                },
                {
                  header: "Participant Name",
                  render: (r) => <span className="font-bold text-gray-900">{r.trainee.fullName}</span>
                },
                {
                  header: "Cost (Individual)",
                  render: (r) => {
                    const individualCost = r.request.estimatedCost / (r.request.numTrainees || 1);
                    return (
                      <span className={`text-xs font-bold ${individualCost >= THRESHOLD ? "text-red-600" : "text-emerald-600"}`}>
                        {individualCost.toLocaleString()} Birr
                      </span>
                    );
                  }
                },
                {
                  header: "Obligation",
                  render: (r) => {
                    const individualCost = r.request.estimatedCost / (r.request.numTrainees || 1);
                    if (individualCost >= THRESHOLD) {
                      const obl = calculateObligation(individualCost);
                      return <span className="text-[10px] font-bold text-amber-700">{obl.label}</span>;
                    }
                    return <span className="text-[10px] text-emerald-600 font-bold italic">No obligation</span>;
                  }
                }
              ]}
              renderActions={(r) => (
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setSelected(r.request)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {t("view")}
                  </button>
                  <button
                    onClick={() => setShowNoteModal(r.request)}
                    disabled={busyId === r.request.id}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${(r.request.estimatedCost / (r.request.numTrainees || 1)) >= THRESHOLD ? "bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white"}`}
                  >
                    {(r.request.estimatedCost / (r.request.numTrainees || 1)) >= THRESHOLD ? (
                      <>
                        <FileSignature className="h-3 w-3" /> {t("requireContract")}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                        {t("approveDirectly")}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(r.request.id)}
                    disabled={busyId === r.request.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                  >
                    <X className="h-3.5 w-3.5" /> {t("reject")}
                  </button>
                </div>
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
            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
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
                  label: t("estimatedCost"),
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
            </div>
          </div>
        </div>
      )}

      {/* Decision Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50/30 px-6 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                Procurement Decision Note
              </h3>
              <button
                onClick={() => setShowNoteModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                <p className="text-xs font-bold text-blue-800 mb-1">
                  Target Request
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {showNoteModal.trainingTitle}
                </p>
                <p className="text-xs text-gray-500 italic">
                  Budget: {showNoteModal.estimatedCost.toLocaleString()} Birr
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                  Internal Review Note / Justification
                </label>
                <textarea
                  value={note[showNoteModal.id] || ""}
                  onChange={(e) =>
                    setNote({ ...note, [showNoteModal.id]: e.target.value })
                  }
                  placeholder="Enter remarks or justification for this decision..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all h-32 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleReject(showNoteModal.id)}
                  disabled={busyId === showNoteModal.id}
                  className="flex-1 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                >
                  Reject Request
                </button>
                <button
                  onClick={() => handleApprove(showNoteModal)}
                  disabled={busyId === showNoteModal.id}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {busyId === showNoteModal.id
                    ? t("loading")
                    : "Confirm Approve"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
