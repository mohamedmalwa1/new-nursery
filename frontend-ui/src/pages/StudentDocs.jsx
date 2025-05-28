import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import DataTable from "../components/DataTable";

export default function StudentDocs() {
  const [rows, setRows]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/student-documents/")
      .then(r => r.json())
      .then(d => { setRows(d); setLoading(false); })
      .catch(() => { toast.error("Failed to load documents"); setLoading(false); });
  }, []);

  const columns = [
    { key: "student_name", label: "Student" },
    { key: "doc_type",     label: "Type"    },
    { key: "issue_date",   label: "Issue Date" },
    { key: "is_expired",   label: "Expired" },
  ];

  return (
    <div>
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">Student Documents</h2>
      {loading ? <p className="p-4">Loading…</p> : <DataTable rows={rows} columns={columns} />}
    </div>
  );
}

