import { useCallback, useEffect, useState } from "react";
import { getMyFees, submitMyFeePayment } from "../../api/institute.api";

const currency = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [paymentForms, setPaymentForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try { const response = await getMyFees(); setFees(response.data || []); }
    catch (e) { setError(e.response?.data?.message || "Could not load your fees"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  function updateForm(feeId, field, value) {
    setPaymentForms((current) => ({ ...current, [feeId]: { ...current[feeId], [field]: value } }));
  }
  async function submit(event, fee) {
    event.preventDefault();
    const form = paymentForms[fee.id] || {};
    setBusyId(fee.id); setError(""); setNotice("");
    try {
      const response = await submitMyFeePayment(fee.id, { amount: form.amount || fee.balance, paymentMethod: form.paymentMethod || "UPI", transactionId: form.transactionId });
      setNotice(response.message || "Payment submitted for review.");
      setPaymentForms((current) => ({ ...current, [fee.id]: {} }));
      await load();
    } catch (e) { setError(e.response?.data?.message || "Could not submit payment"); }
    finally { setBusyId(""); }
  }

  if (loading) return <div className="page-loading">Loading fees…</div>;
  return <div className="page">
    <div className="page-header"><div><h1>My Fees</h1><p>Pending balances and submitted payments</p></div><button onClick={load}>Refresh</button></div>
    {error && <div className="error">{error}</div>}{notice && <div className="success">{notice}</div>}
    {!fees.length ? <div className="dashboard-card">You have no fee records.</div> : <div className="table-card"><table><thead><tr><th>Fee</th><th>Due date</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th><th>Submit fee</th></tr></thead>
      <tbody>{fees.map((fee) => <tr key={fee.id}><td><strong>{fee.title}</strong>{fee.billing_period_start && <small>{new Date(`${fee.billing_period_start}T00:00:00`).toLocaleDateString()} – {new Date(`${fee.billing_period_end}T00:00:00`).toLocaleDateString()}</small>}</td>
        <td>{fee.due_date ? new Date(`${fee.due_date}T00:00:00`).toLocaleDateString() : "—"}</td><td>{currency(fee.amount)}</td><td>{currency(fee.paid_amount)}</td><td>{currency(fee.balance)}</td><td><span className={`status ${fee.status === "PAID" ? "active" : "trial"}`}>{fee.status}</span>{fee.submissions?.filter((submission) => submission.status === "PENDING").map((submission) => <small key={submission.created_at}>Payment {currency(submission.amount)} pending review</small>)}</td>
        <td>{Number(fee.balance) > 0 ? <form onSubmit={(event) => submit(event, fee)} className="student-fee-form"><input type="number" min="0.01" max={fee.balance} step="0.01" placeholder={String(fee.balance)} value={paymentForms[fee.id]?.amount || ""} onChange={(event) => updateForm(fee.id, "amount", event.target.value)} aria-label="Payment amount" required /><select value={paymentForms[fee.id]?.paymentMethod || "UPI"} onChange={(event) => updateForm(fee.id, "paymentMethod", event.target.value)} aria-label="Payment method"><option value="UPI">UPI</option><option value="BANK_TRANSFER">Bank transfer</option><option value="CASH">Cash</option><option value="OTHER">Other</option></select><input value={paymentForms[fee.id]?.transactionId || ""} onChange={(event) => updateForm(fee.id, "transactionId", event.target.value)} placeholder="Reference (optional)" aria-label="Payment reference" /><button disabled={busyId === fee.id}>{busyId === fee.id ? "Submitting…" : "Submit fee"}</button></form> : "—"}</td>
      </tr>)}</tbody></table></div>}
    <p className="muted">Submitted payments remain pending until your institute confirms receipt.</p>
  </div>;
}
