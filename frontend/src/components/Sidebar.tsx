"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Users,
  FileSignature,
  Shield,
  BarChart3,
  GraduationCap,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Clipboard,
  ShoppingCart,
  Package,
} from "lucide-react";
import { TranslationKey } from "@/lib/i18n";

interface NavItem {
  href: string;
  labelKey: TranslationKey;
  icon: React.ReactNode;
  roles: string[];
}

const ALL_ROLES = [
  "EMPLOYEE",
  "DEPARTMENT_HEAD",
  "HR_OFFICER",
  "CYBER_DEVELOPMENT_CENTER",
  "COMMITTEE_MEMBER",
  "DIRECTOR",
  "ADMIN",
  "PROCUREMENT",
];

// ─── Education Nav ─────────────────────────────────────────────────────────
// ─── System/General Nav ────────────────────────────────────────────────────
const systemNavItems: NavItem[] = [
  {
    href: "/dashboard",
    labelKey: "navDashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ALL_ROLES,
  },
];

const adminNavItems: NavItem[] = [
  {
    href: "/employees",
    labelKey: "navEmployees",
    icon: <Users className="h-5 w-5" />,
    roles: ["ADMIN", "DEPARTMENT_HEAD", "HR_OFFICER"],
  },
  {
    href: "/users",
    labelKey: "navUsers",
    icon: <Users className="h-5 w-5" />,
    roles: ["ADMIN"],
  },
];

// ─── Education Nav ─────────────────────────────────────────────────────────
const eduNavItems: NavItem[] = [
  {
    href: "/education/education-opportunities",
    labelKey: "navOpportunities",
    icon: <BookOpen className="h-5 w-5" />,
    roles: ["CYBER_DEVELOPMENT_CENTER", "ADMIN", "DEPARTMENT_HEAD"],
  },
  {
    href: "/education/education-requests",
    labelKey: "navRequests",
    icon: <FileText className="h-5 w-5" />,
    roles: [
      "DEPARTMENT_HEAD",
      "HR_OFFICER",
      "CYBER_DEVELOPMENT_CENTER",
      "ADMIN",
    ],
  },
  {
    href: "/education/hr-verifications",
    labelKey: "navVerifications",
    icon: <ClipboardCheck className="h-5 w-5" />,
    roles: ["HR_OFFICER", "ADMIN"],
  },
  {
    href: "/education/cdc-approval",
    labelKey: "navCdcApproval",
    icon: <BarChart3 className="h-5 w-5" />,
    roles: ["CYBER_DEVELOPMENT_CENTER", "ADMIN"],
  },
  {
    href: "/education/committee-decisions",
    labelKey: "navDecisions",
    icon: <Users className="h-5 w-5" />,
    roles: ["COMMITTEE_MEMBER", "ADMIN"],
  },
  {
    href: "/education/contracts",
    labelKey: "navContracts",
    icon: <FileSignature className="h-5 w-5" />,
    roles: ["CYBER_DEVELOPMENT_CENTER", "HR_OFFICER", "ADMIN"],
  },
  {
    href: "/education/guarantors",
    labelKey: "navGuarantors",
    icon: <Shield className="h-5 w-5" />,
    roles: ["DEPARTMENT_HEAD", "HR_OFFICER", "ADMIN"],
  },
  {
    href: "/education/progress-reports",
    labelKey: "navReports",
    icon: <BarChart3 className="h-5 w-5" />,
    roles: [
      "DEPARTMENT_HEAD",
      "HR_OFFICER",
      "CYBER_DEVELOPMENT_CENTER",
      "ADMIN",
    ],
  },
  {
    href: "/education/completions",
    labelKey: "navCompletions",
    icon: <GraduationCap className="h-5 w-5" />,
    roles: [
      "DEPARTMENT_HEAD",
      "HR_OFFICER",
      "CYBER_DEVELOPMENT_CENTER",
      "ADMIN",
    ],
  },
  {
    href: "/education/service-obligations",
    labelKey: "navObligations",
    icon: <Clock className="h-5 w-5" />,
    roles: ["HR_OFFICER", "CYBER_DEVELOPMENT_CENTER", "ADMIN"],
  },
  {
    href: "/education/reports",
    labelKey: "navEducationAnalytics",
    icon: <BarChart3 className="h-5 w-5" />,
    roles: ["DEPARTMENT_HEAD", "HR_OFFICER", "CYBER_DEVELOPMENT_CENTER", "ADMIN"],
  },
];

