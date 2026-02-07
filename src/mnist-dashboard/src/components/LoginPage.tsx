import { useState } from "react";
import { Link } from "react-router";

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginPageProps {
  onSubmit: (credentials: LoginCredentials) => void;
  error?: string | null;
}

export function LoginPage({ onSubmit, error }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email: email.trim(), password, rememberMe });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      {/* Header / Title */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Digit Classification
        </h1>
        <p className="text-base text-gray-600">
          AI-Powered Number Recognition
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-600">
            Sign in to your account
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Use password <strong>user</strong> for user dashboard or <strong>admin</strong> for admin dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-gray-900 mb-1.5"
            >
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6653FF] focus:border-transparent transition-colors"
              autoComplete="email"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-gray-900 mb-1.5"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6653FF] focus:border-transparent transition-colors"
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-gray-300 text-[#6653FF] focus:ring-[#6653FF]"
              />
              <span className="text-sm text-gray-700">Remember me</span>
            </label>
            <Link
              to="#"
              className="text-sm font-medium text-[#6653FF] hover:underline"
              onClick={(e) => e.preventDefault()}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg text-white font-semibold transition-opacity hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6653FF]"
            style={{
              background: "linear-gradient(135deg, #6653FF 0%, #5a48e6 100%)",
            }}
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don&apos;t have an account?{" "}
          <span className="font-medium text-[#6653FF] cursor-default">
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
