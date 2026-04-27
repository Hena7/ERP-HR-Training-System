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
  const color = statusColors[status] || "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700";

  // Re-map simple text colors to more sophisticated modern equivalents
  let modernColor = color
    .replace('bg-gray-100 text-gray-800', 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700')
    .replace('bg-indigo-100 text-indigo-800', 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800')
    .replace('bg-cyan-100 text-cyan-800', 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800')
    .replace('bg-sky-100 text-sky-800', 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border-sky-200 dark:border-sky-800')
    .replace('bg-yellow-100 text-yellow-800', 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800')
    .replace('bg-blue-100 text-blue-800', 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 border-brand-200 dark:border-brand-800')
    .replace('bg-purple-100 text-purple-800', 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800')
    .replace('bg-green-100 text-green-800', 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800')
    .replace('bg-red-100 text-red-800', 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800')
    .replace('bg-teal-100 text-teal-800', 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800')
    .replace('bg-emerald-100 text-emerald-800', 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800')
    .replace('bg-stone-100 text-stone-800', 'bg-stone-100 text-stone-700 dark:bg-stone-800/50 dark:text-stone-300 border-stone-200 dark:border-stone-700')
    .replace('bg-rose-100 text-rose-800', 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800');

  const translated = t(status as any);
  const label = translated === status ? fallbackLabels[status] || status : translated;

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold shadow-sm transition-colors ${modernColor}`}
    >
      {label}
    </span>
  );
}
