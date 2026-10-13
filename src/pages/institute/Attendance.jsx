import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "../../components/DataTable";
import { getAttendanceSessions } from "../../api/institute.api";

const today = () => new Date().toISOString().slice(0, 10);
export default function Attendance() {
  const isTeacher =
    JSON.parse(localStorage.getItem("user") || "{}").role === "TEACHER";
  const attendanceBasePath = isTeacher
    ? "/teacher/attendance"
    : "/institute/attendance";
  const [sessions, setSessions] = useState([]);
  const [filterDate, setFilterDate] = useState(today());
  const [error, setError] = useState("");

  const sessionColumns = [
    {
      key: "batch",
      header: "Batch / time",
      value: (item) => item.batch_name,
      render: (item) => (
        <>
          <strong>{item.batch_name}</strong>
          <small>
            {item.session_date}
            {item.start_time
              ? ` · ${String(item.start_time).slice(0, 5)}`
              : ""}
            {item.end_time ? `–${String(item.end_time).slice(0, 5)}` : ""}
          </small>
        </>
      ),
    },
    {
      key: "teacher",
      header: "Teacher",
      value: (item) => item.teacher_name || "—",
    },
    {
      key: "roster",
      header: "Roster",
      value: (item) =>
        `${item.present_count} present · ${item.absent_count} absent · ${item.late_count} late · ${item.leave_count} leave`,
    },
    { key: "status", header: "Session", value: (item) => item.status },
    {
      key: "action",
      header: "Action",
      searchable: false,
      sortable: false,
      render: (item) => (
        <Link
          className="button-link"
          to={`${attendanceBasePath}/session/${item.id}`}
        >
          Take attendance
        </Link>
      ),
    },
  ];

  async function loadSessions(date = filterDate) {
    const result = await getAttendanceSessions(date ? { date } : {});
    setSessions(result.data || []);
  }
  useEffect(() => {
    loadSessions().catch((e) =>
      setError(e.response?.data?.message || "Could not load sessions"),
    );
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div className="attendance-page-title">
          <div>
            <h1>Attendance</h1>
            <p>
              Create class sessions, mark the roster, and review batch
              attendance.
            </p>
          </div>
          <Link className="button-link" to={`${attendanceBasePath}/create`}>
            Create Session
          </Link>
        </div>
        <Link
          className="button-link secondary-link"
          to={`${attendanceBasePath}/report`}
        >
          Batch attendance report
        </Link>
      </div>
      {error && <div className="error">{error}</div>}

      <section className="dashboard-card">
        <div className="action-row">
          <h2>Class sessions</h2>
          <label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                loadSessions(e.target.value).catch((err) =>
                  setError(
                    err.response?.data?.message || "Could not load sessions",
                  ),
                );
              }}
            />
          </label>
          <button
            className="compact-cta"
            type="button"
            onClick={() => {
              setFilterDate("");
              loadSessions("").catch(() => setError("Could not load sessions"));
            }}
          >
            All dates
          </button>
        </div>
        <DataTable
          columns={sessionColumns}
          rows={sessions}
          rowKey={(item) => item.id}
          emptyMessage="No sessions for this date."
          searchPlaceholder="Search sessions..."
        />
      </section>
    </div>
  );
}
