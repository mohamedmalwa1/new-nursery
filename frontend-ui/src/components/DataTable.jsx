// src/components/DataTable.jsx
import { useState, useMemo } from "react";
import * as XLSX from "xlsx";

/** col = { key, label, render? } */
export default function DataTable({ columns, rows, onBulkDelete }) {
  /* search + sort */
  const [query, setQuery]     = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [asc, setAsc]         = useState(true);

  /* selection */
  const [sel, setSel] = useState([]);              // ids array

  /* filter + sort result */
  const data = useMemo(() => {
    let out = rows;
    if (query)
      out = out.filter(r =>
        JSON.stringify(r).toLowerCase().includes(query.toLowerCase()));
    if (sortKey)
      out = [...out].sort((a, b) =>
        asc ? a[sortKey] > b[sortKey] ? 1 : -1
            : a[sortKey] < b[sortKey] ? 1 : -1);
    return out;
  }, [rows, query, sortKey, asc]);

  /* bulk export */
  const exportCSV = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      data.map(r => Object.fromEntries(columns.map(c => [c.label, r[c.key]])))
    );
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "export.xlsx");
  };

  const toggleSel = id =>
    setSel(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id]);

  /* UI */
  return (
    <>
      {/* toolbar */}
      <div className="flex items-center justify-between mb-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search…"
          className="border px-2 py-1 rounded text-sm"
        />

        <div className="space-x-2">
          <button
            disabled={!sel.length}
            onClick={() => onBulkDelete(sel)}
            className={`px-3 py-1 rounded text-sm 
                        ${sel.length ? "bg-red-600 text-white" : "bg-gray-300 text-gray-500"}`}>
            Delete&nbsp;({sel.length})
          </button>
          <button onClick={exportCSV}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm">
            Export&nbsp;CSV
          </button>
        </div>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-xl text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3"><input type="checkbox"
                    checked={sel.length === data.length && data.length}
                    onChange={e => setSel(e.target.checked ? data.map(r=>r.id) : [])}/></th>
              {columns.map(col => (
                <th key={col.key}
                    className="px-3 py-2 text-left cursor-pointer select-none"
                    onClick={() => { setAsc(sortKey === col.key ? !asc : true); setSortKey(col.key);} }>
                  {col.label}{sortKey===col.key && (asc? " ▲":" ▼")}
                </th>
              ))}
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {data.map(r => (
              <tr key={r.id} className={r.__rowClass || ""}>
                <td className="px-3"><input type="checkbox"
                      checked={sel.includes(r.id)} onChange={()=>toggleSel(r.id)}/></td>
                {columns.map(col => (
                  <td key={col.key} className="px-3 py-2">
                    {col.render ? col.render(r) : r[col.key]}
                  </td>
                ))}
                {/* caller can inject Edit/Delete buttons via render */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

