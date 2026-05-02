"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { educationFinanceReportApi, contractApi } from "@/lib/api";
import { EducationFinanceReport, Contract } from "@/types";
import { 
  DollarSign, 
  Plus, 
  FileText, 
  TrendingUp, 
  Calendar, 
  Wallet,
  CheckCircle2,
  AlertCircle,
  Receipt
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

const fieldClass =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5";

export default function FinanceReportsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [reports, setReports] = useState<EducationFinanceReport[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    reportingPeriod: "Monthly",
    periodValue: "",
    tuitionFees: "",
    livingAllowance: "",
    otherExpenses: "",
    description: ""
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load contracts for the user
      const conRes = await contractApi.getAll(0, 50);
      const userContracts = conRes.data.content || [];
      
      // If user is EMPLOYEE, filter by their employeeId
      const filtered = user?.role === "EMPLOYEE" 
        ? userContracts.filter((c: any) => String(c.employeeId) === String(user.employeeId || user.id))
        : userContracts;
        
      setContracts(filtered);

      // Load all reports (frontend will filter/calc)
      const repRes = await educationFinanceReportApi.getAll();
      setReports(repRes.data || []);
    } catch (err) {
      console.error("Failed to load finance data", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedContract = contracts.find(c => c.id === selectedContractId);
  const filteredReports = reports.filter(r => r.contractId === selectedContractId);
  
  const cumulativeTotal = filteredReports.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  const handleSelectContract = (id: number) => {
    setSelectedContractId(prev => prev === id ? null : id);
    setForm({
      reportingPeriod: "Monthly",
      periodValue: "",
      tuitionFees: "",
      livingAllowance: "",
      otherExpenses: "",
      description: ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractId) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        contractId: selectedContractId,
        employeeId: String(user?.employeeId || user?.id),
        reportingPeriod: form.reportingPeriod,
        periodValue: form.periodValue,
        tuitionFees: parseFloat(form.tuitionFees || "0"),
        livingAllowance: parseFloat(form.livingAllowance || "0"),
        otherExpenses: parseFloat(form.otherExpenses || "0"),
        description: form.description,
        currency: "ETB"
      };

      await educationFinanceReportApi.create(payload);
      setForm({
        reportingPeriod: "Monthly",
        periodValue: "",
        tuitionFees: "",
        livingAllowance: "",
        otherExpenses: "",
        description: ""
      });
      loadData();
      alert("Finance report submitted successfully!");
    } catch (err) {
      alert("Failed to submit finance report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-md">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Education Finance Reporting</h1>
              <p className="text-sm text-gray-500 font-medium italic">
                Report your educational expenses monthly or per term and track cumulative spending.
              </p>
            </div>
          </div>
        </div>

        {/* Contracts Table */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Active Education Contracts
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Institution / Program</th>
                  <th className="px-6 py-4">Signed Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {contracts.length > 0 ? (
                  contracts.map((c) => {
                    const isSelected = selectedContractId === c.id;
                    return (
                      <tr key={c.id} className={`transition-colors ${isSelected ? "bg-emerald-50/60" : "hover:bg-gray-50/50"}`}>
                        <td className="px-6 py-4 font-bold text-emerald-600">CTR-{c.id.toString().slice(-6)}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{(c as any).university || (c as any).institution || "N/A"}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-tight">{(c as any).program || "Education"}</p>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                          {c.contractSignedDate ? new Date(c.contractSignedDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleSelectContract(c.id)}
                            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all shadow-sm ${
                              isSelected
                                ? "bg-emerald-600 text-white shadow-emerald-200"
                                : "bg-gray-50 text-gray-700 border border-gray-100 hover:bg-emerald-600 hover:text-white"
                            }`}
                          >
                            {isSelected ? "Selected" : "Select to Report"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                      <Wallet className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="font-bold uppercase tracking-widest text-[10px]">No active contracts found for reporting.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedContract && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Form Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-emerald-600" />
                  Submit New Expense Report
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Reporting Period Type</label>
                      <select
                        className={fieldClass}
                        value={form.reportingPeriod}
                        onChange={(e) => setForm({ ...form, reportingPeriod: e.target.value })}
                        required
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Term">Per Term / Semester</option>
                        <option value="Yearly">Yearly</option>
                        <option value="One-time">One-time / Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Period (e.g. Sept 2024 / Term 1)</label>
                      <input
                        className={fieldClass}
                        placeholder="Enter period name..."
                        value={form.periodValue}
                        onChange={(e) => setForm({ ...form, periodValue: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>Tuition Fees (ETB)</label>
                        <input
                          type="number"
                          className={fieldClass}
                          placeholder="0.00"
                          value={form.tuitionFees}
                          onChange={(e) => setForm({ ...form, tuitionFees: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Living Allowance (ETB)</label>
                        <input
                          type="number"
                          className={fieldClass}
                          placeholder="0.00"
                          value={form.livingAllowance}
                          onChange={(e) => setForm({ ...form, livingAllowance: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Other Expenses (ETB)</label>
                        <input
                          type="number"
                          className={fieldClass}
                          placeholder="0.00"
                          value={form.otherExpenses}
                          onChange={(e) => setForm({ ...form, otherExpenses: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelClass}>Description / Remarks</label>
                      <textarea
                        className={fieldClass}
                        rows={3}
                        placeholder="Provide details about the expenses..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total to Report</p>
                      <p className="text-2xl font-black text-gray-900">
                        {((parseFloat(form.tuitionFees || "0") + 
                           parseFloat(form.livingAllowance || "0") + 
                           parseFloat(form.otherExpenses || "0"))).toLocaleString()} <span className="text-sm font-bold text-gray-400">ETB</span>
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-lg bg-emerald-600 px-10 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Report"}
                    </button>
                  </div>
                </form>
              </div>

              {/* History Table */}
              <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Expense History for CTR-{selectedContract.id.toString().slice(-6)}
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      <tr>
                        <th className="px-6 py-4">Period</th>
                        <th className="px-6 py-4">Total Amount</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-xs">
                      {filteredReports.length > 0 ? filteredReports.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-900">{r.periodValue}</p>
                            <p className="text-[10px] text-gray-400">{r.reportingPeriod}</p>
                          </td>
                          <td className="px-6 py-4 font-black text-gray-700">
                            {r.totalAmount?.toLocaleString()} {r.currency}
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={r.status || "PENDING"} />
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No reports submitted yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar Stats Column */}
            <div className="space-y-6">
              <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 shadow-xl text-white">
                <TrendingUp className="h-8 w-8 text-emerald-400 mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Cumulative Total Expenses</p>
                <p className="mt-1 text-3xl font-black">{cumulativeTotal.toLocaleString()} <span className="text-sm font-bold text-gray-500">ETB</span></p>
                
                <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Reported Periods</span>
                    <span className="text-sm font-bold">{filteredReports.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Latest Submission</span>
                    <span className="text-sm font-bold">
                      {filteredReports.length > 0 
                        ? new Date(filteredReports[0].submittedAt).toLocaleDateString() 
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <p className="text-xs font-bold text-blue-900 uppercase tracking-tight">Finance Policy</p>
                </div>
                <p className="text-[11px] leading-relaxed text-blue-700">
                  Please ensure all submitted expenses are backed by original receipts. 
                  The Finance Department may request physical verification before approving payouts.
                </p>
              </div>
            </div>
          </div>
        )}

        {!selectedContractId && (
          <div className="rounded-2xl border-2 border-dashed border-gray-100 p-20 text-center">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-200" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Please select a contract from the list above to begin reporting.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
