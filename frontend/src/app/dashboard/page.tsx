"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { educationRequestApi, contractApi, completionApi } from "@/lib/api";
import { EducationRequest, Contract, EducationCompletion } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";
import {
  FileText,
  ClipboardCheck,
  FileSignature,
  BarChart3,
  Plus,
} from "lucide-react";

export default function DashboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [requests, setRequests] = useState<EducationRequest[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [completions, setCompletions] = useState<EducationCompletion[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    activeContracts: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reqRes, conRes, compRes] = await Promise.all([
        educationRequestApi.getAll(0, 5),
        contractApi.getAll(0, 100),
        completionApi.getAll(0, 100),
      ]);
      const reqs = reqRes.data.content || [];
      const cons = conRes.data.content || [];
      const comps = compRes.data.content || [];
      setRequests(reqs);
      setContracts(cons);
      setCompletions(comps);
      setStats({
        total: reqRes.data.totalElements || 0,
        pending: reqs.filter((r: EducationRequest) => r.status === "PENDING")
          .length,
        approved: reqs.filter((r: EducationRequest) => r.status === "APPROVED")
          .length,
        activeContracts: conRes.data.totalElements || 0,
      });
    } catch {
      // API not available yet
    }
  };

  const handleAcknowledgeHR = async (id: number) => {
    try {
      await completionApi.update(id, { hrAcknowledged: true });
      loadData();
    } catch {
      alert("Failed to acknowledge");
    }
  };

  const statCards = [
    {
      label: t("totalRequests"),
      value: stats.total,
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      color: "bg-blue-50 border-blue-200",
    },
    {
      label: t("pendingRequests"),
      value: stats.pending,
      icon: <ClipboardCheck className="h-8 w-8 text-yellow-500" />,
      color: "bg-yellow-50 border-yellow-200",
    },
    {
      label: t("approvedRequests"),
      value: stats.approved,
      icon: <BarChart3 className="h-8 w-8 text-green-500" />,
      color: "bg-green-50 border-green-200",
    },
    {
      label: t("activeContracts"),
      value: stats.activeContracts,
      icon: <FileSignature className="h-8 w-8 text-purple-500" />,
      color: "bg-purple-50 border-purple-200",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("welcome")}, {user?.fullName}!
          </h1>
          <p className="text-gray-500">{t("dashboard")}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-xl border border-gray-100 p-6 shadow-sm transition-all hover:shadow-md ${card.color}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {card.value}
                  </p>
                </div>
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">
            {t("quickActions")}
          </h2>
          <div className="flex flex-wrap gap-3">
            {user?.role === "EMPLOYEE" || user?.role === "ADMIN" ? (
              <Link
                href="/education-requests"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                {t("newRequest")}
              </Link>
            ) : null}
            {user?.role === "PROCUREMENT" || user?.role === "ADMIN" ? (
              <>
                <Link
                  href="/training/requests-list"
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95"
                >
                  <FileText className="h-4 w-4" />
                  {t("navTrainingRequestLists")}
                </Link>
                <Link
                  href="/training/procurement-review"
                  className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-6 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition-all hover:bg-blue-100 active:scale-95"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  {t("navTrainingProcurement")}
                </Link>
              </>
            ) : null}
            <Link
              href="/education-requests"
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-4 w-4" />
              {t("educationRequests")}
            </Link>
            <Link
              href="/contracts"
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileSignature className="h-4 w-4" />
              {t("contracts")}
            </Link>
          </div>
        </div>

        {/* CDC Analytical Board */}
        {(user?.role === "CYBER_DEVELOPMENT_CENTER" || user?.role === "ADMIN") && (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">Education Analytics Board</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-sm text-gray-500 mb-4 font-medium">Study Completion Status</p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-gray-700">Completed Studies</span>
                      <span className="font-bold text-green-600">{contracts.filter(c => c.educationEndDate && c.educationEndDate <= new Date().toISOString().split('T')[0]).length}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${contracts.length ? (contracts.filter(c => c.educationEndDate && c.educationEndDate <= new Date().toISOString().split('T')[0]).length / contracts.length) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-gray-700">Ongoing Studies</span>
                      <span className="font-bold text-blue-600">{contracts.filter(c => !c.educationEndDate || c.educationEndDate > new Date().toISOString().split('T')[0]).length}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${contracts.length ? (contracts.filter(c => !c.educationEndDate || c.educationEndDate > new Date().toISOString().split('T')[0]).length / contracts.length) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-center items-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-purple-100 bg-white shadow-sm mb-3">
                  <span className="text-2xl font-bold text-purple-700">{contracts.length}</span>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 text-center">Total Commitments</p>
                <p className="text-xs text-gray-400 mt-2 text-center">Tracked by the CDC</p>
              </div>
            </div>
          </div>
        )}

        {/* HR Notifications Board */}
        {(user?.role === "HR_OFFICER" || user?.role === "ADMIN") && (
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
              HR Return Notifications
            </h2>
            <div className="space-y-3">
              {completions.filter(c => c.sentToHr && !c.hrAcknowledged).length > 0 ? (
                completions.filter(c => c.sentToHr && !c.hrAcknowledged).map(c => {
                  const contract = contracts.find(con => con.id === c.contractId);
                  return (
                    <div key={c.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm gap-4 sm:gap-0">
                      <div>
                        <p className="font-bold text-gray-900">{contract ? (contract.employeeName || `EMP-${contract.employeeId}`) : `Contract #${c.contractId}`}</p>
                        <p className="text-sm text-gray-600 mt-1">Has returned from education on <strong className="text-gray-900">{c.returnToWorkDate || "N/A"}</strong>. Please resume salary and duties.</p>
                      </div>
                      <button
                        onClick={() => handleAcknowledgeHR(c.id)}
                        className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm ml-auto sm:ml-0"
                      >
                        Acknowledge
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 font-medium italic text-sm">No pending return notifications from CDC.</p>
              )}
            </div>
          </div>
        )}

        {/* Recent Requests */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">
            {t("recentActivity")}
          </h2>
          {requests.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-50">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <tr>
                    <th className="px-6 py-4">{t("fullName")}</th>
                    <th className="px-6 py-4">{t("selectedEducationType")}</th>
                    <th className="px-6 py-4">{t("institution")}</th>
                    <th className="px-6 py-4">{t("status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {req.employeeName}
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{req.fieldOfStudy || (req as any).educationType || "-"}</td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{req.institution}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={req.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 font-medium italic">{t("noData")}</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
