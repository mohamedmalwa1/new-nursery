import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Drawer from "../components/Drawer";
import InventoryForm from "../components/InventoryForm";

export default function Inventory() {
  const [rows, setRows]   = useState([]);
  const [loading, setLd]  = useState(true);
  const [drawer, setDr]   = useState(false);
  const [editRow, setEdt] = useState(null);

  /* expose low-stock count to other components (Sidebar) */
  useEffect(() => {
    window.__lowStockCount = rows.filter(r => r.quantity < 5).length;
    const event = new Event("lowStockUpdated");
    window.dispatchEvent(event);
  }, [rows]);

  /* load data */
  const load = () => {
    setLd(true);
    fetch("http://127.0.0.1:8000/api/inventory/")
      .then(r => r.json())
      .then(d => { setRows(d); setLd(false); })
      .catch(() => { toast.error("Load failed"); setLd(false); });
  };
  useEffect(load, []);

  /* delete */
  const del = id => {
    if (!window.confirm("Delete item?")) return;
    fetch(`http://127.0.0.1:8000/api/inventory/${id}/`, { method: "DELETE" })
      .then(r => { if (!r.ok) throw new Error(); toast.success("Deleted"); load(); })
      .catch(() => toast.error("Delete failed"));
  };

  return (
    <div>
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-4 border-b pb-2 flex justify-between">
        Inventory
        <button onClick={() => { setEdt(null); setDr(true); }}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Add
        </button>
      </h2>

      {loading ? (
        <p className="p-4">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-xl text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Category</th>
                <th className="px-3 py-2 text-left">Qty</th>
                <th className="px-3 py-2 text-left">Unit $</th>
                <th className="px-3 py-2 text-left">Custodian</th>
                <th className="px-3 py-2 text-left">Student</th>
                <th className="px-3 py-2 text-left">Restock</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className={r.quantity < 5 ? "bg-red-50" : ""}>
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2">{r.category}</td>
                  <td className="px-3 py-2">{r.quantity}</td>
                  <td className="px-3 py-2">{r.unit_price}</td>
                  <td className="px-3 py-2">{r.staff_name || "—"}</td>
                  <td className="px-3 py-2">{r.student_name || "—"}</td>
                  <td className="px-3 py-2">{r.last_restock || "—"}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => { setEdt(r); setDr(true); }}
                            className="text-blue-600 hover:underline mr-2">Edit</button>
                    <button onClick={() => del(r.id)}
                            className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={drawer} onClose={() => setDr(false)}
              title={editRow ? "Edit Item" : "Add Item"}>
        {drawer && (
          <InventoryForm
            initial={editRow}
            onSaved={() => { setDr(false); load(); }}
            onCancel={() => setDr(false)}
          />
        )}
      </Drawer>
    </div>
  );
}

