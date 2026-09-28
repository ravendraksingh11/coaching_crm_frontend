import { useEffect, useState } from "react";
import { getMyAttendance } from "../../api/institute.api";

export default function Attendance() {
  const [attendance, setAttendance] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { getMyAttendance().then((result) => setAttendance(result.data)).catch((e) => setError(e.response?.data?.message || "Could not load attendance")); }, []);
  if (error) return <div className="page"><div className="error">{error}</div></div>;
  if (!attendance) return <div className="page-loading">Loading attendance…</div>;
  return <div className="page"><div className="page-header"><div><h1>My Attendance</h1><p>Attendance across your completed class sessions</p></div></div>
    <div className="stats-grid"><div className="stat-card"><div><p>Attendance</p><h2>{attendance.percentage}%</h2></div></div><div className="stat-card"><div><p>Present</p><h2>{attendance.present}</h2></div></div><div className="stat-card"><div><p>Absent</p><h2>{attendance.absent}</h2></div></div><div className="stat-card"><div><p>Late</p><h2>{attendance.late}</h2></div></div><div className="stat-card"><div><p>Excused leave</p><h2>{attendance.leave}</h2></div></div></div>
    <section className="dashboard-card"><h2>Recent sessions</h2>{attendance.recent.length ? <div className="table-card"><table><thead><tr><th>Date</th><th>Batch</th><th>Status</th><th>Note</th></tr></thead><tbody>{attendance.recent.map((row, index) => <tr key={`${row.batch_name}-${row.session_date}-${index}`}><td>{new Date(`${row.session_date}T00:00:00`).toLocaleDateString()}</td><td>{row.batch_name}</td><td>{row.status}</td><td>{row.remarks || "—"}</td></tr>)}</tbody></table></div> : <p>No attendance recorded yet.</p>}</section>
  </div>;
}
