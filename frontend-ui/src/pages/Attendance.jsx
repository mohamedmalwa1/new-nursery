import React,{useEffect,useState} from "react";
import toast,{Toaster} from "react-hot-toast";
import DataTable from "../components/DataTable";
import Drawer from "../components/Drawer";
import AttendanceForm from "../components/AttendanceForm";

export default function Attendance() {
  const[rows,setRows]=useState([]),[loading,setLd]=useState(true);
  const[drawer,setDr]=useState(false),[edit,setEdt]=useState(null);

  const load=()=>{ setLd(true);
    fetch("http://127.0.0.1:8000/api/attendance/")
      .then(r=>r.json()).then(d=>{setRows(d);setLd(false);})
      .catch(()=>{toast.error("Load failed");setLd(false);});
  };
  useEffect(load,[]);

  const del=id=>{
    if(!window.confirm("Delete record?")) return;
    fetch(`http://127.0.0.1:8000/api/attendance/${id}/`,{method:"DELETE"})
      .then(r=>{if(!r.ok) throw new Error(); toast.success("Deleted"); load();})
      .catch(()=>toast.error("Delete failed"));
  };

  const cols=[
    {key:"date",label:"Date"},
    {key:"student_name",label:"Student"},
    {key:"staff_name",label:"Staff"},
    {key:"status",label:"Status"},
    {key:"check_in",label:"In"},
    {key:"check_out",label:"Out"},
    {key:"actions",label:""},
  ];

  const rowsA=rows.map(r=>({...r,
    actions:<div className="flex gap-2">
      <button onClick={()=>{setEdt(r);setDr(true);}}
              className="text-blue-600 hover:underline">Edit</button>
      <button onClick={()=>del(r.id)}
              className="text-red-600 hover:underline">Delete</button>
    </div>
  }));

  return (
    <div>
      <Toaster position="top-right"/>
      <h2 className="text-2xl font-bold mb-4 border-b pb-2 flex justify-between">
        Attendance
        <button onClick={()=>{setEdt(null);setDr(true);}}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Add
        </button>
      </h2>

      {loading ? <p className="p-4">Loading…</p> : <DataTable rows={rowsA} columns={cols}/>}

      <Drawer open={drawer} onClose={()=>setDr(false)}
              title={edit? "Edit Attendance":"Add Attendance"}>
        {drawer && (
          <AttendanceForm
            initial={edit}
            onSaved={()=>{setDr(false);load();}}
            onCancel={()=>setDr(false)}
          />
        )}
      </Drawer>
    </div>
  );
}

