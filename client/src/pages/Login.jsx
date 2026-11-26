import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gem, Eye, EyeOff } from "lucide-react";
import api from "../services/api";
export default function Login() {
  const [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [show, setShow] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const nav = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await api.post("/login", { username, password });
      localStorage.setItem("gold-credit-token", r.data.token);
      localStorage.setItem(
        "gold-credit-owner",
        r.data.shopOwner?.username || username,
      );
      nav("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Check server connection.",
      );
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
        <div className="eyebrow">SHOP OWNER PORTAL</div>
        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to manage your shop credits.</p>
        <form onSubmit={submit}>
          <label>Username</label>
          <input
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
          />
          <label>Password</label>
          <div className="password-wrap">
            <input
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
            <button type="button" onClick={() => setShow(!show)}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="btn btn-primary btn-full" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="auth-switch">
          New shop owner? <Link to="/register">Create account</Link>
        </div>
      </div>
      <div className="auth-foot">Secure shop credit management</div>
    </div>
  );
}
