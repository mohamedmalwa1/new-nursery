import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";        // ← NAMED import for v4
import toast from "react-hot-toast";
import api from "../utils/api";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [access, setAccess]  = useState(localStorage.getItem("access")  || "");
  const [refresh, setRefresh] = useState(localStorage.getItem("refresh") || "");
  const [user, setUser]       = useState(() =>
    access ? jwtDecode(access) : null
  );

  /* attach / detach auth header */
  useEffect(() => {
    if (access) {
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [access]);

  /* --------------- helpers ---------------- */
  const login = async ({ username, password }) => {
    try {
      const r = await api.post("/auth/token/", { username, password });
      localStorage.setItem("access",  r.data.access);
      localStorage.setItem("refresh", r.data.refresh);
      setAccess(r.data.access);
      setRefresh(r.data.refresh);
      setUser(jwtDecode(r.data.access));
      toast.success("Welcome!");
      return true;
    } catch {
      toast.error("Invalid credentials");
      return false;
    }
  };

  const logout = () => {
    localStorage.clear();
    setAccess("");
    setRefresh("");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

