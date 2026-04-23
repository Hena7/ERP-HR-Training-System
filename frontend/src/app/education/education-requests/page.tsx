"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  educationRequestApi,
  employeeApi,
  educationOpportunityApi,
} from "@/lib/api";
import { EducationRequest, Employee, EducationOpportunity } from "@/types";
import {
  Plus,
  FileText,
  Edit,
  Trash2,
  Send,
  CheckCircle2,
  User,
  GraduationCap,
  Users,
  Search,
  Target,
  Calendar,
  Clock,
  UserPlus,
  Eye,
  X,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

interface Candidate {
  id: number | string; // string for manual entries
  name: string;
  candidateId: string;
  dept: string;
  award: string;
  institution: string;
  duration: number;
  program: string;
  location: string;
  phone?: string;
  isManual?: boolean;
}

export default function EducationRequestsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [requests, setRequests] = useState<EducationRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [opportunities, setOpportunities] = useState<EducationOpportunity[]>(
    [],
  );
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Bulk State
  const [batchEducation, setBatchEducation] = useState({
    opportunityId: "",
    educationCategory: "Technical",
    educationLevel: "BSc",
    fieldOfStudy: "",
    institution: "",
    budgetYear: new Date().getFullYear(),
    estimatedCost: 0,
    numCandidates: 1,
    remark: "",
  });

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<EducationRequest | null>(null);

  // Edit State for candidate modal
  const [currentCandidate, setCurrentCandidate] = useState<Partial<Candidate>>(
    {},
  );
  const [searchTerm, setSearchTerm] = useState("");

  const isDepartmentHead = user?.role === "DEPARTMENT_HEAD";
  const isCenter = user?.role === "CYBER_DEVELOPMENT_CENTER";
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    loadRequests();
    loadOpportunities();
    if (user?.department) {
      loadEmployees(user.department);
    }
  }, [user]);

  const loadRequests = async () => {
    try {
      const isRegularEmployee =
        user?.role === "EMPLOYEE" &&
        ![
          "DEPARTMENT_HEAD",
          "ADMIN",
          "HR_OFFICER",
          "CYBER_DEVELOPMENT_CENTER",
          "COMMITTEE_MEMBER",
        ].includes(user?.role);

      const res =
        isRegularEmployee && user?.employeeId
          ? await educationRequestApi.getMyRequests(user.employeeId, 0, 100)
          : await educationRequestApi.getAll(0, 100);

      setRequests(res.data.content || []);
    } catch (err) {
      console.error("Failed to load education requests", err);
    }
  };

  const loadOpportunities = async () => {
    try {
      const res = await educationOpportunityApi.getAll(0, 100);
      const allOpps = res.data.content || [];
      // Only show OPEN opportunities for request initiation
      setOpportunities(
        allOpps.filter((o: any) => {
          const isStatusOpen = o.status === "OPEN";
          const deadlinePassed =
            o.deadline &&
            new Date(o.deadline) < new Date(new Date().setHours(0, 0, 0, 0));
          return isStatusOpen && !deadlinePassed;
        }),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const loadEmployees = async (dept: string) => {
    try {
      const res = await employeeApi.getByDepartment(dept);
      setEmployees(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCandidate = (emp: Employee) => {
    const exists = candidates.find((c) => c.candidateId === emp.employeeId);
    if (exists) {
      alert("Employee already in candidate list");
      return;
    }

    setCurrentCandidate({
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      candidateId: emp.employeeId,
      dept: emp.department,
      phone: emp.phone,
      institution: batchEducation.institution,
      award: "",
      duration: 1,
      program: "Regular",
      location: "Local",
      isManual: false,
    });
    setSearchTerm("");
    setShowCandidateModal(true);
  };

  const handleManualAdd = () => {
    setCurrentCandidate({
      id: `manual-${Date.now()}`,
      name: "",
      candidateId: "",
      dept: (user as any)?.department || "",
      phone: "",
      institution: batchEducation.institution,
      award: "",
      duration: 1,
      program: "Regular",
      location: "Local",
      isManual: true,
    });
    setSearchTerm("");
    setShowCandidateModal(true);
  };

  const saveCandidate = () => {
    if (!currentCandidate.candidateId || !currentCandidate.name) {
      alert("Employee ID and Full Name are required.");
      return;
    }

    setCandidates((prev) => {
      const idx = prev.findIndex((c) => c.id === currentCandidate.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = currentCandidate as Candidate;
        return updated;
      }
      return [...prev, currentCandidate as Candidate];
    });
    setShowCandidateModal(false);
    setCurrentCandidate({});
  };

  const removeCandidate = (id: number | string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSubmitBatch = async () => {
    if (candidates.length === 0) {
      alert("Please add at least one candidate.");
      return;
    }
    if (!batchEducation.fieldOfStudy) {
      alert("Please set education details.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        opportunityId: batchEducation.opportunityId
          ? Number(batchEducation.opportunityId)
          : null,
        educationCategory: batchEducation.educationCategory,
        educationLevel: batchEducation.educationLevel,
        fieldOfStudy: batchEducation.fieldOfStudy,
        institution: batchEducation.institution,
        budgetYear: Number(batchEducation.budgetYear),
        description: batchEducation.remark,
        candidates: candidates.map((c) => ({
          // DB-backed: use numeric id; Manual: send null, backend resolves via candidateId string
          employeeId: c.isManual ? null : Number(c.id),
          candidateId: c.candidateId,
          name: c.name,
          phone: c.phone,
          award: c.award,
          duration: Number(c.duration),
          programTime: c.program,
          location: c.location,
          dept: c.dept,
        })),
      };

      await educationRequestApi.createBulk(payload);
      alert("Batch request submitted successfully!");
      setCandidates([]);
      setBatchEducation({
        opportunityId: "",
        educationCategory: "Technical",
        educationLevel: "BSc",
        fieldOfStudy: "",
        institution: "",
        budgetYear: new Date().getFullYear(),
        estimatedCost: 0,
        numCandidates: 1,
        remark: "",
      });
      setShowForm(false);
      loadRequests();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          err?.message ||
          "Failed to submit batch request",
      );
    } finally {
      setLoading(false);
    }
  };

  const submitToCenter = async (id: number) => {
    setBusyId(id);
    try {
      await educationRequestApi.submitToCenter(id);
      loadRequests();
    } catch (err: any) {
      alert(err?.message || "Failed to submit to center");
    } finally {
      setBusyId(null);
    }
  };

  const approveRequest = async (id: number) => {
    setBusyId(id);
    try {
      await educationRequestApi.forwardToHr(id);
      loadRequests();
    } catch (err: any) {
      alert(err?.message || "Failed to approve");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("educationRequests")}
              </h1>
              <p className="text-sm text-gray-500 font-medium italic">
                Manage departmental education batch requests and nominations.
              </p>
            </div>
          </div>

          {(isDepartmentHead || isAdmin) && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              {t("newRequest")}
            </button>
          )}
        </div>

        {showForm && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
            {/* Requester Info */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="rounded-lg bg-blue-50 p-2">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  {t("requesterInfo")}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {t("fullName")}
                  </label>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900">
                    {user?.fullName}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {t("department")}
                  </label>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900">
                    {(user as any)?.department || "N/A"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {t("position")}
                  </label>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900">
                    {(user as any)?.position || "Department Head"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {t("employeeId")}
                  </label>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900">
                    {user?.employeeId || user?.id}
                  </div>
                </div>
              </div>
            </div>

            {/* Education Goal */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {t("educationDetail")}
                  </h2>
                </div>
                <button
                  onClick={() => setShowEducationModal(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100"
                >
                  <Edit className="h-3.5 w-3.5" />
                  {batchEducation.fieldOfStudy ? t("edit") : t("save")}
                </button>
              </div>

              {batchEducation.fieldOfStudy ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                  <div className="flex items-start gap-4 rounded-xl border border-gray-100 p-4">
                    <div className="rounded-lg bg-gray-50 p-3 text-gray-400">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {t("educationCategory")}
                      </p>
                      <p className="mt-1 text-base font-bold text-gray-900">
                        {batchEducation.educationCategory}
                      </p>
                      <p className="text-xs font-medium text-gray-500">
                        {batchEducation.fieldOfStudy} (
                        {batchEducation.educationLevel})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 rounded-xl border border-gray-100 p-4">
                    <div className="rounded-lg bg-gray-50 p-3 text-gray-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {t("budgetYear")}
                      </p>
                      <p className="mt-1 text-base font-bold text-gray-900">
                        {batchEducation.budgetYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 rounded-xl border border-gray-100 p-4">
                    <div className="rounded-lg bg-gray-50 p-3 text-gray-400">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {t("numCandidates")}
                      </p>
                      <p className="mt-1 text-base font-bold text-gray-900">
                        {candidates.length}{" "}
                        <span className="text-gray-300">/</span>{" "}
                        {batchEducation.numCandidates}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-100 py-12 text-center">
                  <div className="mb-4 rounded-full bg-gray-50 p-4">
                    <GraduationCap className="h-10 w-10 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    No education goal defined yet.
                  </p>
                  <button
                    onClick={() => setShowEducationModal(true)}
                    className="mt-4 rounded-lg bg-gray-900 px-6 py-2 text-sm font-bold text-white transition-transform hover:scale-105"
                  >
                    + Define Education Goal
                  </button>
                </div>
              )}
            </div>

            {/* Candidates List */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-8 flex flex-col gap-4 border-b border-gray-100 pb-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {t("candidatesList")}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                    <input
                      type="text"
                      placeholder="Search employee by name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-72 rounded-xl border border-gray-100 bg-gray-50 pl-11 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-400 outline-none"
                    />

                    {searchTerm && (
                      <div className="absolute right-0 z-20 mt-2 w-80 origin-top-right rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-h-64 overflow-y-auto">
                          {employees
                            .filter(
                              (e) =>
                                `${e.firstName} ${e.lastName}`
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase()) ||
                                e.employeeId.includes(searchTerm),
                            )
                            .map((emp) => (
                              <button
                                key={emp.id}
                                onClick={() => handleAddCandidate(emp)}
                                className="group flex w-full items-center gap-4 rounded-xl p-3 text-left transition-all hover:bg-blue-50"
                              >
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-black shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                  {emp.firstName[0]}
                                  {emp.lastName[0]}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-gray-900 group-hover:text-blue-800">
                                    {emp.firstName} {emp.lastName}
                                  </p>
                                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-tight">
                                    {emp.employeeId} • {emp.position}
                                  </p>
                                </div>
                                <Plus className="h-5 w-5 text-gray-300 group-hover:text-blue-500" />
                              </button>
                            ))}
                          {employees.filter((e) =>
                            `${e.firstName} ${e.lastName}`
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()),
                          ).length === 0 && (
                            <div className="py-8 text-center">
                              <p className="text-xs font-semibold text-gray-400">
                                No employees found in database.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="h-10 w-[1px] bg-gray-100 hidden md:block"></div>

                  <button
                    onClick={handleManualAdd}
                    className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-6 py-2.5 text-sm font-bold text-blue-700 transition-all hover:bg-blue-100 hover:shadow-md active:scale-95"
                  >
                    <UserPlus className="h-4 w-4" />
                    Manual Add
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/80 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">ID / Emp ID</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">
                        የአባሉ የትምህርት ደረጃ / Degree Point
                      </th>
                      <th className="px-6 py-4">Duration</th>
                      <th className="px-6 py-4">Program</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs">
                    {candidates.map((c) => (
                      <tr
                        key={c.id}
                        className="group hover:bg-gray-50/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-gray-900">
                            {c.candidateId || "NEW"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-1.5 w-1.5 rounded-full ${c.isManual ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"}`}
                            ></div>
                            <span className="font-bold text-gray-900">
                              {c.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs italic text-gray-500">
                          {c.dept || "—"}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-600">
                          {c.award || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-1 text-gray-700 font-bold">
                            <Clock className="h-3 w-3 text-gray-400" />
                            {c.duration} {t("years")}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 uppercase tracking-widest border border-blue-100 italic">
                            {c.program}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setCurrentCandidate(c);
                                setShowCandidateModal(true);
                              }}
                              className="rounded-lg p-2 text-gray-400 hover:bg-blue-500 hover:text-white hover:shadow-lg hover:shadow-blue-200 transition-all"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => removeCandidate(c.id)}
                              className="rounded-lg p-2 text-gray-400 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-200 transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {candidates.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-24 text-center">
                          <div className="flex flex-col items-center">
                            <div className="mb-4 rounded-full bg-gray-50 p-4">
                              <Users className="h-10 w-10 text-gray-200" />
                            </div>
                            <p className="text-sm font-bold text-gray-400 italic">
                              No candidates added yet.
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              Use search or manual add to populate your request
                              batch.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-10 flex items-center justify-end gap-4 border-t border-gray-100 pt-8">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleSubmitBatch}
                  disabled={loading || candidates.length === 0}
                  className="flex items-center gap-2.5 rounded-lg bg-blue-600 px-10 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                >
                  {loading ? (
                    t("loading")
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> {t("submit")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History Table */}

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-5 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-800">Process History</h2>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-gray-200 bg-white p-1">
                <button className="rounded-md bg-gray-100 px-3 py-1 text-xs font-bold text-gray-900">
                  All
                </button>
                <button className="rounded-md px-3 py-1 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                  Draft
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5"># ID</th>
                  <th className="px-8 py-5">{t("fullName")}</th>
                  <th className="px-8 py-5">{t("department")}</th>
                  <th className="px-8 py-5">Goal / Field</th>
                  <th className="px-8 py-5">Year</th>
                  <th className="px-8 py-5">{t("status")}</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-[13px]">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-gray-50/80 transition-all"
                  >
                    <td className="px-8 py-5 font-mono text-[11px] font-bold text-gray-300">
                      REQ-{req.id}
                    </td>
                    <td className="px-8 py-5 text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">
                          {req.employeeName}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                          {req.candidateId || req.employeeId}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs italic text-gray-600">
                      {req.employeeDepartment || "—"}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">
                          {req.fieldOfStudy || t("notSpecified")}
                        </span>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-tighter">
                          {req.educationLevel} • {req.institution}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-gray-600 font-bold">
                      {req.budgetYear || "-"}
                    </td>
                    <td className="px-8 py-5">
                      <StatusBadge status={req.status as any} />
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {t("view") || "View"}
                        </button>
                        {req.status === "SUBMITTED_TO_CENTER" &&
                          (isCenter || isAdmin) && (
                            <button
                              onClick={() => approveRequest(req.id)}
                              disabled={busyId === req.id}
                              className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-[10px] font-bold text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100 uppercase tracking-widest italic"
                            >
                              <CheckCircle2 />
                              Forward to HR
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <FileText className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-base font-bold text-gray-900">
                          No submissions found
                        </p>
                        <p className="text-xs font-medium">
                          Any requests you make will appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Education Detail Modal */}
      {showEducationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <h3 className="mb-8 text-2xl font-bold text-gray-900 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              Education Goal Detail
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {t("educationOpportunity")}
                </label>
                <select
                  value={batchEducation.opportunityId}
                  onChange={(e) => {
                    const opp = opportunities.find(
                      (o) => o.id === Number(e.target.value),
                    );
                    setBatchEducation({
                      ...batchEducation,
                      opportunityId: e.target.value,
                      educationCategory: "Technical",
                      educationLevel: opp?.educationLevel || "BSc",
                      fieldOfStudy: opp?.educationType || "",
                      institution: opp?.institution || "",
                    });
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none"
                >
                  <option value="">Manual Entry / Other</option>
                  {opportunities.map((opp) => (
                    <option key={opp.id} value={opp.id}>
                      {opp.educationType} ({opp.educationLevel}) @{" "}
                      {opp.institution}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {t("educationCategory")}
                </label>
                <select
                  value={batchEducation.educationCategory}
                  onChange={(e) =>
                    setBatchEducation({
                      ...batchEducation,
                      educationCategory: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none"
                >
                  <option value="Technical">Technical</option>
                  <option value="Management">Management</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="educationLevel"
                  className="text-[10px] font-bold uppercase tracking-widest text-gray-400"
                >
                  {t("educationLevel")}
                </label>
                <input
                  id="educationLevel"
                  list="level-options"
                  value={batchEducation.educationLevel}
                  onChange={(e) =>
                    setBatchEducation({
                      ...batchEducation,
                      educationLevel: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none"
                  placeholder="e.g. BSc, MSc"
                />
                <datalist id="level-options">
                  <option value="BSc" />
                  <option value="MSc" />
                  <option value="PhD" />
                  <option value="Diploma" />
                  <option value="Certificate" />
                </datalist>
              </div>

              <div className="col-span-2 space-y-1.5">
                <label
                  htmlFor="fieldOfStudy"
                  className="text-xs font-black uppercase tracking-widest text-gray-400"
                >
                  {t("fieldOfStudy")}
                </label>
                <input
                  id="fieldOfStudy"
                  type="text"
                  name="fieldOfStudy"
                  autoComplete="education-major"
                  value={batchEducation.fieldOfStudy}
                  onChange={(e) =>
                    setBatchEducation({
                      ...batchEducation,
                      fieldOfStudy: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="e.g. Cyber Security"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label
                  htmlFor="institution"
                  className="text-xs font-black uppercase tracking-widest text-gray-400"
                >
                  {t("institution")}
                </label>
                <input
                  id="institution"
                  type="text"
                  name="institution"
                  autoComplete="organization"
                  value={batchEducation.institution}
                  onChange={(e) =>
                    setBatchEducation({
                      ...batchEducation,
                      institution: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="budgetYear"
                  className="text-xs font-black uppercase tracking-widest text-gray-400"
                >
                  {t("budgetYear")}
                </label>
                <input
                  id="budgetYear"
                  type="number"
                  name="budgetYear"
                  autoComplete="off"
                  value={batchEducation.budgetYear}
                  onChange={(e) =>
                    setBatchEducation({
                      ...batchEducation,
                      budgetYear: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  {t("numCandidates")}
                </label>
                <input
                  type="number"
                  value={batchEducation.numCandidates}
                  onChange={(e) =>
                    setBatchEducation({
                      ...batchEducation,
                      numCandidates: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  {t("description")}
                </label>
                <textarea
                  value={batchEducation.remark}
                  onChange={(e) =>
                    setBatchEducation({
                      ...batchEducation,
                      remark: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none"
                />
              </div>
            </div>

            <div className="mt-10 flex justify-end gap-4">
              <button
                onClick={() => setShowEducationModal(false)}
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => setShowEducationModal(false)}
                className="rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:scale-[1.02]"
              >
                {t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Modal */}
      {showCandidateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="mb-8 text-2xl font-bold text-gray-900 border-b border-gray-100 pb-6 flex items-center gap-3">
              <div className="rounded-lg bg-blue-600 p-2 text-white">
                <UserPlus className="h-6 w-6" />
              </div>
              {currentCandidate.isManual
                ? "Manual Candidate Entry"
                : t("addCandidate")}
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Employee ID / ID Card Number
                </label>
                <input
                  type="text"
                  required
                  readOnly={!currentCandidate.isManual}
                  value={currentCandidate.candidateId}
                  onChange={(e) =>
                    setCurrentCandidate({
                      ...currentCandidate,
                      candidateId: e.target.value,
                    })
                  }
                  className={`w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none ${!currentCandidate.isManual ? "opacity-70" : ""}`}
                  placeholder="e.g. EMP123"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label
                  htmlFor="fullName"
                  className="text-xs font-black uppercase tracking-widest text-gray-400"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  required
                  readOnly={!currentCandidate.isManual}
                  value={currentCandidate.name}
                  onChange={(e) =>
                    setCurrentCandidate({
                      ...currentCandidate,
                      name: e.target.value,
                    })
                  }
                  className={`w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none ${!currentCandidate.isManual ? "opacity-70" : ""}`}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  የአባሉ የትምህርት ደረጃ / Degree Point
                </label>
                <input
                  type="text"
                  value={currentCandidate.award}
                  onChange={(e) =>
                    setCurrentCandidate({
                      ...currentCandidate,
                      award: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none"
                  placeholder="e.g. Master of Science"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label
                  htmlFor="candidateInstitution"
                  className="text-xs font-black uppercase tracking-widest text-gray-400"
                >
                  Target Institution (If specific)
                </label>
                <input
                  id="candidateInstitution"
                  type="text"
                  name="institution"
                  autoComplete="organization"
                  value={currentCandidate.institution}
                  onChange={(e) =>
                    setCurrentCandidate({
                      ...currentCandidate,
                      institution: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="candidateDuration"
                  className="text-xs font-black uppercase tracking-widest text-gray-400"
                >
                  Duration (Years)
                </label>
                <input
                  id="candidateDuration"
                  type="number"
                  name="duration"
                  value={currentCandidate.duration}
                  onChange={(e) =>
                    setCurrentCandidate({
                      ...currentCandidate,
                      duration: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Program Time
                </label>
                <select
                  name="program"
                  value={currentCandidate.program}
                  onChange={(e) =>
                    setCurrentCandidate({
                      ...currentCandidate,
                      program: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none"
                >
                  <option value="Regular">Regular</option>
                  <option value="Extension">Extension</option>
                  <option value="Distance">Distance</option>
                </select>
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Location
                </label>
                <select
                  value={currentCandidate.location}
                  onChange={(e) =>
                    setCurrentCandidate({
                      ...currentCandidate,
                      location: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none"
                >
                  <option value="Local">Local</option>
                  <option value="Abroad">Abroad</option>
                </select>
              </div>
            </div>

            <div className="mt-10 flex justify-end gap-4">
              <button
                onClick={() => setShowCandidateModal(false)}
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={saveCandidate}
                className="rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:scale-[1.02]"
              >
                {t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl flex flex-col max-h-[90vh] rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex shrink-0 items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                Request Detail — REQ-{selectedRequest.id}
              </h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {t("fullName")}
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedRequest.employeeName}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                    {selectedRequest.candidateId || selectedRequest.employeeId}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {t("department")}
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedRequest.employeeDepartment || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {t("educationOpportunity")}
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedRequest.fieldOfStudy || t("notSpecified")}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                    {selectedRequest.educationLevel}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {t("institution")}
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedRequest.institution || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {t("award")} / {t("duration")}
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedRequest.award || "-"} ({selectedRequest.duration}{" "}
                    {t("years")})
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {t("location")} / {t("program")}
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedRequest.location} • {selectedRequest.programTime}
                  </p>
                </div>
              </div>

              {((selectedRequest as any).remark ||
                selectedRequest.description) && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-gray-400" />
                    Description / Remark
                  </p>
                  <p className="text-sm text-gray-700 font-medium leading-relaxed">
                    {(selectedRequest as any).remark ||
                      selectedRequest.description}
                  </p>
                </div>
              )}
            </div>
            <div className="bg-gray-50/80 shrink-0 px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
