import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Modal from "../components/Modal";
import { ArrowLeft, Plus, HandCoins, Trash2, RefreshCw } from "lucide-react";
import React from "react";
const money = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
export default function CustomerDetails() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);
  const [credits, setCredits] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState("");
  const [items, setItems] = useState("");
  const [amount, setAmount] = useState("");
  const [confirmStep, setConfirmStep] = useState(0);
  const [targetCredit, setTargetCredit] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/customer-credit/${customerId}`);
      setInfo(data.customer);
      setCredits(data.credits || []);
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Could not fetch customer details");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [customerId]);
  const openAdd = () => {
    setItems("");
    setAmount("");
    setModal("add");
  };
  const openReduce = () => {
    setAmount("");
    setModal("reduce");
  };
  const openDelete = (c) => {
    setTargetCredit(c);
    setConfirmStep(0);
    setModal("delete");
  };
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (modal === "add")
        await api.post("/create-credit", {
          customerId,
          items: items
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
          amount: Number(amount),
        });
      else
        await api.put("/reduce-credit", { customerId, amount: Number(amount) });
      setModal("");
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Operation failed");
    } finally {
      setBusy(false);
    }
  };
  const deleteCredit = async () => {
    if (confirmStep === 0) {
      setConfirmStep(1);
      return;
    }
    setBusy(true);
    try {
      await api.delete(`/delete-credit/${targetCredit._id}`);
      setModal("");
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to delete credit");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <button className="back-link" onClick={() => navigate("/customers")}>
        <ArrowLeft size={16} /> Back to customers
      </button>
      {loading ? (
        <div className="loading">Loading customer…</div>
      ) : (
        info && (
          <>
            <div className="page-heading">
              <div>
                <h1>{info.customerName}</h1>
                <p>Customer credit details and payment management.</p>
              </div>
              <div className="heading-actions">
                <button className="btn secondary" onClick={load}>
                  <RefreshCw size={15} /> Refresh
                </button>
                <button className="btn primary" onClick={openAdd}>
                  <Plus size={16} /> Add Credit
                </button>
              </div>
            </div>
            {error && <div className="alert-error">{error}</div>}
            <div className="customer-summary panel">
              <div>
                <span className="eyebrow">Outstanding credit</span>
                <h2>{money(info.totalCredit)}</h2>
              </div>
              <div className="customer-meta">
                <span>Customer since</span>
                <b>
                  {info.createdAt
                    ? new Date(info.createdAt).toLocaleDateString("en-IN")
                    : "—"}
                </b>
              </div>
              <button className="btn payment-btn" onClick={openReduce}>
                <HandCoins size={17} /> Reduce Credit / Payment
              </button>
            </div>
            <div className="panel table-panel">
              <div className="section-title">
                <div>
                  <h2>Credit entries</h2>
                  <p>
                    {credits.length} record{credits.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th className="align-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {credits.map((c, i) => (
                      <tr key={c._id}>
                        <td className="row-index">{i + 1}</td>
                        <td>
                          {Array.isArray(c.items)
                            ? c.items
                                .map((it) =>
                                  typeof it === "string"
                                    ? it
                                    : it?.name || JSON.stringify(it),
                                )
                                .join(", ")
                            : "—"}
                        </td>
                        <td className="amount">{money(c.amount)}</td>
                        <td>
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleDateString("en-IN")
                            : "—"}
                        </td>
                        <td className="align-right">
                          <button
                            className="icon-btn delete"
                            title="Delete credit"
                            onClick={() => openDelete(c)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {credits.length === 0 && (
                <div className="empty-state">
                  No credit entries. This customer has no outstanding credits.
                </div>
              )}
            </div>
          </>
        )
      )}
      {modal === "add" && (
        <Modal title="Add credit" onClose={() => setModal("")}>
          <form className="form-stack" onSubmit={submit}>
            <label>
              Items (comma-separated)
              <input
                value={items}
                onChange={(e) => setItems(e.target.value)}
                placeholder="Rice, Oil, Sugar"
                required
              />
            </label>
            <label>
              Amount (₹)
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </label>
            <div className="modal-actions">
              <button
                className="btn secondary"
                type="button"
                onClick={() => setModal("")}
              >
                Cancel
              </button>
              <button className="btn primary" disabled={busy}>
                {busy ? "Saving…" : "Add credit"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === "reduce" && (
        <Modal title="Reduce credit / payment" onClose={() => setModal("")}>
          <p className="modal-note">
            Current outstanding: <b>{money(info?.totalCredit)}</b>
          </p>
          <form className="form-stack" onSubmit={submit}>
            <label>
              Payment / reduction amount (₹)
              <input
                type="number"
                min="0.01"
                max={info?.totalCredit}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </label>
            <div className="balance-preview">
              <span>Remaining after payment</span>
              <b>
                {money(
                  Math.max(
                    0,
                    Number(info?.totalCredit || 0) - Number(amount || 0),
                  ),
                )}
              </b>
            </div>
            <div className="modal-actions">
              <button
                className="btn secondary"
                type="button"
                onClick={() => setModal("")}
              >
                Cancel
              </button>
              <button
                className="btn primary"
                disabled={
                  busy ||
                  Number(amount) <= 0 ||
                  Number(amount) > Number(info?.totalCredit)
                }
              >
                {busy ? "Processing…" : "Confirm payment"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === "delete" && (
        <Modal title="Delete credit record" onClose={() => setModal("")}>
          <div className="confirm-body">
            <div className="danger-mark">
              <Trash2 />
            </div>
            <p>
              {confirmStep === 0
                ? "Are you sure you want to delete this credit entry?"
                : "Final approval: this credit record will be permanently deleted. Confirm again to proceed."}
            </p>
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setModal("")}>
                Cancel
              </button>
              <button
                className="btn danger-solid"
                disabled={busy}
                onClick={deleteCredit}
              >
                {busy
                  ? "Deleting…"
                  : confirmStep === 0
                    ? "Continue"
                    : "Confirm delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
