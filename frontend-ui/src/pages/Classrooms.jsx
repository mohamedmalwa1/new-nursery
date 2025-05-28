import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import DataTable from "../components/DataTable";
import Drawer from "../components/Drawer";
import ClassroomForm from "../components/ClassroomForm";

export default function Classrooms() {
  const [rows,setRows]=useState([]); const [loading,setLoading]=useState(true);
  const [drawer,setDrawer]=useState(false); const [edit,setEdit]=useState(null);

  const load=()=>{ setLoading(true);
    fetch("http://127.0.0.1:8000/api/classrooms/")
      .then(r=>r.json()).then(d=>{setRows(d);setLoading(false);})
      .catch(()=>{toast.error("Load failed");setLoading(false);});
  };
  useEffect(load,[]);

  const del=id=>{
    if(!window.confirm("Delete classroom?")) return;
    fetch(`http://127.0.0.1:8000/api/classrooms/${id}/`,{method:"DELETE"})
      .then(r=>{if(!r.ok) throw new Error(); toast.success("Deleted"); load();})
      .catch(()=>toast.error("Delete failed"));
  };

  const columns=[
    {key:"name",label:"Name"},{key:"grade_level",label:"Grade"},
    {key:"capacity",label:"Capacity"},{key:"teacher",label:"Teacher"},
    {key:"actions",label:""},
  ];
  const rowsA=rows.map(r=>({...r,
    actions:<div className="flex gap-2">
      <button onClick={()=>{setEdit(r);setDrawer(true);}}
              className="text-blue-600 hover:underline">Edit</button>
      <button onClick={()=>del(r.id)}
              className="text-red-600 hover:underline">Delete</button>
    </div>
  }));

  return (
    <div>
      <Toaster position="top-right"/>
      <h2 className="text-2xl font-bold mb-4 border-b pb-2 flex justify-between">
        Classrooms
        <button onClick={()=>{setEdit(null);setDrawer(true);}}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">+ Add</button>
      </h2>
      {loading? <p className="p-4">Loading…</p>:<DataTable rows={rowsA} columns={columns}/>}

      <Drawer open={drawer} onClose={()=>setDrawer(false)}
              title={edit?"Edit Classroom":"Add Classroom"}>
        {drawer&&<ClassroomForm initial={edit} onSaved={()=>{setDrawer(false);load();}}
                                onCancel={()=>setDrawer(false)}/>}
      </Drawer>
    </div>
  );
}

