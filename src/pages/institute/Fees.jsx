import { useEffect, useState } from "react";
import { getPendingFees, getFeeSummary, receiveFee } from "../../api/institute.api";

function money(value) { return `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
export default function Fees() {
  const [frequency, setFrequency] = useState("ONE_TIME");
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  async function load(type = frequency) {
    setLoading(true); setError("");
    try { const [pending, totals] = await Promise.all([getPendingFees(type), getFeeSummary()]); setFees(pending.data || []); setSummary(totals.data); }
    catch (e) { setError(e.response?.data?.message || "Could not load fee records"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [frequency]);
  async function markReceived(fee) {
    const input = window.prompt(`Amount received (balance ${money(fee.balance)}). Enter a smaller amount for partial payment:`, Number(fee.balance).toFixed(2));
    if (input === null) return;
    try { await receiveFee(fee.fee_id, { amount: Number(input), paymentMethod: "CASH" }); await load(); }
    catch (e) { setError(e.response?.data?.message || "Could not record payment"); }
  }
  return <div className="page"><div className="page-header"><div><h1>Fees</h1><p>Review one-time and monthly dues, and record payments received.</p></div><button type="button" onClick={() => load()}>Refresh</button></div>
    {error && <div className="error">{error}</div>}
    {summary && <div className="stats-grid"><div className="stat-card"><div><p>One-time pending</p><h2>{money(summary.ONE_TIME.pendingAmount)}</h2><small>{summary.ONE_TIME.pendingCount} fee items</small></div></div><div className="stat-card"><div><p>Monthly pending</p><h2>{money(summary.MONTHLY.pendingAmount)}</h2><small>{summary.MONTHLY.pendingCount} fee items</small></div></div></div>}
    <section className="dashboard-card"><div className="action-row"><h2>Pending {frequency === "ONE_TIME" ? "one-time" : "monthly"} fees</h2><div><button type="button" className={frequency === "ONE_TIME" ? "" : "secondary-button"} onClick={() => setFrequency("ONE_TIME")}>One-time</button> <button type="button" className={frequency === "MONTHLY" ? "" : "secondary-button"} onClick={() => setFrequency("MONTHLY")}>Monthly</button></div></div>
      {loading ? <div className="page-loading">Loading fee records…</div> : fees.length ? <div className="table-card"><table><thead><tr><th>Student</th><th>Batch</th><th>Period / Due date</th><th>Fee</th><th>Received</th><th>Balance</th><th>Status</th><th>Action</th></tr></thead><tbody>{fees.map((fee) => <tr key={fee.fee_id}><td><strong>{fee.student_name}</strong><small>{fee.admission_number}</small></td><td>{fee.batch_name || "—"}</td><td>{fee.billing_period_start || fee.due_date}{fee.due_date ? ` · due ${String(fee.due_date).slice(0, 10)}` : ""}</td><td>{money(fee.amount)}</td><td>{money(fee.paid_amount)}</td><td>{money(fee.balance)}</td><td>{fee.status}</td><td><button type="button" onClick={() => markReceived(fee)}>Mark received</button></td></tr>)}</tbody></table></div> : <p>No pending fees in this category.</p>}
    </section>
  </div>;
}
