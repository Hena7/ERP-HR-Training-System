"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
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
} from "lucide-react";

interface NavItem {
  href: string;
  labelKey: "navDashboard" | "navOpportunities" | "navRequests" | "navVerifications" | "navDecisions" | "navContracts" | "navGuarantors" | "navReports" | "navCompletions" | "navObligations" | "navUsers";
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    labelKey: "navDashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["EMPLOYEE", "HR_OFFICER", "EDUCATION_CENTER", "COMMITTEE_MEMBER", "DIRECTOR", "ADMIN"],
  },
  {
    href: "/education-opportunities",
    labelKey: "navOpportunities",
    icon: <BookOpen className="h-5 w-5" />,
    roles: ["EDUCATION_CENTER", "ADMIN", "EMPLOYEE"],
  },
  {
    href: "/education-requests",
    labelKey: "navRequests",
    icon: <FileText className="h-5 w-5" />,
    roles: ["EMPLOYEE", "HR_OFFICER", "EDUCATION_CENTER", "ADMIN"],
  },
  {
    href: "/hr-verifications",
    labelKey: "navVerifications",
    icon: <ClipboardCheck className="h-5 w-5" />,
    roles: ["HR_OFFICER", "ADMIN"],
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
    roles: ["EDUCATION_CENTER", "HR_OFFICER", "ADMIN"],
  },
  {
    href: "/guarantors",
    labelKey: "navGuarantors",
    icon: <Shield className="h-5 w-5" />,
    roles: ["EMPLOYEE", "HR_OFFICER", "ADMIN"],
  },
  {
    href: "/progress-reports",
    labelKey: "navReports",
    icon: <BarChart3 className="h-5 w-5" />,
    roles: ["EMPLOYEE", "HR_OFFICER", "EDUCATION_CENTER", "ADMIN"],
  },
  {
    href: "/completions",
    labelKey: "navCompletions",
    icon: <GraduationCap className="h-5 w-5" />,
    roles: ["EMPLOYEE", "HR_OFFICER", "EDUCATION_CENTER", "ADMIN"],
  },
  {
    href: "/service-obligations",
    labelKey: "navObligations",
    icon: <Clock className="h-5 w-5" />,
    roles: ["HR_OFFICER", "EDUCATION_CENTER", "ADMIN"],
  },
  {
    href: "/users",
    labelKey: "navUsers",
    icon: <Users className="h-5 w-5" />,
    roles: ["ADMIN"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user } = useAuth();

  const filteredItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-blue-900 text-white shadow-xl">
      <div className="flex h-16 items-center justify-center border-b border-blue-800 px-4">
        <GraduationCap className="mr-2 h-8 w-8 text-yellow-400" />
        <span className="text-lg font-bold">{t("appName")}</span>
      </div>
      <nav className="mt-4 space-y-1 px-3">
        {filteredItems.map((item) => {
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
        })}
      </nav>
    </aside>
  );
}
