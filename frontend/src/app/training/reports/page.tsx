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
  Clock,
  X,
  MapPin,
  User,
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
            { label: "Active Obligations", value: stats.activeObligations, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Approval Rate", value: `${stats.approvalRate}%`, icon: Award, color: "text-indigo-600", bg: "bg-indigo-50" },
          ].map((card, i) => (
            <div key={i} className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all">
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
                 { icon: DollarSign, label: "Cost", value: `${selectedItem.estimatedCost.toLocaleString()} Birr` },
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
