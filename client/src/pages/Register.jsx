import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gem } from "lucide-react";
import api from "../services/api";
export default function Register() {
  const [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const nav = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      await api.post("/register", { username, password });
      nav("/login", { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <Gem size={24} />
        </div>
        <div className="eyebrow">CREATE SHOP ACCOUNT</div>
        <h1>Start your shop</h1>
        <p className="auth-sub">
          Set up your secure credit management account.
        </p>
        <form onSubmit={submit}>
          <label>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose username"
            minLength={3}
            required
          />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            minLength={6}
            required
          />
          <label>Confirm password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter password"
            required
          />
          {error && <div className="form-error">{error}</div>}
          <button className="btn btn-primary btn-full" disabled={busy}>
            {busy ? "Creating account..." : "Create account"}
          </button>
        </form>
        <div className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </div>
      </div>
      <div className="auth-foot">Secure shop credit management</div>
    </div>
  );
}
