// src/components/Topbar.jsx
import { Link } from "react-router-dom";

export default function Topbar() {
  return (
    <header className="flex items-center gap-4 bg-white border-b shadow px-6 py-3">
      {/* LOGO */}
      <Link to="/dashboard" className="inline-flex items-center">
        {/* Use <img> for files inside /public */}
        <img
          src="/lumino.png"
          alt="LUMINO"
          className="h-8 w-auto"
        />
      </Link>

      {/* optional app name text */}
      <span className="text-lg font-semibold text-gray-800"> Nursery Management</span>
    </header>
  );
}

