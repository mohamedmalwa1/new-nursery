// src/components/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar  from "./Topbar";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* sidebar */}
      <Sidebar />

      {/* right-hand column (topbar + page content) */}
      <div className="flex flex-col flex-1">
        <Topbar />

        {/* page wrapper → provides outer padding */}
        <div className="page flex-1 overflow-y-auto">
          {/* card wrapper → white rounded panel */}
          <div className="card">
            <Outlet />   {/* ← your Students / Staff / … component */}
          </div>
        </div>
      </div>
    </div>
  );
}

