"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { educationRequestApi, contractApi } from "@/lib/api";
import { EducationRequest, Contract } from "@/types";
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
      const [reqRes, conRes] = await Promise.all([
        educationRequestApi.getAll(0, 5),
        contractApi.getAll(0, 5),
      ]);
      const reqs = reqRes.data.content || [];
      const cons = conRes.data.content || [];
      setRequests(reqs);
      setContracts(cons);
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
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                {t("newRequest")}
              </Link>
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
                      <td className="px-6 py-4 text-gray-600 font-medium">{req.educationType}</td>
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
