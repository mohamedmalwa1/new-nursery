import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import DataTable    from "../components/DataTable";
import Drawer       from "../components/Drawer";
import PaymentForm  from "../components/PaymentForm";

export default function Payments() {
  /* state */
  const [rows,   setRows] = useState([]);
  const [load,   setLd]   = useState(true);
  const [drawer, setDr]   = useState(false);
  const [edit,   setEdt]  = useState(null);

  /* fetch list */
  const fetchRows = () => {
    setLd(true);
    fetch("http://127.0.0.1:8000/api/payments/")
      .then(r => r.json())
      .then(d => { setRows(d); setLd(false); })
      .catch(() => { toast.error("Load failed"); setLd(false); });
  };
  useEffect(fetchRows, []);

  /* delete single */
  const del = id => {
    if (!window.confirm("Delete item?")) return;
    fetch(`http://127.0.0.1:8000/api/payments/${id}/`, { method: "DELETE" })
      .then(r => { if (!r.ok) throw new Error(); toast.success("Deleted"); fetchRows(); })
      .catch(() => toast.error("Delete failed"));
  };

  /* bulk delete */
  const bulkDelete = ids => {
    Promise.all(ids.map(id =>
      fetch(`http://127.0.0.1:8000/api/payments/${id}/`, { method: "DELETE" })))
      .then(() => { toast.success("Bulk delete done"); fetchRows(); })
      .catch(()  =>  toast.error("Some deletes failed"));
  };

  /* table columns */
  const cols = [
    { key: "invoice_id",  label: "Invoice" },
    { key: "invoice_student", label: "Student" },
    { key: "amount",      label: "Amount" },
    { key: "payment_date",label: "Date" },
    { key: "method",      label: "Method" },
    /* last col renders action buttons */
    {
      key: "_actions",
      label: "",
      render: r => (
        <>
          <button
            onClick={() => { setEdt(r); setDr(true); }}
            className="text-blue-600 hover:underline mr-2">Edit</button>
          <button
            onClick={() => del(r.id)}
            className="text-red-600 hover:underline">Delete</button>
        </>
      )
    }
  ];

  /* UI */
  return (
    <div>
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-4 border-b pb-2 flex justify-between">
        Payments
        <button
          onClick={() => { setEdt(null); setDr(true); }}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Add
        </button>
      </h2>

      {load ? (
        <p className="p-4">Loading…</p>
      ) : (
        <DataTable
          columns={cols}
          rows={rows}
          onBulkDelete={bulkDelete}
        />
      )}

      {/* drawer */}
      <Drawer
        open={drawer}
        onClose={() => setDr(false)}
        title={edit ? "Edit Payment" : "Add Payment"} >
        {drawer && (
          <PaymentForm
            initial={edit}
            onSaved={() => { setDr(false); fetchRows(); }}
            onCancel={() => setDr(false)}
          />
        )}
      </Drawer>
    </div>
  );
}

