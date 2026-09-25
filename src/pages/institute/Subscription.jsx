import { useEffect, useState } from "react";
import { getMySubscription } from "../../api/subscription.api";

export default function Subscription() {
  const [subscriptions, setSubscriptions] = useState([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  async function load() { setLoading(true); setError(""); try { const result = await getMySubscription(); const data = result.data || []; setSubscriptions(Array.isArray(data) ? data : [data]); } catch (e) { setError(e.response?.data?.message || "Could not load subscription"); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  return <div className="page"><div className="page-header"><div><h1>Subscription</h1><p>Plan and access details for your institute.</p></div><button onClick={load}>Refresh</button></div>
    {error && <div className="error">{error}</div>}{loading ? <div className="page-loading">Loading subscription…</div> : subscriptions.length === 0 ? <div className="dashboard-card"><h2>No subscription found</h2><p>Contact your platform administrator to assign a plan.</p></div> : <div className="plans-grid">{subscriptions.map(s => <article className="plan-card" key={s.subscription_id || s.id}><span className={`status ${(s.status || "").toLowerCase()}`}>{s.status}</span><h2>{s.plan_name}</h2><p>{s.plan_description}</p><div className="price">₹{s.plan_price ?? s.amount}</div><p>Students: {s.student_limit ?? s.max_students ?? "—"}</p><p>Teachers: {s.teacher_limit ?? s.max_teachers ?? "—"}</p><p>Start: {s.start_date ? new Date(s.start_date).toLocaleDateString() : "—"}</p><p>End: {s.end_date ? new Date(s.end_date).toLocaleDateString() : "—"}</p></article>)}</div>}
  </div>;
}
