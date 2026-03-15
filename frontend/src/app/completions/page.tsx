"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { completionApi, contractApi } from "@/lib/api";
import { EducationCompletion, Contract } from "@/types";
import { GraduationCap, Plus, Edit, Trash2 } from "lucide-react";

export default function CompletionsPage() {
  const { t } = useLanguage();
  const [completions, setCompletions] = useState<EducationCompletion[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    contractId: "",
    completionDate: "",
    returnToWorkDate: "",
    researchPresentationDate: "",
  });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [compRes, conRes] = await Promise.all([
        completionApi.getAll(0, 20),
        contractApi.getAll(0, 50),
      ]);
      setCompletions(compRes.data.content || []);
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
        completionDate: form.completionDate,
        returnToWorkDate: form.returnToWorkDate || null,
        researchPresentationDate: form.researchPresentationDate || null,
      };

      if (editId) {
        await completionApi.update(editId, payload);
      } else {
        await completionApi.create(payload);
      }
      setShowForm(false);
      setEditId(null);
      setForm({ contractId: "", completionDate: "", returnToWorkDate: "", researchPresentationDate: "" });
      loadData();
    } catch {
      alert("Failed to save completion");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (c: EducationCompletion) => {
    setForm({
      contractId: String(c.contractId),
      completionDate: c.completionDate || "",
      returnToWorkDate: c.returnToWorkDate || "",
      researchPresentationDate: c.researchPresentationDate || "",
    });
    setEditId(c.id);
    setShowForm(true);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{t("completions")}</h1>
          </div>
          <button onClick={() => {
            setEditId(null);
            setForm({ contractId: "", completionDate: "", returnToWorkDate: "", researchPresentationDate: "" });
            setShowForm(!showForm);
          }} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            {t("newCompletion")}
          </button>
        </div>

        {showForm && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">{editId ? t("edit") || "Edit Completion" : t("newCompletion")}</h2>
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
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("completionDate")}</label>
                <input type="date" required value={form.completionDate} onChange={(e) => setForm({ ...form, completionDate: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("returnToWorkDate")}</label>
                <input type="date" value={form.returnToWorkDate} onChange={(e) => setForm({ ...form, returnToWorkDate: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("researchPresentationDate")}</label>
                <input type="date" value={form.researchPresentationDate} onChange={(e) => setForm({ ...form, researchPresentationDate: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="flex gap-2 md:col-span-2">
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
                  <th className="px-4 py-3">{t("completionDate")}</th>
                  <th className="px-4 py-3">{t("returnToWorkDate")}</th>
                  <th className="px-4 py-3">{t("researchPresentationDate")}</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {completions.length > 0 ? completions.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{c.id}</td>
                    <td className="px-4 py-3">#{c.contractId}</td>
                    <td className="px-4 py-3">{c.completionDate}</td>
                    <td className="px-4 py-3">{c.returnToWorkDate || "-"}</td>
                    <td className="px-4 py-3">{c.researchPresentationDate || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(c)} className="p-1 text-gray-500 hover:text-blue-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="p-1 text-gray-500 hover:text-red-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">{t("noData")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
