import { useEffect, useState } from "react";
import {
  createAttendanceSession, getAttendanceSession, getAttendanceSessions,
  getBatches, getBatchAttendanceReport, getTeachers, saveSessionAttendance,
  updateAttendanceSessionStatus,
} from "../../api/institute.api";

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
const statuses = ["PRESENT", "ABSENT", "LATE", "LEAVE"];

export default function Attendance() {
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [session, setSession] = useState(null);
  const [reportBatchId, setReportBatchId] = useState("");
  const [report, setReport] = useState([]);
  const [filterDate, setFilterDate] = useState(today());
  const [form, setForm] = useState({ batchId: "", sessionDate: today(), startTime: "", endTime: "", teacherId: "", remarks: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isTeacher = JSON.parse(localStorage.getItem("user") || "{}").role === "TEACHER";

  async function loadSessions(date = filterDate) {
    const result = await getAttendanceSessions(date ? { date } : {});
    setSessions(result.data || []);
  }
  async function loadSession(id) {
    const result = await getAttendanceSession(id);
    setSession(result.data);
  }
  useEffect(() => {
    Promise.all([getBatches(), isTeacher ? Promise.resolve({ data: [] }) : getTeachers()]).then(([b, t]) => {
      setBatches(b.data || []); setTeachers(t.data || []);
    }).catch((e) => setError(e.response?.data?.message || "Could not load batches and teachers"));
    loadSessions().catch((e) => setError(e.response?.data?.message || "Could not load sessions"));
  }, []);

  async function create(e) {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const result = await createAttendanceSession({ ...form, startTime: form.startTime || null, endTime: form.endTime || null, teacherId: form.teacherId || null });
      await loadSessions(); await loadSession(result.data.id);
      setForm((v) => ({ ...v, startTime: "", endTime: "", remarks: "" }));
    } catch (e) { setError(e.response?.data?.message || "Could not create attendance session"); }
    finally { setSaving(false); }
  }
  function changeStatus(studentId, status) {
    setSession((current) => ({ ...current, students: current.students.map((student) => student.student_id === studentId ? { ...student, status } : student) }));
  }
  async function save() {
    if (!session) return;
    setSaving(true); setError("");
    try {
      await saveSessionAttendance(session.id, session.students.map((student) => ({ studentId: student.student_id, status: student.status, remarks: student.remarks || "" })));
      await loadSession(session.id); await loadSessions();
    } catch (e) { setError(e.response?.data?.message || "Could not save attendance"); }
    finally { setSaving(false); }
  }
  async function setSessionStatus(status) {
    try {
      await updateAttendanceSessionStatus(session.id, status);
      await loadSession(session.id); await loadSessions();
    } catch (e) { setError(e.response?.data?.message || "Could not update session"); }
  }
  async function loadReport(batchId) {
    setReportBatchId(batchId); setReport([]);
    if (!batchId) return;
    try { const result = await getBatchAttendanceReport(batchId); setReport(result.data || []); }
    catch (e) { setError(e.response?.data?.message || "Could not load batch report"); }
  }
  function exportReport() {
    const rows = [["Student", "Admission number", "Classes", "Present", "Absent", "Late", "Leave", "Attendance %"], ...report.map((s) => [s.name, s.admission_number, s.total_classes, s.present, s.absent, s.late, s.leave, s.percentage])];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "attendance-report.csv"; link.click(); URL.revokeObjectURL(url);
  }

  return <div className="page">
    <div className="page-header"><div><h1>Attendance</h1><p>Create class sessions, mark the roster, and review batch attendance.</p></div></div>
    {error && <div className="error">{error}</div>}
    <form className="dashboard-card" onSubmit={create}>
      <h2>Schedule a class session</h2>
      <div className="form-grid">
        <label>Batch<select required value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })}><option value="">Select a batch</option>{batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
        <label>Date<input required type="date" value={form.sessionDate} onChange={(e) => setForm({ ...form, sessionDate: e.target.value })} /></label>
        <label>Start time<input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></label>
        <label>End time<input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></label>
        {!isTeacher && <label>Teacher<select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}><option value="">Unassigned</option>{teachers.map((t) => <option key={t.user_id} value={t.user_id}>{t.name}</option>)}</select></label>}
        <label>Notes<input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></label>
      </div>
      <button disabled={saving}>{saving ? "Creating…" : "Create session"}</button>
    </form>

    <section className="dashboard-card">
      <div className="action-row"><h2>Class sessions</h2><label>Show date<input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); loadSessions(e.target.value).catch((err) => setError(err.response?.data?.message || "Could not load sessions")); }} /></label><button type="button" onClick={() => { setFilterDate(""); loadSessions("").catch(() => setError("Could not load sessions")); }}>All dates</button></div>
      {sessions.length ? <div className="table-card"><table><thead><tr><th>Batch / time</th><th>Teacher</th><th>Roster</th><th>Session</th><th>Action</th></tr></thead><tbody>{sessions.map((item) => <tr key={item.id}><td><strong>{item.batch_name}</strong><small>{item.session_date}{item.start_time ? ` · ${String(item.start_time).slice(0, 5)}` : ""}{item.end_time ? `–${String(item.end_time).slice(0, 5)}` : ""}</small></td><td>{item.teacher_name || "—"}</td><td>{item.present_count} present · {item.absent_count} absent · {item.late_count} late · {item.leave_count} leave</td><td>{item.status}</td><td><button type="button" onClick={() => loadSession(item.id).catch((e) => setError(e.response?.data?.message || "Could not open roster"))}>Take attendance</button></td></tr>)}</tbody></table></div> : <p>No sessions for this date.</p>}
    </section>

    {session && <section className="dashboard-card"><div className="action-row"><div><h2>{session.batch_name} attendance</h2><p>{session.session_date} · {session.status}</p></div><button type="button" onClick={() => setSession(null)}>Close roster</button></div>
      <div className="action-row"><span>{session.students.length} students</span><button type="button" onClick={() => setSession((current) => ({ ...current, students: current.students.map((student) => ({ ...student, status: "PRESENT" })) }))}>Mark all present</button></div>
      <div className="table-card"><table><thead><tr><th>Student</th><th>Status</th><th>Note / correction reason</th></tr></thead><tbody>{session.students.map((student) => <tr key={student.student_id}><td>{student.name}<small>{student.admission_number}</small></td><td><select value={student.status} disabled={session.status === "CANCELLED"} onChange={(e) => changeStatus(student.student_id, e.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></td><td><input value={student.remarks || ""} disabled={session.status === "CANCELLED"} placeholder="Optional note" onChange={(e) => setSession((current) => ({ ...current, students: current.students.map((row) => row.student_id === student.student_id ? { ...row, remarks: e.target.value } : row) }))} /></td></tr>)}</tbody></table></div>
      <div className="action-row"><button type="button" onClick={save} disabled={saving || session.status === "CANCELLED"}>{saving ? "Saving…" : "Save attendance"}</button>{session.status === "OPEN" && <button type="button" onClick={() => setSessionStatus("COMPLETED")}>Complete session</button>}{session.status !== "CANCELLED" && <button type="button" className="danger-button" onClick={() => setSessionStatus("CANCELLED")}>Cancel session</button>}</div>
    </section>}

    <section className="dashboard-card"><div className="action-row"><h2>Batch attendance report</h2>{report.length > 0 && <button type="button" onClick={exportReport}>Export CSV</button>}</div><label>Batch<select value={reportBatchId} onChange={(e) => loadReport(e.target.value)}><option value="">Select a batch</option>{batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>{reportBatchId && <div className="table-card"><table><thead><tr><th>Student</th><th>Classes</th><th>Present</th><th>Absent</th><th>Late</th><th>Leave</th><th>Attendance</th></tr></thead><tbody>{report.map((student) => <tr key={student.student_id}><td>{student.name}<small>{student.admission_number}</small></td><td>{student.total_classes}</td><td>{student.present}</td><td>{student.absent}</td><td>{student.late}</td><td>{student.leave}</td><td><span className={`status ${Number(student.percentage) < 75 ? "trial" : "active"}`}>{student.percentage}%{Number(student.percentage) < 75 ? " · Below 75%" : ""}</span></td></tr>)}</tbody></table></div>}</section>
  </div>;
}
