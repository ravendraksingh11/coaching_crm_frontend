import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getInstituteTest } from "../../api/institute.api";

export default function ViewTest() {
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getInstituteTest(testId)
      .then((result) => setTest(result.data))
      .catch((err) => setError(err.response?.data?.message || "Could not load test details"))
      .finally(() => setLoading(false));
  }, [testId]);

  return (
    <div className="page view-test-page">
      <div className="page-header">
        <div><h1>{test?.title || "View test"}</h1><p>Test details, assignment, and questions.</p></div>
        <Link className="button-link secondary-link" to="/institute/tests">Back to tests</Link>
      </div>
      {error && <div className="error" role="alert">{error}</div>}
      {loading ? <div className="page-loading">Loading test…</div> : test && <>
        <section className="dashboard-card">
          <h2>Test details</h2>
          {test.description && <p>{test.description}</p>}
          <div className="test-detail-grid">
            <div><strong>Status</strong><span>{test.status}</span></div>
            <div><strong>Total marks</strong><span>{test.total_marks}</span></div>
            <div><strong>Duration</strong><span>{test.duration_minutes} minutes</span></div>
            <div><strong>Test date</strong><span>{test.test_date ? new Date(test.test_date).toLocaleDateString() : "—"}</span></div>
            <div><strong>Screen recording</strong><span>{test.screen_recording ? "Required" : "Not required"}</span></div>
            <div><strong>Auto-submit on leave</strong><span>{test.auto_submit_on_leave ? "Enabled" : "Disabled"}</span></div>
          </div>
        </section>
        <section className="dashboard-card">
          <h2>Questions ({test.questions?.length || 0})</h2>
          {test.questions?.map((question, index) => <article className="question-editor" key={question.id}>
            <strong>{index + 1}. {question.question}</strong>
            <p>A. {question.option_a} · B. {question.option_b} · C. {question.option_c} · D. {question.option_d}</p>
            <small>Correct answer: {question.correct_option} · {question.marks} marks</small>
          </article>)}
        </section>
      </>}
    </div>
  );
}
