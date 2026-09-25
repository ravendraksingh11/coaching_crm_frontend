import { useEffect, useState } from "react";
import {
    getBatches,
    createBatch,
    getCourses,
    updateBatch,
    deleteBatch,
} from "../../api/institute.api";

export default function Batches() {
    const [batches, setBatches] = useState([]);
    const [courses, setCourses] = useState([]);

    const [form, setForm] = useState({
        name: "",
        courseId: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        roomNumber: "",
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
                startTime: form.startTime || null,
                endTime: form.endTime || null,
                roomNumber: form.roomNumber || null,
            });

            setForm({
                name: "",
                courseId: "",
                startDate: "",
                endDate: "",
                startTime: "",
                endTime: "",
                roomNumber: "",
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
            await deleteBatch(id);
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
                    <label>Start time</label>
                    <br />
                    <input
                        type="time"
                        name="startTime"
                        value={form.startTime}
                        onChange={handleChange}
                        placeholder="e.g. 50"
                    />
                </div>

                <div style={{ marginBottom: "12px" }}>
                    <label>End time</label>
                    <br />
                    <input
                        type="time"
                        name="endTime"
                        value={form.endTime}
                        onChange={handleChange}
                    />
                </div>
                <div style={{ marginBottom: "12px" }}><label>Room number</label><br /><input name="roomNumber" value={form.roomNumber} onChange={handleChange} /></div>

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
                            <th>Schedule</th>
                            <th>Room</th>
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

                                <td>{[batch.start_time, batch.end_time].filter(Boolean).join(" – ") || "-"}</td>

                                <td>{batch.room_number || "-"}</td>

                                <td>{batch.student_count || 0}</td>

                                <td>{batch.status}</td>

                                <td>
                                    <div className="action-row"><button type="button" className="secondary-button" onClick={async () => {
                                        const name = window.prompt("Batch name", batch.name); if (name === null) return;
                                        try { await updateBatch(batch.id, { name }); await loadData(); }
                                        catch (err) { alert(err?.response?.data?.message || "Could not update batch"); }
                                    }}>Edit</button><button
                                        onClick={() => handleDelete(batch.id)}
                                        className="danger-button"
                                    >
                                        Delete
                                    </button></div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
