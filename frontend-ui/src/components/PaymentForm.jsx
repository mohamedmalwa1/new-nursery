import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const METHODS = [
  ["CASH",     "Cash"],
  ["CARD",     "Credit / Debit"],
  ["TRANSFER", "Bank Transfer"],
];

export default function PaymentForm({ initial, onSaved, onCancel }) {
  const [invoices, setInvoices] = useState([]);
  const [form, setForm]         = useState({
    invoice: "", amount: "", payment_date: "", method: "CASH",
    transaction_id: "", ...initial,
  });
  const isEdit = !!initial?.id;
  const update = (k, v) => setForm({ ...form, [k]: v });

  /* fetch invoices once, for drop-down */
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/invoices/")
      .then(r => r.json())
      .then(setInvoices);
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    const url = `http://127.0.0.1:8000/api/payments/${isEdit ? initial.id + "/" : ""}`;
    fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(() => { toast.success(isEdit ? "Payment updated" : "Payment added"); onSaved(); })
      .catch(() => toast.error("Save failed"));
  };

  const L = ({ label, children }) => (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      {children}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <L label="Invoice">
        <select required value={form.invoice}
                onChange={e => update("invoice", e.target.value)}
                className="w-full border rounded px-3 py-1">
          <option value="">—</option>
          {invoices.map(inv => (
            <option key={inv.id} value={inv.id}>
              #{inv.id} – {inv.student_name} – {inv.amount}
            </option>
          ))}
        </select>
      </L>

      <L label="Amount">
        <input type="number" step="0.01" required value={form.amount}
               onChange={e => update("amount", e.target.value)}
               className="w-full border rounded px-3 py-1" />
      </L>

      <div className="grid grid-cols-2 gap-4">
        <L label="Payment date">
          <input type="date" required value={form.payment_date}
                 onChange={e => update("payment_date", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
        <L label="Method">
          <select value={form.method} onChange={e => update("method", e.target.value)}
                  className="w-full border rounded px-3 py-1">
            {METHODS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </L>
      </div>

      <L label="Transaction ID">
        <input value={form.transaction_id}
               onChange={e => update("transaction_id", e.target.value)}
               className="w-full border rounded px-3 py-1" />
      </L>

      <div className="flex gap-2">
        <button type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {isEdit ? "Update" : "Add"}
        </button>
        <button type="button" onClick={onCancel}
                className="flex-1 border rounded py-2">
          Cancel
        </button>
      </div>
    </form>
  );
}

