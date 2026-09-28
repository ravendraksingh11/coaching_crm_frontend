import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAttendanceSessions,
  getBatches,
  getBatchAttendanceReport,
} from "../../api/institute.api";

const today = () => new Date().toISOString().slice(0, 10);
export default function Attendance() {
  const isTeacher =
    JSON.parse(localStorage.getItem("user") || "{}").role === "TEACHER";
  const attendanceBasePath = isTeacher
    ? "/teacher/attendance"
    : "/institute/attendance";
  const [batches, setBatches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionPage, setSessionPage] = useState(1);
  const [reportBatchId, setReportBatchId] = useState("");
  const [report, setReport] = useState([]);
  const [filterDate, setFilterDate] = useState(today());
  const [error, setError] = useState("");
  const sessionsPerPage = 10;
  const sessionPageCount = Math.max(1, Math.ceil(sessions.length / sessionsPerPage));
  const visibleSessions = sessions.slice(
    (sessionPage - 1) * sessionsPerPage,
    sessionPage * sessionsPerPage,
  );

  async function loadSessions(date = filterDate) {
    const result = await getAttendanceSessions(date ? { date } : {});
    setSessions(result.data || []);
    setSessionPage(1);
  }
  useEffect(() => {
    getBatches()
      .then((b) => setBatches(b.data || []))
      .catch((e) =>
        setError(e.response?.data?.message || "Could not load batches"),
      );
    loadSessions().catch((e) =>
      setError(e.response?.data?.message || "Could not load sessions"),
    );
  }, []);

  async function loadReport(batchId) {
    setReportBatchId(batchId);
    setReport([]);
    if (!batchId) return;
    try {
      const result = await getBatchAttendanceReport(batchId);
      setReport(result.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load batch report");
    }
  }
  function exportReport() {
    const rows = [
      [
        "Student",
        "Admission number",
        "Classes",
        "Present",
        "Absent",
        "Late",
        "Leave",
        "Attendance %",
      ],
      ...report.map((s) => [
        s.name,
        s.admission_number,
        s.total_classes,
        s.present,
        s.absent,
        s.late,
        s.leave,
        s.percentage,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "attendance-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

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
        <a
          className="button-link secondary-link"
          href="#batch-attendance-report"
        >
          Batch attendance report
        </a>
      </div>
      {error && <div className="error">{error}</div>}

      <section className="dashboard-card">
        <div className="action-row">
          <h2>Class sessions</h2>
          <label>
            Show date
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
        {sessions.length ? (
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Batch / time</th>
                  <th>Teacher</th>
                  <th>Roster</th>
                  <th>Session</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleSessions.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.batch_name}</strong>
                      <small>
                        {item.session_date}
                        {item.start_time
                          ? ` · ${String(item.start_time).slice(0, 5)}`
                          : ""}
                        {item.end_time
                          ? `–${String(item.end_time).slice(0, 5)}`
                          : ""}
                      </small>
                    </td>
                    <td>{item.teacher_name || "—"}</td>
                    <td>
                      {item.present_count} present · {item.absent_count} absent
                      · {item.late_count} late · {item.leave_count} leave
                    </td>
                    <td>{item.status}</td>
                    <td>
                      <Link
                        className="button-link"
                        to={`${attendanceBasePath}/session/${item.id}`}
                      >
                        Take attendance
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No sessions for this date.</p>
        )}
        {sessions.length > sessionsPerPage && (
          <div className="pagination-controls" aria-label="Class sessions pagination">
            <span>
              Showing {(sessionPage - 1) * sessionsPerPage + 1}–{Math.min(sessionPage * sessionsPerPage, sessions.length)} of {sessions.length}
            </span>
            <button type="button" disabled={sessionPage === 1} onClick={() => setSessionPage((page) => page - 1)}>Previous</button>
            <span>Page {sessionPage} of {sessionPageCount}</span>
            <button type="button" disabled={sessionPage >= sessionPageCount} onClick={() => setSessionPage((page) => page + 1)}>Next</button>
          </div>
        )}
      </section>

      <section className="dashboard-card" id="batch-attendance-report">
        <div className="action-row">
          <h2>Batch attendance report</h2>
          {report.length > 0 && (
            <button
              className="compact-cta"
              type="button"
              onClick={exportReport}
            >
              Export CSV
            </button>
          )}
        </div>
        <label>
          Batch
          <select
            value={reportBatchId}
            onChange={(e) => loadReport(e.target.value)}
          >
            <option value="">Select a batch</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        {reportBatchId && (
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Classes</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Leave</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {report.map((student) => (
                  <tr key={student.student_id}>
                    <td>
                      {student.name}
                      <small>{student.admission_number}</small>
                    </td>
                    <td>{student.total_classes}</td>
                    <td>{student.present}</td>
                    <td>{student.absent}</td>
                    <td>{student.late}</td>
                    <td>{student.leave}</td>
                    <td>
                      <span
                        className={`status ${Number(student.percentage) < 75 ? "trial" : "active"}`}
                      >
                        {student.percentage}%
                        {Number(student.percentage) < 75 ? " · Below 75%" : ""}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
