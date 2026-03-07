import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Center container */}
      <div className="w-full max-w-sm px-4">
        <Outlet />
      </div>
    </div>
  );
}
