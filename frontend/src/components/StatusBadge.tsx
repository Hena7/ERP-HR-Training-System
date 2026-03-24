"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SUBMITTED: "bg-indigo-100 text-indigo-800",
  CDC_APPROVED: "bg-cyan-100 text-cyan-800",
  FORWARDED_TO_HR: "bg-sky-100 text-sky-800",

  PENDING: "bg-yellow-100 text-yellow-800",
  HR_VERIFIED: "bg-blue-100 text-blue-800",
  SCORED: "bg-blue-100 text-blue-800",
  COMMITTEE_REVIEW: "bg-purple-100 text-purple-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CONTRACT_CREATED: "bg-teal-100 text-teal-800",
  OPEN: "bg-emerald-100 text-emerald-800",
  CLOSED: "bg-stone-100 text-stone-800",
  EXPIRED: "bg-rose-100 text-rose-800",
};

const fallbackLabels: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  CDC_APPROVED: "CDC Approved",

};

export default function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  const color = statusColors[status] || "bg-gray-100 text-gray-800";

  const translated = t(status as any);

  const label =
    translated === status ? fallbackLabels[status] || status : translated;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}
    >
      {label}
    </span>
  );
}
