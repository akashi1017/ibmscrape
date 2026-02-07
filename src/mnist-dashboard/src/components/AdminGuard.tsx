import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import { toast } from "sonner";
import { LoginPage, type LoginCredentials } from "./LoginPage";

const ADMIN_STORAGE_KEY = "mnist-admin-auth";

// Demo credentials – change or use env (e.g. VITE_ADMIN_PASSWORD) for production
const ADMIN_PASSWORD = "admin";

function isAdminAuthenticated(): boolean {
  try {
    return (
      sessionStorage.getItem(ADMIN_STORAGE_KEY) === "true" ||
      localStorage.getItem(ADMIN_STORAGE_KEY) === "true"
    );
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(value: boolean): void {
  try {
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    if (value) {
      sessionStorage.setItem(ADMIN_STORAGE_KEY, "true");
    }
  } catch {
    // ignore
  }
}

function setAdminAuthenticatedWithRemember(value: boolean, remember: boolean): void {
  try {
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    if (value) {
      if (remember) {
        localStorage.setItem(ADMIN_STORAGE_KEY, "true");
      } else {
        sessionStorage.setItem(ADMIN_STORAGE_KEY, "true");
      }
    }
  } catch {
    // ignore
  }
}

export function AdminGuard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    setAuthenticated(isAdminAuthenticated());
    setChecking(false);
  }, []);

  const handleLogin = (credentials: LoginCredentials) => {
    setLoginError(null);
    if (credentials.password.trim() === ADMIN_PASSWORD) {
      setAdminAuthenticatedWithRemember(true, credentials.rememberMe);
      setAuthenticated(true);
      toast.success("Welcome to the admin dashboard.");
    } else {
      setLoginError("Invalid email or password.");
      toast.error("Invalid email or password.");
    }
  };

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div
          className="size-8 border-2 border-[#6653FF] border-t-transparent rounded-full animate-spin"
          aria-hidden
        />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <LoginPage
        onSubmit={handleLogin}
        error={loginError ?? undefined}
      />
    );
  }

  return <Outlet />;
}
