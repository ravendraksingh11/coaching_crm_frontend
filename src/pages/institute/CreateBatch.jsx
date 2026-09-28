import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createBatch, getCourses } from "../../api/institute.api";

const initialForm = {
  name: "", courseId: "", startDate: "", endDate: "",
  startTime: "", endTime: "", roomNumber: "",
};

export default function CreateBatch() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [courses, setCourses] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCourses().then((result) => setCourses(result?.data || [])).catch((error) => {
      alert(error?.response?.data?.message || "Failed to load courses");
    });
  }, []);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim()) return;
    try {
      setSaving(true);
      await createBatch({
        name: form.name,
        courseId: form.courseId || null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        startTime: form.startTime || null,
        endTime: form.endTime || null,
        roomNumber: form.roomNumber || null,
      });
      alert("Batch created successfully");
      navigate("/institute/batches");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to create batch");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page" style={{ padding: 24 }}>
      <div className="page-header">
        <div><h1>Create Batch</h1><p>Set up the course, dates, and class schedule.</p></div>
        <Link className="button-link secondary-link" to="/institute/batches">Back to batches</Link>
      </div>
      {courses.length === 0 && <p className="error">No courses found. Please create a course first.</p>}
      <form onSubmit={handleSubmit} className="form-grid batch-form">
        <label>Batch name<input name="name" value={form.name} onChange={handleChange} placeholder="e.g. NEET Morning Batch" required /></label>
        <label>Course<select name="courseId" value={form.courseId} onChange={handleChange}><option value="">Select Course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>
        <label>Start date<input type="date" name="startDate" value={form.startDate} onChange={handleChange} /></label>
        <label>End date<input type="date" name="endDate" value={form.endDate} onChange={handleChange} /></label>
        <label>Start time<input type="time" name="startTime" value={form.startTime} onChange={handleChange} /></label>
        <label>End time<input type="time" name="endTime" value={form.endTime} onChange={handleChange} /></label>
        <label>Room number<input name="roomNumber" value={form.roomNumber} onChange={handleChange} /></label>
        <button type="submit" disabled={saving}>{saving ? "Creating..." : "Create Batch"}</button>
      </form>
    </div>
  );
}
