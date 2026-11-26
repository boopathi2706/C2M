import { useEffect, useState } from "react";
import api from "../services/api";
import { Wallet, HandCoins, Users, TrendingUp, RefreshCw } from "lucide-react";
import React from "react"
const money = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/dashboard");
      setData(r.data.dashboard);
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your shop’s credit activity.</p>
        </div>
        <button className="btn secondary" onClick={load}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
      {error && <div className="alert-error">{error}</div>}
      {loading ? (
        <div className="loading">Loading dashboard…</div>
      ) : (
        data && (
          <>
            <section className="stat-grid">
              <Stat
                title="Outstanding Credit"
                value={money(data.totalCredit)}
                icon={Wallet}
                tone="blue"
              />
              <Stat
                title="Total Returned"
                value={money(data.totalReturned)}
                icon={HandCoins}
                tone="green"
              />
              <Stat
                title="Customers"
                value={Number(data.totalCustomers || 0).toLocaleString()}
                icon={Users}
                tone="purple"
              />
            </section>
            <section className="panel highest-card">
              <div className="highest-icon">
                <TrendingUp />
              </div>
              <div>
                <span className="eyebrow">Highest credit customer</span>
                <h2>
                  {data.highestCreditCustomer?.customerName ||
                    "No customers yet"}
                </h2>
                <p className="muted">Current outstanding balance</p>
              </div>
              <strong className="highest-amount">
                {money(data.highestCreditCustomer?.amount)}
              </strong>
            </section>
          </>
        )
      )}
    </>
  );
}
function Stat({ title, value, icon: Icon, tone }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={21} />
      </div>
      <p>{title}</p>
      <h2>{value}</h2>
    </article>
  );
}
