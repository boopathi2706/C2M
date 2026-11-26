import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Coins, Eye, EyeOff } from "lucide-react";
import api from "../services/api";
import React from "react"
export default function Auth({ register = false }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post(register ? "/register" : "/login", {
        username,
        password,
      });
      if (!register) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("shopOwner", data.shopOwner?.username || username);
        navigate("/dashboard");
      } else navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(
        err.response?.data?.message || "Request failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="brand-icon">
            <Coins />
          </div>
          <div>
            <b>Gold Credit</b>
            <small>Shop Manager</small>
          </div>
        </div>
        <h1>{register ? "Create shop account" : "Welcome back"}</h1>
        <p className="muted">
          {register
            ? "Register your shop owner account to get started."
            : "Sign in to manage customer credits."}
        </p>
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={submit} className="form-stack">
          <label>
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              minLength={3}
            />
          </label>
          <label>
            Password
            <div className="password-wrap">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                minLength={6}
              />
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <button className="btn primary full" disabled={busy}>
            {busy ? "Please wait…" : register ? "Create Account" : "Login"}
          </button>
        </form>
        <div className="auth-switch">
          {register ? "Already have an account?" : "New shop owner?"}{" "}
          <Link to={register ? "/login" : "/register"}>
            {register ? "Login" : "Register"}
          </Link>
        </div>
      </div>
    </div>
  );
}
