// src/pages/Documents.jsx
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
import DocumentForm from "../components/DocumentForm";

export default function Documents() {
  /* ───────── state ───────── */
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [edit, setEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  /* ───────── fetch ───────── */
  const load = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/student-documents/")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setRows(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load documents");
        setLoading(false);
      });
  };
  useEffect(load, []);

  /* ───────── CRUD ───────── */
  const del = (id) => {
    if (!window.confirm("Delete this document?")) return;
    fetch(`http://127.0.0.1:8000/api/student-documents/${id}/`, {
      method: "DELETE",
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        toast.success("Document deleted");
        load();
      })
      .catch(() => toast.error("Delete failed"));
  };

  /* ───────── helpers ───────── */
  const handlePrint = () => window.print();
  const exportPDF = () =>
    window.open("http://127.0.0.1:8000/api/reports/documents/pdf/", "_blank");

  /* ───────── search filter ───────── */
  const q = searchTerm.toLowerCase();
  const filteredRows = rows.filter(
    (doc) =>
      doc.student_name?.toLowerCase().includes(q) ||
      doc.doc_type?.toLowerCase().includes(q) ||
      (doc.issue_date &&
        new Date(doc.issue_date).toLocaleDateString().includes(q))
  );

  /* ───────── table prep ───────── */
  const rowsA = filteredRows.map((r) => ({
    ...r,
    issue_fmt: r.issue_date ? new Date(r.issue_date).toLocaleDateString() : "",
    exp_fmt: r.expiration_date
      ? new Date(r.expiration_date).toLocaleDateString()
      : "",
    expired_fmt: r.is_expired ? "Yes" : "No",
    file_link: r.file ? (
      <a
        href={r.file}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-blue-600 hover:underline"
      >
        <FiDownload /> Download
      </a>
    ) : (
      "—"
    ),
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
    { key: "student_name", label: "Student", width: "22%" },
    { key: "doc_type", label: "Type", width: "17%" },
    { key: "issue_fmt", label: "Issue", width: "11%" },
    { key: "exp_fmt", label: "Expires", width: "11%" },
    { key: "expired_fmt", label: "Expired", width: "10%" },
    { key: "file_link", label: "File", width: "12%" },
    { key: "actions", label: "Actions", width: "17%" },
  ];

  /* ───────── UI ───────── */
  return (
    <>
      <Toaster position="top-right" />

      <h2 className="text-2xl font-semibold mb-6">Student Documents</h2>

      {/* header strip */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* search bar */}
        <div className="relative w-full max-w-lg">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student, type, date…"
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

        {/* action buttons */}
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
            <FiPlus /> Add Document
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
            <strong>Showing:</strong> {filteredRows.length}
          </span>
        </div>
      )}

      {/* table */}
      {loading ? (
        <p className="p-4 text-gray-600">Loading documents…</p>
      ) : (
        <DataTable
          columns={cols}
          rows={rowsA}
          onBulkDelete={null}        /* seldom bulk-delete student docs */
          defaultSort="issue_fmt"
          showSearch={false}         /* external search bar */
        />
      )}

      {/* drawer (add / edit) */}
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={edit ? "Edit Document" : "Add Document"}
        width="50%"
      >
        {drawer && (
          <DocumentForm
            initial={edit}
            onSaved={() => {
              setDrawer(false);
              load();
              toast.success(edit ? "Document updated!" : "Document added!");
            }}
            onCancel={() => setDrawer(false)}
          />
        )}
      </Drawer>

      {/* suppress buttons when printing */}
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

