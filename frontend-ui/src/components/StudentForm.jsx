// src/components/StudentForm.jsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

/* helper */
const emptyForm = {
  first_name: "",
  last_name: "",
  gender: "M",
  date_of_birth: "",
  profile_image: null,
  classroom: "",
  teacher: "",
  enrollment_date: "",
  enrollment_history: "",
  uploaded_documents: null,
  evaluation_notes: "",
  is_active: true,
  allergies: "",
  medical_notes: "",
  guardian_name: "",
  guardian_contact: "",
  emergency_contact: "",
};

export default function StudentForm({ initial, onSaved, onCancel }) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({ ...emptyForm, ...initial });
  const [classrooms, setClassrooms] = useState([]);
  const [staff, setStaff] = useState([]);

  /* dropdown data -------------------------------------------------------- */
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/classrooms/").then(r => r.json()).then(setClassrooms);
    fetch("http://127.0.0.1:8000/api/staff/").then(r => r.json()).then(setStaff);
  }, []);

  /* helpers -------------------------------------------------------------- */
  const up = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const submit = e => {
    e.preventDefault();

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined) fd.append(k, v);
    });

    const url = `http://127.0.0.1:8000/api/students/${isEdit ? initial.id + "/" : ""}`;
    fetch(url, {
      method: isEdit ? "PUT" : "POST",
      body: fd,
    })
      .then(r => {
        if (!r.ok) throw 0;
        return r.json();
      })
      .then(() => {
        toast.success(isEdit ? "Student updated" : "Student added");
        onSaved();
      })
      .catch(() => toast.error("Save failed"));
  };

  const L = ({ label, children }) => (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      {children}
    </div>
  );

  /* JSX ------------------------------------------------------------------ */
  return (
    <form onSubmit={submit} className="space-y-6 overflow-y-auto max-h-[80vh] p-1 pr-2">

      {/* --- personal ----------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-4">
        <L label="First name">
          <input
            autoFocus
            value={form.first_name}
            onChange={e => up("first_name", e.target.value)}
            className="w-full border rounded px-3 py-1"
          />
        </L>

        <L label="Last name">
          <input
            value={form.last_name}
            onChange={e => up("last_name", e.target.value)}
            className="w-full border rounded px-3 py-1"
          />
        </L>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <L label="Gender">
          <select
            value={form.gender}
            onChange={e => up("gender", e.target.value)}
            className="w-full border rounded px-3 py-1"
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
        </L>

        <L label="Date of birth">
          <input
            type="date"
            value={form.date_of_birth}
            onChange={e => up("date_of_birth", e.target.value)}
            className="w-full border rounded px-3 py-1"
          />
        </L>

        <L label="Profile image">
          <input
            type="file"
            accept="image/*"
            onChange={e => up("profile_image", e.target.files[0] || null)}
            className="w-full border rounded px-3 py-1"
          />
        </L>
      </div>

      {/* --- academic ----------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-4">
        <L label="Classroom">
          <select
            value={form.classroom || ""}
            onChange={e => up("classroom", e.target.value || null)}
            className="w-full border rounded px-3 py-1"
          >
            <option value="">—</option>
            {classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </L>

        <L label="Teacher">
          <select
            value={form.teacher || ""}
            onChange={e => up("teacher", e.target.value || null)}
            className="w-full border rounded px-3 py-1"
          >
            <option value="">—</option>
            {staff.map(t => (
              <option key={t.id} value={t.id}>{t.full_name}</option>
            ))}
          </select>
        </L>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <L label="Enrollment date">
          <input
            type="date"
            value={form.enrollment_date}
            onChange={e => up("enrollment_date", e.target.value)}
            className="w-full border rounded px-3 py-1"
          />
        </L>

        <L label="Enrollment history">
          <input
            value={form.enrollment_history}
            onChange={e => up("enrollment_history", e.target.value)}
            className="w-full border rounded px-3 py-1"
            placeholder="Infant 2022 → Toddler 2023"
          />
        </L>
      </div>

      {/* --- docs & evaluation ------------------------------------------- */}
      <L label="Upload documents">
        <input
          type="file"
          multiple
          onChange={e => up("uploaded_documents", e.target.files)}
          className="w-full border rounded px-3 py-1"
        />
      </L>

      <L label="Evaluation notes">
        <textarea
          rows={2}
          value={form.evaluation_notes}
          onChange={e => up("evaluation_notes", e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </L>

      {/* --- health ------------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-4">
        <L label="Allergies">
          <input
            value={form.allergies}
            onChange={e => up("allergies", e.target.value)}
            className="w-full border rounded px-3 py-1"
          />
        </L>

        <L label="Medical notes">
          <input
            value={form.medical_notes}
            onChange={e => up("medical_notes", e.target.value)}
            className="w-full border rounded px-3 py-1"
          />
        </L>
      </div>

      {/* --- guardian ----------------------------------------------------- */}
      <div className="grid grid-cols-3 gap-4">
        <L label="Guardian name">
          <input
            value={form.guardian_name}
            onChange={e => up("guardian_name", e.target.value)}
            className="w-full border rounded px-3 py-1"
          />
        </L>

        <L label="Guardian contact">
          <input
            value={form.guardian_contact}
            onChange={e => up("guardian_contact", e.target.value)}
            className="w-full border rounded px-3 py-1"
          />
        </L>

        <L label="Emergency contact">
          <input
            value={form.emergency_contact}
            onChange={e => up("emergency_contact", e.target.value)}
            className="w-full border rounded px-3 py-1"
          />
        </L>
      </div>

      {/* --- status ------------------------------------------------------- */}
      <L label="Active">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={e => up("is_active", e.target.checked)}
        />
      </L>

      {/* --- buttons ------------------------------------------------------ */}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {isEdit ? "Update" : "Add"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border rounded py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

