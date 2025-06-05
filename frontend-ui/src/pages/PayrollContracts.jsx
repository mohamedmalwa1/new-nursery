// src/pages/PayrollContracts.jsx
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  FiSearch,
  FiX,
  FiPrinter,
  FiPlus,
  FiFileText,
} from "react-icons/fi";

import DataTable from "../components/DataTable";
import Drawer from "../components/Drawer";
import PayrollContractForm from "../components/PayrollContractForm";

export default function PayrollContracts() {
  /* ─── state ─── */
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [edit, setEdit] = useState(null);
  const [q, setQ] = useState("");

  /* ─── fetch ─── */
  const load = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/payroll/contracts/")
      .then((r) => r.json())
      .then((d) => {
        setRows(d);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load contracts");
        setLoading(false);
      });
  };
  useEffect(load, []);

  /* ─── delete ─── */
  const del = (id) => {
    if (!window.confirm("Delete contract?")) return;
    fetch(`http://127.0.0.1:8000/api/payroll/contracts/${id}/`, {
      method: "DELETE",
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        toast.success("Contract deleted");
        load();
      })
      .catch(() => toast.error("Delete failed"));
  };

  /* ─── header actions ─── */
  const handlePrint = () => window.print();
  const exportPDF = () =>
    window.open("http://127.0.0.1:8000/api/reports/contracts/pdf/", "_blank");

  /* ─── search filter ─── */
  const query = q.toLowerCase();
  const filtered = rows.filter(
    (c) =>
      c.staff_name?.toLowerCase().includes(query) ||
      String(c.base_salary).includes(query) ||
      String(c.allowance).includes(query) ||
      String(c.max_advance).includes(query) ||
      (c.contract_start &&
        new Date(c.contract_start).toLocaleDateString().includes(query)) ||
      (c.contract_end &&
        new Date(c.contract_end).toLocaleDateString().includes(query))
  );

  /* ─── table rows ─── */
  const rowsA = filtered.map((r) => ({
    ...r,
    start_fmt: r.contract_start
      ? new Date(r.contract_start).toLocaleDateString()
      : "",
    end_fmt: r.contract_end
      ? new Date(r.contract_end).toLocaleDateString()
      : "",
    actions: (
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
    { key: "staff_name",  label: "Staff",      width: "18%" },
    { key: "base_salary", label: "Base",       width: "10%" },
    { key: "allowance",   label: "Allow.",     width: "10%" },
    { key: "max_advance", label: "Max Adv.",   width: "10%" }, // NEW COLUMN
    { key: "start_fmt",   label: "Start",      width: "12%" },
    { key: "end_fmt",     label: "End",        width: "12%" },
    { key: "actions",     label: "Actions",    width: "16%" },
  ];

  /* ─── UI ─── */
  return (
    <>
      <Toaster position="top-right" />

      <h2 className="text-2xl font-semibold mb-6">Payroll Contracts</h2>

      {/* header strip */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* search */}
        <div className="relative w-full max-w-lg">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search staff, salary, date…"
            className="w-full pl-12 pr-12 py-2 rounded-full border border-gray-300 shadow-sm
                       focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {q && (
            <button
              onClick={() => setQ("")}
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
            <FiPlus /> Add Contract
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
            <strong>Showing:</strong> {filtered.length}
          </span>
        </div>
      )}

      {/* table */}
      {loading ? (
        <p className="p-4 text-gray-600">Loading contracts…</p>
      ) : (
        <DataTable
          columns={cols}
          rows={rowsA}
          onBulkDelete={null}         /* manage individually */
          defaultSort="staff_name"
          showSearch={false}          /* external search bar */
        />
      )}

      {/* drawer */}
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={edit ? "Edit Contract" : "Add Contract"}
        width="50%"
      >
        {drawer && (
          <PayrollContractForm
            initial={edit}
            onSaved={() => {
              setDrawer(false);
              load();
              toast.success(edit ? "Contract updated!" : "Contract added!");
            }}
            onCancel={() => setDrawer(false)}
          />
        )}
      </Drawer>
    </>
  );
}

