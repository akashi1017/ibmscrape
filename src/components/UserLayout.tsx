import { NavLink, Outlet, useNavigate } from "react-router";
import {
  Hash, Pencil, LayoutDashboard, Clock, LogOut,
  Sun, Moon, Menu, PanelLeftOpen, PanelLeftClose,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { to: "/user", label: "Predict", icon: Pencil, end: true },
  { to: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/user/history", label: "View History", icon: Clock },
];

function getInitialTheme(): "light" | "dark" {
  try {
    const stored = localStorage.getItem("dg-theme") as "light" | "dark" | null;
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "dark";
  }
}

export default function UserLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  const userName = localStorage.getItem("mnist-auth-name") || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("dg-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === "dark" ? "light" : "dark"));

  const handleLogout = () => {
    localStorage.removeItem("mnist-auth-token");
    localStorage.removeItem("mnist-auth-role");
    navigate("/login");
  };

  return (
    <div className="app-layout">
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`sidebar ${collapsed ? "sidebar--collapsed" : ""} ${mobileOpen ? "sidebar--mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={() => navigate("/user")}>
            <div className="sidebar-logo">
              <Hash size={20} />
            </div>
            {!collapsed && <span className="sidebar-brand-text">DigitAI</span>}
          </div>
          <button
            className="sidebar-collapse-btn hide-mobile"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `sidebar-link${isActive ? " sidebar-link--active" : ""}`
              }
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-link"
            onClick={handleLogout}
            title={collapsed ? "Log out" : undefined}
          >
            <LogOut size={18} />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="top-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div style={{ flex: 1 }} />
          <div className="header-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="header-divider" />
            <div className="header-user">
              <div className="header-user-info">
                <span className="header-user-name">{userName}</span>
                <span className="header-user-role">Member</span>
              </div>
              <div className="dg-avatar">{userInitial}</div>
            </div>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
