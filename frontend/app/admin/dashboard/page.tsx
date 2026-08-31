"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type EnquiryStatus =
  | "New"
  | "In Progress"
  | "Contacted"
  | "Completed"
  | "Cancelled";

type Enquiry = {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  service: string;
  requirement: string;
  status: EnquiryStatus;
};

const STATUS_OPTIONS: EnquiryStatus[] = [
  "New",
  "In Progress",
  "Contacted",
  "Completed",
  "Cancelled",
];

export default function DashboardPage() {
  const router = useRouter();

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    EnquiryStatus | "All Statuses"
  >("All Statuses");

  const [selectedEnquiry, setSelectedEnquiry] =
    useState<Enquiry | null>(null);

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/admin");
      return;
    }

    fetchEnquiries();
  }

  async function fetchEnquiries(showRefresh = false) {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setEnquiries((data || []) as Enquiry[]);
    setLoading(false);
    setRefreshing(false);
  }

  async function handleStatusChange(
    id: number,
    newStatus: EnquiryStatus
  ) {
    setUpdatingId(id);
    setError("");

    const { error } = await supabase
      .from("enquiries")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      setError(error.message);
      setUpdatingId(null);
      return;
    }

    setEnquiries((current) =>
      current.map((enquiry) =>
        enquiry.id === id
          ? { ...enquiry, status: newStatus }
          : enquiry
      )
    );

    setSelectedEnquiry((current) =>
      current && current.id === id
        ? { ...current, status: newStatus }
        : current
    );

    setUpdatingId(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin");
  }

  const counts = useMemo(() => {
    return {
      total: enquiries.length,
      new: enquiries.filter((item) => item.status === "New").length,
      inProgress: enquiries.filter(
        (item) => item.status === "In Progress"
      ).length,
      contacted: enquiries.filter(
        (item) => item.status === "Contacted"
      ).length,
      completed: enquiries.filter(
        (item) => item.status === "Completed"
      ).length,
      cancelled: enquiries.filter(
        (item) => item.status === "Cancelled"
      ).length,
    };
  }, [enquiries]);

  const filteredEnquiries = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return enquiries.filter((enquiry) => {
      const matchesSearch =
        searchValue === "" ||
        enquiry.name.toLowerCase().includes(searchValue) ||
        enquiry.phone.toLowerCase().includes(searchValue) ||
        enquiry.service.toLowerCase().includes(searchValue) ||
        enquiry.requirement.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All Statuses" ||
        enquiry.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enquiries, search, statusFilter]);

  function handleCardFilter(
    status: EnquiryStatus | "All Statuses"
  ) {
    setStatusFilter(status);
    setSearch("");
  }

  function getStatusClass(status: EnquiryStatus) {
    switch (status) {
      case "New":
        return "status-new";

      case "In Progress":
        return "status-progress";

      case "Contacted":
        return "status-contacted";

      case "Completed":
        return "status-completed";

      case "Cancelled":
        return "status-cancelled";

      default:
        return "";
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  return (
    <>
      <main className="dashboard-page">
        <div className="dashboard-container">
          {/* HEADER */}
          <header className="dashboard-header">
            <div>
              <div className="eyebrow">
                AKHIL AI BUSINESS WEBSITE
              </div>

              <h1>Admin Dashboard</h1>

              <p>
                Manage customer enquiries and track their progress.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>
          </header>

          {/* ERROR */}
          {error && (
            <div className="error-banner">
              <div>
                <strong>Something went wrong.</strong>
                <span>{error}</span>
              </div>

              <button
                onClick={() => fetchEnquiries(true)}
                className="error-retry-button"
              >
                Retry
              </button>
            </div>
          )}

          {/* SUMMARY CARDS */}
          <section className="summary-grid">
            <button
              className={`summary-card total-card ${
                statusFilter === "All Statuses"
                  ? "summary-card-active"
                  : ""
              }`}
              onClick={() => handleCardFilter("All Statuses")}
            >
              <div className="card-top">
                <span className="card-label">Total Enquiries</span>
                <span className="card-icon">◎</span>
              </div>

              <strong>{counts.total}</strong>

              <span className="card-description">
                All customer enquiries
              </span>
            </button>

            <button
              className={`summary-card new-card ${
                statusFilter === "New"
                  ? "summary-card-active"
                  : ""
              }`}
              onClick={() => handleCardFilter("New")}
            >
              <div className="card-top">
                <span className="card-label">New</span>
                <span className="card-icon">✦</span>
              </div>

              <strong>{counts.new}</strong>

              <span className="card-description">
                Awaiting action
              </span>
            </button>

            <button
              className={`summary-card progress-card ${
                statusFilter === "In Progress"
                  ? "summary-card-active"
                  : ""
              }`}
              onClick={() =>
                handleCardFilter("In Progress")
              }
            >
              <div className="card-top">
                <span className="card-label">In Progress</span>
                <span className="card-icon">◷</span>
              </div>

              <strong>{counts.inProgress}</strong>

              <span className="card-description">
                Currently being handled
              </span>
            </button>

            <button
              className={`summary-card contacted-card ${
                statusFilter === "Contacted"
                  ? "summary-card-active"
                  : ""
              }`}
              onClick={() =>
                handleCardFilter("Contacted")
              }
            >
              <div className="card-top">
                <span className="card-label">Contacted</span>
                <span className="card-icon">◉</span>
              </div>

              <strong>{counts.contacted}</strong>

              <span className="card-description">
                Customer contacted
              </span>
            </button>

            <button
              className={`summary-card completed-card ${
                statusFilter === "Completed"
                  ? "summary-card-active"
                  : ""
              }`}
              onClick={() =>
                handleCardFilter("Completed")
              }
            >
              <div className="card-top">
                <span className="card-label">Completed</span>
                <span className="card-icon">✓</span>
              </div>

              <strong>{counts.completed}</strong>

              <span className="card-description">
                Successfully completed
              </span>
            </button>

            <button
              className={`summary-card cancelled-card ${
                statusFilter === "Cancelled"
                  ? "summary-card-active"
                  : ""
              }`}
              onClick={() =>
                handleCardFilter("Cancelled")
              }
            >
              <div className="card-top">
                <span className="card-label">Cancelled</span>
                <span className="card-icon">×</span>
              </div>

              <strong>{counts.cancelled}</strong>

              <span className="card-description">
                Cancelled enquiries
              </span>
            </button>
          </section>

          {/* CUSTOMER ENQUIRIES */}
          <section className="enquiries-section">
            <div className="section-header">
              <div>
                <h2>Customer Enquiries</h2>

                <p>
                  Search, filter and manage customer requests.
                </p>
              </div>

              <button
                onClick={() => fetchEnquiries(true)}
                disabled={refreshing}
                className="refresh-button"
              >
                {refreshing ? "Refreshing..." : "↻ Refresh"}
              </button>
            </div>

            {/* SEARCH + FILTER */}
            <div className="filters-row">
              <div className="search-wrapper">
                <span className="search-icon">⌕</span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search name, phone, service..."
                  className="search-input"
                />

                {search && (
                  <button
                    className="clear-search"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | EnquiryStatus
                      | "All Statuses"
                  )
                }
                className="filter-select"
              >
                <option value="All Statuses">
                  All Statuses
                </option>

                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* RESULTS INFO */}
            <div className="results-bar">
              <span>
                Showing{" "}
                <strong>{filteredEnquiries.length}</strong>{" "}
                of <strong>{enquiries.length}</strong>{" "}
                enquiries
              </span>

              {(search || statusFilter !== "All Statuses") && (
                <button
                  className="clear-filters"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All Statuses");
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* LOADING */}
            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>

                <p>Loading enquiries...</p>
              </div>
            )}

            {/* EMPTY */}
            {!loading && filteredEnquiries.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">⌕</div>

                <h3>No enquiries found</h3>

                <p>
                  No enquiries match your current search or
                  filter.
                </p>

                {(search ||
                  statusFilter !== "All Statuses") && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("All Statuses");
                    }}
                    className="empty-reset-button"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* TABLE */}
            {!loading && filteredEnquiries.length > 0 && (
              <div className="table-wrapper">
                <table className="enquiries-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Service</th>
                      <th>Requirement</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEnquiries.map((enquiry) => (
                      <tr key={enquiry.id}>
                        <td className="id-cell">
                          #{enquiry.id}
                        </td>

                        <td className="date-cell">
                          {formatDate(enquiry.created_at)}
                        </td>

                        <td className="name-cell">
                          {enquiry.name}
                        </td>

                        <td>{enquiry.phone}</td>

                        <td>
                          <span className="service-badge">
                            {enquiry.service}
                          </span>
                        </td>

                        <td className="requirement-cell">
                          {enquiry.requirement}
                        </td>

                        <td>
                          <select
                            value={enquiry.status}
                            onChange={(event) =>
                              handleStatusChange(
                                enquiry.id,
                                event.target.value as EnquiryStatus
                              )
                            }
                            disabled={
                              updatingId === enquiry.id
                            }
                            className={`status-select ${getStatusClass(
                              enquiry.status
                            )}`}
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option
                                key={status}
                                value={status}
                              >
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          <button
                            onClick={() =>
                              setSelectedEnquiry(enquiry)
                            }
                            className="view-button"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* DETAILS MODAL */}
      {selectedEnquiry && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedEnquiry(null)}
        >
          <div
            className="details-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">
                  ENQUIRY #{selectedEnquiry.id}
                </span>

                <h2>Enquiry Details</h2>
              </div>

              <button
                onClick={() => setSelectedEnquiry(null)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="detail-item">
                <span>Name</span>
                <strong>{selectedEnquiry.name}</strong>
              </div>

              <div className="detail-item">
                <span>Phone</span>
                <strong>{selectedEnquiry.phone}</strong>
              </div>

              <div className="detail-item">
                <span>Service</span>
                <strong>{selectedEnquiry.service}</strong>
              </div>

              <div className="detail-item requirement-detail">
                <span>Requirement</span>
                <strong>
                  {selectedEnquiry.requirement}
                </strong>
              </div>

              <div className="detail-item">
                <span>Status</span>

                <select
                  value={selectedEnquiry.status}
                  onChange={(event) =>
                    handleStatusChange(
                      selectedEnquiry.id,
                      event.target.value as EnquiryStatus
                    )
                  }
                  disabled={
                    updatingId === selectedEnquiry.id
                  }
                  className={`modal-status-select ${getStatusClass(
                    selectedEnquiry.status
                  )}`}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="detail-item">
                <span>Submitted</span>
                <strong>
                  {formatDate(
                    selectedEnquiry.created_at
                  )}
                </strong>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="modal-close-button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .dashboard-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at top left,
              rgba(99, 102, 241, 0.08),
              transparent 28%
            ),
            #f5f7fb;
          color: #111827;
          padding: 42px 24px 70px;
        }

        .dashboard-container {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 34px;
        }

        .eyebrow {
          color: #6366f1;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.4px;
          margin-bottom: 8px;
        }

        .dashboard-header h1 {
          margin: 0;
          font-size: clamp(32px, 4vw, 46px);
          line-height: 1.1;
          letter-spacing: -1.2px;
        }

        .dashboard-header p {
          margin: 10px 0 0;
          color: #64748b;
          font-size: 17px;
        }

        .logout-button {
          border: none;
          background: #111827;
          color: white;
          padding: 13px 22px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
          white-space: nowrap;
        }

        .logout-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.18);
        }

        .error-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 14px 18px;
          margin-bottom: 24px;
          border: 1px solid #fecaca;
          background: #fff1f2;
          color: #991b1b;
          border-radius: 12px;
        }

        .error-banner div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .error-retry-button {
          border: 1px solid #fca5a5;
          background: white;
          color: #991b1b;
          border-radius: 8px;
          padding: 8px 14px;
          cursor: pointer;
          font-weight: 700;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }

        .summary-card {
          min-width: 0;
          min-height: 180px;
          text-align: left;
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 16px;
          padding: 22px;
          cursor: pointer;
          box-shadow: 0 8px 28px rgba(15, 23, 42, 0.05);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .summary-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.09);
        }

        .summary-card-active {
          border-color: #6366f1;
          box-shadow:
            0 0 0 2px rgba(99, 102, 241, 0.12),
            0 14px 34px rgba(15, 23, 42, 0.09);
        }

        .total-card {
          background: linear-gradient(
            145deg,
            #ffffff,
            #eef2ff
          );
        }

        .new-card {
          background: linear-gradient(
            145deg,
            #ffffff,
            #fff7ed
          );
        }

        .progress-card {
          background: linear-gradient(
            145deg,
            #ffffff,
            #eff6ff
          );
        }

        .contacted-card {
          background: linear-gradient(
            145deg,
            #ffffff,
            #ecfeff
          );
        }

        .completed-card {
          background: linear-gradient(
            145deg,
            #ffffff,
            #ecfdf5
          );
        }

        .cancelled-card {
          background: linear-gradient(
            145deg,
            #ffffff,
            #fff1f2
          );
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .card-label {
          color: #64748b;
          font-size: 14px;
          font-weight: 700;
        }

        .card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.75);
          font-size: 17px;
          font-weight: 800;
        }

        .summary-card strong {
          display: block;
          margin-top: 18px;
          font-size: 38px;
          line-height: 1;
          letter-spacing: -1px;
        }

        .card-description {
          display: block;
          margin-top: 12px;
          color: #64748b;
          font-size: 12px;
        }

        .enquiries-section {
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 18px;
          padding: 28px;
          box-shadow: 0 10px 35px rgba(15, 23, 42, 0.06);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .section-header h2 {
          margin: 0;
          font-size: 24px;
          letter-spacing: -0.4px;
        }

        .section-header p {
          margin: 7px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .refresh-button {
          background: white;
          border: 1px solid #cbd5e1;
          color: #1e293b;
          padding: 11px 17px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 700;
          transition: all 0.2s ease;
        }

        .refresh-button:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        .refresh-button:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .filters-row {
          display: grid;
          grid-template-columns: 1fr 260px;
          gap: 14px;
          margin-bottom: 16px;
        }

        .search-wrapper {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 22px;
          pointer-events: none;
        }

        .search-input,
        .filter-select {
          width: 100%;
          height: 52px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          background: white;
          color: #0f172a;
          font-size: 15px;
          outline: none;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .search-input {
          padding: 0 44px;
        }

        .filter-select {
          padding: 0 14px;
          cursor: pointer;
        }

        .search-input::placeholder {
          color: #94a3b8;
        }

        .search-input:focus,
        .filter-select:focus {
          border-color: #818cf8;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: #f1f5f9;
          color: #64748b;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
        }

        .results-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          min-height: 42px;
          color: #64748b;
          font-size: 14px;
        }

        .results-bar strong {
          color: #0f172a;
        }

        .clear-filters {
          border: none;
          background: transparent;
          color: #6366f1;
          font-weight: 700;
          cursor: pointer;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          margin-top: 8px;
        }

        .enquiries-table {
          width: 100%;
          min-width: 1050px;
          border-collapse: collapse;
        }

        .enquiries-table th {
          background: #f8fafc;
          color: #475569;
          text-align: left;
          padding: 15px 14px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
          border-bottom: 1px solid #e2e8f0;
        }

        .enquiries-table td {
          padding: 17px 14px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          font-size: 14px;
          vertical-align: middle;
        }

        .enquiries-table tbody tr:last-child td {
          border-bottom: none;
        }

        .enquiries-table tbody tr:hover {
          background: #fafbff;
        }

        .id-cell {
          color: #6366f1 !important;
          font-weight: 800;
        }

        .date-cell {
          white-space: nowrap;
          color: #64748b !important;
        }

        .name-cell {
          color: #0f172a !important;
          font-weight: 700;
          white-space: nowrap;
        }

        .requirement-cell {
          min-width: 220px;
          max-width: 320px;
        }

        .service-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 7px;
          background: #f1f5f9;
          color: #334155;
          font-weight: 600;
          white-space: nowrap;
        }

        .status-select,
        .modal-status-select {
          min-width: 135px;
          padding: 9px 30px 9px 11px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          outline: none;
          appearance: auto;
        }

        .status-select:disabled,
        .modal-status-select:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .status-new {
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }

        .status-progress {
          background: #fff7ed;
          color: #c2410c;
          border: 1px solid #fed7aa;
        }

        .status-contacted {
          background: #ecfeff;
          color: #0f766e;
          border: 1px solid #a5f3fc;
        }

        .status-completed {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        .status-cancelled {
          background: #fff1f2;
          color: #be123c;
          border: 1px solid #fecdd3;
        }

        .view-button {
          border: none;
          background: #111827;
          color: white;
          padding: 9px 15px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-button:hover {
          background: #1e293b;
          transform: translateY(-1px);
        }

        .loading-state,
        .empty-state {
          min-height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          color: #64748b;
        }

        .spinner {
          width: 34px;
          height: 34px;
          border: 3px solid #e2e8f0;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 14px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .empty-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          background: #f1f5f9;
          border-radius: 50%;
          font-size: 27px;
          color: #64748b;
          margin-bottom: 14px;
        }

        .empty-state h3 {
          margin: 0;
          color: #0f172a;
          font-size: 18px;
        }

        .empty-state p {
          margin: 8px 0 18px;
        }

        .empty-reset-button {
          border: none;
          background: #6366f1;
          color: white;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 23, 42, 0.58);
          backdrop-filter: blur(5px);
        }

        .details-modal {
          width: 100%;
          max-width: 620px;
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 18px;
          box-shadow: 0 30px 80px rgba(15, 23, 42, 0.25);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          padding: 25px 28px 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-eyebrow {
          color: #6366f1;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .modal-header h2 {
          margin: 6px 0 0;
          color: #0f172a;
          font-size: 26px;
        }

        .modal-close {
          width: 38px;
          height: 38px;
          border: none;
          border-radius: 50%;
          background: #f1f5f9;
          color: #334155;
          font-size: 23px;
          cursor: pointer;
        }

        .modal-content {
          padding: 25px 28px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .detail-item span {
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
        }

        .detail-item strong {
          color: #0f172a;
          font-size: 16px;
          line-height: 1.5;
          font-weight: 600;
        }

        .requirement-detail {
          grid-column: 1 / -1;
        }

        .modal-status-select {
          width: fit-content;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          padding: 18px 28px 25px;
          border-top: 1px solid #e2e8f0;
        }

        .modal-close-button {
          border: none;
          background: #111827;
          color: white;
          padding: 11px 20px;
          border-radius: 9px;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 1250px) {
          .summary-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 800px) {
          .dashboard-page {
            padding: 25px 14px 50px;
          }

          .dashboard-header {
            flex-direction: column;
          }

          .logout-button {
            align-self: flex-start;
          }

          .summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .enquiries-section {
            padding: 20px 16px;
          }

          .section-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .refresh-button {
            width: 100%;
          }

          .filters-row {
            grid-template-columns: 1fr;
          }

          .modal-content {
            grid-template-columns: 1fr;
          }

          .requirement-detail {
            grid-column: auto;
          }
        }

        @media (max-width: 520px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }

          .summary-card {
            min-height: 150px;
          }

          .results-bar {
            align-items: flex-start;
            flex-direction: column;
            padding: 8px 0;
          }

          .details-modal {
            border-radius: 14px;
          }

          .modal-header,
          .modal-content,
          .modal-footer {
            padding-left: 20px;
            padding-right: 20px;
          }
        }
      `}</style>
    </>
  );
}