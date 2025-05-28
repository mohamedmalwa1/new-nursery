import React from "react";
import ThemeToggle from "./ThemeToggle";   // <-- dark-mode switch

export default function Topbar() {
  return (
    <header className="bg-white dark:bg-gray-900 border-b shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        PP Nursery Management
      </h1>

      {/* dark / light switch */}
      <ThemeToggle />
    </header>
  );
}