// ─── Training Nav ──────────────────────────────────────────────────────────
const trainingNavItems: NavItem[] = [
  {
    href: "/training/request-form",
    labelKey: "navTrainingRequests",
    icon: <Clipboard className="h-5 w-5" />,
    roles: ["EMPLOYEE", "DEPARTMENT_HEAD", "HR_OFFICER", "ADMIN"],
  },
  {
    href: "/training/requests-list",
    labelKey: "navTrainingRequestLists",
    icon: <Briefcase className="h-5 w-5" />,
    roles: ["PROCUREMENT", "HR_OFFICER", "ADMIN"],
  },
  {
    href: "/training/procurement-review",
    labelKey: "navTrainingProcurement",
    icon: <ShoppingCart className="h-5 w-5" />,
    roles: ["PROCUREMENT", "ADMIN"],
  },
  {
    href: "/training/contract-form",
    labelKey: "navTrainingContracts",
    icon: <FileSignature className="h-5 w-5" />,
    roles: ["PROCUREMENT", "HR_OFFICER", "ADMIN"],
  },
  {
    href: "/training/guarantor-form",
    labelKey: "navTrainingGuarantors",
    icon: <Shield className="h-5 w-5" />,
    roles: ["HR_OFFICER", "PROCUREMENT", "ADMIN"],
  },
  {
    href: "/training/obligation-tracking",
    labelKey: "navTrainingObligations",
    icon: <Clock className="h-5 w-5" />,
    roles: ["HR_OFFICER", "PROCUREMENT", "ADMIN"],
  },
  {
    href: "/training/reports",
    labelKey: "navTrainingReports",
    icon: <BarChart3 className="h-5 w-5" />,
    roles: ["HR_OFFICER", "PROCUREMENT", "ADMIN"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [eduOpen, setEduOpen] = useState(!pathname.startsWith("/training"));
  const [trainingOpen, setTrainingOpen] = useState(
    pathname.startsWith("/training"),
  );

  const filteredSystem = systemNavItems.filter(
    (item) => user && item.roles.includes(user.role),
  );
  const filteredEdu = eduNavItems.filter(
    (item) => user && item.roles.includes(user.role),
  );
  const filteredTraining = trainingNavItems.filter(
    (item) => user && item.roles.includes(user.role),
  );
  const filteredAdmin = adminNavItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  const navLink = (item: NavItem) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
          isActive
            ? "bg-brand-600 text-white shadow-md shadow-brand-900/20 dark:shadow-brand-900/50"
            : "text-slate-300 hover:bg-slate-800/50 hover:text-white dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        }`}
      >
        <span className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
          {item.icon}
        </span>
        <span className="tracking-wide">{t(item.labelKey)}</span>
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-950 dark:bg-slate-900 text-slate-200 shadow-xl flex flex-col border-r border-slate-800">
      {/* Logo */}
      <div className="flex h-16 flex-shrink-0 items-center gap-3 border-b border-slate-800 bg-slate-950/50 dark:bg-slate-900/50 backdrop-blur-sm px-4 relative z-10">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 shadow-sm">
          <img
            src="/INSA_LOGO.png"
            alt="INSA Logo"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-sm font-bold leading-tight tracking-wide text-white">
            {t("appName")}
          </span>
          <span className="text-[10px] text-brand-400 uppercase tracking-[0.2em] font-semibold mt-0.5">
            Security Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-4 flex-1 overflow-y-auto custom-scrollbar space-y-1.5 px-3 pb-4">
        {/* System/General */}
        {filteredSystem.map(navLink)}

        {/* ─── Education Module ─── */}
        {filteredEdu.length > 0 && (
          <>
            <div className="mt-4 mb-1">
              <button
                onClick={() => setEduOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  {t("educationModule")}
                </span>
                <span className={`transition-transform duration-300 ${eduOpen ? "rotate-180" : ""}`}>
                  <ChevronDown className="h-3.5 w-3.5" />
                </span>
              </button>
            </div>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${eduOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="ml-3 mt-1 border-l border-slate-800 pl-3 space-y-1">
                {filteredEdu.map(navLink)}
              </div>
            </div>
          </>
        )}

        {/* ─── Training Module ─── */}
        {filteredTraining.length > 0 && (
          <>
            <div className="mt-4 mb-1">
              <button
                onClick={() => setTrainingOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t("trainingModule")}
                </span>
                <span className={`transition-transform duration-300 ${trainingOpen ? "rotate-180" : ""}`}>
                  <ChevronDown className="h-3.5 w-3.5" />
                </span>
              </button>
            </div>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${trainingOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="ml-3 mt-1 border-l border-slate-800 pl-3 space-y-1">
                {filteredTraining.map(navLink)}
              </div>
            </div>
          </>
        )}

        {/* ─── Admin/System Management ─── */}
        {filteredAdmin.length > 0 && (
          <>
            <div className="mt-6 mb-2 px-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-500">
                System Admin
              </p>
            </div>
            {filteredAdmin.map(navLink)}
          </>
        )}
      </nav>
    </aside>
  );
}
