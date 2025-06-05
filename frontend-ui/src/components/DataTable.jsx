// components/DataTable.jsx  – header actions at far right
import React, { useState } from "react";

export default function DataTable({
  columns,
  rows,
  defaultSort = "",
  onBulkDelete,
  showSearch = true,
}) {
  /* ─── state ─── */
  const [sortKey, setSortKey] = useState(defaultSort);
  const [sortDir, setSortDir] = useState("asc");
  const [selected, setSelected] = useState([]);
  const [q, setQ] = useState("");

  const toggleAll = (ck) => setSelected(ck ? rows.map((r) => r.id) : []);
  const toggleOne = (id) =>
    setSelected((old) =>
      old.includes(id) ? old.filter((x) => x !== id) : [...old, id]
    );

  /* ─── filter + sort ─── */
  const filtered = rows.filter((r) =>
    showSearch && q ? JSON.stringify(r).toLowerCase().includes(q) : true
  );

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const A = a[sortKey] ?? "";
    const B = b[sortKey] ?? "";
    if (A === B) return 0;
    return (A > B ? 1 : -1) * (sortDir === "asc" ? 1 : -1);
  });

  /* ─── csv ─── */
  const exportCSV = () => {
    const csv =
      columns.map((c) => `"${c.label}"`).join(",") +
      "\n" +
      rows
        .map((r) =>
          columns.map((c) => `"${(r[c.key] ?? "").toString()}"`).join(",")
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), {
      href: url,
      download: "export.csv",
    }).click();
    URL.revokeObjectURL(url);
  };

  /* ─── UI ─── */
  return (
    <div className="space-y-2">
      {/* header strip */}
      <div className="flex flex-wrap items-center gap-3">
        {showSearch && (
          <input
            className="datatable-search flex-1 min-w-[180px] max-w-xs
                       px-3 py-2 border border-gray-300 rounded-md
                       focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        )}

        {/* actions pushed right */}
        <div className="flex gap-2 ml-auto">
          {onBulkDelete && (
            <button
              disabled={selected.length === 0}
              onClick={() =>
                onBulkDelete(selected).then(() => setSelected([]))
              }
              className={`${
                selected.length
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white px-4 py-2 rounded-md`}
            >
              Delete ({selected.length})
            </button>
          )}

          <button
            onClick={exportCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {onBulkDelete && (
                <th className="px-3 py-2 text-left align-middle">
                  <input
                    type="checkbox"
                    checked={selected.length === rows.length && rows.length > 0}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </th>
              )}
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{ width: c.width }}
                  className="px-3 py-2 text-left align-middle cursor-pointer select-none"
                  onClick={() => {
                    if (sortKey === c.key) {
                      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    } else {
                      setSortKey(c.key);
                      setSortDir("asc");
                    }
                  }}
                >
                  {c.label}
                  {sortKey === c.key && (sortDir === "asc" ? " ↑" : " ↓")}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sorted.map((r) => (
              <tr
                key={r.id}
                className="odd:bg-white even:bg-gray-50 text-gray-800"
              >
                {onBulkDelete && (
                  <td className="px-3 py-2 align-middle">
                    <input
                      type="checkbox"
                      checked={selected.includes(r.id)}
                      onChange={() => toggleOne(r.id)}
                    />
                  </td>
                )}
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className="px-3 py-2 align-middle whitespace-nowrap"
                  >
                    {r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

