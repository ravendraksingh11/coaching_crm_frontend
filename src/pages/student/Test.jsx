import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAssignedTest, submitAssignedTest } from "../../api/institute.api";

export default function Test() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    getAssignedTest(id)
      .then((r) => setQuestions(r.data || []))
      .catch((e) =>
        setError(e.response?.data?.message || "Could not load test"),
      )
      .finally(() => setLoading(false));
  }, [id]);
  async function submit(e) {
    e.preventDefault();
    if (
      !window.confirm("Submit your answers? You cannot submit this test again.")
    )
      return;
    setSaving(true);
    setError("");
    try {
      await submitAssignedTest(id, answers);
      alert("Test submitted successfully");
      navigate("/student/tests");
    } catch (e) {
      setError(e.response?.data?.message || "Could not submit test");
    } finally {
      setSaving(false);
    }
  }
  if (loading) return <div className="page-loading">Loading test…</div>;
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Test</h1>
          <p>Choose one answer for each question.</p>
        </div>
        <Link to="/student/tests" className="button-link secondary-link">
          Back to tests
        </Link>
      </div>
      {error && <div className="error">{error}</div>}
      {questions.length > 0 && (
        <form onSubmit={submit}>
          {questions.map((q, i) => (
            <section className="dashboard-card" key={q.id}>
              <h3>
                {i + 1}. {q.question}
              </h3>
              {["a", "b", "c", "d"].map((letter) => {
                const key = `option_${letter}`;
                return (
                  q[key] && (
                    <label className="answer-option" key={letter}>
                      <input
                        type="radio"
                        name={q.id}
                        value={letter.toUpperCase()}
                        checked={answers[q.id] === letter.toUpperCase()}
                        onChange={() =>
                          setAnswers((v) => ({
                            ...v,
                            [q.id]: letter.toUpperCase(),
                          }))
                        }
                        required
                      />
                      {letter.toUpperCase()}. {q[key]}
                    </label>
                  )
                );
              })}
            </section>
          ))}
          <button disabled={saving}>
            {saving ? "Submitting…" : "Submit test"}
          </button>
        </form>
      )}
    </div>
  );
}
