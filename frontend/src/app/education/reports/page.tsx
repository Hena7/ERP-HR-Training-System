"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { educationRequestApi, contractApi, serviceObligationApi } from "@/lib/api";
import { EducationRequest } from "@/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import {
  TrendingUp, Users, GraduationCap, Eye, Filter, Download,
  Building2, FileText, Clock, X, MapPin, User, BookOpen, Award, CheckCircle2
} from "lucide-react";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#3b82f6"];

export default function EducationReportsPage() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState<EducationRequest[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [obligations, setObligations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [filterLevel, setFilterLevel] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [historySearch, setHistorySearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [reqs, ctrs, obls] = await Promise.all([
          educationRequestApi.getAll(0, 1000),
          contractApi.getAll(0, 1000),
          serviceObligationApi.getAll(0, 1000),
        ]);
        setRequests(reqs.data.content || reqs.data || []);
        setContracts(ctrs.data.content || ctrs.data || []);
        setObligations(obls.data.content || obls.data || []);
      } catch (err) {
        console.error("Failed to load education report data", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const total = requests.length;
    const approved = requests.filter(r => r.status === "CDC_APPROVED" || r.status === "CONTRACT_CREATED").length;
    const contracted = contracts.length;
    const completed = requests.filter(r => r.status === "COMPLETED" || r.status === "EDUCATION_COMPLETED").length;
    return { total, approved, contracted, completed };
  }, [requests, contracts]);

  const levelData = useMemo(() => {
    const map: Record<string, number> = {};
    requests.forEach(r => {
      const l = r.educationLevel || "Unknown";
      map[l] = (map[l] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [requests]);

  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    requests.forEach(r => {
      const s = (r.status || "UNKNOWN").replace(/_/g, " ");
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [requests]);

  const deptData = useMemo(() => {
    const map: Record<string, number> = {};
    requests.forEach(r => {
      const d = r.employeeDepartment || "Unknown";
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [requests]);

  const levels = useMemo(() => ["All", ...Array.from(new Set(requests.map(r => r.educationLevel).filter(Boolean)))], [requests]);
  const statuses = useMemo(() => ["All", ...Array.from(new Set(requests.map(r => r.status).filter(Boolean)))], [requests]);

  const filteredHistory = useMemo(() => {
    let result = [...requests].sort((a, b) => (b.id || 0) - (a.id || 0));
    if (filterLevel !== "All") result = result.filter(r => r.educationLevel === filterLevel);
    if (filterStatus !== "All") result = result.filter(r => r.status === filterStatus);
    if (historySearch.trim()) {
      const term = historySearch.toLowerCase();
      result = result.filter(r =>
        r.employeeName?.toLowerCase().includes(term) ||
        r.employeeDepartment?.toLowerCase().includes(term) ||
        r.fieldOfStudy?.toLowerCase().includes(term) ||
        r.institution?.toLowerCase().includes(term)
      );
    }
    return result;
  }, [requests, filterLevel, filterStatus, historySearch]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">
              Loading Education Data...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg shadow-indigo-200">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Education Analytics</h1>
              <p className="text-sm font-medium text-gray-500">Academic Programme & Candidate Pipeline Insights</p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="no-print flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all active:scale-95"
          >
            <Download className="h-4 w-4" /> Export Report
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Requests", value: stats.total, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "CDC Approved", value: stats.approved, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Active Commitments", value: stats.contracted, icon: Award, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Completed Studies", value: stats.completed, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
          ].map((card, i) => (
            <div key={i} className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} ${card.color} transition-transform group-hover:scale-110`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{card.label}</p>
                  <p className="text-2xl font-black text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1: Requests by Department & Education Level */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Requests by Department</h3>
                <p className="text-[10px] font-medium text-gray-400">Number of candidates per department</p>
              </div>
              <Building2 className="h-5 w-5 text-gray-300" />
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={9} fontWeight="bold" axisLine={false} tickLine={false} interval={0} />
                  <YAxis fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" name="Requests" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Education Levels</h3>
              <p className="text-[10px] font-medium text-gray-400">Distribution by degree type</p>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={levelData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {levelData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2: Pipeline Status */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Request Pipeline Status</h3>
              <p className="text-[10px] font-medium text-gray-400">Candidate distribution across workflow stages</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-gray-300" />
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" fontSize={9} fontWeight="bold" axisLine={false} tickLine={false} width={130} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                <Bar dataKey="value" name="Candidates" fill="#10b981" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Local Study", value: requests.filter(r => (r.location || "").toLowerCase().includes("local") || !r.location).length },
            { label: "Abroad Study", value: requests.filter(r => (r.location || "").toLowerCase().includes("abroad")).length },
            { label: "Service Obligations", value: obligations.length },
            { label: "Budget Years Tracked", value: new Set(requests.map(r => r.budgetYear).filter(Boolean)).size },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm text-center">
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Historical Audit Log */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Historical Requests Log</h3>
                  <p className="text-[10px] font-medium text-gray-400">Complete education request audit trail</p>
                </div>
                <input
                  type="text"
                  placeholder="Search name, dept, field..."
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  className="no-print w-56 rounded-xl border border-gray-100 bg-white px-4 py-2 text-xs font-bold outline-none shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>
              <div className="no-print flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-gray-400" />
                  <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-black text-gray-700 outline-none">
                    {levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-black text-gray-700 outline-none">
                  {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
                <span className="text-[10px] font-bold text-gray-400">{filteredHistory.length} records</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/30 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="px-6 py-4">REQ-ID</th>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Field of Study</th>
                  <th className="px-6 py-4">Level</th>
                  <th className="px-6 py-4">Budget Year</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right no-print">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredHistory.length === 0 ? (
                  <tr><td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-400">No records found.</td></tr>
                ) : filteredHistory.map((req: any) => (
                  <tr key={req.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-indigo-600">EDQ-{String(req.id).slice(-6)}</td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-gray-900">{req.employeeName || "—"}</p>
                      <p className="text-[10px] text-gray-400">{req.candidateId || ""}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-600 italic">{req.employeeDepartment || "—"}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-700">{req.fieldOfStudy || req.educationType || "—"}</td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-700">{req.educationLevel || "—"}</td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">{req.budgetYear || "—"}</td>
                    <td className="px-6 py-4 text-xs font-black text-indigo-700">{req.totalScore ? `${req.totalScore.toFixed(1)}%` : "—"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700 border border-indigo-100">
                        {req.status?.replace(/_/g, " ") || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right no-print">
                      <button onClick={() => setSelectedItem(req)}
                        className="rounded-lg bg-white border border-gray-100 p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/30">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Education Request Detail</p>
                <h2 className="text-lg font-black text-gray-900">EDQ-{String(selectedItem.id).slice(-6)}</h2>
              </div>
              <button onClick={() => setSelectedItem(null)} className="rounded-xl p-2 hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-8 grid grid-cols-2 gap-5 max-h-[60vh] overflow-y-auto">
              {[
                { icon: User, label: "Employee Name", value: selectedItem.employeeName },
                { icon: Building2, label: "Department", value: selectedItem.employeeDepartment },
                { icon: BookOpen, label: "Field of Study", value: selectedItem.fieldOfStudy || selectedItem.educationType },
                { icon: GraduationCap, label: "Education Level", value: selectedItem.educationLevel },
                { icon: Award, label: "Institution", value: selectedItem.institution },
                { icon: Clock, label: "Duration (yrs)", value: selectedItem.duration },
                { icon: MapPin, label: "Study Location", value: selectedItem.location || "Local" },
                { icon: FileText, label: "Program Type", value: selectedItem.programTime },
                { icon: TrendingUp, label: "Total Score", value: selectedItem.totalScore ? `${selectedItem.totalScore.toFixed(1)}%` : "—" },
                { icon: CheckCircle2, label: "Status", value: selectedItem.status?.replace(/_/g, " ") },
                { icon: FileText, label: "Budget Year", value: selectedItem.budgetYear },
                { icon: Users, label: "Category", value: selectedItem.educationCategory || selectedItem.category },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.label}</p>
                    <p className="text-sm font-bold text-gray-900">{item.value || "—"}</p>
                  </div>
                </div>
              ))}
              <div className="col-span-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Description / Remarks</p>
                <p className="text-sm font-medium text-gray-700 leading-relaxed italic">
                  {selectedItem.description || "No description provided."}
                </p>
              </div>
            </div>
            <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setSelectedItem(null)}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
