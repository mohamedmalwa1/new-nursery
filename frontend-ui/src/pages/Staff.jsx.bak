import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import DataTable from "../components/DataTable";
import Drawer from "../components/Drawer";
import StaffForm from "../components/StaffForm";

export default function Staff() {
  const [rows, setRows] = useState([]);
  const [load, setLd] = useState(true);
  const [drawer, setDr] = useState(false);
  const [edit, setEdt] = useState(null);

  const fetchRows = () => {
    setLd(true);
    fetch("http://127.0.0.1:8000/api/staff/")
      .then(r => r.json())
      .then(d => {
        setRows(d);
        setLd(false);
      })
      .catch(() => {
        toast.error("Load failed");
        setLd(false);
      });
  };
  useEffect(fetchRows, []);

  const del = id =>
    fetch(`http://127.0.0.1:8000/api/staff/${id}/`, { method: "DELETE" })
      .then(r => {
        if (!r.ok) throw 0;
        toast.success("Deleted");
        fetchRows();
      })
      .catch(() => toast.error("Delete failed"));

  const bulkDelete = ids =>
    Promise.all(ids.map(id =>
      fetch(`http://127.0.0.1:8000/api/staff/${id}/`, { method: "DELETE" })))
      .then(() => {
        toast.success("Bulk delete done");
        fetchRows();
      });

  const handlePrint = () => {
    window.print();
  };

  const cols = [
    { key: "full_name", label: "Name" },
    { key: "role", label: "Role" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "is_active", label: "Active" },
    {
      key: "_actions", label: "", render: r => (
        <>
          <button className="text-blue-600 hover:underline mr-2"
                  onClick={() => { setEdt(r); setDr(true); }}>Edit</button>
          <button className="text-red-600 hover:underline"
                  onClick={() => del(r.id)}>Delete</button>
        </>
      )
    }
  ];

  return (
    <div>
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-4 border-b pb-2 flex justify-between items-center">
        Staff
        <div className="flex gap-2">
          <button onClick={handlePrint}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
            🖨 Print
          </button>
          <button onClick={() => { setEdt(null); setDr(true); }}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
            + Add
          </button>
        </div>
      </h2>

      {load
        ? <p className="p-4">Loading…</p>
        : <DataTable columns={cols} rows={rows} onBulkDelete={bulkDelete} />
      }

      <Drawer open={drawer} onClose={() => setDr(false)}
              title={edit ? "Edit Staff" : "Add Staff"}>
        {drawer && <StaffForm
          initial={edit}
          onSaved={() => { setDr(false); fetchRows(); }}
          onCancel={() => setDr(false)} />}
      </Drawer>
    </div>
  );
}

