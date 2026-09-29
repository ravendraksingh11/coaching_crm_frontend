import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  createTest,
  getBatches,
  getStudents,
  getLatestToppers,
  deactivateTest,
  getInstituteTests,
  getInstituteTest,
  updateInstituteTest,
  deleteInstituteTest,
} from "../../api/institute.api";

const emptyQuestion = () => ({
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOption: "A",
  marks: 1,
});

export default function Tests({ createMode = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [toppers, setToppers] = useState([]);
  const [tests, setTests] = useState([]);
  const [editingTestId, setEditingTestId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    totalMarks: '',
    durationMinutes: "",
    testDate: "",
    dueDate: "",
    screenRecording: false,
    autoSubmitOnLeave: false,
    batchId: "",
    studentId: "",
  });
  const [questions, setQuestions] = useState(
    [emptyQuestion()],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [b, s, t, testList] = await Promise.all([
        getBatches(),
        getStudents(),
        getLatestToppers(),
        getInstituteTests(),
      ]);
      setBatches(b.data || []);
      setStudents(s.data || []);
      setToppers(t.data || []);
      setTests(testList.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load test data");
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (createMode && location.state?.editTestId) {
      editTest(location.state.editTestId, false);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [createMode]);

  function updateQuestion(index, key, value) {
    setQuestions((current) =>
      current.map((q, i) => (i === index ? { ...q, [key]: value } : q)),
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.batchId && !form.studentId) {
      setError("Assign the test to a batch or an individual student.");
      return;
    }
    if (
      questions.some(
        (q) =>
          !q.question.trim() ||
          !q.optionA.trim() ||
          !q.optionB.trim() ||
          !q.optionC.trim() ||
          !q.optionD.trim(),
      )
    ) {
      setError(
        "Complete the question and all four options for all questions.",
      );
      return;
    }
    try {
      setSaving(true);
      const payload = {
        ...form,
        totalMarks: Number(form.totalMarks),
        durationMinutes: form.durationMinutes
          ? Number(form.durationMinutes)
          : null,
        batchId: form.batchId || null,
        studentId: form.studentId || null,
        questions: questions.map((q) => ({ ...q, marks: Number(q.marks) })),
      };
      if (editingTestId) await updateInstituteTest(editingTestId, payload);
      else await createTest(payload);
      setEditingTestId(null);
      setForm({
        title: "",
        description: "",
        totalMarks: 50,
        durationMinutes: "",
        testDate: "",
        dueDate: "",
        screenRecording: false,
        autoSubmitOnLeave: false,
        batchId: "",
        studentId: "",
      });
      setQuestions([emptyQuestion()]);
      alert(editingTestId ? "Test updated" : "Test created and assigned");
      await load();
      navigate("/institute/tests");
    } catch (e) {
      setError(e.response?.data?.message || "Could not create test");
    } finally {
      setSaving(false);
    }
  }
  async function editTest(id, goToForm = true) {
    setError("");
    try {
      const { data: test } = await getInstituteTest(id);
      const assignment = test.assignments?.[0] || {};
      setForm({
        title: test.title || "", description: test.description || "",
        totalMarks: test.total_marks, durationMinutes: test.duration_minutes || "",
        testDate: test.test_date ? String(test.test_date).slice(0, 10) : "",
        dueDate: assignment.dueDate ? String(assignment.dueDate).slice(0, 10) : "",
        batchId: assignment.batchId || "", studentId: assignment.studentId || "",
        screenRecording: test.screen_recording, autoSubmitOnLeave: test.auto_submit_on_leave,
      });
      setQuestions((test.questions || []).map((q) => ({
        question: q.question, optionA: q.option_a || "", optionB: q.option_b || "",
        optionC: q.option_c || "", optionD: q.option_d || "",
        correctOption: q.correct_option || "A", marks: q.marks || 1,
      })));
      setEditingTestId(test.id);
      if (goToForm) navigate("/institute/tests/create", { state: { editTestId: id } });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e.response?.data?.message || "Could not load test for editing");
    }
  }
  async function removeTest(id) {
    if (!window.confirm("Permanently delete this test and its questions and results?")) return;
    try {
      await deleteInstituteTest(id);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not delete test");
    }
  }
  async function closeTest(id) {
    if (
      !window.confirm(
        "Deactivate this test? Students who have not submitted may be marked as missed.",
      )
    )
      return;
    try {
      await deactivateTest(id);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not deactivate test");
    }
  }
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{createMode ? (editingTestId ? "Edit test" : "Create test") : "Tests"}</h1>
          <p>{createMode ? "Add test details, questions, and assign it to students." : "Manage tests, assignments, and results."}</p>
        </div>
        {createMode ? <Link className="button-link secondary-link" to="/institute/tests">Back to tests</Link> : <Link className="button-link" to="/institute/tests/create">Create Test</Link>}
      </div>
      {error && <div className="error">{error}</div>}
      {!createMode && <>
        <div className="dashboard-card">
          <h2>Latest toppers</h2>
          {toppers.length ? (
            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Student</th>
                    <th>Marks</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {toppers.map((t, i) => (
                    <tr key={`${t.test_id}-${i}`}>
                      <td>{t.title}</td>
                      <td>{t.topper_name}</td>
                      <td>{t.marks_obtained}</td>
                      <td>{Number(t.percentage).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No test results available yet.</p>
          )}
        </div>
        <div className="dashboard-card">
          <h2>Created tests</h2>
          {tests.length ? <div className="table-card"><table><thead><tr><th>Test</th><th>Questions</th><th>Duration</th><th>Submissions</th><th>Status</th><th>Actions</th></tr></thead><tbody>
            {tests.map((test) => <tr key={test.id}>
              <td><strong>{test.title}</strong><small>{test.description || ""}</small></td>
              <td>{test.question_count}</td><td>{test.duration_minutes} min</td><td>{test.submission_count}</td><td>{test.status}</td>
            <td><div className="action-row"><Link className="button-link" to={`/institute/tests/${test.id}/view`}>View</Link><Link className="button-link secondary-link" to={`/institute/tests/${test.id}/students`}>Assign Student</Link><button type="button" onClick={() => editTest(test.id)} disabled={Number(test.submission_count) > 0 || Number(test.attempt_count) > 0}>Edit</button><button type="button" className="danger-button" onClick={() => removeTest(test.id)}>Delete</button>{test.status === "ACTIVE" && <button type="button" className="danger-button" onClick={() => closeTest(test.id)}>Deactivate</button>}</div></td>
            </tr>)}
          </tbody></table></div> : <p>No tests created yet.</p>}
        </div>
      </>}
      {(createMode || editingTestId) && <form onSubmit={submit} className="dashboard-card">
        {/* <h2>{editingTestId ? "Edit test" : "Create test"}</h2> */}
        <div className="form-grid">
          <label>
            Test Title
            <input
              required
              placeholder="Test title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label>
            Description
            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label>
            Total Marks
            <input
              required
              type="number"
              min="1"
              placeholder="Total marks"
              value={form.totalMarks}
              onChange={(e) => setForm({ ...form, totalMarks: e.target.value })}
            />
          </label>
          <label>
            Duration (minutes)
            <input
              required
              type="number"
              min="1"
              placeholder="Duration (minutes)"
              value={form.durationMinutes}
              onChange={(e) =>
                setForm({ ...form, durationMinutes: e.target.value })
              }
            />
          </label>
          <label>
            Test date
            <input
              type="date"
              value={form.testDate}
              onChange={(e) => setForm({ ...form, testDate: e.target.value })}
            />
          </label>
          <label>
            Due date
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </label>
          <label>
            Assign batch
            <select
              value={form.batchId}
              onChange={(e) => setForm({ ...form, batchId: e.target.value })}
            >
              <option value="">No batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Or individual student
            <select
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            >
              <option value="">No individual student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.admission_number})
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-grid">
          <div className="row_element">
            <label className="vertical-align">
              Require screen recording
            </label>
            <input type="checkbox" checked={form.screenRecording} onChange={(e) => setForm({ ...form, screenRecording: e.target.checked })} />
          </div>
          <div className="row_element">
            <label className="vertical-align">Auto-submit if student changes tab or leaves</label>
            <input type="checkbox" checked={form.autoSubmitOnLeave} onChange={(e) => setForm({ ...form, autoSubmitOnLeave: e.target.checked })} />
          </div>
        </div>
        <div className="question-list">
          {questions.map((q, i) => (
            <section className="question-editor" key={i}>
              <h3>Question {i + 1}</h3>
              <input
                required
                placeholder="Question"
                value={q.question}
                onChange={(e) => updateQuestion(i, "question", e.target.value)}
              />
              <br />
              <br />
              <div className="form-grid">
                {["optionA", "optionB", "optionC", "optionD"].map((key, j) => (
                  <input
                    required
                    key={key}
                    placeholder={`Option ${String.fromCharCode(65 + j)}`}
                    value={q[key]}
                    onChange={(e) => updateQuestion(i, key, e.target.value)}
                  />
                ))}
              </div>
              <label>
                Correct answer
                <select
                  value={q.correctOption}
                  onChange={(e) =>
                    updateQuestion(i, "correctOption", e.target.value)
                  }
                >
                  {["A", "B", "C", "D"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <br /><br />
              <label>
                Marks
                <input
                  type="number"
                  min="1"
                  value={q.marks}
                  onChange={(e) => updateQuestion(i, "marks", e.target.value)}
                />
              </label>
            </section>
          ))}
        </div>
        <button type="button" onClick={() => setQuestions((current) => [...current, emptyQuestion()])} className="right-space">Add question</button>
        {editingTestId && <button type="button" className="secondary-link" onClick={() => { setEditingTestId(null); setQuestions([emptyQuestion()]); setError(""); }}>Cancel edit</button>}
        <button disabled={saving}>
          {saving ? "Saving…" : editingTestId ? "Save changes" : "Create and assign test"}
        </button>
      </form>}
    </div>
  );
}
