// src/pages/Staff.jsx
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
import StaffForm from "../components/StaffForm";

export default function Staff() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [edit, setEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  /* ─── fetch data ─── */
  const load = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/staff/")
      .then((r) => r.json())
      .then((d) => {
        setRows(d);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load staff");
        setLoading(false);
      });
  };
  useEffect(load, []);

  /* ─── CRUD helpers ─── */
  const del = (id) => {
    if (!window.confirm("Delete this staff member?")) return;
    fetch(`http://127.0.0.1:8000/api/staff/${id}/`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) throw new Error();
        toast.success("Staff deleted");
        load();
      })
      .catch(() => toast.error("Delete failed"));
  };

  const bulkDelete = (ids) =>
    Promise.all(
      ids.map((id) =>
        fetch(`http://127.0.0.1:8000/api/staff/${id}/`, { method: "DELETE" })
      )
    ).then(() => {
      toast.success("Bulk delete completed");
      load();
    });

  const handlePrint = () => window.print();
  const handleExportPDF = () =>
    window.open("http://127.0.0.1:8000/api/reports/staff/pdf/", "_blank");

  /* ─── external search (name, role, email, phone) ─── */
  const search = searchTerm.toLowerCase();
  const filteredRows = rows.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search) ||
      s.role?.toLowerCase().includes(search) ||
      s.email?.toLowerCase().includes(search) ||
      s.phone?.toLowerCase().includes(search)
  );

  /* ─── table prep ─── */
  const rowsA = filteredRows.map((r) => ({
    ...r,
    hire_date_fmt: r.hire_date
      ? new Date(r.hire_date).toLocaleDateString()
      : "",
    document_link: r.document ? (
      <a
        href={r.document}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline flex items-center gap-1"
      >
        <FiDownload /> Download
      </a>
    ) : (
      "—"
    ),
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
    { key: "role", label: "Role", width: "12%" },
    { key: "email", label: "Email", width: "19%" },
    { key: "phone", label: "Phone", width: "12%" },
    { key: "hire_date_fmt", label: "Hire Date", width: "10%" },
    { key: "document_link", label: "Document", width: "12%" },
    { key: "is_active", label: "Active", width: "7%" },
    { key: "_actions", label: "Actions", width: "10%" },
  ];

  /* ─── UI ─── */
  return (
    <>
      <Toaster position="top-right" />

      <h2 className="text-2xl font-semibold mb-6">Staff Management</h2>

      {/* header actions & search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="relative w-full max-w-lg">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, role, email, or phone…"
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
            <FiPlus /> Add Staff
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
            <strong>Active:</strong>{" "}
            {rows.filter((r) => r.is_active).length}
          </span>{" "}
          |{" "}
          <span>
            <strong>Showing:</strong> {filteredRows.length}
          </span>
        </div>
      )}

      {/* table */}
      {loading ? (
        <p className="p-4 text-gray-600">Loading staff…</p>
      ) : (
        <DataTable
          columns={cols}
          rows={rowsA}
          onBulkDelete={bulkDelete}
          defaultSort="full_name"
          showSearch={false} // external search above
        />
      )}

      {/* drawer */}
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={edit ? "Edit Staff" : "Add New Staff"}
        width="50%"
      >
        {drawer && (
          <StaffForm
            initial={edit}
            onSaved={() => {
              setDrawer(false);
              load();
              toast.success(edit ? "Staff updated!" : "Staff added!");
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

