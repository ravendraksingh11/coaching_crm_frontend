import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createAttendanceSession, getBatches, getTeachers } from "../../api/institute.api";

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export default function CreateAttendanceSession() {
  const navigate = useNavigate();
  const isTeacher = JSON.parse(localStorage.getItem("user") || "{}").role === "TEACHER";
  const attendancePath = isTeacher ? "/teacher/attendance" : "/institute/attendance";
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ batchId: "", sessionDate: today(), startTime: "", endTime: "", teacherId: "", remarks: "" });

  useEffect(() => {
    Promise.all([getBatches(), isTeacher ? Promise.resolve({ data: [] }) : getTeachers()])
      .then(([batchResult, teacherResult]) => {
        setBatches(batchResult.data || []);
        setTeachers(teacherResult.data || []);
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load batches and teachers"));
  }, []);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createAttendanceSession({
        ...form,
        startTime: form.startTime || null,
        endTime: form.endTime || null,
        teacherId: form.teacherId || null,
      });
      navigate(attendancePath);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create attendance session");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div><h1>Schedule a class session</h1><p>Choose a batch, date, and class times.</p></div>
        <Link className="button-link secondary-link" to={attendancePath}>Back to attendance</Link>
      </div>
      {error && <div className="error">{error}</div>}
      <form className="dashboard-card form-grid session-form" onSubmit={submit}>
        <label>Batch<select required name="batchId" value={form.batchId} onChange={updateField}><option value="">Select a batch</option>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}</select></label>
        <label>Date<input required type="date" name="sessionDate" value={form.sessionDate} onChange={updateField} /></label>
        <label>Start time<input type="time" name="startTime" value={form.startTime} onChange={updateField} /></label>
        <label>End time<input type="time" name="endTime" value={form.endTime} onChange={updateField} /></label>
        {!isTeacher && <label>Teacher<select name="teacherId" value={form.teacherId} onChange={updateField}><option value="">Unassigned</option>{teachers.map((teacher) => <option key={teacher.user_id} value={teacher.user_id}>{teacher.name}</option>)}</select></label>}
        <label>Notes<input name="remarks" value={form.remarks} onChange={updateField} /></label>
        <button disabled={saving}>{saving ? "Creating…" : "Create session"}</button>
      </form>
    </div>
  );
}
