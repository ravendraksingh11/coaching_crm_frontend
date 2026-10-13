import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import { getChildrenPerformance } from "../../api/institute.api";

function formatDate(value) {
  return value
    ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString()
    : "—";
}

export default function Performance() {
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChildrenPerformance()
      .then((response) => setResults(response.data || []))
      .catch((err) =>
        setError(
          err.response?.data?.message || "Could not load child results",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "student", header: "Student", value: (result) => result.student_name },
    { key: "test", header: "Test", value: (result) => result.title || "—" },
    {
      key: "result",
      header: "Result",
      value: (result) =>
        result.result_available
          ? `${result.marks_obtained} / ${result.total_marks} (${Number(result.percentage).toFixed(1)}%)`
          : result.submitted_at && result.result_declaration_date
            ? `Available on ${formatDate(result.result_declaration_date)}`
            : result.submitted_at
              ? "Awaiting result"
              : "—",
    },
    {
      key: "submitted",
      header: "Submitted",
      value: (result) =>
        result.submitted_at
          ? new Date(result.submitted_at).toLocaleString()
          : "—",
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Children’s Test Results</h1>
          <p>Results are shown after the institute declares them.</p>
        </div>
      </div>
      {error && <div className="error" role="alert">{error}</div>}
      {loading ? (
        <div className="page-loading">Loading test results…</div>
      ) : (
        <DataTable
          columns={columns}
          rows={results}
          rowKey={(result, index) =>
            `${result.student_id}-${result.test_id || index}`
          }
          emptyMessage="No test results are available yet."
          searchPlaceholder="Search children or tests..."
        />
      )}
    </div>
  );
}
