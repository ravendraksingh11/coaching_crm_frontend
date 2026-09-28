import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getAttendanceSession,
  saveSessionAttendance,
  updateAttendanceSessionStatus,
} from "../../api/institute.api";

const statuses = ["PRESENT", "ABSENT", "LATE", "LEAVE"];

export default function TakeAttendance() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isTeacher = JSON.parse(localStorage.getItem("user") || "{}").role === "TEACHER";
  const backPath = isTeacher ? "/teacher/attendance" : "/institute/attendance";

  async function loadSession() {
    try {
      const result = await getAttendanceSession(id);
      setSession(result.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load attendance roster");
    }
  }

  useEffect(() => { loadSession(); }, [id]);

  function updateStudent(studentId, changes) {
    setSession((current) => ({
      ...current,
      students: current.students.map((student) => student.student_id === studentId ? { ...student, ...changes } : student),
    }));
  }

  async function save() {
    if (!session) return;
    setSaving(true);
    setError("");
    try {
      await saveSessionAttendance(session.id, session.students.map((student) => ({
        studentId: student.student_id,
        status: student.status,
        remarks: student.remarks || "",
      })));
      await loadSession();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save attendance");
    } finally {
      setSaving(false);
    }
  }

  async function setSessionStatus(status) {
    setSaving(true);
    setError("");
    try {
      await updateAttendanceSessionStatus(session.id, status);
      await loadSession();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update session");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page take-attendance-page">
      <div className="page-header">
        <div><h1>{session ? `${session.batch_name} attendance` : "Take attendance"}</h1><p>{session ? `${session.session_date} · ${session.status}` : "Loading session roster…"}</p></div>
        <Link className="button-link secondary-link" to={backPath}>Back to attendance</Link>
      </div>
      {error && <div className="error">{error}</div>}
      {session && <>
        <div className="roster-toolbar">
          <strong>{session.students.length} students</strong>
          <button type="button" disabled={session.status === "CANCELLED"} onClick={() => setSession((current) => ({ ...current, students: current.students.map((student) => ({ ...student, status: "PRESENT" })) }))}>Mark all present</button>
        </div>
        <div className="attendance-roster">
          {session.students.map((student) => <article className="attendance-student-card" key={student.student_id}>
            <div className="attendance-student-name"><strong>{student.name}</strong><small>{student.admission_number}</small></div>
            <label>Status<select value={student.status} disabled={session.status === "CANCELLED"} onChange={(event) => updateStudent(student.student_id, { status: event.target.value })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
            <label>Note / correction reason<input value={student.remarks || ""} disabled={session.status === "CANCELLED"} placeholder="Optional note" onChange={(event) => updateStudent(student.student_id, { remarks: event.target.value })} /></label>
          </article>)}
        </div>
        <div className="roster-actions">
          <button type="button" onClick={save} disabled={saving || session.status === "CANCELLED"}>{saving ? "Saving…" : "Save attendance"}</button>
          {session.status === "OPEN" && <button type="button" disabled={saving} onClick={() => setSessionStatus("COMPLETED")}>Complete session</button>}
          {session.status !== "CANCELLED" && <button type="button" className="danger-button" disabled={saving} onClick={() => setSessionStatus("CANCELLED")}>Cancel session</button>}
        </div>
      </>}
    </div>
  );
}
