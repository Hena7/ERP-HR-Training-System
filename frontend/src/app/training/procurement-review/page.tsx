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

const THRESHOLD = 50000;

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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
            <ClipboardCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              {t("procurementReview")}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Requests pending procurement decision
            </p>
          </div>
        </div>

        {/* Cost Rule Banner */}
        <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-amber-700">
            Cost &lt; 50,000 Birr → Approve Directly &nbsp;|&nbsp; Cost ≥ 50,000 Birr
            → Require Contract
          </p>
        </div>

        <div className="rounded-2xl border-2 border-gray-100 bg-white shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {["REQ-ID", t("department"), t("trainingTitle"), t("estimatedCost"), t("numTrainees"), t("actions")].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">
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
                    <td className="px-6 py-4 text-xs font-black text-indigo-700">
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
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-600 hover:text-white transition-all"
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
            <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border-2 border-gray-100 p-6 space-y-4">
              <h3 className="text-sm font-black text-gray-900">Add Review Note (Optional)</h3>
              <textarea
                rows={3}
                value={note[showNoteModal.id] || ""}
                onChange={(e) => setNote({ ...note, [showNoteModal.id]: e.target.value })}
                className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium focus:border-indigo-500 focus:outline-none resize-none"
                placeholder="Leave a review note..."
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(showNoteModal)}
                  disabled={busyId === showNoteModal.id}
                  className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-sm font-black text-white hover:opacity-90 transition-all"
                >
                  {busyId === showNoteModal.id ? t("loading") : "Confirm"}
                </button>
                <button
                  onClick={() => setShowNoteModal(null)}
                  className="rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
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
