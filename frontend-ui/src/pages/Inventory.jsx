// src/pages/Inventory.jsx
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  FiSearch,
  FiX,
  FiPrinter,
  FiPlus,
  FiFileText,
  FiClock,
} from "react-icons/fi";

import DataTable from "../components/DataTable";
import Drawer from "../components/Drawer";
import InventoryForm from "../components/InventoryForm";

/* ——— simple history table inside a drawer ——— */
function HistoryTable({ rows }) {
  return (
    <table className="min-w-full text-sm border">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-2 py-1 text-left">Date</th>
          <th className="border px-2 py-1 text-left">Assigned&nbsp;To</th>
          <th className="border px-2 py-1 text-left">Notes</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((h) => (
          <tr key={h.id} className="odd:bg-white even:bg-gray-50">
            <td className="border px-2 py-1">
              {new Date(h.date_assigned).toLocaleDateString()}
            </td>
            <td className="border px-2 py-1">{h.assigned_to}</td>
            <td className="border px-2 py-1">{h.notes}</td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td colSpan={3} className="border px-4 py-2 text-center italic">
              No history found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default function Inventory() {
  /* ───── state ───── */
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [drawer, setDrawer] = useState(false);
  const [edit, setEdit] = useState(null);

  const [historyDrawer, setHistoryDrawer] = useState(false);
  const [historyRows, setHistoryRows] = useState([]);
  const [historyItem, setHistoryItem] = useState("");

  const [q, setQ] = useState("");

  /* ───── fetch ───── */
  const load = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/inventory/")
      .then((r) => r.json())
      .then((d) => {
        setRows(d);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load inventory");
        setLoading(false);
      });
  };
  useEffect(load, []);

  /* ───── CRUD helpers ───── */
  const del = (id) => {
    if (!window.confirm("Delete item?")) return;
    fetch(`http://127.0.0.1:8000/api/inventory/${id}/`, { method: "DELETE" })
      .then(load)
      .catch(() => toast.error("Delete failed"));
  };

  const bulkDelete = (ids) =>
    Promise.all(
      ids.map((id) =>
        fetch(`http://127.0.0.1:8000/api/inventory/${id}/`, {
          method: "DELETE",
        })
      )
    )
      .then(() => {
        toast.success("Bulk delete completed");
        load();
      })
      .catch(() => toast.error("Bulk delete failed"));

  /* ───── header buttons ───── */
  const handlePrint = () => window.print();
  const exportPDF = () =>
    window.open("http://127.0.0.1:8000/api/reports/inventory/pdf/", "_blank");

  /* ───── history drawer ───── */
  const openHistory = (item) => {
    setHistoryItem(item.name);
    fetch(`http://127.0.0.1:8000/inventory/${item.id}/history/`)
      .then((r) => r.json())
      .then((d) => {
        setHistoryRows(d);
        setHistoryDrawer(true);
      })
      .catch(() => toast.error("Could not load history"));
  };

  /* ───── external search ───── */
  const query = q.toLowerCase();
  const filtered = rows.filter(
    (i) =>
      i.name.toLowerCase().includes(query) ||
      i.category?.toLowerCase().includes(query) ||
      i.staff_name?.toLowerCase().includes(query) ||
      i.student_name?.toLowerCase().includes(query)
  );

  /* ───── table prep ───── */
  const rowsA = filtered.map((i) => ({
    ...i,
    remaining: i.remaining_quantity,
    total_value: i.total_value,
    restock_fmt: i.last_restock
      ? new Date(i.last_restock).toLocaleDateString()
      : "",

    actions: (
      <div className="flex gap-2">
        <button
          className="text-blue-600 hover:underline"
          onClick={() => {
            setEdit(i);
            setDrawer(true);
          }}
        >
          Edit
        </button>
        <button
          className="text-red-600 hover:underline"
          onClick={() => del(i.id)}
        >
          Delete
        </button>
        <button
          className="text-indigo-600 hover:underline"
          onClick={() => openHistory(i)}
        >
          History
        </button>
      </div>
    ),

    __rowClass:
      i.remaining_quantity !== undefined && i.remaining_quantity < 5
        ? "bg-red-50"
        : "",
  }));

  const cols = [
    { key: "name", label: "Name", width: "18%" },
    { key: "category", label: "Category", width: "12%" },
    { key: "quantity", label: "Qty", width: "7%" },
    { key: "remaining", label: "Left", width: "7%" },
    { key: "unit_price", label: "Unit $", width: "9%" },
    { key: "total_value", label: "Total $", width: "9%" },
    { key: "staff_name", label: "Custodian", width: "14%" },
    { key: "student_name", label: "Student", width: "14%" },
    { key: "restock_fmt", label: "Restock", width: "10%" },
    { key: "actions", label: "Actions", width: "10%" },
  ];

  /* ───── UI ───── */
  return (
    <>
      <Toaster position="top-right" />

      <h2 className="text-2xl font-semibold mb-6">Inventory</h2>

      {/* header strip */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* search */}
        <div className="relative w-full max-w-lg">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, category, custodian…"
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
            <FiPlus /> Add Item
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
            <strong>Low&nbsp;stock&nbsp;(&lt;5):</strong>{" "}
            {rows.filter((r) => r.remaining_quantity < 5).length}
          </span>{" "}
          |{" "}
          <span>
            <strong>Showing:</strong> {filtered.length}
          </span>
        </div>
      )}

      {/* table */}
      {loading ? (
        <p className="p-4 text-gray-600">Loading inventory…</p>
      ) : (
        <DataTable
          columns={cols}
          rows={rowsA}
          onBulkDelete={bulkDelete}
          defaultSort="name"
          showSearch={false}
        />
      )}

      {/* add / edit drawer */}
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={edit ? "Edit Item" : "Add Item"}
        width="50%"
      >
        {drawer && (
          <InventoryForm
            initial={edit}
            onSaved={() => {
              setDrawer(false);
              load();
              toast.success(edit ? "Item updated!" : "Item added!");
            }}
            onCancel={() => setDrawer(false)}
          />
        )}
      </Drawer>

      {/* history drawer */}
      <Drawer
        open={historyDrawer}
        onClose={() => setHistoryDrawer(false)}
        title={
          <span className="flex items-center gap-2">
            <FiClock className="shrink-0" />
            History — {historyItem}
          </span>
        }
        width="max-w-xl"
      >
        <div className="p-4">
          <HistoryTable rows={historyRows} />
        </div>
      </Drawer>
    </>
  );
}

