// src/components/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar  from "./Topbar";
import { Toaster } from "react-hot-toast";     // ← NEW

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* left navigation */}
      <Sidebar />

      {/* right side: topbar + page content */}
      <div className="flex flex-col flex-1">
        <Topbar />

        {/* global toast pop-ups */}
        <Toaster position="top-right" />       {/* ← NEW */}

        {/* main scrollable area */}
        <div className="page flex-1 overflow-y-auto">
          {/* white card wrapper for every page */}
          <div className="card">
            <Outlet />   {/* Students / Staff / etc. render here */}
          </div>
        </div>
      </div>
    </div>
  );
}

