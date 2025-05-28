import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

/* categories from the Django model */
const CATEGORIES = [
  ["UNIFORM",   "Uniform"],
  ["BOOK",      "Book"],
  ["STATIONERY","Stationery"],
  ["TOY",       "Toy"],
  ["EQUIPMENT", "Equipment"],
  ["ASSET",     "Asset"],
];

export default function InventoryForm({ initial, onSaved, onCancel }) {
  /* dropdown lists */
  const [staff,    setStaff]    = useState([]);
  const [students, setStudents] = useState([]);

  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    name: "", category: "UNIFORM", quantity: "", unit_price: "",
    last_restock: "", staff_custodian: "", assigned_to_student: "",
    ...initial,
  });
  const update = (k, v) => setForm({ ...form, [k]: v });

  /* fetch dropdown data once */
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/staff/").then(r => r.json()).then(setStaff);
    fetch("http://127.0.0.1:8000/api/students/").then(r => r.json()).then(setStudents);
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    const url = `http://127.0.0.1:8000/api/inventory/${isEdit ? initial.id + "/" : ""}`;
    fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(() => { toast.success(isEdit ? "Item updated" : "Item added"); onSaved(); })
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
      <L label="Name">
        <input required value={form.name}
               onChange={e => update("name", e.target.value)}
               className="w-full border rounded px-3 py-1" />
      </L>

      <div className="grid grid-cols-2 gap-4">
        <L label="Category">
          <select value={form.category} onChange={e => update("category", e.target.value)}
                  className="w-full border rounded px-3 py-1">
            {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </L>

        <L label="Quantity">
          <input type="number" required value={form.quantity}
                 onChange={e => update("quantity", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
      </div>

      <L label="Unit price">
        <input type="number" step="0.01" required value={form.unit_price}
               onChange={e => update("unit_price", e.target.value)}
               className="w-full border rounded px-3 py-1" />
      </L>

      <L label="Last restock">
        <input type="date" value={form.last_restock}
               onChange={e => update("last_restock", e.target.value)}
               className="w-full border rounded px-3 py-1" />
      </L>

      <div className="grid grid-cols-2 gap-4">
        <L label="Staff custodian">
          <select value={form.staff_custodian || ""}
                  onChange={e => update("staff_custodian", e.target.value || null)}
                  className="w-full border rounded px-3 py-1">
            <option value="">—</option>
            {staff.map(s => (
              <option key={s.id} value={s.id}>{s.full_name}</option>
            ))}
          </select>
        </L>

        <L label="Assigned student">
          <select value={form.assigned_to_student || ""}
                  onChange={e => update("assigned_to_student", e.target.value || null)}
                  className="w-full border rounded px-3 py-1">
            <option value="">—</option>
            {students.map(st => (
              <option key={st.id} value={st.id}>{st.full_name}</option>
            ))}
          </select>
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

