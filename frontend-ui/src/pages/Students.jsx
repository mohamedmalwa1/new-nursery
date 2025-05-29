import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import DataTable   from "../components/DataTable";
import Drawer      from "../components/Drawer";
import StudentForm from "../components/StudentForm";

export default function Students() {
  const [rows, setRows]   = useState([]);
  const [loading, setLd]  = useState(true);
  const [drawer, setDr]   = useState(false);
  const [edit,   setEdt]  = useState(null);

  const load = () => {
    setLd(true);
    fetch("http://127.0.0.1:8000/api/students/")
      .then(r => r.json()).then(d => { setRows(d); setLd(false); })
      .catch(()=>{toast.error("Load failed"); setLd(false);});
  };
  useEffect(load, []);

  const del = id =>
    fetch(`http://127.0.0.1:8000/api/students/${id}/`, {method:"DELETE"})
      .then(r=>{if(!r.ok)throw 0; toast.success("Deleted"); load();})
      .catch(()=>toast.error("Delete failed"));

  const bulkDelete = ids =>
    Promise.all(ids.map(id =>
      fetch(`http://127.0.0.1:8000/api/students/${id}/`,{method:"DELETE"})))
      .then(()=>{toast.success("Bulk delete done"); load();});

  const cols = [
    {key:"full_name",   label:"Name"},
    {key:"classroom_name",label:"Class"},
    {key:"teacher_name", label:"Teacher"},
    {key:"age",         label:"Age"},
    {key:"is_active",   label:"Active"},
    {key:"_actions", label:"", render:r=>(
      <>
        <button className="text-blue-600 hover:underline mr-2"
                onClick={()=>{setEdt(r);setDr(true);}}>Edit</button>
        <button className="text-red-600 hover:underline"
                onClick={()=>del(r.id)}>Delete</button>
      </>
    )}
  ];

  return (
    <div>
      <Toaster position="top-right"/>
      <h2 className="text-2xl font-bold mb-4 border-b pb-2 flex justify-between">
        Students
        <button onClick={()=>{setEdt(null);setDr(true);}}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Add
        </button>
      </h2>

      {loading ? <p className="p-4">Loading…</p>
               : <DataTable columns={cols} rows={rows} onBulkDelete={bulkDelete}/>}

      <Drawer open={drawer} onClose={()=>setDr(false)}
              title={edit? "Edit Student":"Add Student"}>
        {drawer && <StudentForm initial={edit}
                  onSaved={()=>{setDr(false);load();}}
                  onCancel={()=>setDr(false)}/>}
      </Drawer>
    </div>
  );
}

