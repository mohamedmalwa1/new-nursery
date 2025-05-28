import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import DataTable from "../components/DataTable";
import Drawer from "../components/Drawer";
import SalaryForm from "../components/SalaryForm";

export default function Salaries() {
  const [rows,setRows]=useState([]); const[loading,setLd]=useState(true);
  const[drawer,setDr]=useState(false); const[edit,setEdt]=useState(null);

  const load=()=>{ setLd(true);
    fetch("http://127.0.0.1:8000/api/payroll/salaries/")
      .then(r=>r.json()).then(d=>{setRows(d);setLd(false);})
      .catch(()=>{toast.error("Load failed");setLd(false);});
  };
  useEffect(load,[]);

  const del=id=>{
    if(!window.confirm("Delete salary record?")) return;
    fetch(`http://127.0.0.1:8000/api/payroll/salaries/${id}/`,{method:"DELETE"})
      .then(r=>{if(!r.ok) throw new Error(); toast.success("Deleted"); load();})
      .catch(()=>toast.error("Delete failed"));
  };

  const cols=[
    {key:"staff_name", label:"Staff"},
    {key:"month",      label:"Month"},
    {key:"net_salary", label:"Net"},
    {key:"is_paid",    label:"Paid"},
    {key:"payment_date",label:"Pay Date"},
    {key:"actions",    label:""},
  ];

  const rowsA=rows.map(r=>({...r,
    is_paid: r.is_paid ? "Yes" : "No",
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
        Salary Records
        <button onClick={()=>{setEdt(null);setDr(true);}}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Add
        </button>
      </h2>

      {loading ? <p className="p-4">Loading…</p>
               : <DataTable rows={rowsA} columns={cols}/>}

      <Drawer open={drawer} onClose={()=>setDr(false)}
              title={edit? "Edit Salary":"Add Salary"}>
        {drawer && (
          <SalaryForm
            initial={edit}
            onSaved={()=>{setDr(false);load();}}
            onCancel={()=>setDr(false)}
          />
        )}
      </Drawer>
    </div>
  );
}

