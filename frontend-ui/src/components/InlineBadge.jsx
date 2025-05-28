export default function InlineBadge({ children, color = "red" }) {
  const cls = {
    red: "bg-red-600",
    blue: "bg-blue-600",
  }[color];
  return (
    <span className={`${cls} text-white text-[10px] px-1.5 py-0.5 rounded-full`}>
      {children}
    </span>
  );
}

