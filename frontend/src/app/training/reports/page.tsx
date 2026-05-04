"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  trainingRequestApi,
  trainingObligationApi,
  trainingContractApi,
} from "@/app/training/services/trainingApi";
import { TrainingRequest, TrainingObligation, TrainingContract } from "@/types/training";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  TrendingUp,
  Users,
  DollarSign,
  Award,
  Eye,
  Filter,
  Download,
  Calendar,
  Building2,
  FileText,
  X,
  MapPin,
  User,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function TrainingReportsPage() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [obligations, setObligations] = useState<TrainingObligation[]>([]);
  const [contracts, setContracts] = useState<TrainingContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [filterDept, setFilterDept] = useState("All");
  const [rosterTab, setRosterTab] = useState<"ongoing" | "completed">("ongoing");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reqs, obls, ctrs] = await Promise.all([
          trainingRequestApi.getAll(),
          trainingObligationApi.getAll(),
          trainingContractApi.getAll(),
        ]);
        setRequests(reqs.data);
        setObligations(obls.data);
        setContracts(ctrs.data);
      } catch (err) {
        console.error("Failed to load report data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Analytical Calculations ---

  const stats = useMemo(() => {
    const totalCost = requests.reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
    const totalTrainees = requests.reduce((sum, r) => sum + (r.numTrainees || 0), 0);
    const activeObligations = obligations.filter(o => o.status === "ACTIVE").length;
    const approvalRate = requests.length > 0 
      ? (requests.filter(r => r.status !== "REJECTED").length / requests.length * 100).toFixed(1)
      : 0;

    return { totalCost, totalTrainees, activeObligations, approvalRate };
  }, [requests, obligations]);

  const deptData = useMemo(() => {
    const depts: Record<string, number> = {};
    requests.forEach(r => {
      depts[r.department] = (depts[r.department] || 0) + r.estimatedCost;
    });
    return Object.entries(depts).map(([name, value]) => ({ name, value }));
  }, [requests]);

  const statusData = useMemo(() => {
    const statuses: Record<string, number> = {};
    requests.forEach(r => {
      statuses[r.status] = (statuses[r.status] || 0) + 1;
    });
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  }, [requests]);

  const filteredHistory = useMemo(() => {
    return requests
      .filter(r => filterDept === "All" ? true : r.department === filterDept)
      .sort((a, b) => b.id - a.id);
  }, [requests, filterDept]);

  const departments = useMemo(() => {
    const d = new Set(requests.map(r => r.department));
    return ["All", ...Array.from(d)];
  }, [requests]);

  // Training roster: split by contract status
  const ongoingTrainees = useMemo(
    () => contracts.filter((c) => c.status === "ACTIVE"),
    [contracts],
  );

  const completedTrainees = useMemo(
    () => contracts.filter((c) => c.status === "COMPLETED" || c.status === "VIOLATED"),
    [contracts],
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">
              Generating Enterprise Analytics...
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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-200">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                {t("trainingReports")}
              </h1>
              <p className="text-sm font-medium text-gray-500">
                Enterprise Intelligence & Resource Allocation Overview
              </p>
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
            { label: "Total Investment", value: `${stats.totalCost.toLocaleString()} Birr`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Trainee Impact", value: stats.totalTrainees, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Currently Training", value: ongoingTrainees.length, icon: GraduationCap, color: "text-blue-700", bg: "bg-blue-100", highlight: true },
            { label: "Training Completed", value: completedTrainees.length, icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-100" },
          ].map((card, i) => (
            <div key={i} className={`group rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-all ${
              (card as any).highlight ? "border-blue-200 ring-1 ring-blue-100" : "border-gray-100"
            }`}>
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} ${card.color} transition-transform group-hover:scale-110`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{card.label}</p>
                  <p className="text-xl font-black text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Chart: Dept Spend */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Investment by Department</h3>
                <p className="text-[10px] font-medium text-gray-400">Total training cost distribution across INSA</p>
              </div>
              <Building2 className="h-5 w-5 text-gray-300" />
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Chart: Status Distribution */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Request Lifecycle</h3>
              <p className="text-[10px] font-medium text-gray-400">Volume distribution by current status</p>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Employee Training Status Roster ── */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                  Employee Training Status
                </h3>
                <p className="text-[10px] font-medium text-gray-400">
                  Real-time view of who is currently in training and who has completed it
                </p>
              </div>
              {/* Tab Toggle */}
              <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-100/60 p-1">
                <button
                  onClick={() => setRosterTab("ongoing")}
                  className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-black transition-all ${
                    rosterTab === "ongoing"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-current opacity-80" />
                  Ongoing
                  <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                    rosterTab === "ongoing" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                  }`}>
                    {ongoingTrainees.length}
                  </span>
                </button>
                <button
                  onClick={() => setRosterTab("completed")}
                  className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-black transition-all ${
                    rosterTab === "completed"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-current opacity-80" />
                  Completed
                  <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                    rosterTab === "completed" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                  }`}>
                    {completedTrainees.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Status Summary Cards */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-4 rounded-xl border border-blue-100 bg-blue-50/60 px-5 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-200">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-blue-700">{ongoingTrainees.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">
                    Currently Training
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50/60 px-5 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-md shadow-emerald-200">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-700">{completedTrainees.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                    Training Completed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Roster Table */}
          <div className="overflow-x-auto">
            {rosterTab === "ongoing" ? (
              ongoingTrainees.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-100 bg-blue-50/40 text-[10px] font-black uppercase tracking-widest text-blue-600">
                    <tr>
                      <th className="px-6 py-3">Employee</th>
                      <th className="px-6 py-3">Department</th>
                      <th className="px-6 py-3">Training Type</th>
                      <th className="px-6 py-3">Country</th>
                      <th className="px-6 py-3">City</th>
                      <th className="px-6 py-3">Duration (mo)</th>
                      <th className="px-6 py-3">Total Cost</th>
                      <th className="px-6 py-3">Signed Date</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {ongoingTrainees.map((c) => (
                      <tr key={c.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="px-6 py-3">
                          <span className="font-bold text-gray-900">{c.employeeName || `EMP-${c.employeeId}`}</span>
                        </td>
                        <td className="px-6 py-3 text-xs italic text-gray-500">{c.employeeDepartment || "—"}</td>
                        <td className="px-6 py-3">
                          <span className="font-semibold text-gray-800">{c.trainingType || "—"}</span>
                        </td>
                        <td className="px-6 py-3 text-xs text-gray-600">{c.trainingCountry || "—"}</td>
                        <td className="px-6 py-3 text-xs text-gray-600">{c.trainingCity || "—"}</td>
                        <td className="px-6 py-3 text-xs font-bold text-gray-700">{c.contractDurationMonths ? `${c.contractDurationMonths} mo` : "—"}</td>
                        <td className="px-6 py-3 text-xs font-black text-blue-700">{c.totalCost ? `${c.totalCost.toLocaleString()} Birr` : "—"}</td>
                        <td className="px-6 py-3 text-xs text-gray-500">{c.signedDate ? new Date(c.signedDate).toLocaleDateString() : "—"}</td>
                        <td className="px-6 py-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-12 text-center text-sm text-gray-400">
                  No employees are currently in an active training programme.
                </div>
              )
            ) : (
              completedTrainees.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-100 bg-emerald-50/40 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                    <tr>
                      <th className="px-6 py-3">Employee</th>
                      <th className="px-6 py-3">Department</th>
                      <th className="px-6 py-3">Training Type</th>
                      <th className="px-6 py-3">Country</th>
                      <th className="px-6 py-3">Duration (mo)</th>
                      <th className="px-6 py-3">Total Cost</th>
                      <th className="px-6 py-3">Signed Date</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {completedTrainees.map((c) => (
                      <tr key={c.id} className="hover:bg-emerald-50/20 transition-colors">
                        <td className="px-6 py-3">
                          <span className="font-bold text-gray-900">{c.employeeName || `EMP-${c.employeeId}`}</span>
                        </td>
                        <td className="px-6 py-3 text-xs italic text-gray-500">{c.employeeDepartment || "—"}</td>
                        <td className="px-6 py-3">
                          <span className="font-semibold text-gray-800">{c.trainingType || "—"}</span>
                        </td>
                        <td className="px-6 py-3 text-xs text-gray-600">{c.trainingCountry || "—"}</td>
                        <td className="px-6 py-3 text-xs font-bold text-gray-700">{c.contractDurationMonths ? `${c.contractDurationMonths} mo` : "—"}</td>
                        <td className="px-6 py-3 text-xs font-black text-emerald-700">{c.totalCost ? `${c.totalCost.toLocaleString()} Birr` : "—"}</td>
                        <td className="px-6 py-3 text-xs text-gray-500">{c.signedDate ? new Date(c.signedDate).toLocaleDateString() : "—"}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            c.status === "VIOLATED"
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}>
                            <CheckCircle2 className="h-3 w-3" />
                            {c.status === "VIOLATED" ? "Violated" : "Completed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-12 text-center text-sm text-gray-400">
                  No employees have completed their training yet.
                </div>
              )
            )}
          </div>
        </div>

        {/* Historical Master Table */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Historical Audit Log</h3>
              <p className="text-[10px] font-medium text-gray-400">Complete record of training activities</p>
            </div>
            <div className="flex items-center gap-3 no-print">
              <Filter className="h-4 w-4 text-gray-400" />
              <select 
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-black text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/30 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Training Title</th>
                  <th className="px-6 py-4">Participants</th>
                  <th className="px-6 py-4">Total Cost</th>
                  <th className="px-6 py-4 text-right no-print">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredHistory.map((req) => (
                  <tr key={req.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-blue-600">TRQ-{req.id.toString().slice(-6)}</td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-900">{req.department}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-600 truncate max-w-[200px]">{req.trainingTitle}</td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-700">{req.numTrainees}</td>
                    <td className="px-6 py-4 text-xs font-black text-blue-700">{req.estimatedCost.toLocaleString()} Birr</td>
                    <td className="px-6 py-4 text-right no-print">
                      <button 
                        onClick={() => setSelectedItem(req)}
                        className="rounded-lg bg-white border border-gray-100 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 transition-all shadow-sm"
                      >
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
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Audit Detail</p>
                <h2 className="text-lg font-black text-gray-900">Request TRQ-{selectedItem.id.toString().slice(-6)}</h2>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="rounded-xl p-2 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-8 grid grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
               {[
                 { icon: User, label: "Requester", value: selectedItem.requesterName },
                 { icon: Building2, label: "Department", value: selectedItem.department },
                 { icon: FileText, label: "Title", value: selectedItem.trainingTitle },
                 { icon: DollarSign, label: "Total Cost", value: `${selectedItem.estimatedCost.toLocaleString()} Birr` },
                 { icon: Users, label: "Participants", value: selectedItem.numTrainees },
                 { icon: Calendar, label: "Duration", value: selectedItem.trainingDuration },
                 { icon: MapPin, label: "Location", value: selectedItem.trainingLocation },
                 { icon: Award, label: "Budget Source", value: selectedItem.budgetSource },
               ].map((item, i) => (
                 <div key={i} className="flex items-start gap-4">
                   <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                     <item.icon className="h-5 w-5" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.label}</p>
                     <p className="text-sm font-bold text-gray-900">{item.value || "—"}</p>
                   </div>
                 </div>
               ))}
               <div className="col-span-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Technical Specifications</p>
                 <p className="text-sm font-medium text-gray-700 leading-relaxed italic">
                   {selectedItem.specification || "No specifications provided."}
                 </p>
               </div>
            </div>
            <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
               <button 
                 onClick={() => setSelectedItem(null)}
                 className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition-all"
               >
                 Close Detail
               </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
