import React, { useMemo, useState } from "react";
import clsx from "classnames";
import exportToCSV from "../utils/exportCSV";

export default function DataTable({ rows, columns }) {
  const [search, setSearch]   = useState("");
  const [sortKey, setSortKey] = useState(columns[0].key);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage]       = useState(1);
  const perPage = 10;

  // filter
  const filtered = useMemo(() =>
    rows.filter(r =>
      Object.values(r).join(" ").toLowerCase().includes(search.toLowerCase())
    ), [rows, search]);

  // sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const vA = a[sortKey] ?? "", vB = b[sortKey] ?? "";
      if (vA === vB) return 0;
      return (vA > vB ? 1 : -1) * (sortAsc ? 1 : -1);
    });
    return arr;
  }, [filtered, sortKey, sortAsc]);

  // pagination
  const pageCount = Math.max(1, Math.ceil(sorted.length / perPage));
  const current   = sorted.slice((page - 1) * perPage, page * perPage);
  const goto = p => setPage(Math.min(Math.max(1, p), pageCount));

  return (
    <div className="space-y-3">
      {/* top bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search…"
          className="w-full md:w-60 border rounded px-3 py-1 text-sm"
        />
        <button
          onClick={() => exportToCSV(sorted, columns)}
          className="px-3 py-1 border rounded text-sm bg-blue-600 text-white hover:bg-blue-700"
        >
          Download CSV
        </button>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 border rounded-xl text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => {
                    if (sortKey === col.key) setSortAsc(!sortAsc);
                    else { setSortKey(col.key); setSortAsc(true); }
                  }}
                  className="px-4 py-2 text-left cursor-pointer select-none"
                >
                  {col.label}
                  {sortKey === col.key && (sortAsc ? " ▲" : " ▼")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {current.map(row => (
              <tr key={row.id || Math.random()} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-2">
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {current.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-400">
                  No results
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* pager */}
      {pageCount > 1 && (
        <div className="flex gap-2 justify-center text-sm">
          <button onClick={() => goto(page - 1)} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-40">←</button>
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => goto(i + 1)}
              className={clsx("px-2 py-1 border rounded w-8",
                page === i + 1 ? "bg-blue-600 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700")}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => goto(page + 1)} disabled={page === pageCount} className="px-2 py-1 border rounded disabled:opacity-40">→</button>
        </div>
      )}
    </div>
  );
}

