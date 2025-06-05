// src/App.jsx  (full file)

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout          from "./components/Layout";
import ProtectedRoute  from "./components/ProtectedRoute";
import Login           from "./pages/Login";

import Dashboard         from "./pages/Dashboard";
import Students          from "./pages/Students";
import Staff             from "./pages/Staff";
import Classrooms        from "./pages/Classrooms";
import Attendance        from "./pages/Attendance";
import Medical           from "./pages/Medical";
import Invoices          from "./pages/Invoices";
import Payments          from "./pages/Payments";
import Inventory         from "./pages/Inventory";
import Documents         from "./pages/Documents";
import PayrollContracts  from "./pages/PayrollContracts";
import Salaries          from "./pages/Salaries";

export default function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/login" element={<Login />} />

      {/* everything else behind auth */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard"         element={<Dashboard        />} />
        <Route path="students"          element={<Students         />} />
        <Route path="staff"             element={<Staff            />} />
        <Route path="classrooms"        element={<Classrooms       />} />
        <Route path="attendance"        element={<Attendance       />} />
        <Route path="medical"           element={<Medical          />} />
        <Route path="invoices"          element={<Invoices         />} />
        <Route path="payments"          element={<Payments         />} />
        <Route path="inventory"         element={<Inventory        />} />
        <Route path="documents"         element={<Documents        />} />
        <Route path="payroll-contracts" element={<PayrollContracts />} />
        <Route path="salaries"          element={<Salaries         />} />
      </Route>
    </Routes>
  );
}

