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
    onSubmit({
      email: email.trim(),
      password,
      rememberMe,
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f1f2f9 0%, #f5f6fb 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "60px 16px 40px",
      }}
    >
      <header style={{ textAlign: "center", marginBottom: "34px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(2rem, 5vw, 3.3rem)",
            lineHeight: 1.08,
            fontWeight: 800,
            color: "#10172b",
            letterSpacing: "-0.02em",
          }}
        >
          Digit Classification
        </h1>
        <p
          style={{
            marginTop: "12px",
            marginBottom: 0,
            color: "#6f7689",
            fontSize: "1.02rem",
            fontWeight: 500,
          }}
        >
          AI-Powered Number Recognition
        </p>
      </header>

      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          backgroundColor: "#ffffff",
          borderRadius: "22px",
          boxShadow: "0 16px 40px rgba(39, 43, 63, 0.12)",
          padding: "40px 38px 34px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h2
            style={{
              margin: 0,
              color: "#10172b",
              fontSize: "2rem",
              lineHeight: 1.15,
              fontWeight: 800,
            }}
          >
            Welcome Back
          </h2>
          <p
            style={{
              marginTop: "9px",
              marginBottom: 0,
              color: "#7d8396",
              fontSize: "1.05rem",
            }}
          >
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#2a3144",
                fontSize: "1.05rem",
                fontWeight: 700,
              }}
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={{
                width: "100%",
                height: "52px",
                borderRadius: "13px",
                border: "1px solid #e4e6ee",
                padding: "0 18px",
                fontSize: "1.07rem",
                color: "#1d2638",
                backgroundColor: "#ffffff",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#2a3144",
                fontSize: "1.05rem",
                fontWeight: 700,
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{
                width: "100%",
                height: "52px",
                borderRadius: "13px",
                border: "1px solid #e4e6ee",
                padding: "0 18px",
                fontSize: "1.07rem",
                color: "#1d2638",
                backgroundColor: "#ffffff",
                outline: "none",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "26px",
              gap: "12px",
            }}
          >
            <label
              htmlFor="remember"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "9px",
                color: "#6f7689",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                  accentColor: "#605eff",
                }}
              />
              Remember me
            </label>

            <Link
              to="#"
              style={{
                color: "#5b59df",
                fontSize: "1rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Forgot password?
            </Link>
          </div>

          {error ? (
            <p
              style={{
                marginTop: 0,
                marginBottom: "14px",
                color: "#d14343",
                fontSize: "0.96rem",
              }}
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            style={{
              width: "100%",
              height: "54px",
              border: "none",
              borderRadius: "15px",
              background: "linear-gradient(90deg, #605eff 0%, #4f46e5 100%)",
              color: "#ffffff",
              fontSize: "1.55rem",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 12px 28px rgba(96, 94, 255, 0.35)",
              letterSpacing: "0.01em",
            }}
          >
            Sign In
          </button>
        </form>

        <div
          style={{
            marginTop: "26px",
            borderTop: "1px solid #eceef4",
            paddingTop: "20px",
            textAlign: "center",
            color: "#6f7689",
            fontSize: "1.02rem",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            to="#"
            style={{
              color: "#5b59df",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
