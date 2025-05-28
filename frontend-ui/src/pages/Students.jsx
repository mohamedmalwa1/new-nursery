import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import DataTable from "../components/DataTable";
import Drawer from "../components/Drawer";
import StudentForm from "../components/StudentForm";

export default function Students() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  // load list
  const load = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/students/")
      .then(r => r.json())
      .then(d => { setRows(d); setLoading(false); })
      .catch(() => { toast.error("Load failed"); setLoading(false); });
  };
  useEffect(load, []);

  // columns + action buttons
  const columns = [
    { key: "full_name",      label: "Name" },
    { key: "classroom_name", label: "Class" },
    { key: "teacher_name",   label: "Teacher" },
    { key: "age",            label: "Age" },
    { key: "actions",        label: "" },
  ];
  const rowsWithActions = rows.map(r => ({
    ...r,
    actions: (
      <div className="flex gap-2">
        <button onClick={() => { setEditRow(r); setDrawerOpen(true); }} className="text-blue-600 hover:underline">Edit</button>
        <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline">Delete</button>
      </div>
    ),
  }));

  const handleDelete = id => {
    if (!window.confirm("Delete this student?")) return;
    fetch(`http://127.0.0.1:8000/api/students/${id}/`, { method: "DELETE" })
      .then(r => { if (!r.ok) throw new Error(); toast.success("Deleted"); load(); })
      .catch(() => toast.error("Delete failed"));
  };

  return (
    <div>
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-4 border-b pb-2 flex justify-between items-center">
        Students
        <button onClick={() => { setEditRow(null); setDrawerOpen(true); }} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Add
        </button>
      </h2>

      {loading
        ? <p className="p-4">Loading…</p>
        : <DataTable rows={rowsWithActions} columns={columns} />}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editRow ? "Edit Student" : "Add Student"}
      >
        {drawerOpen && (
          <StudentForm
            initial={editRow}
            onSaved={() => { setDrawerOpen(false); load(); }}
            onCancel={() => setDrawerOpen(false)}
          />
        )}
      </Drawer>
    </div>
  );
}

