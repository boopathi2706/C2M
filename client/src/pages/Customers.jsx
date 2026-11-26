import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Modal from "../components/Modal";
import React from "react";

import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

export default function Customers() {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState("");
  const [name, setName] = useState("");
  const [target, setTarget] = useState(null);

  const [confirmStep, setConfirmStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const perPage = 20;

  // Fetch customers from backend
  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/customers", {
        params: {
          page,
          limit: perPage,
          search,
        },
      });

      const customers = Array.isArray(data)
        ? data
        : data.customers || [];

      const pagination = data.pagination;

      setList(customers);

      if (pagination) {
        setTotalCustomers(pagination.totalCustomers || 0);
        setTotalPages(Math.max(1, pagination.totalPages || 1));

        // If current page no longer exists, go back to the last page
        if (page > Math.max(1, pagination.totalPages || 1)) {
          setPage(Math.max(1, pagination.totalPages || 1));
        }
      } else {
        // Fallback for APIs returning all customers without pagination
        setTotalCustomers(customers.length);
        setTotalPages(Math.max(1, Math.ceil(customers.length / perPage)));
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load customers. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load when page or search changes
  useEffect(() => {
    load();
  }, [page, search]);

  // Open Add Customer modal
  const openAdd = () => {
    setName("");
    setTarget(null);
    setModal("add");
  };

  // Open Edit Customer modal
  const openEdit = (customer) => {
    setName(customer.customerName);
    setTarget(customer);
    setModal("edit");
  };

  // Open Delete confirmation modal
  const openDelete = (customer) => {
    setTarget(customer);
    setConfirmStep(0);
    setModal("delete");
  };

  // Add or Edit customer
  const save = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Customer name is required.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      if (modal === "add") {
        await api.post("/create-customer", {
          customerName: trimmedName,
        });
      } else {
        await api.put("/edit-customer", {
          customerName: target.customerName,
          newCustomerName: trimmedName,
        });
      }

      setModal("");
      setName("");

      // Reload current page
      await load();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not save customer."
      );
    } finally {
      setBusy(false);
    }
  };

  // Delete customer with two approval steps
  const deleteNow = async () => {
    // First approval
    if (confirmStep === 0) {
      setConfirmStep(1);
      return;
    }

    // Second approval - delete from backend
    setBusy(true);
    setError("");

    try {
      await api.delete("/delete-customer", {
        data: {
          customerName: target.customerName,
        },
      });

      setModal("");
      setTarget(null);
      setConfirmStep(0);

      await load();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not delete customer."
      );
    } finally {
      setBusy(false);
    }
  };

  // If backend provides pagination, list already contains current page.
  // Otherwise paginate locally.
  const visible = list.length > perPage
    ? list.slice((page - 1) * perPage, page * perPage)
    : list;

  const startNumber =
    totalCustomers === 0 ? 0 : (page - 1) * perPage + 1;

  const endNumber = Math.min(page * perPage, totalCustomers);

  return (
    <>
      {/* Page Header */}
      <div className="page-heading">
        <div>
          <h1>Customers</h1>
          <p>Manage customer records and balances.</p>
        </div>

        <button className="btn primary" onClick={openAdd}>
          <Plus size={17} />
          Add Customer
        </button>
      </div>

      {/* Error message */}
      {error && <div className="alert-error">{error}</div>}

      {/* Customers Table */}
      <div className="panel table-panel">
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={17} />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search customer name..."
            />
          </div>

          <button className="btn secondary small" onClick={load}>
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="loading">Loading customers...</div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Total Credit</th>
                    <th>Created</th>
                    <th className="align-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {visible.map((customer, index) => (
                    <tr key={customer._id}>
                      <td className="row-index">
                        {(page - 1) * perPage + index + 1}
                      </td>

                      <td>
                        <button
                          className="customer-link"
                          onClick={() =>
                            navigate(`/customers/${customer._id}`)
                          }
                        >
                          {customer.customerName}
                        </button>
                      </td>

                      <td className="amount">
                        ₹
                        {Number(
                          customer.totalCredit || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      <td>
                        {customer.createdAt
                          ? new Date(
                              customer.createdAt
                            ).toLocaleDateString("en-IN")
                          : "—"}
                      </td>

                      <td className="align-right">
                        <div className="actions">
                          <button
                            className="icon-btn edit"
                            title="Edit customer"
                            onClick={() => openEdit(customer)}
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            className="icon-btn delete"
                            title="Delete customer"
                            onClick={() => openDelete(customer)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty state */}
            {visible.length === 0 && (
              <div className="empty-state">
                {search
                  ? "No customers found for this search."
                  : "No customers added yet."}
              </div>
            )}

            {/* Pagination */}
            <div className="pagination">
              <span>
                Showing {startNumber}–{endNumber} of {totalCustomers}
              </span>

              <div className="page-controls">
                <button
                  className="icon-btn"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={18} />
                </button>

                <span>
                  Page {page} of {totalPages}
                </span>

                <button
                  className="icon-btn"
                  disabled={page >= totalPages || loading}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <Modal
          title={modal === "add" ? "Add customer" : "Edit customer name"}
          onClose={() => setModal("")}
        >
          <form className="form-stack" onSubmit={save}>
            <label>
              Customer name

              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter customer name"
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
                {busy ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal - Two Approval Steps */}
      {modal === "delete" && (
        <Modal title="Delete customer" onClose={() => setModal("")}>
          <div className="confirm-body">
            <div className="danger-mark">
              <Trash2 />
            </div>

            <p>
              {confirmStep === 0 ? (
                <>
                  Delete <b>{target?.customerName}</b> and all
                  associated credit entries?
                </>
              ) : (
                <>
                  <b>Second confirmation:</b> Permanently delete{" "}
                  <b>{target?.customerName}</b> and all their credit
                  records. This action cannot be undone.
                </>
              )}
            </p>

            <div className="modal-actions">
              <button
                className="btn secondary"
                disabled={busy}
                onClick={() => {
                  setModal("");
                  setConfirmStep(0);
                }}
              >
                Cancel
              </button>

              <button
                className="btn danger-solid"
                disabled={busy}
                onClick={deleteNow}
              >
                {busy
                  ? "Deleting..."
                  : confirmStep === 0
                  ? "Continue"
                  : "Confirm Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}