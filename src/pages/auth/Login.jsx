import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpenCheck, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { logo } from "../../assets";
import { login } from "../../api/auth.api";
import DownloadApp from "../share/downloads";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const result = await login(email, password);

      localStorage.setItem("token", result?.data?.token);

      localStorage.setItem("user", JSON.stringify(result?.data?.user));

      if (result.data.user.role === "SUPER_ADMIN") {
        navigate("/super-admin/dashboard");
      } else if (result.data.user.role === "INSTITUTE_ADMIN") {
        navigate("/institute/dashboard");
      } else if (result.data.user.role === "STUDENT") {
        navigate("/student/tests");
      } else {
        setError("This dashboard is not available yet.");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <main className="login-shell">
        <section className="login-story" aria-label="About Institexa">
          <div className="login-brand">
            <img src={logo} alt="" />
            <span>INSTITEXA</span>
          </div>

          <div className="login-story-copy">
            <span className="login-eyebrow">
              <Sparkles size={15} aria-hidden="true" />
              A smarter way to learn
            </span>
            <h1>
              Everything your institute needs to{" "}
              <span>move forward.</span>
            </h1>
            <p>
              One thoughtful platform for teaching, learning, and everything
              that happens in between.
            </p>
          </div>

          <div className="login-preview" aria-hidden="true">
            <div className="preview-heading">
              <span className="preview-icon">
                <BookOpenCheck size={19} />
              </span>
              <div>
                <span className="preview-overline">YOUR LEARNING SPACE</span>
                <strong>Good things are in progress.</strong>
              </div>
              <span className="preview-status" />
            </div>
            <div className="preview-progress">
              <div className="preview-progress-label">
                <span>Learning momentum</span>
                <strong>82%</strong>
              </div>
              <div className="preview-progress-track">
                <span />
              </div>
              <div className="preview-footer">
                <span>Keep showing up. It adds up.</span>
                <span>↗</span>
              </div>
            </div>
            <div className="preview-note">
              <span className="preview-note-dot" />
              <span>Your next great idea starts here.</span>
            </div>
          </div>

          <div className="login-story-footer">
            <span>Made for people who make a difference.</span>
            <span>Learn well. Grow together.</span>
          </div>
        </section>

        <section className="login-panel">
          <div className="login-card">
            <div className="login-mobile-brand" aria-label="INSTITEXA">
              <img src={logo} alt="" />
              <span>INSTITEXA</span>
            </div>

            <span className="login-form-eyebrow">YOUR LEARNING SPACE</span>
            <h2>Welcome back</h2>
            <p className="login-intro">
              Sign in to pick up right where you left off.
            </p>

            {error && (
              <div className="error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="login-email">Email address</label>
                <div className="login-input-wrap">
                  <Mail size={18} aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourinstitute.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="login-password">Password</label>
                <div className="login-input-wrap">
                  <LockKeyhole size={18} aria-hidden="true" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    className="login-password-toggle"
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff size={18} aria-hidden="true" />
                    ) : (
                      <Eye size={18} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <button
                className="login-submit"
                type="submit"
                disabled={loading}
              >
                <span>{loading ? "Signing you in..." : "Sign in to your account"}</span>
                {!loading && <ArrowRight size={18} aria-hidden="true" />}
              </button>
            </form>

            <div className="login-secure-note">
              <LockKeyhole size={14} aria-hidden="true" />
              <span>Your learning space, kept secure.</span>
            </div>

            <p className="login-product-link">
              New to INSTITEXA?{" "}
              <Link to="/institexa">Explore the platform</Link>
            </p>
          </div>
        </section>
      </main>

      <div className="login-download">
        <DownloadApp />
      </div>
    </div>
  );
}
