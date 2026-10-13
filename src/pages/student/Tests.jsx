import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "../../components/DataTable";
import { getMyTests } from "../../api/institute.api";

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await getMyTests();
      setTests(result.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load your tests");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  const columns = [
    {
      key: "title",
      header: "Test",
      value: (test) => test.title,
      render: (test) => (
        <>
          <strong>{test.title}</strong>
          <small>{test.description || ""}</small>
        </>
      ),
    },
    {
      key: "due",
      header: "Due",
      value: (test) =>
        test.due_date ? new Date(test.due_date).toLocaleDateString() : "—",
    },
    {
      key: "duration",
      header: "Duration",
      value: (test) =>
        test.duration_minutes ? `${test.duration_minutes} min` : "—",
    },
    {
      key: "result",
      header: "Result",
      value: (test) =>
        test.result_available
          ? `${test.marks_obtained} / ${test.total_marks} (${Number(test.percentage).toFixed(1)}%)`
          : test.submitted_at && test.result_declaration_date
            ? `Available on ${new Date(`${String(test.result_declaration_date).slice(0, 10)}T00:00:00`).toLocaleDateString()}`
            : test.submitted_at
              ? "Awaiting result"
              : "—",
    },
    {
      key: "status",
      header: "Status",
      value: (test) => test.submitted_at ? "Submitted" : "Not submitted",
      render: (test) => (
        <span className={`status ${test.submitted_at ? "active" : "trial"}`}>
          {test.submitted_at ? "Submitted" : "Not submitted"}
        </span>
      ),
    },
    {
      key: "action",
      header: "Action",
      sortable: false,
      searchable: false,
      value: () => "",
      render: (test) =>
        test.submitted_at && test.result_available ? (
          <Link to={`/student/tests/${test.id}/result`} className="button-link">
            View
          </Link>
        ) : test.submitted_at ? (
          <span>Result not declared</span>
        ) : (
          <Link to={`/student/tests/${test.id}`} className="button-link">
            Start test
          </Link>
        ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My Tests</h1>
          <p>Tests assigned to you and your latest results</p>
        </div>
        <button onClick={load}>Refresh</button>
      </div>
      {error && <div className="error">{error}</div>}
      {loading ? (
        <div className="page-loading">Loading tests…</div>
      ) : tests.length === 0 ? (
        <div className="dashboard-card">No active tests assigned yet.</div>
      ) : (
        <DataTable
          columns={columns}
          rows={tests}
          rowKey={(test) => test.id}
          searchPlaceholder="Search tests..."
        />
      )}
    </div>
  );
}
