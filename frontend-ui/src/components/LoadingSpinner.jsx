// src/components/LoadingSpinner.jsx
import React from "react";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-75"></div>
    </div>
  );
}

