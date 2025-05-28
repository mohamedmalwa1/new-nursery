import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import InlineBadge from "./InlineBadge";      // small red badge

/* helper for active link styling */
const linkClass = ({ isActive }) =>
  `block px-4 py-2 rounded hover:bg-gray-100 ${
    isActive ? "bg-gray-200 font-semibold text-blue-700" : ""
  }`;

export default function Sidebar() {
  const [lowStock, setLowStock] = useState(0);

  /* listen for global event fired by Inventory page */
  useEffect(() => {
    const handler = () => setLowStock(window.__lowStockCount || 0);
    handler();                           // initial call
    window.addEventListener("lowStockUpdated", handler);
    return () => window.removeEventListener("lowStockUpdated", handler);
  }, []);

  return (
    <aside className="w-64 bg-white border-r shadow-sm">
      <div className="p-4 font-bold text-xl border-b">Nursery Admin</div>

      <nav className="p-4 space-y-2 text-sm">
        <NavLink to="/dashboard"         className={linkClass}>Dashboard</NavLink>
        <NavLink to="/students"          className={linkClass}>Students</NavLink>
        <NavLink to="/staff"             className={linkClass}>Staff</NavLink>
        <NavLink to="/classrooms"        className={linkClass}>Classrooms</NavLink>
        <NavLink to="/attendance"        className={linkClass}>Attendance</NavLink>
        <NavLink to="/medical"           className={linkClass}>Medical</NavLink>
        <NavLink to="/invoices"          className={linkClass}>Invoices</NavLink>
        <NavLink to="/payments"          className={linkClass}>Payments</NavLink>

        {/* Inventory link with low-stock badge */}
        <NavLink to="/inventory" className={linkClass}>
          Inventory{" "}
          {lowStock > 0 && <InlineBadge>{lowStock}</InlineBadge>}
        </NavLink>

        <NavLink to="/documents"         className={linkClass}>Documents</NavLink>
        <NavLink to="/payroll-contracts" className={linkClass}>Payroll Contracts</NavLink>
        <NavLink to="/salaries"          className={linkClass}>Salaries</NavLink>
      </nav>
    </aside>
  );
}

