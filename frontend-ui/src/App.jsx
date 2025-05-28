// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Layout            from "./components/Layout";

/* finished pages */
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
    <Router>
      <Routes>
        {/* shared sidebar/topbar layout */}
        <Route element={<Layout />}>
          {/* redirect root → dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* all working routes */}
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
    </Router>
  );
}

