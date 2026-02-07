import { Outlet, useLocation, useNavigate } from "react-router";
import { BarChart3, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { LoginPage } from "./LoginPage";
import type { LoginCredentials } from "./LoginPage";

const AUTH_STORAGE_KEY = "mnist-auth";
const ROLE_STORAGE_KEY = "mnist-auth-role";

export type AuthRole = "user" | "admin";

// Demo passwords – change or use env for production
const USER_PASSWORD = "user";
const ADMIN_PASSWORD = "admin";

function getStoredRole(): AuthRole | null {
  try {
    const role = sessionStorage.getItem(ROLE_STORAGE_KEY) || localStorage.getItem(ROLE_STORAGE_KEY);
    return role === "user" || role === "admin" ? role : null;
  } catch {
    return null;
  }
}

function isAuthenticated(): boolean {
  try {
    return (
      sessionStorage.getItem(AUTH_STORAGE_KEY) === "true" ||
      localStorage.getItem(AUTH_STORAGE_KEY) === "true"
    );
  } catch {
    return false;
  }
}

function setAuthStorage(value: boolean, remember: boolean, role: AuthRole | null): void {
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(ROLE_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);
    if (value && role) {
      if (remember) {
        localStorage.setItem(AUTH_STORAGE_KEY, "true");
        localStorage.setItem(ROLE_STORAGE_KEY, role);
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
        sessionStorage.setItem(ROLE_STORAGE_KEY, role);
      }
    }
  } catch {
    // ignore
  }
}

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState<AuthRole | null>(null);
  const [checking, setChecking] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setRole(getStoredRole());
    setChecking(false);
  }, []);

  // Redirect if logged-in user is on wrong area for their role
  useEffect(() => {
    if (!authenticated || !role) return;
    const path = location.pathname;
    if (role === "user" && (path === "/admin" || path.startsWith("/admin/"))) {
      navigate("/", { replace: true });
    } else if (role === "admin" && (path === "/" || path === "/user")) {
      navigate("/admin", { replace: true });
    }
  }, [authenticated, role, location.pathname, navigate]);

  const handleLogin = (credentials: LoginCredentials) => {
    setLoginError(null);
    const pwd = credentials.password.trim().toLowerCase();
    if (pwd === ADMIN_PASSWORD.toLowerCase()) {
      setAuthStorage(true, credentials.rememberMe, "admin");
      setAuthenticated(true);
      setRole("admin");
      navigate("/admin");
    } else if (pwd === USER_PASSWORD.toLowerCase()) {
      setAuthStorage(true, credentials.rememberMe, "user");
      setAuthenticated(true);
      setRole("user");
      navigate("/");
    } else {
      setLoginError("Invalid email or password.");
    }
  };

  const handleLogout = () => {
    setAuthStorage(false, false, null);
    setAuthenticated(false);
    setRole(null);
    navigate("/");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div
          className="size-8 border-2 border-[#6653FF] border-t-transparent rounded-full animate-spin"
          aria-hidden
        />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <>
        <LoginPage onSubmit={handleLogin} error={loginError ?? undefined} />
        <Toaster richColors position="top-center" />
      </>
    );
  }

  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BarChart3 className="size-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                MNIST Dashboard
              </span>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">
                  {isAdmin ? "Admin" : "User"}
                </div>
                <div className="text-xs text-gray-500">
                  {isAdmin ? "Administrator" : "Member"}
                </div>
              </div>
              <div className="size-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                {isAdmin ? "A" : "U"}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
      <Toaster richColors position="top-center" />
    </div>
  );
}
