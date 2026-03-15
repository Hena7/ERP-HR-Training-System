"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { educationRequestApi, educationOpportunityApi } from "@/lib/api";
import { EducationRequest, EducationOpportunity } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { Plus, FileText, Edit, Trash2 } from "lucide-react";

export default function EducationRequestsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [requests, setRequests] = useState<EducationRequest[]>([]);
  const [opportunities, setOpportunities] = useState<EducationOpportunity[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    opportunityId: "",
    country: "",
    studyMode: "ON_JOB",
    description: "",
  });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    loadRequests();
    loadOpportunities();
  }, []);

  const loadRequests = async () => {
    try {
      const res = await educationRequestApi.getAll(0, 20);
      setRequests(res.data.content || []);
    } catch {
      // API not available
    }
  };

  const loadOpportunities = async () => {
    try {
      const res = await educationOpportunityApi.getAll(0, 50);
      setOpportunities(res.data.content || []);
    } catch {
      // Handle error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedOpp = opportunities.find(o => o.id === Number(form.opportunityId));
      if (!selectedOpp) throw new Error("Please select an opportunity");

      // We map the referenced data so it displays in the frontend correctly without additional joins in mock DB.
      const submitData = {
        ...form,
        opportunityId: Number(form.opportunityId),
        educationType: selectedOpp.educationType,
        educationLevel: selectedOpp.educationLevel,
        institution: selectedOpp.institution,
      };

      if (editId) {
        await educationRequestApi.update(editId, submitData);
      } else {
        await educationRequestApi.create({
          ...submitData,
          employeeId: Number(form.employeeId) || user?.employeeId,
        });
      }
      setShowForm(false);
      setEditId(null);
      setForm({ employeeId: "", opportunityId: "", country: "", studyMode: "ON_JOB", description: "" });
      loadRequests();
    } catch (err: any) {
      alert(err.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (req: EducationRequest) => {
    setForm({
      employeeId: String(req.employeeId),
      opportunityId: String(req.opportunityId),
      country: req.country || "",
      studyMode: req.studyMode || "ON_JOB",
      description: req.description || "",
    });
    setEditId(req.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this request?")) {
      try {
        await educationRequestApi.delete(id);
        loadRequests();
      } catch {
        alert("Failed to delete request");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{t("educationRequests")}</h1>
          </div>
          {(user?.role === "EMPLOYEE" || user?.role === "ADMIN") && (
            <button
              onClick={() => {
                setEditId(null);
                setForm({ employeeId: "", opportunityId: "", country: "", studyMode: "ON_JOB", description: "" });
                setShowForm(!showForm);
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t("newRequest")}
            </button>
          )}
        </div>

        {showForm && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">{editId ? t("edit") || "Edit" : t("submitRequest")}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("educationOpportunity")}</label>
                <select 
                  value={form.opportunityId} 
                  onChange={(e) => setForm({ ...form, opportunityId: e.target.value })} 
                  required 
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 flex items-center bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Select Opportunity --</option>
                  {opportunities.map(opp => (
                    <option key={opp.id} value={opp.id}>
                      {opp.educationType} ({opp.educationLevel}) - {opp.institution} [{opp.department}]
                    </option>
                  ))}
                </select>
              </div>

              {user?.role === "ADMIN" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{t("employeeId")}</label>
                  <input type="number" required={!editId && user?.role === "ADMIN"} value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
                </div>
              )}
              
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("country")}</label>
                <input type="text" required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("studyMode")}</label>
                <select value={form.studyMode} onChange={(e) => setForm({ ...form, studyMode: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
                  <option value="ON_JOB">{t("onJob")}</option>
                  <option value="OFF_JOB">{t("offJob")}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("description")}</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              
              <div className="flex gap-2 md:col-span-2">
                <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {loading ? t("loading") : t("submit")}
                </button>
                <button type="button" onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }} className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
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
                  <th className="px-4 py-3">{t("educationType")}</th>
                  <th className="px-4 py-3">{t("educationLevel")}</th>
                  <th className="px-4 py-3">{t("institution")}</th>
                  <th className="px-4 py-3">{t("studyMode")}</th>
                  <th className="px-4 py-3">{t("status")}</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{req.id}</td>
                      <td className="px-4 py-3 font-medium">{req.employeeName}</td>
                      <td className="px-4 py-3">{req.educationType}</td>
                      <td className="px-4 py-3">{req.educationLevel}</td>
                      <td className="px-4 py-3">{req.institution}</td>
                      <td className="px-4 py-3">{req.studyMode === "ON_JOB" ? t("onJob") : t("offJob")}</td>
                      <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(req)} className="p-1 text-gray-500 hover:text-blue-600 transition-colors" title={t("edit") || "Edit"}>
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(req.id)} className="p-1 text-gray-500 hover:text-red-600 transition-colors" title={t("delete") || "Delete"}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">{t("noData")}</td>
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
