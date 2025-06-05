// src/pages/Classrooms.jsx
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
import ClassroomForm from "../components/ClassroomForm";

export default function Classrooms() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [edit, setEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  /* ───── fetch ───── */
  const load = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/classrooms/")
      .then((r) => r.json())
      .then((d) => {
        setRows(d);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load classrooms");
        setLoading(false);
      });
  };
  useEffect(load, []);

  /* ───── CRUD ───── */
  const del = (id) => {
    if (!window.confirm("Delete this classroom?")) return;
    fetch(`http://127.0.0.1:8000/api/classrooms/${id}/`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) throw new Error();
        toast.success("Classroom deleted");
        load();
      })
      .catch(() => toast.error("Delete failed"));
  };

  const bulkDelete = (ids) =>
    Promise.all(
      ids.map((id) =>
        fetch(`http://127.0.0.1:8000/api/classrooms/${id}/`, {
          method: "DELETE",
        })
      )
    ).then(() => {
      toast.success("Bulk delete completed");
      load();
    });

  const handlePrint = () => window.print();
  const handleExportPDF = () =>
    window.open("http://127.0.0.1:8000/api/reports/classrooms/pdf/", "_blank");

  /* ───── external search ───── */
  const q = searchTerm.toLowerCase();
  const filteredRows = rows.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.grade_level?.toLowerCase().includes(q) ||
      c.teacher?.toLowerCase().includes(q)
  );

  /* ───── table prep ───── */
  const rowsA = filteredRows.map((r) => ({
    ...r,
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
    { key: "name", label: "Name", width: "25%" },
    { key: "grade_level", label: "Grade", width: "15%" },
    { key: "capacity", label: "Capacity", width: "12%" },
    { key: "teacher", label: "Teacher", width: "24%" },
    { key: "_actions", label: "Actions", width: "14%" },
  ];

  /* ───── UI ───── */
  return (
    <>
      <Toaster position="top-right" />

      <h2 className="text-2xl font-semibold mb-6">Classroom Management</h2>

      {/* header strip */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* search */}
        <div className="relative w-full max-w-lg">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, grade, or teacher…"
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
            <FiPlus /> Add Classroom
          </button>
          <button
            onClick={handleExportPDF}
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
            <strong>Showing:</strong> {filteredRows.length}
          </span>
        </div>
      )}

      {/* table */}
      {loading ? (
        <p className="p-4 text-gray-600">Loading classrooms…</p>
      ) : (
        <DataTable
          columns={cols}
          rows={rowsA}
          onBulkDelete={bulkDelete}
          defaultSort="name"
          showSearch={false} // using external search
        />
      )}

      {/* drawer */}
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={edit ? "Edit Classroom" : "Add New Classroom"}
        width="50%"
      >
        {drawer && (
          <ClassroomForm
            initial={edit}
            onSaved={() => {
              setDrawer(false);
              load();
              toast.success(edit ? "Classroom updated!" : "Classroom added!");
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

