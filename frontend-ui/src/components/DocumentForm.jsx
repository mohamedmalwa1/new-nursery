import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const TYPES = [
  ["BIRTH_CERT", "Birth Certificate"],
  ["MEDICAL",    "Medical Record"],
  ["CONSENT",    "Consent Form"],
  ["OTHER",      "Other"],
];

export default function DocumentForm({ initial, onSaved, onCancel }) {
  const [students, setStudents] = useState([]);
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/students/").then(r => r.json()).then(setStudents);
  }, []);

  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    student: "", doc_type: "BIRTH_CERT",
    issue_date: "", expiration_date: "",
    file: null,
    ...initial,
  });
  const update = (k, v) => setForm({ ...form, [k]: v });

  const submit = e => {
    e.preventDefault();
    const url = `http://127.0.0.1:8000/api/student-documents/${isEdit ? initial.id + "/" : ""}`;
    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== "") body.append(k, v);
    });
    fetch(url, { method: isEdit ? "PUT" : "POST", body })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(() => { toast.success(isEdit ? "Document updated" : "Document added"); onSaved(); })
      .catch(() => toast.error("Save failed"));
  };

  const L = ({ label, children }) => (<div><label className="block text-sm mb-1">{label}</label>{children}</div>);

  return (
    <form onSubmit={submit} className="space-y-4">
      <L label="Student">
        <select required value={form.student}
                onChange={e => update("student", e.target.value)}
                className="w-full border rounded px-3 py-1">
          <option value="">—</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
        </select>
      </L>

      <div className="grid grid-cols-2 gap-4">
        <L label="Type">
          <select value={form.doc_type} onChange={e => update("doc_type", e.target.value)}
                  className="w-full border rounded px-3 py-1">
            {TYPES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </L>
        <L label="File">
          <input type="file" onChange={e => update("file", e.target.files[0] || null)} />
        </L>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <L label="Issue date">
          <input type="date" value={form.issue_date}
                 onChange={e => update("issue_date", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
        <L label="Expiration date">
          <input type="date" value={form.expiration_date}
                 onChange={e => update("expiration_date", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {isEdit ? "Update" : "Add"}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 border rounded py-2">Cancel</button>
      </div>
    </form>
  );
}

