import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import DataTable from "../components/DataTable";
import Drawer from "../components/Drawer";
import DocumentForm from "../components/DocumentForm";

export default function Documents() {
  const [rows, setRows] = useState([]), [loading, setLd] = useState(true);
  const [drawer, setDr] = useState(false), [edit, setEdt] = useState(null);

  const load = () => {
    setLd(true);
    fetch("http://127.0.0.1:8000/api/student-documents/")
      .then(r => r.json()).then(d => { setRows(d); setLd(false); })
      .catch(() => { toast.error("Load failed"); setLd(false); });
  };
  useEffect(load, []);

  const del = id => {
    if (!window.confirm("Delete document?")) return;
    fetch(`http://127.0.0.1:8000/api/student-documents/${id}/`, { method: "DELETE" })
      .then(r => { if (!r.ok) throw new Error(); toast.success("Deleted"); load(); })
      .catch(() => toast.error("Delete failed"));
  };

  const cols = [
    { key: "student_name", label: "Student" },
    { key: "doc_type",     label: "Type"    },
    { key: "issue_date",   label: "Issue"   },
    { key: "expiration_date", label: "Expires" },
    { key: "is_expired",   label: "Expired" },
    { key: "actions",      label: "" },
  ];

  const rowsA = rows.map(r => ({ ...r,
    is_expired: r.is_expired ? "Yes" : "No",
    actions: (
      <div className="flex gap-2">
        <button onClick={() => { setEdt(r); setDr(true); }}
                className="text-blue-600 hover:underline">Edit</button>
        <button onClick={() => del(r.id)}
                className="text-red-600 hover:underline">Delete</button>
      </div>
    ),
  }));

  return (
    <div>
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-4 border-b pb-2 flex justify-between">
        Student Documents
        <button onClick={() => { setEdt(null); setDr(true); }}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Add
        </button>
      </h2>

      {loading ? <p className="p-4">Loading…</p> : <DataTable rows={rowsA} columns={cols} />}

      <Drawer open={drawer} onClose={() => setDr(false)}
              title={edit ? "Edit Document" : "Add Document"}>
        {drawer && (
          <DocumentForm
            initial={edit}
            onSaved={() => { setDr(false); load(); }}
            onCancel={() => setDr(false)}
          />
        )}
      </Drawer>
    </div>
  );
}

