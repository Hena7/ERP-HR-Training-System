"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { guarantorApi, contractApi } from "@/lib/api";
import { Guarantor, Contract } from "@/types";
import { Shield, Plus, Trash2 } from "lucide-react";

export default function GuarantorsPage() {
  const { t } = useLanguage();
  const [guarantors, setGuarantors] = useState<Guarantor[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState("");
  const [form, setForm] = useState({
    contractId: "",
    fullName: "",
    nationalId: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const res = await contractApi.getAll(0, 50);
      setContracts(res.data.content || []);
    } catch {
      // API not available
    }
  };

  const loadGuarantors = async (contractId: string) => {
    if (!contractId) return;
    try {
      const res = await guarantorApi.getByContract(Number(contractId));
      setGuarantors(res.data || []);
    } catch {
      setGuarantors([]);
    }
  };

  const handleContractChange = (contractId: string) => {
    setSelectedContract(contractId);
    loadGuarantors(contractId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await guarantorApi.create({
        contractId: Number(form.contractId),
        fullName: form.fullName,
        nationalId: form.nationalId,
        phone: form.phone,
        address: form.address,
      });
      setShowForm(false);
      setForm({ contractId: "", fullName: "", nationalId: "", phone: "", address: "" });
      loadGuarantors(selectedContract);
    } catch {
      alert("Failed to add guarantor");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await guarantorApi.delete(id);
      loadGuarantors(selectedContract);
    } catch {
      alert("Failed to delete guarantor");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{t("guarantors")}</h1>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            {t("addGuarantor")}
          </button>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <label className="mb-1 block text-sm font-medium text-gray-700">{t("contracts")}</label>
          <select value={selectedContract} onChange={(e) => handleContractChange(e.target.value)} className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
            <option value="">-- {t("contracts")} --</option>
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>#{c.id} - {c.employeeName} - {c.university}</option>
            ))}
          </select>
        </div>

        {showForm && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">{t("addGuarantor")}</h2>
            <p className="mb-3 text-sm text-gray-500">{t("maxGuarantors")}</p>
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
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("fullName")}</label>
                <input type="text" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("nationalId")}</label>
                <input type="text" required value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("phone")}</label>
                <input type="text" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("address")}</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="flex gap-2 md:col-span-2">
                <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">{loading ? t("loading") : t("submit")}</button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 transition-colors">{t("cancel")}</button>
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
                  <th className="px-4 py-3">{t("fullName")}</th>
                  <th className="px-4 py-3">{t("nationalId")}</th>
                  <th className="px-4 py-3">{t("phone")}</th>
                  <th className="px-4 py-3">{t("address")}</th>
                  <th className="px-4 py-3">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {guarantors.length > 0 ? guarantors.map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{g.id}</td>
                    <td className="px-4 py-3 font-medium">{g.fullName}</td>
                    <td className="px-4 py-3">{g.nationalId}</td>
                    <td className="px-4 py-3">{g.phone}</td>
                    <td className="px-4 py-3">{g.address}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(g.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">{selectedContract ? t("noData") : t("contracts") + "..."}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
