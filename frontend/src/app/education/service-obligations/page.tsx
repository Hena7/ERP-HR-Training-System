"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { serviceObligationApi, contractApi } from "@/lib/api";
import { ServiceObligation, Contract } from "@/types";
import { Clock, Edit, Trash2, FileText, CheckCircle2 } from "lucide-react";

const fieldClass =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5";

export default function ServiceObligationsPage() {
  const { t } = useLanguage();
  const [obligations, setObligations] = useState<ServiceObligation[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    studyYears: "",
    requiredServiceYears: "",
    serviceStartDate: "",
    serviceEndDate: "",
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [oblRes, conRes] = await Promise.all([
        serviceObligationApi.getAll(0, 20),
        contractApi.getAll(0, 50),
      ]);
      setObligations(oblRes.data.content || []);
      setContracts(conRes.data.content || []);
    } catch { /* API not available */ }
  };

  const selectedContract = contracts.find((c) => c.id === selectedContractId) || null;

  const handleSelectContract = (id: number) => {
    setSelectedContractId((prev) => (prev === id ? null : id));
    setEditId(null);
    setForm({
      studyYears: "",
      requiredServiceYears: "",
      serviceStartDate: "",
      serviceEndDate: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractId) return;
    setLoading(true);
    try {
      const payload = {
        contractId: selectedContractId,
        studyYears: Number(form.studyYears),
        requiredServiceYears: Number(form.requiredServiceYears),
        serviceStartDate: form.serviceStartDate || null,
        serviceEndDate: form.serviceEndDate || null,
      };

      if (editId) {
        await serviceObligationApi.update(editId, payload);
      } else {
        await serviceObligationApi.create(payload);
      }
      setEditId(null);
      setForm({ studyYears: "", requiredServiceYears: "", serviceStartDate: "", serviceEndDate: "" });
      loadData();
    } catch {
      alert("Failed to save obligation");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (o: ServiceObligation) => {
    setSelectedContractId(o.contractId);
    setForm({
      studyYears: String(o.studyYears || ""),
      requiredServiceYears: String(o.requiredServiceYears || ""),
      serviceStartDate: o.serviceStartDate || "",
      serviceEndDate: o.serviceEndDate || "",
    });
    setEditId(o.id);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this service obligation?")) {
      try {
        await serviceObligationApi.delete(id);
        loadData();
      } catch {
        alert("Failed to delete obligation");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("serviceObligations")}</h1>
            <p className="text-sm text-gray-500 font-medium italic">
              Select a contract below to define or update service obligations.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800 font-medium">{t("obligationRule")}</p>
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

        {/* Obligation Form */}
        {selectedContract ? (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-gray-400">
              {editId ? "Edit Service Obligation" : "Add Service Obligation"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>{t("studyYears")}</label>
                <input type="number" required value={form.studyYears} onChange={(e) => setForm({ ...form, studyYears: e.target.value })} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>{t("requiredServiceYears")}</label>
                <input type="number" required value={form.requiredServiceYears} onChange={(e) => setForm({ ...form, requiredServiceYears: e.target.value })} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>{t("serviceStartDate")}</label>
                <input type="date" value={form.serviceStartDate} onChange={(e) => setForm({ ...form, serviceStartDate: e.target.value })} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>{t("serviceEndDate")}</label>
                <input type="date" value={form.serviceEndDate} onChange={(e) => setForm({ ...form, serviceEndDate: e.target.value })} className={fieldClass} />
              </div>

              <div className="flex gap-3 md:col-span-2 mt-2">
                <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all">
                  {loading ? t("loading") : t("submit")}
                </button>
                <button type="button" onClick={() => { setEditId(null); setSelectedContractId(null); setForm({ studyYears: "", requiredServiceYears: "", serviceStartDate: "", serviceEndDate: "" }); }} className="rounded-lg border border-gray-200 px-8 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
            Select a contract above to manage service obligations.
          </div>
        )}

        {/* Existing Obligations Table */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Service Obligation Records
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">{t("contracts")} ID</th>
                  <th className="px-6 py-4">{t("studyYears")}</th>
                  <th className="px-6 py-4">{t("requiredServiceYears")}</th>
                  <th className="px-6 py-4">{t("serviceStartDate")}</th>
                  <th className="px-6 py-4">{t("serviceEndDate")}</th>
                  <th className="px-6 py-4 text-right">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {obligations.length > 0 ? obligations.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-blue-600">OBL-{o.id.toString().slice(-6)}</td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">CTR-{o.contractId?.toString().slice(-6)}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{o.studyYears}</td>
                    <td className="px-6 py-4 font-bold text-blue-700">{o.requiredServiceYears}</td>
                    <td className="px-6 py-4 font-medium text-gray-500">{o.serviceStartDate || "—"}</td>
                    <td className="px-6 py-4 font-medium text-gray-500">{o.serviceEndDate || "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(o)} className="rounded-lg border border-gray-100 p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(o.id)} className="rounded-lg border border-gray-100 p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">{t("noData")}</td>
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
