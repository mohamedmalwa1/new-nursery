// src/components/Topbar.jsx
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Power } from "lucide-react";          // ← logout icon
import { AuthContext } from "../context/AuthContext";

export default function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b bg-white shadow-sm">
      {/* left – breadcrumbs or page title */}
      <h1 className="text-lg font-medium text-indigo-700">
        Nursery Management
      </h1>

      {/* right – user + logout */}
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-gray-600 hidden sm:block">
            {user.username}
          </span>
        )}

        <button
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-indigo-50 text-gray-600 hover:text-red-600 transition"
          title="Log out"
        >
          <Power className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

