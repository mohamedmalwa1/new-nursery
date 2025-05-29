import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import DataTable   from "../components/DataTable";
import Drawer      from "../components/Drawer";
import InventoryForm from "../components/InventoryForm";

export default function Inventory() {
  const [rows, setRows]   = useState([]);
  const [loading, setLd]  = useState(true);
  const [drawer, setDr]   = useState(false);
  const [editRow, setEdt] = useState(null);

  const load = () => {
    setLd(true);
    fetch("http://127.0.0.1:8000/api/inventory/")
      .then(r => r.json())
      .then(d => { setRows(d); setLd(false); })
      .catch(() => { toast.error("Load failed"); setLd(false); });
  };
  useEffect(load, []);

  /* bulk low-stock count for sidebar badge */
  useEffect(() => {
    window.__lowStockCount = rows.filter(r => r.quantity < 5).length;
    window.dispatchEvent(new Event("lowStockUpdated"));
  }, [rows]);

  /* build rowClass for red tint */
  const data = rows.map(r => ({
    ...r,
    __rowClass: r.quantity < 5 ? "bg-red-50" : ""
  }));

  /* delete helpers */
  const del = id =>
    fetch(`http://127.0.0.1:8000/api/inventory/${id}/`, { method:"DELETE"})
      .then(r => { if(!r.ok) throw 0; toast.success("Deleted"); load(); })
      .catch(()=> toast.error("Delete failed"));

  const bulkDelete = ids =>
    Promise.all(ids.map(id =>
      fetch(`http://127.0.0.1:8000/api/inventory/${id}/`, {method:"DELETE"})))
      .then(()=> { toast.success("Bulk delete done"); load(); });

  /* columns */
  const cols = [
    { key:"name",        label:"Name" },
    { key:"category",    label:"Category" },
    { key:"quantity",    label:"Qty" },
    { key:"unit_price",  label:"Unit $" },
    { key:"staff_name",  label:"Custodian" },
    { key:"student_name",label:"Student" },
    { key:"last_restock",label:"Restock" },
    { key:"_actions", label:"", render:r=>(
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
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-4 border-b pb-2 flex justify-between">
        Inventory
        <button onClick={()=>{setEdt(null);setDr(true);}}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Add
        </button>
      </h2>

      {loading ? <p className="p-4">Loading…</p>
               : <DataTable columns={cols} rows={data} onBulkDelete={bulkDelete}/>}

      <Drawer open={drawer} onClose={()=>setDr(false)}
              title={editRow ? "Edit Item":"Add Item"}>
        {drawer && (
          <InventoryForm
            initial={editRow}
            onSaved={()=>{setDr(false);load();}}
            onCancel={()=>setDr(false)}
          />
        )}
      </Drawer>
    </div>
  );
}

