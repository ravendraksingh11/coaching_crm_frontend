import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import { getChildrenAttendance } from "../../api/institute.api";

export default function Attendance() {
  const [children, setChildren] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { getChildrenAttendance().then((result) => setChildren(result.data || [])).catch((e) => setError(e.response?.data?.message || "Could not load child attendance")).finally(() => setLoading(false)); }, []);
  const recentColumns = [
    {
      key: "date",
      header: "Date",
      value: (row) => new Date(`${row.date}T00:00:00`).toLocaleDateString(),
    },
    { key: "batch", header: "Batch", value: (row) => row.batch },
    { key: "status", header: "Status", value: (row) => row.status },
  ];
  return <div className="page"><div className="page-header"><div><h1>Children’s Attendance</h1><p>Attendance for completed class sessions</p></div></div>{error && <div className="error">{error}</div>}{loading ? <div className="page-loading">Loading attendance…</div> : children.length ? children.map((child) => <section className="dashboard-card" key={child.studentId}><h2>{child.studentName}</h2><div className="stats-grid"><div className="stat-card"><div><p>Attendance</p><h2>{child.percentage}%</h2></div></div><div className="stat-card"><div><p>Present</p><h2>{child.present}</h2></div></div><div className="stat-card"><div><p>Absent</p><h2>{child.absent}</h2></div></div><div className="stat-card"><div><p>Late</p><h2>{child.late}</h2></div></div><div className="stat-card"><div><p>Excused leave</p><h2>{child.leave}</h2></div></div></div><h3>Recent sessions</h3>{child.recent.length ? <DataTable columns={recentColumns} rows={child.recent} rowKey={(row, index) => `${row.batch}-${row.date}-${index}`} searchPlaceholder="Search sessions..." /> : <p>No attendance records yet.</p>}</section>) : <div className="dashboard-card">No linked children were found.</div>}</div>;
}
