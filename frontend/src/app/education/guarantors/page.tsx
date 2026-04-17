"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { guarantorApi, witnessApi, contractApi, userApi } from "@/lib/api";
import { Guarantor, Witness, Contract } from "@/types";
import { Shield, Plus, Trash2, Edit, Eye, X, Users } from "lucide-react";

export default function GuarantorsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"guarantors" | "witnesses">("guarantors");
  const [guarantors, setGuarantors] = useState<Guarantor[]>([]);
  const [witnesses, setWitnesses] = useState<Witness[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState("");
  const [form, setForm] = useState({
    contractId: "",
    fullName: "",
    nationalId: "",
    phone: "",
    address: "",
    guarantorType: "INTERNAL",
    scannedDocument: "" as string | null,
  });
  const [viewDoc, setViewDoc] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const [contractsRes, usersRes] = await Promise.all([
        contractApi.getAll(0, 50),
        userApi.getAll()
      ]);
      setContracts(contractsRes.data.content || []);
      setUsers(usersRes.data || []);
    } catch {
      // API not available
    }
  };

  const loadItems = async (contractId: string) => {
    if (!contractId) return;
    try {
      const gRes = await guarantorApi.getByContract(Number(contractId));
      setGuarantors(gRes.data || []);
      const wRes = await witnessApi.getByContract(Number(contractId));
      setWitnesses(wRes.data || []);
    } catch {
      setGuarantors([]);
      setWitnesses([]);
    }
  };

  const handleContractChange = (contractId: string) => {
    setSelectedContract(contractId);
    setForm({ ...form, contractId });
    loadItems(contractId);
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
        guarantorType: activeTab === "guarantors" ? form.guarantorType : undefined,
        scannedDocument: form.scannedDocument,
      };

      if (editId) {
        if (activeTab === "guarantors") {
          await guarantorApi.update(editId, payload);
        } else {
          await witnessApi.update(editId, payload);
        }
      } else {
        if (activeTab === "guarantors") {
          await guarantorApi.create(payload);
        } else {
          await witnessApi.create(payload);
        }
      }
      setShowForm(false);
      setEditId(null);
      setForm({
        contractId: selectedContract,
        fullName: "",
        nationalId: "",
        phone: "",
        address: "",
        guarantorType: "INTERNAL",
        scannedDocument: null,
      });
      loadItems(selectedContract);
    } catch {
      alert("Failed to save data");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (g: any) => {
    setForm({
      contractId: String(g.contractId),
      fullName: g.fullName || "",
      nationalId: g.nationalId || "",
      phone: g.phone || "",
      address: g.address || "",
      guarantorType: g.guarantorType || "INTERNAL",
      scannedDocument: g.scannedDocument || null,
    });
    setEditId(g.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      if (activeTab === "guarantors") {
        await guarantorApi.delete(id);
      } else {
        await witnessApi.delete(id);
      }
      loadItems(selectedContract);
    } catch {
      alert("Failed to delete item");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {t("guarantors")} & {t("witnesses")}
            </h1>
          </div>
          <div className="flex gap-2">
            {!showForm && selectedContract && (
              <button
                onClick={() => {
                  const currentCount = activeTab === "guarantors" ? guarantors.length : witnesses.length;
                  const max = 2;
                  if (currentCount >= max) {
                    alert(activeTab === "guarantors" ? t("maxGuarantors") : t("maxWitnesses"));
                    return;
                  }
                  setEditId(null);
                  setForm({
                    contractId: selectedContract,
                    fullName: "",
                    nationalId: "",
                    phone: "",
                    address: "",
                    guarantorType: "INTERNAL",
                    scannedDocument: null,
                  });
                  setShowForm(true);
                }}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                {activeTab === "guarantors" ? t("addGuarantor") : t("addWitness")}
              </button>
            )}
          </div>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => { setActiveTab("guarantors"); setShowForm(false); }}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "guarantors"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Shield className="mr-2 inline-block h-4 w-4" />
            {t("guarantors")} ({guarantors.length}/2)
          </button>
          <button
            onClick={() => { setActiveTab("witnesses"); setShowForm(false); }}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "witnesses"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="mr-2 inline-block h-4 w-4" />
            {t("witnesses")} ({witnesses.length}/2)
          </button>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden mb-6">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Active Contracts (Select to Manage)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">{t("fullName")}</th>
                  <th className="px-6 py-4">{t("university")}</th>
                  <th className="px-6 py-4">{t("program")}</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {contracts.length > 0 ? (
                  contracts.map((c) => {
                    const isSelected = selectedContract === String(c.id);
                    return (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-blue-600">CON-{c.id}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {c.employeeName || users.find(u => String(u.id) === String(c.employeeId))?.fullName || `EMP-${c.employeeId}`}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700">{c.university || "-"}</td>
                        <td className="px-6 py-4 font-medium text-gray-500">{c.program}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleContractChange(String(c.id))}
                            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all shadow-sm ${
                              isSelected
                                ? "bg-blue-600 text-white shadow-blue-200"
                                : "bg-gray-50 text-gray-700 border border-gray-100 hover:bg-blue-600 hover:text-white"
                            }`}
                          >
                            {isSelected ? "Selected" : "Manage"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      {t("noData")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showForm && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-blue-900">
              {editId 
                ? (activeTab === "guarantors" ? t("edit") : t("edit")) 
                : (activeTab === "guarantors" ? t("addGuarantor") : t("addWitness"))
              }
            </h2>
            <p className="mb-3 text-sm text-blue-600">
              {activeTab === "guarantors" ? t("maxGuarantors") : t("maxWitnesses")}
            </p>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("contracts")}
                </label>
                <div className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-bold text-gray-900">
                  {contracts.find((c) => String(c.id) === form.contractId)?.employeeName || users.find(u => String(u.id) === String(contracts.find((c) => String(c.id) === form.contractId)?.employeeId))?.fullName || `CON-${form.contractId}`}
                </div>
              </div>
              <div>
                <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">
                  {t("fullName")}
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  required
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="nationalId" className="mb-1 block text-sm font-medium text-gray-700">
                  {t("nationalId")}
                </label>
                <input
                  id="nationalId"
                  type="text"
                  name="nationalId"
                  autoComplete="off"
                  required
                  value={form.nationalId}
                  onChange={(e) =>
                    setForm({ ...form, nationalId: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                  {t("phone")}
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              {activeTab === "guarantors" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Affiliation
                  </label>
                  <select
                    value={form.guarantorType}
                    onChange={(e) => setForm({ ...form, guarantorType: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="INTERNAL">Inside INSA</option>
                    <option value="EXTERNAL">Outside Company</option>
                  </select>
                </div>
              )}
              <div className="md:col-span-2">
                <label htmlFor="address" className="mb-1 block text-sm font-medium text-gray-700">
                  {t("address")}
                </label>
                <textarea
                  id="address"
                  name="address"
                  autoComplete="street-address"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("uploadDocument")}
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {form.scannedDocument && (
                  <p className="mt-1 text-xs text-green-600">
                    Document uploaded
                  </p>
                )}
              </div>
              <div className="flex gap-2 md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? t("loading") : t("submit")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                  }}
                  className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t("cancel")}
                </button>
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
                  {activeTab === "guarantors" && <th className="px-4 py-3">Affiliation</th>}
                  <th className="px-4 py-3">{t("nationalId")}</th>
                  <th className="px-4 py-3">{t("phone")}</th>
                  <th className="px-4 py-3">{t("address")}</th>
                  <th className="px-4 py-3">
                    {t("scannedDocument" as any) || "Doc"}
                  </th>
                  <th className="px-4 py-3 text-right">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(activeTab === "guarantors" ? guarantors : witnesses).length > 0 ? (
                  (activeTab === "guarantors" ? guarantors : witnesses).map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{item.id}</td>
                      <td className="px-4 py-3 font-medium">{item.fullName}</td>
                      {activeTab === "guarantors" && (
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${item.guarantorType === 'EXTERNAL' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                            {item.guarantorType === 'EXTERNAL' ? 'External' : 'Inside INSA'}
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-3">{item.nationalId}</td>
                      <td className="px-4 py-3">{item.phone}</td>
                      <td className="px-4 py-3">{item.address}</td>
                      <td className="px-4 py-3">
                        {item.scannedDocument ? (
                          <button
                            onClick={() => setViewDoc(item.scannedDocument!)}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            {t("viewDocument")}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            {t("noDocument")}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={activeTab === "guarantors" ? 8 : 7}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      {selectedContract ? t("noData") : t("contracts") + "..."}
                    </td>
                  </tr>
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
                <embed
                  src={viewDoc}
                  className="w-full h-full"
                  type="application/pdf"
                />
              ) : (
                <img
                  src={viewDoc || ""}
                  alt="Scanned Document"
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
