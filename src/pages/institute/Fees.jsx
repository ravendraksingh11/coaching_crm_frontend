import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import {
  getPendingFees,
  getFeeSummary,
  receiveFee,
  getPendingFeeSubmissions,
  approveFeeSubmission,
} from "../../api/institute.api";

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
export default function Fees() {
  const [frequency, setFrequency] = useState("ONE_TIME");
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  async function load(type = frequency) {
    setLoading(true);
    setError("");
    try {
      const [pending, totals, requests] = await Promise.all([
        getPendingFees(type),
        getFeeSummary(),
        getPendingFeeSubmissions(),
      ]);
      setFees(pending.data || []);
      setSummary(totals.data);
      setSubmissions(requests.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load fee records");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [frequency]);
  async function markReceived(fee) {
    const input = window.prompt(
      `Amount received (balance ${money(fee.balance)}). Enter a smaller amount for partial payment:`,
      Number(fee.balance).toFixed(2),
    );
    if (input === null) return;
    try {
      await receiveFee(fee.fee_id, {
        amount: Number(input),
        paymentMethod: "CASH",
      });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not record payment");
    }
  }
  async function confirmSubmission(submission) {
    try {
      await approveFeeSubmission(submission.id);
      await load();
    } catch (e) {
      setError(
        e.response?.data?.message || "Could not confirm submitted payment",
      );
    }
  }

  const submissionColumns = [
    {
      key: "student",
      header: "Student",
      value: (submission) => submission.student_name,
      render: (submission) => (
        <>
          <strong>{submission.student_name}</strong>
          <small>{submission.admission_number}</small>
        </>
      ),
    },
    { key: "fee", header: "Fee", value: (submission) => submission.fee_title },
    {
      key: "amount",
      header: "Amount",
      value: (submission) => money(submission.amount),
    },
    {
      key: "method",
      header: "Method",
      value: (submission) => submission.payment_method,
    },
    {
      key: "reference",
      header: "Reference",
      value: (submission) => submission.transaction_id || "—",
    },
    {
      key: "submitted",
      header: "Submitted",
      value: (submission) => new Date(submission.created_at).toLocaleString(),
    },
    {
      key: "action",
      header: "Action",
      sortable: false,
      searchable: false,
      value: () => "",
      render: (submission) => (
        <button type="button" onClick={() => confirmSubmission(submission)}>
          Confirm received
        </button>
      ),
    },
  ];

  const pendingFeeColumns = [
    {
      key: "student",
      header: "Student",
      value: (fee) => fee.student_name,
      render: (fee) => (
        <>
          <strong>{fee.student_name}</strong>
          <small>{fee.admission_number}</small>
        </>
      ),
    },
    {
      key: "batch",
      header: "Batch",
      value: (fee) => fee.batch_name || "—",
    },
    {
      key: "period",
      header: "Period / Due date",
      value: (fee) =>
        `${fee.billing_period_start || fee.due_date || ""}${fee.due_date ? ` · due ${String(fee.due_date).slice(0, 10)}` : ""}`,
    },
    { key: "amount", header: "Fee", value: (fee) => money(fee.amount) },
    {
      key: "received",
      header: "Received",
      value: (fee) => money(fee.paid_amount),
    },
    {
      key: "balance",
      header: "Balance",
      value: (fee) => money(fee.balance),
    },
    { key: "status", header: "Status", value: (fee) => fee.status },
    {
      key: "action",
      header: "Action",
      sortable: false,
      searchable: false,
      value: () => "",
      render: (fee) => (
        <button type="button" onClick={() => markReceived(fee)}>
          Mark received
        </button>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Fees</h1>
          <p>Review one-time and monthly dues, and record payments received.</p>
        </div>
        <button type="button" onClick={() => load()}>
          Refresh
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {summary && (
        <div className="stats-grid">
          <div className="stat-card">
            <div>
              <p>One-time pending</p>
              <h2>{money(summary.ONE_TIME.pendingAmount)}</h2>
              <small>{summary.ONE_TIME.pendingCount} fee items</small>
            </div>
          </div>
          <div className="stat-card">
            <div>
              <p>Monthly pending</p>
              <h2>{money(summary.MONTHLY.pendingAmount)}</h2>
              <small>{summary.MONTHLY.pendingCount} fee items</small>
            </div>
          </div>
        </div>
      )}
      <section className="dashboard-card">
        <h2>Student payment submissions</h2>
        {submissions.length ? (
          <DataTable
            columns={submissionColumns}
            rows={submissions}
            rowKey={(submission) => submission.id}
            searchPlaceholder="Search submissions..."
          />
        ) : (
          <p>No student payment submissions awaiting review.</p>
        )}
      </section>
      <section className="dashboard-card">
        <div className="action-row">
          <h2>
            Pending {frequency === "ONE_TIME" ? "one-time" : "monthly"} fees
          </h2>
          <div>
            <button
              type="button"
              className={frequency === "ONE_TIME" ? "" : "secondary-button"}
              onClick={() => setFrequency("ONE_TIME")}
            >
              One-time
            </button>{" "}
            <button
              type="button"
              className={frequency === "MONTHLY" ? "" : "secondary-button"}
              onClick={() => setFrequency("MONTHLY")}
            >
              Monthly
            </button>
          </div>
        </div>
        {loading ? (
          <div className="page-loading">Loading fee records…</div>
        ) : fees.length ? (
          <DataTable
            columns={pendingFeeColumns}
            rows={fees}
            rowKey={(fee) => fee.fee_id}
            searchPlaceholder="Search pending fees..."
          />
        ) : (
          <p>No pending fees in this category.</p>
        )}
      </section>
    </div>
  );
}
