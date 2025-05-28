import React, { useState } from "react";
import toast from "react-hot-toast";

export default function StaffForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState({
    first_name: "", last_name: "",
    role: "TEACHER", hire_date: "",
    email: "", phone: "",
    document: null, is_active: true,
    ...initial,
  });
  const isEdit = !!initial?.id;
  const update = (k, v) => setForm({ ...form, [k]: v });

  const handleSubmit = e => {
    e.preventDefault();
    const url    = `http://127.0.0.1:8000/api/staff/${isEdit ? initial.id + "/" : ""}`;
    const method = isEdit ? "PUT" : "POST";

    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== "") body.append(k, v);
    });

    fetch(url, { method, body })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(() => { toast.success(isEdit ? "Staff updated" : "Staff added"); onSaved(); })
      .catch(()  => toast.error("Save failed"));
  };

  const L = ({ label, children }) => (
    <div><label className="block text-sm mb-1">{label}</label>{children}</div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <L label="First name">
          <input required value={form.first_name}
                 onChange={e => update("first_name", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
        <L label="Last name">
          <input required value={form.last_name}
                 onChange={e => update("last_name", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
      </div>

      <L label="Role">
        <select value={form.role}
                onChange={e => update("role", e.target.value)}
                className="w-full border rounded px-3 py-1">
          <option value="TEACHER">Teacher</option>
          <option value="ASSISTANT">Assistant</option>
          <option value="ADMIN">Administrator</option>
          <option value="SUPPORT">Support Staff</option>
        </select>
      </L>

      <L label="Hire date">
        <input type="date" value={form.hire_date}
               onChange={e => update("hire_date", e.target.value)}
               className="w-full border rounded px-3 py-1" />
      </L>

      <div className="grid grid-cols-2 gap-4">
        <L label="Email">
          <input type="email" value={form.email}
                 onChange={e => update("email", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
        <L label="Phone">
          <input value={form.phone}
                 onChange={e => update("phone", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
      </div>

      <L label="Document (PDF, image…)">
        <input type="file" onChange={e => update("document", e.target.files[0] || null)} />
      </L>

      <div className="flex items-center gap-2">
        <input id="is_active" type="checkbox" checked={form.is_active}
               onChange={e => update("is_active", e.target.checked)} />
        <label htmlFor="is_active" className="text-sm">Is active</label>
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

