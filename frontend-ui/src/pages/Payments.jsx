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
import PaymentForm from "../components/PaymentForm";

export default function Payments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [edit, setEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  /* fetch */
  const load = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/payments/")
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

  /* delete */
  const del = (id) => {
    if (!window.confirm("Delete payment?")) return;
    fetch(`http://127.0.0.1:8000/api/payments/${id}/`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) throw new Error();
        toast.success("Deleted");
        load();
      })
      .catch(() => toast.error("Delete failed"));
  };

  const bulkDelete = (ids) =>
    Promise.all(
      ids.map((id) =>
        fetch(`http://127.0.0.1:8000/api/payments/${id}/`, { method: "DELETE" })
      )
    ).then(() => {
      toast.success("Bulk delete done");
      load();
    });

  /* header actions */
  const handlePrint = () => window.print();
  const exportPDF = () =>
    window.open("http://127.0.0.1:8000/api/reports/payments/pdf/", "_blank");

  /* search filter */
  const q = searchTerm.toLowerCase();
  const filteredRows = rows.filter(
    (p) =>
      String(p.invoice_id).includes(q) ||
      p.invoice_student?.toLowerCase().includes(q) ||
      p.method?.toLowerCase().includes(q) ||
      (p.amount && String(p.amount).includes(q)) ||
      (p.payment_date &&
        new Date(p.payment_date).toLocaleDateString().includes(q))
  );

  /* table data */
  const rowsA = filteredRows.map((r) => ({
    ...r,
    payment_date_fmt: r.payment_date
      ? new Date(r.payment_date).toLocaleDateString()
      : "",
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
    { key: "invoice_id", label: "Invoice", width: "10%" },
    { key: "invoice_student", label: "Student", width: "22%" },
    { key: "amount", label: "Amount", width: "12%" },
    { key: "method", label: "Method", width: "14%" },
    { key: "payment_date_fmt", label: "Date", width: "14%" },
    { key: "_actions", label: "Actions", width: "12%" },
  ];

  return (
    <>
      <Toaster position="top-right" />

      <h2 className="text-2xl font-semibold mb-6">Payment Management</h2>

      {/* header strip */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* search */}
        <div className="relative w-full max-w-lg">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoice, student, method, date…"
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
            <FiPlus /> Add Payment
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
        <p className="p-4 text-gray-600">Loading payments…</p>
      ) : (
        <DataTable
          columns={cols}
          rows={rowsA}
          onBulkDelete={bulkDelete}
          defaultSort="payment_date_fmt"
          showSearch={false}
        />
      )}

      {/* drawer */}
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={edit ? "Edit Payment" : "Add Payment"}
        width="50%"
      >
        {drawer && (
          <PaymentForm
            initial={edit}
            onSaved={() => {
              setDrawer(false);
              load();
              toast.success(edit ? "Payment updated!" : "Payment added!");
            }}
            onCancel={() => setDrawer(false)}
          />
        )}
      </Drawer>
    </>
  );
}

