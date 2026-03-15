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
    fullName: "",
    phone: "",
    department: "",
    opportunityId: "",
    currentEducationLevel: "",
    workExperience: "",
    performanceScore: "",
    description: "",
  });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    loadRequests();
    loadOpportunities();
    if (user && user.role === "EMPLOYEE") {
      setForm(prev => ({
        ...prev,
        employeeId: String(user.id || ""),
        fullName: user.fullName || "",
        phone: (user as any).phone || "",
        department: (user as any).department || "",
      }));
    }
  }, [user]);

  const loadRequests = async () => {
    try {
      const res = await educationRequestApi.getAll(0, 50);
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

      const submitData = {
        ...form,
        opportunityId: Number(form.opportunityId),
        employeeId: Number(form.employeeId) || user?.employeeId,
        employeeName: form.fullName, // explicitly pack these for mock API/backend compatibility
        employeePhone: form.phone,
        employeeDepartment: form.department,
        workExperience: Number(form.workExperience) || 0,
        performanceScore: Number(form.performanceScore) || 0,
        educationType: selectedOpp.educationType,
        educationLevel: selectedOpp.educationLevel,
        institution: selectedOpp.institution,
      };

      if (editId) {
        await educationRequestApi.update(editId, submitData);
      } else {
        await educationRequestApi.create(submitData);
      }
      setShowForm(false);
      setEditId(null);
      setForm({
        employeeId: (user?.role === "EMPLOYEE") ? String(user.id) : "",
        fullName: (user?.role === "EMPLOYEE") ? user.fullName : "",
        phone: (user?.role === "EMPLOYEE") ? (user as any).phone || "" : "",
        department: (user?.role === "EMPLOYEE") ? (user as any).department || "" : "",
        opportunityId: "",
        currentEducationLevel: "",
        workExperience: "",
        performanceScore: "",
        description: "",
      });
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
      fullName: req.employeeName || "",
      phone: req.employeePhone || "",
      department: req.employeeDepartment || "",
      opportunityId: String(req.opportunityId),
      currentEducationLevel: req.currentEducationLevel || "",
      workExperience: String(req.workExperience || ""),
      performanceScore: String(req.performanceScore || ""),
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
                setForm({
                  employeeId: (user?.role === "EMPLOYEE") ? String(user.id) : "",
                  fullName: (user?.role === "EMPLOYEE") ? user.fullName : "",
                  phone: (user?.role === "EMPLOYEE") ? (user as any).phone || "" : "",
                  department: (user?.role === "EMPLOYEE") ? (user as any).department || "" : "",
                  opportunityId: "",
                  currentEducationLevel: "",
                  workExperience: "",
                  performanceScore: "",
                  description: "",
                });
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
                  <input type="number" required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("fullName")}</label>
                <input type="text" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" readOnly={user?.role === "EMPLOYEE"} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("phone")}</label>
                <input type="text" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" readOnly={user?.role === "EMPLOYEE"} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("department")}</label>
                <input type="text" required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" readOnly={user?.role === "EMPLOYEE"} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("currentEducationLevel")}</label>
                <input type="text" required value={form.currentEducationLevel} onChange={(e) => setForm({ ...form, currentEducationLevel: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="e.g. BSc in Computer Science" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("workExperience")}</label>
                <input type="number" step="0.1" required value={form.workExperience} onChange={(e) => setForm({ ...form, workExperience: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("averagePerformanceScore")}</label>
                <input type="number" step="0.01" required value={form.performanceScore} onChange={(e) => setForm({ ...form, performanceScore: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">{t("description")}</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder={t("description") + "..."} />
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
              <thead className="border-b bg-gray-50 text-[10px] uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-3">ID</th>
                  <th className="px-3 py-3">{t("fullName")}</th>
                  <th className="px-3 py-3">{t("currentEducationLevel")}</th>
                  <th className="px-3 py-3">{t("workExperience")}</th>
                  <th className="px-3 py-3">{t("averagePerformanceScore")}</th>
                  <th className="px-3 py-3">{t("selectedEducationType")}</th>
                  <th className="px-3 py-3">{t("selectedEducationLevel")}</th>
                  <th className="px-3 py-3">{t("phone")}</th>
                  <th className="px-3 py-3">{t("department")}</th>
                  <th className="px-3 py-3">{t("description")}</th>
                  <th className="px-3 py-3 text-right">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 whitespace-nowrap">{req.id}</td>
                      <td className="px-3 py-3 font-medium whitespace-nowrap">{req.employeeName}</td>
                      <td className="px-3 py-3">{req.currentEducationLevel}</td>
                      <td className="px-3 py-3">{req.workExperience}</td>
                      <td className="px-3 py-3">{req.performanceScore}</td>
                      <td className="px-3 py-3">{req.educationType}</td>
                      <td className="px-3 py-3">{req.educationLevel}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{req.employeePhone}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{req.employeeDepartment}</td>
                      <td className="px-3 py-3 max-w-[150px] truncate" title={req.description}>{req.description}</td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleEdit(req)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title={t("edit") || "Edit"}>
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(req.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title={t("delete") || "Delete"}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500">{t("noData")}</td>
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
