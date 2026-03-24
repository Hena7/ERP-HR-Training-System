"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { guarantorApi, contractApi } from "@/lib/api";
import { Guarantor, Contract } from "@/types";
import { Shield, Plus, Trash2, Edit, Eye, X } from "lucide-react";

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
    scannedDocument: "" as string | null,
  });
  const [viewDoc, setViewDoc] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

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
    setForm({ ...form, contractId });
    loadGuarantors(contractId);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, scannedDocument: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        contractId: Number(form.contractId),
        fullName: form.fullName,
        nationalId: form.nationalId,
        phone: form.phone,
        address: form.address,
        scannedDocument: form.scannedDocument,
      };
      
      if (editId) {
        await guarantorApi.update(editId, payload);
      } else {
        await guarantorApi.create(payload);
      }
      setShowForm(false);
      setEditId(null);
      setForm({ contractId: "", fullName: "", nationalId: "", phone: "", address: "", scannedDocument: null });
      loadGuarantors(selectedContract);
    } catch {
      alert("Failed to save guarantor");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (g: Guarantor) => {
    setForm({
      contractId: String(g.contractId),
      fullName: g.fullName || "",
      nationalId: g.nationalId || "",
      phone: g.phone || "",
      address: g.address || "",
      scannedDocument: g.scannedDocument || null,
    });
    setEditId(g.id);
    setShowForm(true);
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
          <button onClick={() => {
            setEditId(null);
            setForm({ contractId: "", fullName: "", nationalId: "", phone: "", address: "", scannedDocument: null });
            setShowForm(!showForm);
          }} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors">
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
            <h2 className="mb-4 text-lg font-semibold">{editId ? t("edit") || "Edit Guarantor" : t("addGuarantor")}</h2>
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
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("uploadDocument")}</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {form.scannedDocument && (
                   <p className="mt-1 text-xs text-green-600">Document uploaded</p>
                )}
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
                  <th className="px-4 py-3">{t("fullName")}</th>
                  <th className="px-4 py-3">{t("nationalId")}</th>
                  <th className="px-4 py-3">{t("phone")}</th>
                  <th className="px-4 py-3">{t("address")}</th>
                  <th className="px-4 py-3">{t("scannedDocument" as any) || "Doc"}</th>
                  <th className="px-4 py-3 text-right">{t("actions")}</th>
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
                        {g.scannedDocument ? (
                          <button
                            onClick={() => setViewDoc(g.scannedDocument!)}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            {t("viewDocument")}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">{t("noDocument")}</span>
                        )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(g)} className="p-1 text-gray-500 hover:text-blue-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(g.id)} className="p-1 text-gray-500 hover:text-red-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                   <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">{selectedContract ? t("noData") : t("contracts") + "..."}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">{t("viewDocument")}</h3>
              <button
                onClick={() => setViewDoc(null)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100 flex items-center justify-center">
              {viewDoc?.startsWith("data:application/pdf") ? (
                <embed src={viewDoc} className="w-full h-full" type="application/pdf" />
              ) : (
                <img src={viewDoc || ""} alt="Scanned Document" className="max-w-full max-h-full object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
