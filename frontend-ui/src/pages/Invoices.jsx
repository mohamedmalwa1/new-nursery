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
import InvoiceForm from "../components/InvoiceForm";

export default function Invoices() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [edit, setEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const load = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/invoices/")
      .then((r) => r.json())
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

  const del = (id) => {
    if (!window.confirm("Delete invoice?")) return;
    fetch(`http://127.0.0.1:8000/api/invoices/${id}/`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) throw new Error();
        toast.success("Deleted");
        load();
      })
      .catch(() => toast.error("Delete failed"));
  };

  const handlePrint = () => window.print();
  const exportAllPDF = () =>
    window.open("http://127.0.0.1:8000/api/reports/invoices/pdf/", "_blank");

  /* search filter */
  const q = searchTerm.toLowerCase();
  const filteredRows = rows.filter(
    (i) =>
      String(i.id).includes(q) ||
      i.student_name?.toLowerCase().includes(q) ||
      i.status?.toLowerCase().includes(q) ||
      (i.issue_date && new Date(i.issue_date).toLocaleDateString().includes(q))
  );

  /* table rows */
  const rowsA = filteredRows.map((r) => ({
    ...r,
    issue_fmt: r.issue_date ? new Date(r.issue_date).toLocaleDateString() : "",
    due_fmt: r.due_date ? new Date(r.due_date).toLocaleDateString() : "",
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
        <button
          className="text-green-600 hover:underline"
          onClick={() =>
            window.open(
              `http://127.0.0.1:8000/api/reports/invoices/${r.id}/pdf/`,
              "_blank"
            )
          }
        >
          PDF
        </button>
      </div>
    ),
  }));

  const cols = [
    { key: "id", label: "ID", width: "6%" },
    { key: "student_name", label: "Student", width: "22%" },
    { key: "amount", label: "Amount", width: "12%" },
    { key: "status", label: "Status", width: "10%" },
    { key: "issue_fmt", label: "Issue", width: "12%" },
    { key: "due_fmt", label: "Due", width: "12%" },
    { key: "_actions", label: "Actions", width: "16%" },
  ];

  return (
    <>
      <Toaster position="top-right" />

      <h2 className="text-2xl font-semibold mb-6">Invoice Management</h2>

      {/* header strip */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* search */}
        <div className="relative w-full max-w-lg">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ID, student, status, date…"
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
            <FiPlus /> Add Invoice
          </button>
          <button
            onClick={exportAllPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition"
          >
            <FiFileText /> Export All PDF
          </button>
        </div>
      </div>

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

      {loading ? (
        <p className="p-4 text-gray-600">Loading invoices…</p>
      ) : (
        <DataTable
          columns={cols}
          rows={rowsA}
          onBulkDelete={null}       /* usually single deletes only */
          defaultSort="id"
          showSearch={false}
        />
      )}

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={edit ? "Edit Invoice" : "Add Invoice"}
        width="50%"
      >
        {drawer && (
          <InvoiceForm
            initial={edit}
            onSaved={() => {
              setDrawer(false);
              load();
              toast.success(edit ? "Invoice updated!" : "Invoice added!");
            }}
            onCancel={() => setDrawer(false)}
          />
        )}
      </Drawer>
    </>
  );
}

