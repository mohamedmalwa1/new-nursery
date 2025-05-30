import React,{useEffect,useState} from "react";
import toast,{Toaster} from "react-hot-toast";
import DataTable from "../components/DataTable";
import Drawer from "../components/Drawer";
import InvoiceForm from "../components/InvoiceForm";

export default function Invoices() {
  const[rows,setRows]=useState([]); const[loading,setLoading]=useState(true);
  const[drawer,setDrawer]=useState(false); const[edit,setEdit]=useState(null);

  const load=()=>{ setLoading(true);
    fetch("http://127.0.0.1:8000/api/invoices/")
      .then(r=>r.json()).then(d=>{setRows(d);setLoading(false);})
      .catch(()=>{toast.error("Load failed");setLoading(false);});
  };
  useEffect(load,[]);

  const del=id=>{
    if(!window.confirm("Delete invoice?")) return;
    fetch(`http://127.0.0.1:8000/api/invoices/${id}/`,{method:"DELETE"})
      .then(r=>{if(!r.ok)throw new Error();toast.success("Deleted");load();})
      .catch(()=>toast.error("Delete failed"));
  };

  const cols=[
    {key:"id",label:"ID"},
    {key:"student_name",label:"Student"},
    {key:"amount",label:"Amount"},
    {key:"status",label:"Status"},
    {key:"issue_date",label:"Issue"},
    {key:"due_date",label:"Due"},
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
        Invoices
        <button onClick={()=>{setEdit(null);setDrawer(true);}}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">+ Add</button>
      </h2>
      {loading? <p className="p-4">Loading…</p>:<DataTable rows={rowsA} columns={cols}/>}

      <Drawer open={drawer} onClose={()=>setDrawer(false)}
              title={edit?"Edit Invoice":"Add Invoice"}>
        {drawer&&<InvoiceForm initial={edit} onSaved={()=>{setDrawer(false);load();}}
                              onCancel={()=>setDrawer(false)}/>}
      </Drawer>
    </div>
  );
}

