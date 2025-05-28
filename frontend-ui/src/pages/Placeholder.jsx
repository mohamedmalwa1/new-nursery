// Placeholder.jsx
import React from "react";

export default function Placeholder({ name = "Page" }) {
  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      <p className="text-xl">{name} – coming soon</p>
    </div>
  );
}

