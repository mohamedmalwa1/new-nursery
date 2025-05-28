import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function PayrollContractForm({ initial, onSaved, onCancel }) {
  const [staff, setStaff] = useState([]);
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/staff/").then(r => r.json()).then(setStaff);
  }, []);

  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    staff: "", base_salary: "", allowance: "",
    tax_percentage: "", max_advance: "",
    contract_start: "", contract_end: "",
    ...initial,
  });
  const update = (k, v) => setForm({ ...form, [k]: v });

  const submit = e => {
    e.preventDefault();
    const url = `http://127.0.0.1:8000/api/payroll/contracts/${isEdit ? initial.id + "/" : ""}`;
    fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(() => { toast.success(isEdit ? "Contract updated" : "Contract added"); onSaved(); })
      .catch(() => toast.error("Save failed"));
  };

  const L = ({ label, children }) => (<div><label className="block text-sm mb-1">{label}</label>{children}</div>);

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
        <L label="Tax %">
          <input type="number" step="0.01" value={form.tax_percentage}
                 onChange={e => update("tax_percentage", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
        <L label="Max advance">
          <input type="number" step="0.01" value={form.max_advance}
                 onChange={e => update("max_advance", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <L label="Contract start">
          <input type="date" value={form.contract_start}
                 onChange={e => update("contract_start", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
        <L label="Contract end">
          <input type="date" value={form.contract_end}
                 onChange={e => update("contract_end", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
      </div>

      <div className="flex gap-2">
        <button type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {isEdit ? "Update" : "Add"}
        </button>
        <button type="button" onClick={onCancel}
                className="flex-1 border rounded py-2">Cancel</button>
      </div>
    </form>
  );
}

