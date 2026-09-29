import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteBatch, getBatches, updateBatch } from "../../api/institute.api";

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadBatches() {
    try {
      const result = await getBatches();
      setBatches(result?.data || []);
    } catch (error) {
      console.error("Failed to load batches:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBatches(); }, []);

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this batch?")) return;
    try {
      await deleteBatch(id);
      await loadBatches();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete batch");
    }
  }

  if (loading) return <div>Loading batches...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div><h1>Batches</h1><p>Manage class schedules and batch enrollment.</p></div>
        <Link className="button-link" to="/institute/batches/create">Create Batch</Link>
      </div>
      {batches.length === 0 ? <p>No batches found.</p> : <div className="table-card"><table>
        <thead><tr><th>Batch</th><th>Course</th><th>Schedule</th><th>Room</th><th>Students</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>{batches.map((batch) => <tr key={batch.id}>
          <td>{batch.name}</td><td>{batch.course_name || "No Course"}</td>
          <td>{[batch.start_time, batch.end_time].filter(Boolean).join(" – ") || "-"}</td>
          <td>{batch.room_number || "-"}</td><td>{batch.student_count || 0}</td><td>{batch.status}</td>
          <td><div className="action-row">
            <button type="button" className="secondary-button" onClick={async () => {
              const name = window.prompt("Batch name", batch.name); if (name === null) return;
              try { await updateBatch(batch.id, { name }); await loadBatches(); }
              catch (error) { alert(error?.response?.data?.message || "Could not update batch"); }
            }}>Edit</button>
            <button type="button" className="danger-button" onClick={() => handleDelete(batch.id)}>Delete</button>
          </div></td>
        </tr>)}</tbody>
      </table></div>}
    </div>
  );
}
