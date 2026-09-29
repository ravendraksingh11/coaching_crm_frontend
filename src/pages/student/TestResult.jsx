import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAssignedTestResult } from "../../api/institute.api";

const optionLabel = (question, option) => {
  if (!option) return "Not answered";
  const text = question[`option_${option.toLowerCase()}`];
  return text ? `${option}. ${text}` : option;
};

export default function TestResult() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    getAssignedTestResult(id).then((response) => setResult(response.data)).catch((e) => setError(e.response?.data?.message || "Could not load test result"));
  }, [id]);

  if (error) return <div className="page"><div className="error">{error}</div><Link className="button-link secondary-link" to="/student/tests">Back to tests</Link></div>;
  if (!result) return <div className="page-loading">Loading result…</div>;
  const percent = Number(result.percentage || 0);
  return <div className="page">
    <div className="page-header"><div><h1>{result.title}</h1><p>Review your answers and the correct answers.</p></div><Link className="button-link secondary-link" to="/student/tests">Back to tests</Link></div>
    <section className="dashboard-card"><h2>Result: {result.marks_obtained} / {result.total_marks}</h2><p>{percent.toFixed(1)}% · Submitted {result.submitted_at ? new Date(result.submitted_at).toLocaleString() : ""}</p></section>
    {result.questions.map((question, index) => <section className="dashboard-card" key={question.id}>
      <div className="page-header"><h3>{index + 1}. {question.question}</h3><span className={`status ${question.is_correct ? "active" : "trial"}`}>{!question.selected_option ? "Not answered" : question.is_correct ? "Correct" : "Incorrect"}</span></div>
      <p><strong>Your answer:</strong> {optionLabel(question, question.selected_option)}</p>
      <p><strong>Correct answer:</strong> {optionLabel(question, question.correct_option)}</p>
      <small>Marks: {question.marks_earned} / {question.marks}</small>
    </section>)}
  </div>;
}
