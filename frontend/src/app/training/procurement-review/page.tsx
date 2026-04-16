"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { trainingRequestApi, trainingContractApi } from "@/app/training/services/trainingApi";
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
} from "lucide-react";
import Link from "next/link";
import { calculateObligation } from "@/app/training/services/obligationCalculator";

const THRESHOLD = 200000;

export default function ProcurementReviewPage() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [note, setNote] = useState<Record<number, string>>({});
  const [showNoteModal, setShowNoteModal] = useState<TrainingRequest | null>(null);

  const load = () => {
    setLoading(true);
    trainingRequestApi.getAll().then(({ data }) => {
      setRequests(data.filter((r: TrainingRequest) => r.status === "SUBMITTED"));
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleApprove = async (req: TrainingRequest) => {
    setBusyId(req.id);
    if (req.estimatedCost >= THRESHOLD) {
      await trainingRequestApi.updateStatus(req.id, "CONTRACT_REQUIRED", note[req.id]);
    } else {
      await trainingRequestApi.updateStatus(req.id, "APPROVED_DIRECT", note[req.id]);
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
            Cost &lt; 200,000 Birr → Approve Directly &nbsp;|&nbsp; Cost ≥ 200,000 Birr
            → Require Contract &amp; Service Obligation
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Obligation: 200k–400k = 6–12 mo • 400k–800k = 1–2 yr • 800k–1.2M = 2–3 yr • 1.2M–1.6M = 3–4 yr • 1.6M–2M = 4–5 yr • 2M–2.6M = 5–6 yr • &gt;2.6M = 7–10 yr
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <tr>
                {["REQ-ID", t("department"), t("trainingTitle"), t("estimatedCost"), "Service Obligation", t("numTrainees"), t("actions")].map((h) => (
                  <th key={h} className="px-6 py-4 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-gray-400">{t("loading")}</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <CheckCircle2 className="h-10 w-10 text-gray-300 mb-3" />
                      <p className="text-sm font-bold text-gray-700">No pending requests</p>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-blue-600">
                      TRQ-{req.id.toString().slice(-6)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{req.department}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 max-w-[180px] truncate">
                      {req.trainingTitle}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-sm font-bold ${req.estimatedCost >= THRESHOLD ? "text-red-600" : "text-emerald-600"}`}>
                        <DollarSign className="h-3.5 w-3.5" />
                        {req.estimatedCost.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {req.estimatedCost >= THRESHOLD ? (() => {
                        const obl = calculateObligation(req.estimatedCost);
                        return (
                          <span className="inline-flex flex-col">
                            <span className="text-xs font-bold text-amber-700">{obl.label}</span>
                            <span className="text-[10px] text-gray-400">{obl.months} months total</span>
                          </span>
                        );
                      })() : (
                        <span className="text-[10px] text-emerald-600 font-bold">No obligation</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{req.numTrainees}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowNoteModal(req)}
                          disabled={busyId === req.id}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${req.estimatedCost >= THRESHOLD ? "bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white"}`}
                        >
                          {req.estimatedCost >= THRESHOLD ? (
                            <><FileSignature className="h-3.5 w-3.5" /> {t("requireContract")}</>
                          ) : (
                            <><CheckCircle2 className="h-3.5 w-3.5" /> {t("approveDirectly")}</>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          disabled={busyId === req.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                          <X className="h-3.5 w-3.5" /> {t("reject")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Note Modal */}
        {showNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl border border-gray-100 p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Add Review Note</h3>
              <textarea
                rows={3}
                value={note[showNoteModal.id] || ""}
                onChange={(e) => setNote({ ...note, [showNoteModal.id]: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                placeholder="Leave a review note..."
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(showNoteModal)}
                  disabled={busyId === showNoteModal.id}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-all"
                >
                  {busyId === showNoteModal.id ? t("loading") : "Confirm Approval"}
                </button>
                <button
                  onClick={() => setShowNoteModal(null)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
