"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, Plus, Search, Edit, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { EducationOpportunity } from "@/types";
import { educationOpportunityApi } from "@/lib/api";

export default function EducationOpportunitiesPage() {
  const { t } = useLanguage();
  const [opportunities, setOpportunities] = useState<EducationOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    educationType: "",
    educationLevel: "",
    institution: "",
    department: "",
    description: "",
  });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await educationOpportunityApi.getAll(0, 50);
      setOpportunities(response.data.content);
    } catch (error) {
      console.error("Failed to fetch opportunities", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await educationOpportunityApi.update(editId, formData);
      } else {
        await educationOpportunityApi.create(formData);
      }
      setFormData({
        educationType: "",
        educationLevel: "",
        institution: "",
        department: "",
        description: "",
      });
      setShowForm(false);
      setEditId(null);
      fetchOpportunities();
    } catch (error) {
      console.error("Failed to save opportunity", error);
    }
  };

  const handleEdit = (opp: EducationOpportunity) => {
    setEditId(opp.id);
    setFormData({
      educationType: opp.educationType,
      educationLevel: opp.educationLevel,
      institution: opp.institution,
      department: opp.department,
      description: opp.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this opportunity?")) {
      try {
        await educationOpportunityApi.delete(id);
        fetchOpportunities();
      } catch (error) {
        console.error("Failed to delete opportunity", error);
      }
    }
  };

  if (loading) return <DashboardLayout><div className="p-8 text-center">{t("loading")}</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("educationOpportunities")}</h1>
          <p className="mt-1 text-sm text-gray-500">Manage available education programs.</p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setFormData({
              educationType: "",
              educationLevel: "",
              institution: "",
              department: "",
              description: "",
            });
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          {t("newOpportunity")}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">{editId ? t("editOpportunity") : t("addOpportunity")}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t("educationType")}</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={formData.educationType}
                onChange={(e) => setFormData({ ...formData, educationType: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t("educationLevel")}</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={formData.educationLevel}
                onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t("institution")}</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t("department")}</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">{t("description")}</label>
              <textarea
                className="w-full rounded-lg border p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                {t("save")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
                className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t("search") + "..."}
              className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 font-medium">{t("educationType")}</th>
                <th className="p-4 font-medium">{t("educationLevel")}</th>
                <th className="p-4 font-medium">{t("institution")}</th>
                <th className="p-4 font-medium">{t("department")}</th>
                <th className="p-4 font-medium">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-600">
              {opportunities.map((opp) => (
                <tr key={opp.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-gray-900">{opp.educationType}</td>
                  <td className="p-4">{opp.educationLevel}</td>
                  <td className="p-4">{opp.institution}</td>
                  <td className="p-4">{opp.department}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(opp)}
                        className="rounded p-1 text-blue-600 hover:bg-blue-50"
                        title={t("edit")}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(opp.id)}
                        className="rounded p-1 text-red-600 hover:bg-red-50"
                        title={t("delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {opportunities.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    {t("noData")}
                  </td>
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
