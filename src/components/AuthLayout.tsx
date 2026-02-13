import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">

      {/* Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      />

      {/* Center container */}
      <div className="w-full max-w-sm px-4">
        <Outlet />
      </div>

    </div>
  );
}
