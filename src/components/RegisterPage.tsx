import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { Hash, Eye, EyeOff } from "lucide-react";
import API_BASE from "../config";

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

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await response.json();
      if (!response.ok) {
        let detail = data.detail;
        if (Array.isArray(detail)) detail = detail.map((d: any) => d.msg ?? JSON.stringify(d)).join("; ");
        else if (typeof detail === "object" && detail !== null) detail = JSON.stringify(detail);
        throw new Error(detail || "Registration failed");
      }

      navigate("/login");
    } catch (err: any) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
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
        <h2 className="auth-card-title">Create account</h2>
        <p className="auth-card-desc">Get started for free</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Doe"
              required
              autoComplete="name"
            />
          </div>
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
                autoComplete="new-password"
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
          <div className="form-group">
            <label className="form-label">Confirm password</label>
            <div style={{ position: "relative" }}>
              <input
                className="form-input"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", padding: "4px", height: "auto", border: "none", background: "transparent", color: "var(--dg-muted)" }}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn-primary btn-full"
            disabled={isLoading}
            style={{ marginTop: 4 }}
          >
            {isLoading ? (
              <><span className="dg-spinner" /> Creating…</>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="form-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
