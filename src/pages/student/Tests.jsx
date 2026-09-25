import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyTests } from "../../api/institute.api";

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true); setError("");
    try { const result = await getMyTests(); setTests(result.data || []); }
    catch (e) { setError(e.response?.data?.message || "Could not load your tests"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  return <div className="page">
    <div className="page-header"><div><h1>My Tests</h1><p>Tests assigned to you and your latest results</p></div><button onClick={load}>Refresh</button></div>
    {error && <div className="error">{error}</div>}
    {loading ? <div className="page-loading">Loading tests…</div> : tests.length === 0 ? <div className="dashboard-card">No active tests assigned yet.</div> : <div className="table-card"><table><thead><tr><th>Test</th><th>Due</th><th>Duration</th><th>Result</th><th>Status</th><th /></tr></thead><tbody>{tests.map(test => <tr key={test.id}><td><strong>{test.title}</strong><small>{test.description || ""}</small></td><td>{test.due_date ? new Date(test.due_date).toLocaleDateString() : "—"}</td><td>{test.duration_minutes ? `${test.duration_minutes} min` : "—"}</td><td>{test.marks_obtained == null ? "—" : `${test.marks_obtained} / ${test.total_marks} (${Number(test.percentage).toFixed(1)}%)`}</td><td><span className={`status ${test.submitted_at ? "active" : "trial"}`}>{test.submitted_at ? "Submitted" : "Not submitted"}</span></td><td>{!test.submitted_at && <Link to={`/student/tests/${test.id}`} className="button-link">Start test</Link>}</td></tr>)}</tbody></table></div>}
  </div>;
}
