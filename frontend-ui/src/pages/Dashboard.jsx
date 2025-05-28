import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import KpiCard from "../components/KpiCard";
import toast, { Toaster } from "react-hot-toast";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLd] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/dashboard/summary/")
      .then(r => r.json())
      .then(d => { setSummary(d); setLd(false); })
      .catch(() => { toast.error("Load failed"); setLd(false); });
  }, []);

  if (loading) return <p className="p-4">Loading dashboard…</p>;
  if (!summary)   return null;

  /* fake data for 7-day trend – replace with real time-series later */
  const attendanceTrend = Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],
    pct: summary.today_attendance + (Math.random()*10-5),
  }));

  const pieData = [
    { name: "Paid",   value: summary.total_invoices - summary.unpaid_invoices },
    { name: "Unpaid", value: summary.unpaid_invoices },
  ];
  const COLORS = ["#059669", "#ef4444"];   // green, red

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard title="Students"        value={summary.total_students}   color="blue"  />
        <KpiCard title="Staff"           value={summary.total_staff}      color="indigo"/>
        <KpiCard title="Unpaid invoices" value={summary.unpaid_invoices} color="orange"/>
        <KpiCard title="Today attendance" value={summary.today_attendance + '%'} color="green" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* attendance trend */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-2">Attendance last 7 days</h3>
          <LineChart width={380} height={200} data={attendanceTrend}>
            <XAxis dataKey="day" />
            <YAxis domain={[0,100]} />
            <Tooltip />
            <Line type="monotone" dataKey="pct" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </div>

        {/* invoices pie */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-2">Invoices status</h3>
          <PieChart width={380} height={200}>
            <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} label>
              {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
    </div>
  );
}

