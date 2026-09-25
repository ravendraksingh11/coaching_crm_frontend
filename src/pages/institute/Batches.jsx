import { useEffect, useState } from "react";
import {
    getBatches,
    createBatch,
    getCourses,
} from "../../api/institute.api";

export default function Batches() {
    const [batches, setBatches] = useState([]);
    const [courses, setCourses] = useState([]);

    const [form, setForm] = useState({
        name: "",
        courseId: "",
        startDate: "",
        endDate: "",
        capacity: "",
        timing: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [coursesResponse, batchesResponse] = await Promise.all([
                getCourses(),
                getBatches(),
            ]);

            console.log("Courses API:", coursesResponse);
            console.log("Batches API:", batchesResponse);
            console.log("coursesResponse", coursesResponse)
            setCourses(coursesResponse?.data || []);
            setBatches(batchesResponse?.data || []);
        } catch (err) {
            console.error("Failed to load batches data:", err);

            setError(
                err?.response?.data?.message ||
                "Failed to load courses and batches"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim()) {
            alert("Batch name is required");
            return;
        }

        try {
            setSaving(true);

            await createBatch({
                name: form.name,
                courseId: form.courseId || null,
                startDate: form.startDate || null,
                endDate: form.endDate || null,
                capacity: form.capacity
                    ? Number(form.capacity)
                    : null,
                timing: form.timing || null,
            });

            setForm({
                name: "",
                courseId: "",
                startDate: "",
                endDate: "",
                capacity: "",
                timing: "",
            });

            await loadData();

            alert("Batch created successfully");
        } catch (err) {
            console.error("Create batch error:", err);

            alert(
                err?.response?.data?.message ||
                "Failed to create batch"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this batch?"
        );

        if (!confirmed) return;

        try {
            await fetch(`/api/institute/batches/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            await loadData();
        } catch (err) {
            console.error("Delete batch error:", err);
            alert("Failed to delete batch");
        }
    };

    if (loading) {
        return <div>Loading courses and batches...</div>;
    }

    return (
        <div style={{ padding: "24px" }}>
            <h1>Batches</h1>

            {error && (
                <div
                    style={{
                        padding: "12px",
                        marginBottom: "20px",
                        background: "#ffe5e5",
                        color: "#b00020",
                    }}
                >
                    {error}
                </div>
            )}

            {/* Create Batch */}
            <form
                onSubmit={handleSubmit}
                style={{
                    padding: "20px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    marginBottom: "30px",
                }}
            >
                <h2>Create Batch</h2>

                <div style={{ marginBottom: "12px" }}>
                    <label>Batch Name</label>
                    <br />
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. NEET Morning Batch"
                        required
                    />
                </div>

                <div style={{ marginBottom: "12px" }}>
                    <label>Course</label>
                    <br />

                    <select
                        name="courseId"
                        value={form.courseId}
                        onChange={handleChange}
                    >
                        <option value="">Select Course</option>

                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.name}
                            </option>
                        ))}
                    </select>

                    {courses.length === 0 && (
                        <div style={{ marginTop: "5px", color: "red" }}>
                            No courses found. Please create a course first.
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: "12px" }}>
                    <label>Start Date</label>
                    <br />
                    <input
                        type="date"
                        name="startDate"
                        value={form.startDate}
                        onChange={handleChange}
                    />
                </div>

                <div style={{ marginBottom: "12px" }}>
                    <label>End Date</label>
                    <br />
                    <input
                        type="date"
                        name="endDate"
                        value={form.endDate}
                        onChange={handleChange}
                    />
                </div>

                <div style={{ marginBottom: "12px" }}>
                    <label>Capacity</label>
                    <br />
                    <input
                        type="number"
                        name="capacity"
                        value={form.capacity}
                        onChange={handleChange}
                        placeholder="e.g. 50"
                    />
                </div>

                <div style={{ marginBottom: "12px" }}>
                    <label>Timing</label>
                    <br />
                    <input
                        type="text"
                        name="timing"
                        value={form.timing}
                        onChange={handleChange}
                        placeholder="e.g. 8:00 AM - 10:00 AM"
                    />
                </div>

                <button type="submit" disabled={saving}>
                    {saving ? "Creating..." : "Create Batch"}
                </button>
            </form>

            {/* Batch List */}
            <h2>All Batches</h2>

            {batches.length === 0 ? (
                <p>No batches found.</p>
            ) : (
                <table
                    border="1"
                    cellPadding="10"
                    cellSpacing="0"
                    width="100%"
                >
                    <thead>
                        <tr>
                            <th>Batch</th>
                            <th>Course</th>
                            <th>Timing</th>
                            <th>Capacity</th>
                            <th>Students</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {batches.map((batch) => (
                            <tr key={batch.id}>
                                <td>{batch.name}</td>

                                <td>
                                    {batch.course_name || "No Course"}
                                </td>

                                <td>{batch.timing || "-"}</td>

                                <td>{batch.capacity || "-"}</td>

                                <td>{batch.student_count || 0}</td>

                                <td>{batch.status}</td>

                                <td>
                                    <button
                                        onClick={() => handleDelete(batch.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}