import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../../api/auth.api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const result =
        await login(
          email,
          password
        );

      localStorage.setItem(
        "token",
        result?.data?.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          result?.data?.user
        )
      );

      if (
        result.data.user.role ===
        "SUPER_ADMIN"
      ) {
        navigate(
          "/super-admin/dashboard"
        );
      } else if (
        result.data.user.role ===
        "INSTITUTE_ADMIN"
      ) {
        navigate(
          "/institute/dashboard"
        );
        console.log("navigatenavigate")
      } else {
        setError(
          "This dashboard is not available yet."
        );
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="login-page">
      <div className="login-card">

        <h1>
          Coaching SaaS
        </h1>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
        >

          <label>
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            placeholder="Email"
            required
          />

          <label>
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            placeholder="Password"
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

      </div>
    </div>
  );
}