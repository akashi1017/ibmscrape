import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router";
import { Hash, Eye, EyeOff } from "lucide-react";

function DigitsBackdrop() {
  const digits = useMemo(() => {
    return Array.from({ length: 12 }, () => ({
      digit: Math.floor(Math.random() * 10),
      left: Math.random() * 95,
      top: Math.random() * 95,
      size: 80 + Math.random() * 180,
      duration: 30 + Math.random() * 30,
      delay: -Math.random() * 30,
      dx: (Math.random() - 0.5) * 80,
      dy: (Math.random() - 0.5) * 80,
      rot: (Math.random() - 0.5) * 30,
    }));
  }, []);

  return (
    <div className="digits-backdrop" aria-hidden="true">
      {digits.map((d, i) => (
        <span
          key={i}
          className="floating-digit mono"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            fontSize: `${d.size}px`,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
            "--dx": `${d.dx}px`,
            "--dy": `${d.dy}px`,
            "--rot": `${d.rot}deg`,
          } as React.CSSProperties}
        >
          {d.digit}
        </span>
      ))}
    </div>
  );
}

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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset loading when error appears
  useEffect(() => {
    if (error) setLoading(false);
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onSubmit({ email: email.trim(), password, rememberMe });
  };

  return (
    <div className="auth-page">
      <DigitsBackdrop />
      <div className="auth-brand">
        <div className="auth-logo">
          <Hash size={28} />
        </div>
        <h1 className="auth-title">Digit Classification</h1>
        <p className="auth-subtitle">AI-Powered Number Recognition</p>
      </div>

      <div className="auth-card">
        <h2 className="auth-card-title">Welcome back</h2>
        <p className="auth-card-desc">Sign in to your account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                className="form-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", padding: "4px", height: "auto", border: "none", background: "transparent", color: "var(--dg-muted)" }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
            <label className="form-check">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <Link to="#" className="form-link">Forgot password?</Link>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? (
              <><span className="dg-spinner" /> Signing in…</>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="form-link">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
