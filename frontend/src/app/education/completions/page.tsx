"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { completionApi, contractApi } from "@/lib/api";
import { EducationCompletion, Contract } from "@/types";
import { GraduationCap, Edit, Trash2, FileText } from "lucide-react";

const fieldClass =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5";

export default function CompletionsPage() {
  const { t } = useLanguage();
  const [completions, setCompletions] = useState<EducationCompletion[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    completionDate: "",
    returnToWorkDate: "",
    researchPresentationDate: "",
  });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [compRes, conRes] = await Promise.all([
        completionApi.getAll(0, 20),
        contractApi.getAll(0, 50),
      ]);
      setCompletions(compRes.data.content || []);
      setContracts(conRes.data.content || []);
    } catch { /* API not available */ }
  };

  const selectedContract = contracts.find((c) => c.id === selectedContractId) || null;

  const handleSelectContract = (id: number) => {
    setSelectedContractId((prev) => (prev === id ? null : id));
    setEditId(null);
    setForm({ completionDate: "", returnToWorkDate: "", researchPresentationDate: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractId) return;
    setLoading(true);
    try {
      const payload = {
        contractId: selectedContractId,
        completionDate: form.completionDate,
        returnToWorkDate: form.returnToWorkDate || null,
        researchPresentationDate: form.researchPresentationDate || null,
      };

      if (editId) {
        await completionApi.update(editId, payload);
      } else {
        await completionApi.create(payload);
      }
      setEditId(null);
      setForm({ completionDate: "", returnToWorkDate: "", researchPresentationDate: "" });
      loadData();
    } catch {
      alert("Failed to save completion");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (c: EducationCompletion) => {
    setSelectedContractId(c.contractId);
    setForm({
      completionDate: c.completionDate || "",
      returnToWorkDate: c.returnToWorkDate || "",
      researchPresentationDate: c.researchPresentationDate || "",
    });
    setEditId(c.id);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this completion record?")) {
      try {
        await completionApi.delete(id);
        loadData();
      } catch {
        alert("Failed to delete completion");
      }
    }
  };

  const handleNotifyHr = async (id: number) => {
    try {
      await completionApi.update(id, { sentToHr: true });
      loadData();
    } catch {
      alert("Failed to notify HR");
    }
  };

  const handleNotifyKmc = async (id: number) => {
    try {
      await completionApi.update(id, { notifiedKmc: true });
      loadData();
    } catch {
      alert("Failed to notify KMC");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("completions")}</h1>
            <p className="text-sm text-gray-500 font-medium italic">
              Select a contract below to record an education completion.
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">{t("fullName")}</th>
                  <th className="px-6 py-4">{t("department")}</th>
                  <th className="px-6 py-4">{t("contractSignedDate")}</th>
                  <th className="px-6 py-4 text-right">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {contracts.length > 0 ? contracts.map((c) => {
                  const isSelected = selectedContractId === c.id;
                  return (
                    <tr key={c.id} className={`transition-colors ${isSelected ? "bg-blue-50/60" : "hover:bg-gray-50/50"}`}>
                      <td className="px-6 py-4 text-xs font-bold text-blue-600">CTR-{c.id.toString().slice(-6)}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">{c.employeeName}</td>
                      <td className="px-6 py-4 font-medium text-gray-600">{(c as any).employeeDepartment || "—"}</td>
                      <td className="px-6 py-4 font-medium text-gray-500 text-xs">{(c as any).signedDate || "—"}</td>
                      <td className="px-6 py-4 text-right">
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
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      {t("noData")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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

        {/* Completion Form */}
        {selectedContract ? (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-gray-400">
              {editId ? "Edit Completion Record" : "New Completion Record"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="completionDate" className={labelClass}>{t("completionDate")}</label>
                <input
                  id="completionDate"
                  type="date"
                  name="completionDate"
                  autoComplete="off"
                  required
                  value={form.completionDate}
                  onChange={(e) =>
                    setForm({ ...form, completionDate: e.target.value })
                  }
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="returnToWorkDate" className={labelClass}>{t("returnToWorkDate")}</label>
                <input
                  id="returnToWorkDate"
                  type="date"
                  name="returnToWorkDate"
                  autoComplete="off"
                  value={form.returnToWorkDate}
                  onChange={(e) =>
                    setForm({ ...form, returnToWorkDate: e.target.value })
                  }
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="researchPresentationDate" className={labelClass}>{t("researchPresentationDate")}</label>
                <input
                  id="researchPresentationDate"
                  type="date"
                  name="researchPresentationDate"
                  autoComplete="off"
                  value={form.researchPresentationDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      researchPresentationDate: e.target.value,
                    })
                  }
                  className={fieldClass}
                />
              </div>

              <div className="flex gap-3 md:col-span-2 pt-2">
                <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all">
                  {loading ? t("loading") : t("submit")}
                </button>
                <button type="button" onClick={() => { setEditId(null); setSelectedContractId(null); setForm({ completionDate: "", returnToWorkDate: "", researchPresentationDate: "" }); }} className="rounded-lg border border-gray-200 px-8 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
            Select a contract above to record education completion.
          </div>
        )}

        {/* Existing Completions Table */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Completion Records
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">{t("contracts")} ID</th>
                  <th className="px-6 py-4">{t("completionDate")}</th>
                  <th className="px-6 py-4">{t("returnToWorkDate")}</th>
                  <th className="px-6 py-4">{t("researchPresentationDate")}</th>
                  <th className="px-6 py-4 text-right">Notifications / {t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {completions.length > 0 ? completions.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-blue-600">CMP-{c.id.toString().slice(-6)}</td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">CTR-{c.contractId?.toString().slice(-6)}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{c.completionDate}</td>
                    <td className="px-6 py-4 font-medium text-gray-500">{c.returnToWorkDate || "—"}</td>
                    <td className="px-6 py-4 font-medium text-gray-500">{c.researchPresentationDate || "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {!(c as any).sentToHr ? (
                          <button
                            onClick={() => handleNotifyHr(c.id)}
                            className="rounded-md bg-green-50 border border-green-100 px-2 py-1 text-[10px] font-bold text-green-700 hover:bg-green-100 uppercase tracking-wide"
                          >
                            Send to HR
                          </button>
                        ) : (
                          <span className="text-[10px] text-green-600 font-bold uppercase mr-1">HR ✓</span>
                        )}
                        {!(c as any).notifiedKmc ? (
                          <button
                            onClick={() => handleNotifyKmc(c.id)}
                            className="rounded-md bg-purple-50 border border-purple-100 px-2 py-1 text-[10px] font-bold text-purple-700 hover:bg-purple-100 uppercase tracking-wide"
                          >
                            Notify KMC
                          </button>
                        ) : (
                          <span className="text-[10px] text-purple-600 font-bold uppercase">KMC ✓</span>
                        )}
                        <div className="w-px h-4 bg-gray-200 mx-1" />
                        <button onClick={() => handleEdit(c)} className="rounded-lg border border-gray-100 p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="rounded-lg border border-gray-100 p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">{t("noData")}</td>
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
