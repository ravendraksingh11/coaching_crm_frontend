import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createCourse } from "../../api/institute.api";

export default function CreateCourse() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      setLoading(true);
      await createCourse({ name, description });
      navigate("/institute/courses");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page" style={{ padding: 24 }}>
      <div className="page-header">
        <div><h1>Add Course</h1><p>Enter the course details below.</p></div>
        <Link className="button-link secondary-link" to="/institute/courses">Back to courses</Link>
      </div>
      <form onSubmit={handleSubmit} className="dashboard-card course-form">
        <label>Course name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Course name" required /></label>
        <label>Description<textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" /></label>
        <button disabled={loading}>{loading ? "Creating..." : "Add Course"}</button>
      </form>
    </div>
  );
}
