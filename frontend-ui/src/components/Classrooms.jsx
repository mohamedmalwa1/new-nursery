import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function StudentForm({ initial, onSaved, onCancel }) {
  /* ─── base state (all fields) ─── */
  const [form, setForm] = useState({
    first_name: "",           last_name: "",
    date_of_birth: "",        gender: "M",
    profile_image: null,      classroom: "",
    teacher: "",              enrollment_date: "",
    enrollment_history: "",   uploaded_documents: null,
    evaluation_notes: "",     is_active: true,

    allergies: "",            medical_notes: "",
    guardian_name: "",        guardian_contact: "",
    emergency_contact: "",

    ...initial,
  });
  const isEdit = !!initial?.id;

  /* ─── dropdown data ─── */
  const [classrooms, setClassrooms] = useState([]);
  const [teachers,   setTeachers]   = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/classrooms/").then(r => r.json()).then(setClassrooms);
    fetch("http://127.0.0.1:8000/api/staff/").then(r => r.json()).then(setTeachers);
  }, []);

  /* ─── helpers ─── */
  const update     = (k, v) => setForm({ ...form, [k]: v });
  const handleFile = (k, e) => update(k, e.target.files.length ? e.target.files[0] : null);

  /* ─── submit ─── */
  const handleSubmit = (e) => {
    e.preventDefault();
    const url    = `http://127.0.0.1:8000/api/students/${isEdit ? initial.id + "/" : ""}`;
    const method = isEdit ? "PUT" : "POST";

    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== "") body.append(k, v);
    });

    fetch(url, { method, body })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(() => { toast.success(isEdit ? "Student updated" : "Student added"); onSaved(); })
      .catch(() => toast.error("Save failed"));
  };

  /* ─── field component for brevity ─── */
  const L = ({ label, children }) => (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      {children}
    </div>
  );

  /* ─── render ─── */
  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* personal */}
      <div className="grid grid-cols-2 gap-4">
        <L label="First name">
          <input required value={form.first_name} onChange={e => update("first_name", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
        <L label="Last name">
          <input required value={form.last_name} onChange={e => update("last_name", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <L label="Date of birth">
          <input type="date" required value={form.date_of_birth}
                 onChange={e => update("date_of_birth", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
        <L label="Gender">
          <select value={form.gender} onChange={e => update("gender", e.target.value)}
                  className="w-full border rounded px-3 py-1">
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
        </L>
      </div>

      {/* profile image & docs */}
      <L label="Profile image">
        <input type="file" accept="image/*" onChange={e => handleFile("profile_image", e)} />
      </L>
      <L label="Uploaded documents (PDF / ZIP / …)">
        <input type="file" multiple onChange={e => handleFile("uploaded_documents", e)} />
      </L>

      {/* classroom & teacher */}
      <div className="grid grid-cols-2 gap-4">
        <L label="Classroom">
          <select value={form.classroom || ""} onChange={e => update("classroom", e.target.value || null)}
                  className="w-full border rounded px-3 py-1">
            <option value="">—</option>
            {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </L>
        <L label="Teacher">
          <select value={form.teacher || ""} onChange={e => update("teacher", e.target.value || null)}
                  className="w-full border rounded px-3 py-1">
            <option value="">—</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
          </select>
        </L>
      </div>

      {/* enrollment meta */}
      <L label="Enrollment date">
        <input type="date" value={form.enrollment_date}
               onChange={e => update("enrollment_date", e.target.value)}
               className="w-full border rounded px-3 py-1" />
      </L>
      <L label="Enrollment history">
        <textarea value={form.enrollment_history} rows={2}
                  onChange={e => update("enrollment_history", e.target.value)}
                  className="w-full border rounded px-3 py-2" />
      </L>
      <L label="Evaluation notes">
        <textarea value={form.evaluation_notes} rows={2}
                  onChange={e => update("evaluation_notes", e.target.value)}
                  className="w-full border rounded px-3 py-2" />
      </L>

      {/* medical */}
      <div className="grid grid-cols-2 gap-4">
        <L label="Allergies">
          <input value={form.allergies} onChange={e => update("allergies", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
        <L label="Medical notes">
          <input value={form.medical_notes} onChange={e => update("medical_notes", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
      </div>

      {/* guardian */}
      <div className="grid grid-cols-2 gap-4">
        <L label="Guardian name">
          <input value={form.guardian_name} onChange={e => update("guardian_name", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
        <L label="Guardian contact">
          <input value={form.guardian_contact} onChange={e => update("guardian_contact", e.target.value)}
                 className="w-full border rounded px-3 py-1" />
        </L>
      </div>
      <L label="Emergency contact">
        <input value={form.emergency_contact} onChange={e => update("emergency_contact", e.target.value)}
               className="w-full border rounded px-3 py-1" />
      </L>

      {/* active flag */}
      <div className="flex items-center gap-2">
        <input id="is_active" type="checkbox" checked={form.is_active}
               onChange={e => update("is_active", e.target.checked)} />
        <label htmlFor="is_active" className="text-sm">Is active</label>
      </div>

      {/* buttons */}
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

