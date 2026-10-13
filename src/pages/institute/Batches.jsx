import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "../../components/DataTable";
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

  const columns = [
    { key: "name", header: "Batch", value: (batch) => batch.name },
    {
      key: "course",
      header: "Course",
      value: (batch) => batch.course_name || "No Course",
    },
    {
      key: "schedule",
      header: "Schedule",
      value: (batch) =>
        [batch.start_time, batch.end_time].filter(Boolean).join(" – ") || "-",
    },
    {
      key: "room",
      header: "Room",
      value: (batch) => batch.room_number || "-",
    },
    {
      key: "students",
      header: "Students",
      value: (batch) => batch.student_count || 0,
    },
    { key: "status", header: "Status", value: (batch) => batch.status },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      searchable: false,
      render: (batch) => (
        <div className="action-row">
          <button
            type="button"
            className="secondary-button"
            onClick={async () => {
              const name = window.prompt("Batch name", batch.name);
              if (name === null) return;
              try {
                await updateBatch(batch.id, { name });
                await loadBatches();
              } catch (error) {
                alert(error?.response?.data?.message || "Could not update batch");
              }
            }}
          >
            Edit
          </button>
          <button
            type="button"
            className="danger-button"
            onClick={() => handleDelete(batch.id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <div>Loading batches...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div><h1>Batches</h1><p>Manage class schedules and batch enrollment.</p></div>
        <Link className="button-link" to="/institute/batches/create">Create Batch</Link>
      </div>
      <DataTable
        columns={columns}
        rows={batches}
        rowKey={(batch) => batch.id}
        emptyMessage="No batches found."
        searchPlaceholder="Search batches..."
      />
    </div>
  );
}
