"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const statusColors: Record<string, string> = {
  // Generic
  DRAFT:                        "bg-gray-100 text-gray-700",
  OPEN:                         "bg-emerald-100 text-emerald-800",
  CLOSED:                       "bg-stone-100 text-stone-800",
  EXPIRED:                      "bg-rose-100 text-rose-800",

  // Education workflow
  PENDING_DEPARTMENT_SUBMISSION: "bg-amber-100 text-amber-800",
  SUBMITTED_TO_CENTER:           "bg-indigo-100 text-indigo-800",
  CENTER_REVIEWED:               "bg-sky-100 text-sky-800",
  FORWARDED_TO_HR:               "bg-blue-100 text-blue-800",
  HR_VERIFIED:                   "bg-cyan-100 text-cyan-800",
  SCORED:                        "bg-violet-100 text-violet-800",
  COMMITTEE_REVIEW:              "bg-purple-100 text-purple-800",
  COMMITTEE_REPORTED:            "bg-fuchsia-100 text-fuchsia-800",
  CDC_APPROVED:                  "bg-teal-100 text-teal-800",
  APPROVED:                      "bg-green-100 text-green-800",
  REJECTED:                      "bg-red-100 text-red-800",
  CONTRACT_CREATED:              "bg-emerald-100 text-emerald-800",

  // Generic aliases
  PENDING:                       "bg-yellow-100 text-yellow-800",
  SUBMITTED:                     "bg-indigo-100 text-indigo-800",
};

const fallbackLabels: Record<string, string> = {
  DRAFT:                         "Draft",
  OPEN:                          "Open",
  CLOSED:                        "Closed",
  EXPIRED:                       "Expired",

  PENDING_DEPARTMENT_SUBMISSION: "Pending Submission",
  SUBMITTED_TO_CENTER:           "Sent to CDC",
  CENTER_REVIEWED:               "CDC Reviewed",
  FORWARDED_TO_HR:               "Forwarded to HR",
  HR_VERIFIED:                   "HR Verified",
  SCORED:                        "Scored",
  COMMITTEE_REVIEW:              "Committee Review",
  COMMITTEE_REPORTED:            "Committee Reported",
  CDC_APPROVED:                  "CDC Approved",
  APPROVED:                      "Approved",
  REJECTED:                      "Rejected",
  CONTRACT_CREATED:              "Contract Created",

  PENDING:                       "Pending",
  SUBMITTED:                     "Submitted",
};

export default function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  const color = statusColors[status] || "bg-gray-100 text-gray-600";

  const translated = t(status as any);
  const label =
    translated === status ? fallbackLabels[status] || status.replace(/_/g, " ") : translated;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}
    >
      {label}
    </span>
  );
}
