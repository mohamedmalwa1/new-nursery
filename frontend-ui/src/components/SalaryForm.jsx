import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SalaryForm({ initial, onSaved, onCancel }) {
  const [staff, setStaff] = useState([]);
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/staff/").then(r => r.json()).then(setStaff);
    fetch("http://127.0.0.1:8000/api/payroll/contracts/").then(r => r.json()).then(setContracts);
  }, []);

  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    staff: "", contract: "", month: "",
    base_salary: "", allowance: "", advance_taken: "",
    deductions: "", tax_applied: "", net_salary: "",
    is_paid: false, payment_date: "", ...initial,
  });
  const update = (k, v) => setForm({ ...form, [k]: v });

  const submit = e => {
    e.preventDefault();
    const url = `http://127.0.0.1:8000/api/payroll/salaries/${isEdit ? initial.id + "/" : ""}`;
    fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(() => { toast.success(isEdit ? "Salary updated" : "Salary added"); onSaved(); })
      .catch(() => toast.error("Save failed"));
  };

  const L = ({ label, children }) => (
    <div><label className="block text-sm mb-1">{label}</label>{children}</div>
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      <L label="Staff">
        <select required value={form.staff}
                onChange={e => update("staff", e.target.value)}
                className="w-full border rounded px-3 py-1">
          <option value="">—</option>
          {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
        </select>
      </L>

      <L label="Contract">
        <select value={form.contract || ""}
                onChange={e => update("contract", e.target.value || null)}
                className="w-full border rounded px-3 py-1">
          <option value="">—</option>
          {contracts.map(c => (
            <option key={c.id} value={c.id}>
              {c.staff_name} – starts {c.contract_start}
            </option>
          ))}
        </select>
      </L>

      <L label="Month (first day)">
        <input type="date" required value={form.month}
               onChange={e => update("month", e.target.value)}
               className="w-full border rounded px-3 py-1" />
      </L>

      <div className="grid grid-cols-2 gap-4">
        <L label="Base salary">
          <input type="number" step="0.01" value={form.base_salary}
                 onChange={e => update("base_salary", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
        <L label="Allowance">
          <input type="number" step="0.01" value={form.allowance}
                 onChange={e => update("allowance", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <L label="Advance taken">
          <input type="number" step="0.01" value={form.advance_taken}
                 onChange={e => update("advance_taken", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
        <L label="Deductions">
          <input type="number" step="0.01" value={form.deductions}
                 onChange={e => update("deductions", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <L label="Tax %">
          <input type="number" step="0.01" value={form.tax_applied}
                 onChange={e => update("tax_applied", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
        <L label="Net salary">
          <input type="number" step="0.01" value={form.net_salary}
                 onChange={e => update("net_salary", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
      </div>

      <div className="flex items-center gap-2">
        <input id="is_paid" type="checkbox" checked={form.is_paid}
               onChange={e => update("is_paid", e.target.checked)} />
        <label htmlFor="is_paid" className="text-sm">Is paid</label>
      </div>

      <L label="Payment date">
        <input type="date" value={form.payment_date}
               onChange={e => update("payment_date", e.target.value)}
               className="w-full border rounded px-3 py-1" />
      </L>

      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {isEdit ? "Update" : "Add"}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 border rounded py-2">
          Cancel
        </button>
      </div>
    </form>
  );
}

