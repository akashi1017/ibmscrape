import { createBrowserRouter, Navigate } from "react-router";
import API_BASE from "./config";

import AuthLayout from "./components/AuthLayout";
import Root from "./components/Root";

import { UserDashboard } from "./components/UserDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { NotFound } from "./components/NotFound";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";

import { useState } from "react";

function LoginWithAPI() {
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (credentials: any) => {
    setError(null);
    try {
      const response = await fetch("${API_BASE}/api/auth/login-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let detail = data.detail;
        if (Array.isArray(detail)) {
          detail = detail.map((d: any) => d.msg ?? JSON.stringify(d)).join("; ");
        } else if (typeof detail === "object" && detail !== null) {
          detail = JSON.stringify(detail);
        }
        throw new Error(detail || "Login failed");
      }

      const token = data.access_token;
      localStorage.setItem("mnist-auth-token", token);

      // Get user details
      const userResponse = await fetch("${API_BASE}/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        localStorage.setItem("mnist-auth-role", userData.role);
        localStorage.setItem("mnist-auth-name", userData.name ?? "");
      } else {
        localStorage.setItem("mnist-auth-role", "user");
        localStorage.setItem("mnist-auth-name", "");
      }

      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    }
  };

  return <LoginPage onSubmit={handleLogin} error={error} />;
}

/** Redirect to the right dashboard based on stored role */
function RootIndex() {
  const role = localStorage.getItem("mnist-auth-role");
  if (role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/user" replace />;
}

export const router = createBrowserRouter([

  // AUTH ROUTES (NO SIDEBAR)
  {
    path: "/login",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <LoginWithAPI />,
      },
    ],
  },
  {
    path: "/register",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <RegisterPage />,
      },
    ],
  },

  // APP ROUTES (WITH SIDEBAR)
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <RootIndex /> },
      { path: "user", element: <UserDashboard /> },
      { path: "admin", element: <AdminDashboard /> },
      { path: "*", element: <NotFound /> },
    ],
  },

]);

