import { useState } from "react";
import { Link, useNavigate } from "react-router";
import API_BASE from "../config";

export function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    password: password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // FastAPI validation errors return detail as an array of objects
                let detail = data.detail;
                if (Array.isArray(detail)) {
                    detail = detail.map((d: any) => d.msg ?? JSON.stringify(d)).join("; ");
                } else if (typeof detail === "object" && detail !== null) {
                    detail = JSON.stringify(detail);
                }
                throw new Error(detail || "Registration failed");
            }

            // Success - redirect to login
            navigate("/login");
        } catch (err: any) {
            setError(err.message || "An error occurred during registration");
        } finally {
            setIsLoading(false);
        }
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
                        Create Account
                    </h2>
                    <p
                        style={{
                            marginTop: "9px",
                            marginBottom: 0,
                            color: "#7d8396",
                            fontSize: "1.05rem",
                        }}
                    >
                        Join the community
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "16px" }}>
                        <label
                            htmlFor="name"
                            style={{
                                display: "block",
                                marginBottom: "8px",
                                color: "#2a3144",
                                fontSize: "1.05rem",
                                fontWeight: 700,
                            }}
                        >
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Enter your name"
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

                    <div style={{ marginBottom: "16px" }}>
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
                            placeholder="Create a password"
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

                    <div style={{ marginBottom: "26px" }}>
                        <label
                            htmlFor="confirmPassword"
                            style={{
                                display: "block",
                                marginBottom: "8px",
                                color: "#2a3144",
                                fontSize: "1.05rem",
                                fontWeight: 700,
                            }}
                        >
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Confirm your password"
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
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            height: "54px",
                            border: "none",
                            borderRadius: "15px",
                            background: "linear-gradient(90deg, #605eff 0%, #4f46e5 100%)",
                            color: "#ffffff",
                            fontSize: "1.55rem",
                            fontWeight: 800,
                            cursor: isLoading ? "not-allowed" : "pointer",
                            boxShadow: "0 12px 28px rgba(96, 94, 255, 0.35)",
                            letterSpacing: "0.01em",
                            opacity: isLoading ? 0.8 : 1,
                        }}
                    >
                        {isLoading ? "Creating Account..." : "Sign Up"}
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
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        style={{
                            color: "#5b59df",
                            fontWeight: 700,
                            textDecoration: "none",
                        }}
                    >
                        Log In
                    </Link>
                </div>
            </div>
        </div>
    );
}
