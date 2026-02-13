import { createBrowserRouter } from "react-router";

import AuthLayout from "./components/AuthLayout";
import Root from "./components/Root";

import { UserDashboard } from "./components/UserDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { NotFound } from "./components/NotFound";
import { LoginPage } from "./components/LoginPage";

export const router = createBrowserRouter([

  // AUTH ROUTES (NO SIDEBAR)
  {
    path: "/login",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <LoginPage onSubmit={(credentials) => {
          // Simple authentication logic
          if (credentials.email && credentials.password) {
            localStorage.setItem("mnist-auth", "true");
            localStorage.setItem("mnist-auth-role", credentials.password === "admin" ? "admin" : "user");
            window.location.href = "/";
          } else {
            alert("Please enter valid credentials");
          }
        }} />,
      },
    ],
  },

  // APP ROUTES (WITH SIDEBAR)
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <UserDashboard /> },
      { path: "user", element: <UserDashboard /> },
      { path: "admin", element: <AdminDashboard /> },
      { path: "*", element: <NotFound /> },
    ],
  },

]);
