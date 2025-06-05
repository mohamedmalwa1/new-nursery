// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home as IconDashboard,
  Users as IconStudents,
  User as IconStaff,
  ClipboardList as IconClassrooms,
  Calendar as IconAttendance,
  Heart as IconMedical,
  FileText as IconInvoices,
  CreditCard as IconPayments,
  Archive as IconInventory,
  File as IconDocuments,
  BookOpen as IconContracts,
  DollarSign as IconSalaries,
} from "lucide-react"; // lucide is already a direct drop-in for feather

const links = [
  { to: "/",               label: "Dashboard",      icon: IconDashboard },
  { to: "/students",       label: "Students",       icon: IconStudents  },
  { to: "/staff",          label: "Staff",          icon: IconStaff     },
  { to: "/classrooms",     label: "Classrooms",     icon: IconClassrooms},
  { to: "/attendance",     label: "Attendance",     icon: IconAttendance},
  { to: "/medical",        label: "Medical",        icon: IconMedical   },
  { to: "/invoices",       label: "Invoices",       icon: IconInvoices  },
  { to: "/payments",       label: "Payments",       icon: IconPayments  },
  { to: "/inventory",      label: "Inventory",      icon: IconInventory },
  { to: "/documents",      label: "Documents",      icon: IconDocuments },
  { to: "/payroll-contracts", label: "Payroll Contracts", icon: IconContracts},
  { to: "/salaries",       label: "Salaries",       icon: IconSalaries  },
];

export default function Sidebar() {
  return (
    <aside
      className="h-screen w-56 flex-shrink-0
                 bg-gradient-to-b from-slate-900 via-indigo-900 to-indigo-800
                 text-indigo-100"
    >
      <div className="h-16 flex items-center justify-center font-semibold text-lg tracking-wide">
        Nursery Admin
      </div>

      <nav className="mt-4 space-y-1 px-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              [
                "group flex items-center gap-3 px-3 py-2 rounded-md",
                "transition-colors duration-150",
                isActive
                  ? "bg-indigo-700/30 text-white font-medium"
                  : "hover:bg-indigo-700/20 text-indigo-200",
              ].join(" ")
            }
          >
            {/* accent bar */}
            {({ isActive }) => (
              <span
                className={[
                  "h-5 w-1 rounded-r-sm",
                  isActive
                    ? "bg-emerald-400"
                    : "group-hover:bg-emerald-300/70 bg-transparent",
                ].join(" ")}
              />
            )}
            <Icon className="h-5 w-5 shrink-0 opacity-90" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

