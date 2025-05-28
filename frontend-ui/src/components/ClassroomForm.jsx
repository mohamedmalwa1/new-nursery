import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const GRADES = [
  ["INFANT",  "Infant (0-1)"],
  ["TODDLER", "Toddler (1-2)"],
  ["PRESCHOOL", "Preschool (3-4)"],
  ["PRE_K",   "Pre-K (4-5)"],
];

export default function ClassroomForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: "", grade_level: "INFANT", capacity: "", teacher: "",
    ...initial,
  });
  const isEdit = !!initial?.id;
  const update = (k, v)=> setForm({ ...form, [k]: v });

  const handleSubmit = e => {
    e.preventDefault();
    const url = `http://127.0.0.1:8000/api/classrooms/${isEdit ? initial.id + "/" : ""}`;
    const body = JSON.stringify(form);
    fetch(url, { method: isEdit ? "PUT":"POST", headers:{'Content-Type':'application/json'}, body })
      .then(r => { if(!r.ok) throw new Error(); return r.json(); })
      .then(()=>{ toast.success(isEdit? "Classroom updated":"Classroom added"); onSaved(); })
      .catch(()=> toast.error("Save failed"));
  };

  const L = ({label,children})=> <div><label className="block text-sm mb-1">{label}</label>{children}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <L label="Name">
        <input required value={form.name} onChange={e=>update("name",e.target.value)}
               className="w-full border rounded px-3 py-1"/>
      </L>

      <L label="Grade level">
        <select value={form.grade_level} onChange={e=>update("grade_level",e.target.value)}
                className="w-full border rounded px-3 py-1">
          {GRADES.map(([v,l])=> <option key={v} value={v}>{l}</option>)}
        </select>
      </L>

      <div className="grid grid-cols-2 gap-4">
        <L label="Capacity">
          <input type="number" value={form.capacity}
                 onChange={e=>update("capacity",e.target.value)}
                 className="w-full border rounded px-3 py-1"/>
        </L>
        <L label="Teacher (name)">
          <input value={form.teacher} onChange={e=>update("teacher",e.target.value)}
                 className="w-full border rounded px-3 py-1"/>
        </L>
      </div>

      <div className="flex gap-2">
        <button type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {isEdit?"Update":"Add"}
        </button>
        <button type="button" onClick={onCancel}
                className="flex-1 border rounded py-2">Cancel</button>
      </div>
    </form>
  );
}

