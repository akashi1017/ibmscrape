import { Outlet, Navigate } from "react-router";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { useNavigate } from "react-router";

const AUTH_STORAGE_KEY = "mnist-auth-token";
const ROLE_STORAGE_KEY = "mnist-auth-role";

export type AuthRole = "user" | "admin";

function getStoredRole(): AuthRole | null {
  try {
    const role = localStorage.getItem(ROLE_STORAGE_KEY);
    return role === "user" || role === "admin" ? role : null;
  } catch {
    return null;
  }
}

function isAuthenticated(): boolean {
  try {
    return !!localStorage.getItem(AUTH_STORAGE_KEY);
  } catch {
    return false;
  }
}

export default function Root() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg, #09090b)" }}>
        <span className="dg-spinner dg-spinner--lg" aria-hidden />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Outlet />
      <Toaster richColors position="top-center" />
    </>
  );
}

/** Redirect to the right dashboard based on stored role */
export function RootIndex() {
  const role = localStorage.getItem("mnist-auth-role");
  if (role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/user" replace />;
}
