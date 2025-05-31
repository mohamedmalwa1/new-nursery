// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API = "http://127.0.0.1:8000";

function StatCard({ title, value, sub, warn }) {
  return (
    <div className="bg-white shadow rounded-xl p-4 flex-1 relative">
      {warn && (
        <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full">
          Low
        </span>
      )}
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-semibold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    fetch(`${API}/api/dashboard/summary/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(setStats)
      .catch(() => setErr(true));
  }, []);

  if (err) return <p className="p-4 text-red-600">Failed to load dashboard.</p>;
  if (!stats) return <p className="p-4">Loading dashboard…</p>;

  // normalize between old & new key names
  const totalStudents =
    stats.total_students ?? stats.students ?? 0;
  const totalStaff =
    stats.total_staff ?? stats.staff ?? 0;
  const totalInvoices =
    stats.total_invoices ?? stats.total_invoices ?? 0;
  const unpaidInvoices =
    stats.unpaid_invoices ?? stats.unpaid_invoices ?? 0;
  const attendancePct =
    stats.today_attendance ??
    stats.attendance_today ??
    0;
  const inventoryTotal =
    stats.inventory_total ?? 0;
  const inventoryLow =
    stats.inventory_low ?? 0;

  const chartData = [
    { name: "Students", value: totalStudents },
    { name: "Staff",    value: totalStaff },
    { name: "Invoices", value: totalInvoices },
    { name: "Stock",    value: inventoryTotal },
  ];

  return (
    <div className="space-y-8">

      {/* Top row */}
      <div className="grid sm:grid-cols-3 gap-6">
        <StatCard title="Students" value={totalStudents} />
        <StatCard title="Staff" value={totalStaff} />
        <StatCard
          title="Attendance"
          value={`${attendancePct}%`}
          sub="Present today"
        />
      </div>

      {/* Second row */}
      <div className="grid sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Invoices"
          value={totalInvoices.toLocaleString(undefined, {
            style: "currency",
            currency: "AED",
            maximumFractionDigits: 0,
          })}
        />
        <StatCard
          title="Unpaid Invoices"
          value={unpaidInvoices}
        />
        <StatCard
          title="Inventory Items"
          value={inventoryTotal}
          sub={`${inventoryLow} < 5`}
          warn={inventoryLow > 0}
        />
      </div>

      {/* Bar chart */}
      <div className="bg-white shadow rounded-xl p-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#0284c7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

