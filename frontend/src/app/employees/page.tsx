"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { employeeApi } from "@/lib/api";
import { Employee } from "@/types";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  UserPlus,
  Building2,
  Mail,
  Phone,
  Users,
} from "lucide-react";

export default function EmployeesPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [form, setForm] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    gender: "MALE",
    email: "",
    phone: "",
    department: "",
    position: "",
    role: "EMPLOYEE" as any,
    password: "Password123",
  });

  const isAdmin = user?.role === "ADMIN";
  const isDH = user?.role === "DEPARTMENT_HEAD";
  const userDept = (user as any)?.department;

  useEffect(() => {
    loadEmployees();
  }, [userDept, user?.role]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      let res;
      if (isDH && userDept) {
        res = await employeeApi.getByDepartment(userDept);
        setEmployees(res.data || []);
      } else {
        res = await employeeApi.getAll();
        setEmployees(res.data.content || []);
      }
    } catch (error) {
      console.error("Failed to load employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const searchStr = `${emp.firstName} ${emp.lastName} ${emp.employeeId} ${emp.department}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [employees, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await employeeApi.update(editId, form);
      } else {
        await employeeApi.create(form);
      }
      setShowForm(false);
      setEditId(null);
      resetForm();
      loadEmployees();
    } catch (error) {
      console.error("Failed to save employee:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (emp: Employee) => {
    setEditId(emp.id);
    setForm({
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      gender: emp.gender,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      position: emp.position,
      role: emp.role as any,
      password: "", 
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    setBusyId(id);
    try {
      await employeeApi.delete(id);
      loadEmployees();
    } catch (error) {
      console.error("Failed to delete employee:", error);
    } finally {
      setBusyId(null);
    }
  };

  const resetForm = () => {
    setForm({
      employeeId: "",
      firstName: "",
      lastName: "",
      gender: "MALE",
      email: "",
      phone: "",
      department: isDH ? userDept : "",
      position: "",
      role: "EMPLOYEE",
      password: "Password123",
    });
  };

  const canManage = isAdmin; // Only admin can add/edit/delete for now

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
             <Users className="h-6 w-6 text-blue-600" />
             <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t("employeeList")}
                </h1>
                <p className="text-sm text-gray-500">
                  {isDH ? `Viewing employees in ${userDept}` : "Manage organization staff directory."}
                </p>
             </div>
          </div>
          {canManage && (
            <button
              onClick={() => {
                resetForm();
                setEditId(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 shadow-sm"
            >
              <UserPlus className="h-4 w-4" />
              {t("addEmployee")}
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`${t("search")}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider">Org Context</th>
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider">Role</th>
                  {canManage && <th className="px-6 py-3 text-center font-semibold uppercase tracking-wider">{t("actions")}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && employees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 text-xs">
                            {emp.firstName?.[0]}{emp.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{emp.firstName} {emp.lastName}</div>
                            <div className="text-xs text-gray-500 font-mono">#{emp.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            {emp.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {emp.phone || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-gray-900 font-medium">
                            <Building2 className="h-3.5 w-3.5 text-gray-400" />
                            {emp.department}
                          </div>
                          <div className="text-xs text-gray-500 ml-5">{emp.position || 'Staff'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 border border-blue-100">
                          {(emp.role || 'EMPLOYEE').replace('_', ' ')}
                        </span>
                      </td>
                      {canManage && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEdit(emp)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(emp.id)}
                              disabled={busyId === emp.id}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-30"
                            >
                               {busyId === emp.id ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                               ) : (
                                  <Trash2 className="h-4 w-4" />
                               )}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-2xl border border-gray-200">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                   {editId ? t("editEmployee") : t("addEmployee")}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t("employeeId")}</label>
                  <input
                    required
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="EMP001"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t("email")}</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="email@insa.gov.et"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t("firstName")}</label>
                  <input
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t("lastName")}</label>
                  <input
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t("gender")}</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="MALE">{t("male")}</option>
                    <option value="FEMALE">{t("female")}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t("phone")}</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t("department")}</label>
                  <input
                    required
                    disabled={isDH}
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Software engineering"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t("position")}</label>
                  <input
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t("role")}</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="EMPLOYEE">{t("EMPLOYEE")}</option>
                    <option value="DEPARTMENT_HEAD">{t("DEPARTMENT_HEAD")}</option>
                    <option value="HR_OFFICER">{t("HR_OFFICER")}</option>
                    <option value="CYBER_DEVELOPMENT_CENTER">{t("CYBER_DEVELOPMENT_CENTER")}</option>
                    <option value="COMMITTEE_MEMBER">{t("COMMITTEE_MEMBER")}</option>
                    <option value="DIRECTOR">{t("DIRECTOR")}</option>
                    <option value="ADMIN">{t("ADMIN")}</option>
                  </select>
                </div>

                {!editId && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t("password")}</label>
                    <input
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}

                <div className="md:col-span-2 mt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "..." : editId ? t("save") : t("submit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
