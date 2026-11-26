import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ReceiptText,
  LogOut,
  Menu,
  X,
  Coins,
} from "lucide-react";
import React from "react";
import { useState } from "react";
export default function Layout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("shopOwner");
    navigate("/login");
  };
  const nav = [
    { to: "/dashboard", label: "Home", icon: LayoutDashboard },
    { to: "/customers", label: "Customers", icon: Users },
    { to: "/credits", label: "Credit", icon: ReceiptText },
  ];
  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <Coins />
          </div>
          <div>
            <b>Gold Credit</b>
            <small>Shop Manager</small>
          </div>
          <button
            className="icon-btn mobile-close"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>
        <nav>
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-link logout" onClick={logout}>
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>
      {open && <div className="mobile-shade" onClick={() => setOpen(false)} />}
      <main className="main">
        <header className="topbar">
          <button
            className="icon-btn menu-toggle"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>
          <div className="topbar-title">Gold Credit Shop</div>
          <div className="owner-chip">Shop Owner</div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
