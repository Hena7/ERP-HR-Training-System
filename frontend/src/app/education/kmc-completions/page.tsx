"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { completionApi, contractApi } from "@/lib/api";
import { EducationCompletion, Contract } from "@/types";
import { GraduationCap, CheckCircle, FileText, User } from "lucide-react";

export default function KMCCompletionsPage() {
  const { t } = useLanguage();
  const [completions, setCompletions] = useState<EducationCompletion[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [compRes, conRes] = await Promise.all([
        completionApi.getAll(0, 100),
        contractApi.getAll(0, 100),
      ]);
      
      // Filter completions that were sent to KMC
      const allCompletions = compRes.data.content || [];
      const kmcCompletions = allCompletions.filter((c: any) => c.notifiedKmc === true);
      
      setCompletions(kmcCompletions);
      setContracts(conRes.data.content || []);
    } catch (error) {
      console.error("Failed to load completions", error);
    } finally {
      setLoading(false);
    }
  };

  const getContractDetails = (contractId: number) => {
    return contracts.find(c => c.id === contractId);
  };

  const handleAcknowledge = async (id: number) => {
    try {
      await completionApi.update(id, { kmcAcknowledged: true });
      loadData();
    } catch (error) {
      alert("Failed to acknowledge completion");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-md">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">KMC Completion Notifications</h1>
            <p className="text-sm text-gray-500 font-medium italic">
              Knowledge Management Center review of education completion records.
            </p>
          </div>
        </div>

        {/* Completions Table */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Education Completions Pending KMC Review
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Completion Date</th>
                  <th className="px-6 py-4">Research Presentation</th>
                  <th className="px-6 py-4 text-right">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex justify-center items-center gap-2">
                         <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                         <span>Loading notifications...</span>
                      </div>
                    </td>
                  </tr>
                ) : completions.length > 0 ? (
                  completions.map((c) => {
                    const contract = getContractDetails(c.contractId);
                    return (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-blue-600">CMP-{c.id.toString().slice(-6)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
                                <User className="h-4 w-4 text-gray-400" />
                             </div>
                             <span className="font-bold text-gray-900">{contract?.employeeName || "Unknown Employee"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-600">{(contract as any)?.employeeDepartment || "—"}</td>
                        <td className="px-6 py-4 font-medium text-gray-700">{c.completionDate}</td>
                        <td className="px-6 py-4 font-medium text-gray-500">{c.researchPresentationDate || "—"}</td>
                        <td className="px-6 py-4 text-right">
                          {c.kmcAcknowledged ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 border border-purple-100">
                              <CheckCircle className="h-3 w-3" />
                              Acknowledged
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAcknowledge(c.id)}
                              className="rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition-all"
                            >
                              Acknowledge
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>No completion notifications found for KMC.</p>
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
