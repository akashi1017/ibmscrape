import { Outlet, Navigate } from "react-router";
import { BarChart3, LogOut } from "lucide-react";
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
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    return !!token;
  } catch {
    return false;
  }
}

export default function Root() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState<AuthRole | null>(null);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      console.log("Root: Checking authentication...");
      const auth = isAuthenticated();
      const storedRole = getStoredRole();
      const storedName = localStorage.getItem("mnist-auth-name") ?? "";
      console.log("Root: Auth state:", { auth, storedRole, storedName });

      setAuthenticated(auth);
      setRole(storedRole);
      setUserName(storedName);
      setLoading(false);
      console.log("Root: Loading set to false");
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(ROLE_STORAGE_KEY);
    } catch { }

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div
          className="size-8 border-2 border-[#6653FF] border-t-transparent rounded-full animate-spin"
          aria-hidden
        />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
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
                  {userName || (isAdmin ? "Admin" : "User")}
                </div>
                <div className="text-xs text-gray-500">
                  {isAdmin ? "Administrator" : "Member"}
                </div>
              </div>
              <div className="size-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                {userName ? userName.charAt(0).toUpperCase() : (isAdmin ? "A" : "U")}
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
