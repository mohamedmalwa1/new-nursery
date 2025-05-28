// quick coloured card for a single metric
export default function KpiCard({ title, value, color = "blue" }) {
  const palette = {
    blue:  "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    indigo:"bg-indigo-50 text-indigo-700",
    orange:"bg-orange-50 text-orange-700",
  }[color];

  return (
    <div className={`p-4 rounded-xl shadow-sm ${palette}`}>
      <p className="text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

