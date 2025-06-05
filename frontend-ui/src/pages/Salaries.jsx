// src/pages/Salaries.jsx
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  FiSearch,
  FiX,
  FiPrinter,
  FiPlus,
  FiFileText,
  FiDownload,
} from "react-icons/fi";

import DataTable from "../components/DataTable";
import Drawer from "../components/Drawer";
import SalaryForm from "../components/SalaryForm";

export default function Salaries() {
  /* ───────── state ───────── */
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [edit, setEdit] = useState(null);
  const [search, setSearch] = useState("");

  /* ───────── fetch ───────── */
  const load = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/payroll/salaries/")
      .then((r) => r.json())
      .then((d) => {
        setRows(d);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load salaries");
        setLoading(false);
      });
  };
  useEffect(load, []);

  /* ───────── delete ───────── */
  const del = (id) => {
    if (!window.confirm("Delete salary record?")) return;
    fetch(`http://127.0.0.1:8000/api/payroll/salaries/${id}/`, {
      method: "DELETE",
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        toast.success("Salary deleted");
        load();
      })
      .catch(() => toast.error("Delete failed"));
  };

  /* ───────── header buttons ───────── */
  const handlePrint = () => window.print();
  const exportPDF = () =>
    window.open("http://127.0.0.1:8000/api/reports/salaries/pdf/", "_blank");

  /* ───────── search filter ───────── */
  const q = search.toLowerCase();
  const filtered = rows.filter(
    (s) =>
      s.staff_name?.toLowerCase().includes(q) ||
      s.month?.includes(q) ||
      String(s.advance_taken).includes(q) ||
      String(s.deductions).includes(q) ||
      (s.is_paid && "paid".includes(q))
  );

  /* ───────── table rows ───────── */
  const rowsA = filtered.map((r) => ({
    ...r,
    month_fmt: r.month
      ? new Date(r.month).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "",
    pay_date_fmt: r.payment_date
      ? new Date(r.payment_date).toLocaleDateString()
      : "",
    paid_badge: r.is_paid ? "✅" : "—",
    slip_link: (
      <a
        href={`http://127.0.0.1:8000/api/payroll/salaries/${r.id}/pdf/`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline flex items-center gap-1"
      >
        <FiDownload /> PDF
      </a>
    ),
    _actions: (
      <div className="flex gap-3">
        <button
          className="text-blue-600 hover:underline"
          onClick={() => {
            setEdit(r);
            setDrawer(true);
          }}
        >
          Edit
        </button>
        <button
          className="text-red-600 hover:underline"
          onClick={() => del(r.id)}
        >
          Delete
        </button>
      </div>
    ),
  }));

  const cols = [
    { key: "staff_name", label: "Staff", width: "18%" },
    { key: "month_fmt", label: "Month", width: "10%" },
    { key: "base_salary", label: "Base", width: "9%" },
    { key: "allowance", label: "Allow.", width: "9%" },
    { key: "advance_taken", label: "Advance", width: "9%" },   // NEW
    { key: "deductions", label: "Deduction", width: "9%" },    // NEW
    { key: "net_salary", label: "Net", width: "9%" },
    { key: "paid_badge", label: "Paid", width: "6%" },
    { key: "slip_link", label: "Slip", width: "6%" },
    { key: "_actions", label: "Actions", width: "15%" },
  ];

  /* ───────── UI ───────── */
  return (
    <>
      <Toaster position="top-right" />

      <h2 className="text-2xl font-semibold mb-6">Salary Records</h2>

      {/* header strip */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* search bar */}
        <div className="relative w-full max-w-lg">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff, month, net…"
            className="w-full pl-12 pr-12 py-2 rounded-full border border-gray-300 shadow-sm
                       focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX />
            </button>
          )}
        </div>

        {/* buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            <FiPrinter /> Print
          </button>
          <button
            onClick={() => {
              setEdit(null);
              setDrawer(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <FiPlus /> Add Salary
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition"
          >
            <FiFileText /> Export PDF
          </button>
        </div>
      </div>

      {/* stats */}
      {!loading && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700">
          <span>
            <strong>Total:</strong> {rows.length}
          </span>{" "}
          |{" "}
          <span>
            <strong>Paid:</strong> {rows.filter((r) => r.is_paid).length}
          </span>{" "}
          |{" "}
          <span>
            <strong>Showing:</strong> {filtered.length}
          </span>
        </div>
      )}

      {/* table */}
      {loading ? (
        <p className="p-4 text-gray-600">Loading salaries…</p>
      ) : (
        <DataTable
          columns={cols}
          rows={rowsA}
          onBulkDelete={null}
          defaultSort="month_fmt"
          showSearch={false}
        />
      )}

      {/* drawer (add / edit) */}
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={edit ? "Edit Salary" : "Add Salary"}
        width="50%"
      >
        {drawer && (
          <SalaryForm
            initial={edit}
            onSaved={() => {
              setDrawer(false);
              load();
              toast.success(edit ? "Salary updated!" : "Salary added!");
            }}
            onCancel={() => setDrawer(false)}
          />
        )}
      </Drawer>
    </>
  );
}

