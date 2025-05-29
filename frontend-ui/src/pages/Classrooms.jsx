import React,{useEffect,useState} from "react";
import toast,{Toaster} from "react-hot-toast";

import DataTable      from "../components/DataTable";
import Drawer         from "../components/Drawer";
import ClassroomForm  from "../components/ClassroomForm";

export default function Classrooms() {
  const [rows,setRows]=useState([]),[ld,setLd]=useState(true);
  const [drawer,setDr]=useState(false),[edit,setEdt]=useState(null);

  const load=()=>{setLd(true);
    fetch("http://127.0.0.1:8000/api/classrooms/")
      .then(r=>r.json()).then(d=>{setRows(d);setLd(false);})
      .catch(()=>{toast.error("Load failed");setLd(false);});};
  useEffect(load,[]);

  const del=id=>fetch(`http://127.0.0.1:8000/api/classrooms/${id}/`,{method:"DELETE"})
      .then(r=>{if(!r.ok)throw 0;toast.success("Deleted");load();})
      .catch(()=>toast.error("Delete failed"));

  const bulkDelete=ids=>Promise.all(ids.map(id=>
    fetch(`http://127.0.0.1:8000/api/classrooms/${id}/`,{method:"DELETE"})))
      .then(()=>{toast.success("Bulk delete done");load();});

  const cols=[
    {key:"name",       label:"Name"},
    {key:"grade_level",label:"Grade"},
    {key:"capacity",   label:"Capacity"},
    {key:"teacher",    label:"Teacher"},
    {key:"_actions",   label:"",render:r=>(
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
        Classrooms
        <button onClick={()=>{setEdt(null);setDr(true);}}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">+ Add</button>
      </h2>

      {ld? <p className="p-4">Loading…</p>
          : <DataTable columns={cols} rows={rows} onBulkDelete={bulkDelete}/>}

      <Drawer open={drawer} onClose={()=>setDr(false)}
              title={edit?"Edit Classroom":"Add Classroom"}>
        {drawer && <ClassroomForm initial={edit}
                                  onSaved={()=>{setDr(false);load();}}
                                  onCancel={()=>setDr(false)}/>}
      </Drawer>
    </div>
  );
}

