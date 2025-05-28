import Papa from "papaparse";

/**
 * exportToCSV(rows, columns, filename)
 * rows    = [{ full_name:'Ali', age:5 }, …]
 * columns = [{ key:'full_name', label:'Name' }, …]  (same as DataTable)
 */
export default function exportToCSV(rows, columns, filename = "export.csv") {
  const header = columns.map(c => c.label);
  const data   = rows.map(r => columns.map(c => r[c.key]));

  const csv = Papa.unparse({ fields: header, data });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url; link.download = filename; link.style.visibility = "hidden";
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

