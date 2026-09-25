import { useEffect, useState } from "react";
import { createTest, getBatches, getStudents, getLatestToppers, deactivateTest } from "../../api/institute.api";

const emptyQuestion = () => ({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A", marks: 1 });
export default function Tests() {
  const [batches, setBatches] = useState([]); const [students, setStudents] = useState([]); const [toppers, setToppers] = useState([]);
  const [createdTests, setCreatedTests] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", totalMarks: 50, durationMinutes: "", testDate: "", dueDate: "", batchId: "", studentId: "" });
  const [questions, setQuestions] = useState(Array.from({ length: 50 }, emptyQuestion)); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  async function load() {
    try { const [b, s, t] = await Promise.all([getBatches(), getStudents(), getLatestToppers()]); setBatches(b.data || []); setStudents(s.data || []); setToppers(t.data || []); }
    catch (e) { setError(e.response?.data?.message || "Could not load test data"); }
  }
  useEffect(() => { load(); }, []);
  function updateQuestion(index, key, value) { setQuestions(current => current.map((q, i) => i === index ? { ...q, [key]: value } : q)); }
  async function submit(e) {
    e.preventDefault(); setError("");
    if (!form.batchId && !form.studentId) { setError("Assign the test to a batch or an individual student."); return; }
    if (questions.some(q => !q.question.trim() || !q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim())) { setError("Complete the question and all four options for all 50 questions."); return; }
    try {
      setSaving(true);
      const created = await createTest({ ...form, totalMarks: Number(form.totalMarks), durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null, batchId: form.batchId || null, studentId: form.studentId || null, questions: questions.map(q => ({ ...q, marks: Number(q.marks) })) });
      setCreatedTests(current => [created.data, ...current]);
      setForm({ title: "", description: "", totalMarks: 50, durationMinutes: "", testDate: "", dueDate: "", batchId: "", studentId: "" }); setQuestions(Array.from({ length: 50 }, emptyQuestion));
      alert("Test created and assigned"); await load();
    } catch (e) { setError(e.response?.data?.message || "Could not create test"); }
    finally { setSaving(false); }
  }
  async function closeTest(id) {
    if (!window.confirm("Deactivate this test? Students who have not submitted may be marked as missed.")) return;
    try { await deactivateTest(id); setCreatedTests(current => current.filter(test => test.id !== id)); }
    catch (e) { setError(e.response?.data?.message || "Could not deactivate test"); }
  }
  return <div className="page"><div className="page-header"><div><h1>Tests</h1><p>Create a 50 question test and assign it to a batch or student.</p></div></div>
    {error && <div className="error">{error}</div>}
    <div className="dashboard-card"><h2>Latest toppers</h2>{toppers.length ? <div className="table-card"><table><thead><tr><th>Test</th><th>Student</th><th>Marks</th><th>Score</th></tr></thead><tbody>{toppers.map((t, i) => <tr key={`${t.test_id}-${i}`}><td>{t.title}</td><td>{t.topper_name}</td><td>{t.marks_obtained}</td><td>{Number(t.percentage).toFixed(1)}%</td></tr>)}</tbody></table></div> : <p>No test results available yet.</p>}</div>
    {createdTests.length > 0 && <div className="dashboard-card"><h2>Tests created this session</h2>{createdTests.map(test => <div className="action-row" key={test.id}><span>{test.title}</span><button className="danger-button" onClick={() => closeTest(test.id)}>Deactivate</button></div>)}</div>}
    <form onSubmit={submit} className="dashboard-card"><h2>Create test</h2><div className="form-grid">
      <input required placeholder="Test title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /><input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      <input required type="number" min="1" placeholder="Total marks" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: e.target.value })} /><input type="number" min="1" placeholder="Duration (minutes)" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: e.target.value })} />
      <label>Test date<input type="date" value={form.testDate} onChange={e => setForm({ ...form, testDate: e.target.value })} /></label><label>Due date<input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></label>
      <label>Assign batch<select value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })}><option value="">No batch</option>{batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
      <label>Or individual student<select value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}><option value="">No individual student</option>{students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.admission_number})</option>)}</select></label>
    </div><div className="question-list">{questions.map((q, i) => <section className="question-editor" key={i}><h3>Question {i + 1}</h3><input required placeholder="Question" value={q.question} onChange={e => updateQuestion(i, "question", e.target.value)} /><div className="form-grid">{["optionA", "optionB", "optionC", "optionD"].map((key, j) => <input required key={key} placeholder={`Option ${String.fromCharCode(65 + j)}`} value={q[key]} onChange={e => updateQuestion(i, key, e.target.value)} />)}</div><label>Correct answer<select value={q.correctOption} onChange={e => updateQuestion(i, "correctOption", e.target.value)}>{["A", "B", "C", "D"].map(x => <option key={x}>{x}</option>)}</select></label> <label>Marks<input type="number" min="1" value={q.marks} onChange={e => updateQuestion(i, "marks", e.target.value)} /></label></section>)}</div><button disabled={saving}>{saving ? "Creating…" : "Create and assign test"}</button></form>
  </div>;
}
