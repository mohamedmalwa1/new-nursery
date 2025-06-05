// Students.jsx  — modern card layout & single search bar
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FiSearch, FiX, FiPrinter, FiPlus, FiFileText } from "react-icons/fi";
import DataTable from "../components/DataTable";
import Drawer from "../components/Drawer";
import StudentForm from "../components/StudentForm";

export default function Students() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [edit, setEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  /* ─── fetch ─── */
  const load = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/students/")
      .then((r) => r.json())
      .then((d) => {
        setRows(d);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load students");
        setLoading(false);
      });
  };
  useEffect(load, []);

  /* ─── helpers ─── */
  const del = (id) => {
    if (!window.confirm("Delete this student?")) return;
    fetch(`http://127.0.0.1:8000/api/students/${id}/`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) throw new Error();
        toast.success("Student deleted");
        load();
      })
      .catch(() => toast.error("Delete failed"));
  };

  const bulkDelete = (ids) =>
    Promise.all(
      ids.map((id) =>
        fetch(`http://127.0.0.1:8000/api/students/${id}/`, { method: "DELETE" })
      )
    ).then(() => {
      toast.success("Bulk delete completed");
      load();
    });

  const handlePrint = () => window.print();
  const handleExportPDF = () =>
    window.open("http://127.0.0.1:8000/api/reports/students/pdf/", "_blank");

  /* ─── search (name only) ─── */
  const filteredRows = rows.filter((s) =>
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ─── table prep ─── */
  const rowsA = filteredRows.map((r) => ({
    ...r,
    date_of_birth: r.date_of_birth
      ? new Date(r.date_of_birth).toLocaleDateString()
      : "",
    enrollment_date: r.enrollment_date
      ? new Date(r.enrollment_date).toLocaleDateString()
      : "",
    is_active: r.is_active ? "Yes" : "No",
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
    { key: "full_name", label: "Name", width: "18%" },
    { key: "gender", label: "Gender", width: "8%" },
    { key: "date_of_birth", label: "DOB", width: "10%" },
    { key: "age", label: "Age", width: "6%" },
    { key: "classroom_name", label: "Class", width: "10%" },
    { key: "teacher_name", label: "Teacher", width: "12%" },
    { key: "guardian_name", label: "Guardian", width: "12%" },
    { key: "guardian_contact", label: "Contact", width: "10%" },
    { key: "enrollment_date", label: "Enrolled", width: "10%" },
    { key: "is_active", label: "Active", width: "6%" },
    { key: "_actions", label: "Actions", width: "8%" },
  ];

  /* ─── UI ─── */
  return (
    <>
      <Toaster position="top-right" />

      {/* outer page padding keeps consistency across modules */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* card */}
        <div className="bg-white shadow-lg rounded-2xl p-6 space-y-6">
          {/* header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Student Management
            </h2>

            <div className="flex flex-wrap gap-3">
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
                <FiPlus /> Add Student
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition"
              >
                <FiFileText /> Export PDF
              </button>
            </div>
          </div>

          {/* search + stats */}
          <div className="space-y-4">
            {/* search input */}
            <div className="relative w-full max-w-lg">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student name…"
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

            {/* quick stats */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>
                <strong>Total:</strong> {rows.length}
              </span>
              <span>
                <strong>Active:</strong>{" "}
                {rows.filter((r) => r.is_active).length}
              </span>
              <span>
                <strong>Showing:</strong> {filteredRows.length}
              </span>
            </div>
          </div>

          {/* table */}
          {loading ? (
            <p className="p-4 text-gray-600">Loading students…</p>
          ) : (
            <DataTable
              columns={cols}
              rows={rowsA}
              onBulkDelete={bulkDelete}
              defaultSort="full_name"
              showSearch={false}
            />
          )}
        </div>
      </div>

      {/* drawer */}
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={edit ? "Edit Student" : "Add New Student"}
        width="50%"
      >
        {drawer && (
          <StudentForm
            initial={edit}
            onSaved={() => {
              setDrawer(false);
              load();
              toast.success(edit ? "Student updated!" : "Student added!");
            }}
            onCancel={() => setDrawer(false)}
          />
        )}
      </Drawer>

      {/* print tweaks */}
      <style jsx>{`
        @media print {
          .no-print,
          .shadow-lg,
          .rounded-2xl {
            display: none !important;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </>
  );
}

