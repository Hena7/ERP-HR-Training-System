"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { serviceObligationApi } from "@/lib/api";
import { ServiceObligation } from "@/types";
import { Clock } from "lucide-react";

export default function ServiceObligationsPage() {
  const { t } = useLanguage();
  const [obligations, setObligations] = useState<ServiceObligation[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await serviceObligationApi.getAll(0, 20);
      setObligations(res.data.content || []);
    } catch {
      // API not available
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">{t("serviceObligations")}</h1>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800 font-medium">{t("obligationRule")}</p>
        </div>

        <div className="rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">{t("contracts")} ID</th>
                  <th className="px-4 py-3">{t("studyYears")}</th>
                  <th className="px-4 py-3">{t("requiredServiceYears")}</th>
                  <th className="px-4 py-3">{t("serviceStartDate")}</th>
                  <th className="px-4 py-3">{t("serviceEndDate")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {obligations.length > 0 ? obligations.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{o.id}</td>
                    <td className="px-4 py-3">#{o.contractId}</td>
                    <td className="px-4 py-3">{o.studyYears}</td>
                    <td className="px-4 py-3 font-semibold text-blue-600">{o.requiredServiceYears}</td>
                    <td className="px-4 py-3">{o.serviceStartDate || "-"}</td>
                    <td className="px-4 py-3">{o.serviceEndDate || "-"}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">{t("noData")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
