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
    href: "/education-opportunities",
    labelKey: "navOpportunities",
    icon: <BookOpen className="h-5 w-5" />,
    roles: ["CYBER_DEVELOPMENT_CENTER", "ADMIN", "DEPARTMENT_HEAD"],
  },
  {
    href: "/education-requests",
    labelKey: "navRequests",
    icon: <FileText className="h-5 w-5" />,
    roles: ["DEPARTMENT_HEAD", "HR_OFFICER", "CYBER_DEVELOPMENT_CENTER", "ADMIN"],
  },
  {
    href: "/hr-verifications",
    labelKey: "navVerifications",
    icon: <ClipboardCheck className="h-5 w-5" />,
    roles: ["HR_OFFICER", "ADMIN"],
  },
  {
    href: "/cdc-scoring",
    labelKey: "navCdcScoring",
    icon: <BarChart3 className="h-5 w-5" />,
    roles: ["CYBER_DEVELOPMENT_CENTER", "ADMIN"],
  },
  {
    href: "/committee-decisions",
    labelKey: "navDecisions",
    icon: <Users className="h-5 w-5" />,
    roles: ["COMMITTEE_MEMBER", "ADMIN"],
  },
  {
    href: "/contracts",
    labelKey: "navContracts",
    icon: <FileSignature className="h-5 w-5" />,
    roles: ["CYBER_DEVELOPMENT_CENTER", "HR_OFFICER", "ADMIN"],
  },
  {
    href: "/guarantors",
    labelKey: "navGuarantors",
    icon: <Shield className="h-5 w-5" />,
    roles: ["DEPARTMENT_HEAD", "HR_OFFICER", "ADMIN"],
  },
  {
    href: "/progress-reports",
    labelKey: "navReports",
    icon: <BarChart3 className="h-5 w-5" />,
    roles: ["DEPARTMENT_HEAD", "HR_OFFICER", "CYBER_DEVELOPMENT_CENTER", "ADMIN"],
  },
  {
    href: "/completions",
    labelKey: "navCompletions",
    icon: <GraduationCap className="h-5 w-5" />,
    roles: ["DEPARTMENT_HEAD", "HR_OFFICER", "CYBER_DEVELOPMENT_CENTER", "ADMIN"],
  },
  {
    href: "/service-obligations",
    labelKey: "navObligations",
    icon: <Clock className="h-5 w-5" />,
    roles: ["HR_OFFICER", "CYBER_DEVELOPMENT_CENTER", "ADMIN"],
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
    labelKey: "navTrainingRequests",
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
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? "bg-blue-700 text-white"
            : "text-blue-100 hover:bg-blue-800 hover:text-white"
        }`}
      >
        {item.icon}
        {t(item.labelKey)}
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-blue-900 text-white shadow-xl flex flex-col">
      {/* Logo */}
      <div className="flex h-20 flex-shrink-0 items-center gap-3 border-b border-blue-800 px-4">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-white p-1">
          <img src="/INSA_LOGO.png" alt="INSA Logo" className="h-full w-full object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold leading-tight">{t("appName")}</span>
          <span className="text-[10px] text-blue-300 uppercase tracking-wider font-semibold">
            Security Administration
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-4 flex-1 overflow-y-auto space-y-1 px-3 pb-4">
        {/* System/General */}
        {filteredSystem.map(navLink)}

        {/* ─── Education Module ─── */}
        {filteredEdu.length > 0 && (
          <>
            <div className="mt-3">
              <button
                onClick={() => setEduOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-bold text-blue-200 hover:bg-blue-800 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  {t("educationModule")}
                </span>
                {eduOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </div>
            {eduOpen && (
              <div className="ml-2 border-l-2 border-blue-700 pl-3 space-y-1">
                {filteredEdu.map(navLink)}
              </div>
            )}
          </>
        )}

        {/* ─── Training Module ─── */}
        {filteredTraining.length > 0 && (
          <>
            <div className="mt-3">
              <button
                onClick={() => setTrainingOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-bold text-blue-200 hover:bg-blue-800 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t("trainingModule")}
                </span>
                {trainingOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </div>
            {trainingOpen && (
              <div className="ml-2 border-l-2 border-blue-700 pl-3 space-y-1">
                {filteredTraining.map(navLink)}
              </div>
            )}
          </>
        )}

        {/* ─── Admin/System Management ─── */}
        {filteredAdmin.length > 0 && (
          <>
            <div className="mt-4 mb-1 px-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">
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
