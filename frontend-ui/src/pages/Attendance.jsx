// src/pages/Attendance.jsx
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
import AttendanceForm from "../components/AttendanceForm";

export default function Attendance() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [edit, setEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  /* ─── fetch ─── */
  const load = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/attendance/")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => {
        setRows(d);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Load failed");
        setLoading(false);
      });
  };
  useEffect(load, []);

  /* ─── delete ─── */
  const del = (id) => {
    if (!window.confirm("Delete record?")) return;
    fetch(`http://127.0.0.1:8000/api/attendance/${id}/`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) throw new Error();
        toast.success("Deleted");
        load();
      })
      .catch(() => toast.error("Delete failed"));
  };

  /* ─── header buttons ─── */
  const handlePrint = () => window.print();
  const exportStudentsPDF = () =>
    window.open(
      "http://127.0.0.1:8000/api/reports/attendance/students/pdf/",
      "_blank"
    );
  const exportStaffPDF = () =>
    window.open(
      "http://127.0.0.1:8000/api/reports/attendance/staff/pdf/",
      "_blank"
    );

  /* ─── external search ─── */
  const q = searchTerm.toLowerCase();
  const filteredRows = rows.filter(
    (r) =>
      r.student_name?.toLowerCase().includes(q) ||
      r.staff_name?.toLowerCase().includes(q) ||
      r.status?.toLowerCase().includes(q) ||
      (r.date && new Date(r.date).toLocaleDateString().includes(q))
  );

  /* ─── table prep ─── */
  const rowsA = filteredRows.map((r) => ({
    ...r,
    date_fmt: r.date ? new Date(r.date).toLocaleDateString() : "",
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
    { key: "date_fmt", label: "Date", width: "15%" },
    { key: "student_name", label: "Student", width: "20%" },
    { key: "staff_name", label: "Staff", width: "20%" },
    { key: "status", label: "Status", width: "12%" },
    { key: "check_in", label: "In", width: "12%" },
    { key: "check_out", label: "Out", width: "12%" },
    { key: "_actions", label: "Actions", width: "9%" },
  ];

  /* ─── UI ─── */
  return (
    <>
      <Toaster position="top-right" />

      <h2 className="text-2xl font-semibold mb-6">Attendance Management</h2>

      {/* header strip */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* search */}
        <div className="relative w-full max-w-lg">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student, staff, status, or date…"
            className="w-full pl-12 pr-12 py-2 rounded-full border border-gray-300 shadow-sm
                       focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
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
            <FiPlus /> Add Entry
          </button>
          <button
            onClick={exportStudentsPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition"
          >
            <FiFileText /> Student PDF
          </button>
          <button
            onClick={exportStaffPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            <FiFileText /> Staff PDF
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
            <strong>Showing:</strong> {filteredRows.length}
          </span>
        </div>
      )}

      {/* table */}
      {loading ? (
        <p className="p-4 text-gray-600">Loading attendance…</p>
      ) : (
        <DataTable
          columns={cols}
          rows={rowsA}
          onBulkDelete={null}       /* attendance rarely bulk-deleted */
          defaultSort="date_fmt"
          showSearch={false}        /* external search bar above */
        />
      )}

      {/* drawer */}
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={edit ? "Edit Attendance" : "Add Attendance"}
        width="50%"
      >
        {drawer && (
          <AttendanceForm
            initial={edit}
            onSaved={() => {
              setDrawer(false);
              load();
              toast.success(edit ? "Attendance updated!" : "Attendance added!");
            }}
            onCancel={() => setDrawer(false)}
          />
        )}
      </Drawer>

      {/* print tweaks */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

