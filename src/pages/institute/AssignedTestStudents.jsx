import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAssignedTestStudents, getInstituteTest } from "../../api/institute.api";

export default function AssignedTestStudents() {
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([getInstituteTest(testId), getAssignedTestStudents(testId)])
      .then(([testResult, studentResult]) => {
        setTest(testResult.data);
        setStudents(studentResult.data || []);
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load test results"))
      .finally(() => setLoading(false));
  }, [testId]);

  const filteredStudents = useMemo(
    () => students.filter((student) => filter === "ALL" || student.attempt_status === filter),
    [filter, students],
  );
  const attemptedCount = students.filter((student) => student.attempt_status === "ATTEMPTED").length;
  const pendingCount = students.length - attemptedCount;

  return (
    <div className="page assigned-test-students-page">
      <div className="page-header">
        <div>
          <h1>{test ? `${test.title} · Student results` : "Student results"}</h1>
          <p>Review assigned students and their test attempt status.</p>
        </div>
        <Link className="button-link secondary-link" to="/institute/tests">Back to tests</Link>
      </div>
      {error && <div className="error" role="alert">{error}</div>}
      {loading ? <div className="page-loading">Loading assigned students…</div> : <>
        <div className="assignment-filters" role="group" aria-label="Filter students by test attempt status">
          <button type="button" className={filter === "ATTEMPTED" ? "assignment-filter-active" : "secondary-button"} onClick={() => setFilter("ATTEMPTED")}>Attempted ({attemptedCount})</button>
          <button type="button" className={filter === "PENDING" ? "assignment-filter-active" : "secondary-button"} onClick={() => setFilter("PENDING")}>Pending ({pendingCount})</button>
          <button type="button" className={filter === "ALL" ? "assignment-filter-active" : "secondary-button"} onClick={() => setFilter("ALL")}>All ({students.length})</button>
        </div>
        {filteredStudents.length ? <div className="table-card"><table>
          <thead><tr><th>Student</th><th>Admission number</th><th>Attempt status</th><th>Started</th><th>Submitted</th></tr></thead>
          <tbody>{filteredStudents.map((student) => <tr key={student.student_id}>
            <td>{student.name}</td>
            <td>{student.admission_number}</td>
            <td><span className={`status ${student.attempt_status === "ATTEMPTED" ? "active" : "trial"}`}>{student.attempt_status}</span></td>
            <td>{student.started_at ? new Date(student.started_at).toLocaleString() : "—"}</td>
            <td>{student.submitted_at ? new Date(student.submitted_at).toLocaleString() : "—"}</td>
          </tr>)}</tbody>
        </table></div> : <div className="dashboard-card">No students match this filter.</div>}
      </>}
    </div>
  );
}
