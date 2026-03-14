"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  HR_VERIFIED: "bg-blue-100 text-blue-800",
  COMMITTEE_REVIEW: "bg-purple-100 text-purple-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CONTRACT_CREATED: "bg-teal-100 text-teal-800",
};

export default function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  const color = statusColors[status] || "bg-gray-100 text-gray-800";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {t(status as "PENDING" | "HR_VERIFIED" | "COMMITTEE_REVIEW" | "APPROVED" | "REJECTED" | "CONTRACT_CREATED")}
    </span>
  );
}
