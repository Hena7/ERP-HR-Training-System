"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { serviceObligationApi, contractApi } from "@/lib/api";
import { ServiceObligation, Contract } from "@/types";
import { Clock, Plus, Edit, Trash2 } from "lucide-react";

export default function ServiceObligationsPage() {
  const { t } = useLanguage();
  const [obligations, setObligations] = useState<ServiceObligation[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    contractId: "",
    studyYears: "",
    requiredServiceYears: "",
    serviceStartDate: "",
    serviceEndDate: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [oblRes, conRes] = await Promise.all([
        serviceObligationApi.getAll(0, 20),
        contractApi.getAll(0, 50),
      ]);
      setObligations(oblRes.data.content || []);
      setContracts(conRes.data.content || []);
    } catch {
      // API not available
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        contractId: Number(form.contractId),
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
      setShowForm(false);
      setEditId(null);
      setForm({ contractId: "", studyYears: "", requiredServiceYears: "", serviceStartDate: "", serviceEndDate: "" });
      loadData();
    } catch {
      alert("Failed to save obligation");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (o: ServiceObligation) => {
    setForm({
      contractId: String(o.contractId),
      studyYears: String(o.studyYears || ""),
      requiredServiceYears: String(o.requiredServiceYears || ""),
      serviceStartDate: o.serviceStartDate || "",
      serviceEndDate: o.serviceEndDate || "",
    });
    setEditId(o.id);
    setShowForm(true);
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{t("serviceObligations")}</h1>
          </div>
          <button onClick={() => {
            setEditId(null);
            setForm({ contractId: "", studyYears: "", requiredServiceYears: "", serviceStartDate: "", serviceEndDate: "" });
            setShowForm(!showForm);
          }} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            Add {t("serviceObligations")}
          </button>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800 font-medium">{t("obligationRule")}</p>
        </div>

        {showForm && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">{editId ? t("edit") || "Edit Obligation" : "Add " + t("serviceObligations")}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("contracts")}</label>
                <select required value={form.contractId} onChange={(e) => setForm({ ...form, contractId: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
                  <option value="">--</option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>#{c.id} - {c.employeeName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("studyYears")}</label>
                <input type="number" required value={form.studyYears} onChange={(e) => setForm({ ...form, studyYears: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("requiredServiceYears")}</label>
                <input type="number" required value={form.requiredServiceYears} onChange={(e) => setForm({ ...form, requiredServiceYears: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("serviceStartDate")}</label>
                <input type="date" value={form.serviceStartDate} onChange={(e) => setForm({ ...form, serviceStartDate: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("serviceEndDate")}</label>
                <input type="date" value={form.serviceEndDate} onChange={(e) => setForm({ ...form, serviceEndDate: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>

              <div className="flex gap-2 md:col-span-2 mt-2">
                <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">{loading ? t("loading") : t("submit")}</button>
                <button type="button" onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }} className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 transition-colors">{t("cancel")}</button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">{t("contracts")} ID</th>
                  <th className="px-4 py-3">{t("studyYears")}</th>
                  <th className="px-4 py-3">{t("requiredServiceYears")}</th>
                  <th className="px-4 py-3">{t("serviceStartDate")}</th>
                  <th className="px-4 py-3">{t("serviceEndDate")}</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {obligations.length > 0 ? obligations.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{o.id}</td>
                    <td className="px-4 py-3">#{o.contractId}</td>
                    <td className="px-4 py-3">{o.studyYears}</td>
                    <td className="px-4 py-3 font-semibold text-blue-600">{o.requiredServiceYears}</td>
                    <td className="px-4 py-3">{o.serviceStartDate || "-"}</td>
                    <td className="px-4 py-3">{o.serviceEndDate || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(o)} className="p-1 text-gray-500 hover:text-blue-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(o.id)} className="p-1 text-gray-500 hover:text-red-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">{t("noData")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
