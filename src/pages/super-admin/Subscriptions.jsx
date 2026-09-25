import { useEffect, useState } from "react";
import { getInstitutes, getPlans, assignLegacySubscription } from "../../api/superAdmin.api";

export default function Subscriptions() {
  const [institutes, setInstitutes] = useState([]); const [plans, setPlans] = useState([]);
  const [planByInstitute, setPlanByInstitute] = useState({}); const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(""); const [error, setError] = useState("");
  async function load() {
    setLoading(true); setError("");
    try { const [i, p] = await Promise.all([getInstitutes(), getPlans()]); setInstitutes(i.data || []); setPlans((p.data || []).filter(x => x.is_active)); }
    catch (e) { setError(e.response?.data?.message || "Could not load institutes and plans"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  async function assign(id) {
    if (!planByInstitute[id]) { setError("Choose an active plan first."); return; }
    try { setSaving(id); setError(""); await assignLegacySubscription(id, { planId: planByInstitute[id], startDate }); await load(); }
    catch (e) { setError(e.response?.data?.message || "Could not assign plan"); }
    finally { setSaving(""); }
  }
  return <div className="page"><div className="page-header"><div><h1>Institute subscriptions</h1><p>Assign or replace an institute plan.</p></div><button onClick={load}>Refresh</button></div>
    {error && <div className="error">{error}</div>}
    {loading ? <div className="page-loading">Loading subscriptions…</div> : <div className="table-card"><table><thead><tr><th>Institute</th><th>Current plan</th><th>Status</th><th>Assign active plan</th><th>Start date</th><th /></tr></thead><tbody>{institutes.map(i => <tr key={i.id}><td><strong>{i.name}</strong><small>{i.email}</small></td><td>{i.plan_name || "No plan"}</td><td><span className={`status ${(i.status || "").toLowerCase()}`}>{i.status}</span></td><td><select value={planByInstitute[i.id] || ""} onChange={e => setPlanByInstitute(v => ({ ...v, [i.id]: e.target.value }))}><option value="">Select plan</option>{plans.map(p => <option key={p.id} value={p.id}>{p.name} · ₹{p.price}</option>)}</select></td><td><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></td><td><button disabled={saving === i.id || !plans.length} onClick={() => assign(i.id)}>{saving === i.id ? "Assigning…" : "Assign"}</button></td></tr>)}</tbody></table>{institutes.length === 0 && <p className="empty-state">No institutes found.</p>}</div>}
  </div>;
}
