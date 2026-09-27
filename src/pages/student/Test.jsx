import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAssignedTest, startAssignedTest, submitAssignedTest } from "../../api/institute.api";

export default function Test() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [test, setTest] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const recorder = useRef(null);
  const chunks = useRef([]);
  const submitted = useRef(false);

  const finish = useCallback(async (automatic = false) => {
    if (submitted.current || saving) return;
    submitted.current = true;
    setSaving(true);
    setError("");
    try {
      await submitAssignedTest(id, answers);
      if (recorder.current?.state === "recording") recorder.current.stop();
      alert(automatic ? "Your test was submitted automatically." : "Test submitted successfully.");
      navigate("/student/tests");
    } catch (e) {
      submitted.current = false;
      setError(e.response?.data?.message || "Could not submit test");
      setSaving(false);
    }
  }, [answers, id, navigate, saving]);

  async function begin() {
    setError("");
    try {
      if (test?.screen_recording) {
        if (!navigator.mediaDevices?.getDisplayMedia) throw new Error("Screen recording is not supported by this browser.");
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        recorder.current = new MediaRecorder(stream);
        chunks.current = [];
        recorder.current.ondataavailable = (event) => { if (event.data.size) chunks.current.push(event.data); };
        recorder.current.onstop = () => {
          const blob = new Blob(chunks.current, { type: recorder.current?.mimeType || "video/webm" });
          if (blob.size) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `test-recording-${id}.webm`;
            link.click();
            URL.revokeObjectURL(url);
          }
          stream.getTracks().forEach((track) => track.stop());
        };
        recorder.current.start();
        stream.getVideoTracks()[0]?.addEventListener("ended", () => finish(true));
      }
      const startedTest = await startAssignedTest(id);
      const loaded = await getAssignedTest(id);
      setQuestions(loaded.data || []);
      setTest({ ...startedTest.data, ...loaded.data?.[0] });
      setRemaining(startedTest.data.deadline ? Math.max(0, Math.floor((new Date(startedTest.data.deadline) - Date.now()) / 1000)) : null);
      setStarted(true);
    } catch (e) {
      if (recorder.current?.state === "recording") recorder.current.stop();
      setError(e.response?.data?.message || e.message || "Could not start test");
    }
  }

  useEffect(() => { getAssignedTest(id).then((r) => { setQuestions(r.data || []); if (r.data?.[0]) setTest(r.data[0]); }).catch((e) => setError(e.response?.data?.message || "Could not load test")).finally(() => setLoading(false)); }, [id]);
  useEffect(() => {
    if (!started || remaining === null) return;
    if (remaining <= 0) { finish(true); return; }
    const timer = window.setTimeout(() => setRemaining((n) => n - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [started, remaining, finish]);
  useEffect(() => {
    if (!started || !test?.auto_submit_on_leave) return;
    const onVisibility = () => { if (document.visibilityState === "hidden") finish(true); };
    const onPageHide = () => finish(true);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => { document.removeEventListener("visibilitychange", onVisibility); window.removeEventListener("pagehide", onPageHide); };
  }, [started, test, finish]);

  if (loading) return <div className="page-loading">Loading test…</div>;
  const displayTime = remaining === null ? "" : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
  return <div className="page">
    <div className="page-header"><div><h1>Test</h1><p>{started ? "Choose one answer for each question." : "Review the test rules before you begin."}</p></div>
      {!started && <Link to="/student/tests" className="button-link secondary-link">Back to tests</Link>}
    </div>
    {error && <div className="error">{error}</div>}
    {!started ? <div className="dashboard-card"><p>Once started, the timer begins and your attempt is recorded.</p>{test?.screen_recording && <p>This test requires screen sharing and recording. Your browser will ask you to choose a screen.</p>}{test?.auto_submit_on_leave && <p>Leaving this tab or page will automatically submit the test.</p>}<button onClick={begin}>Start test</button></div> : <>
      {remaining !== null && <div className="dashboard-card" role="timer"><strong>Time remaining: {displayTime}</strong></div>}
      {questions.length > 0 && <form onSubmit={(e) => { e.preventDefault(); finish(false); }}>{questions.map((q, i) => <section className="dashboard-card" key={q.id}><h3>{i + 1}. {q.question}</h3>{["a", "b", "c", "d"].map((letter) => { const key = `option_${letter}`; return q[key] && <label className="answer-option" key={letter}><input type="radio" name={q.id} value={letter.toUpperCase()} checked={answers[q.id] === letter.toUpperCase()} onChange={() => setAnswers((v) => ({ ...v, [q.id]: letter.toUpperCase() }))} required />{letter.toUpperCase()}. {q[key]}</label>; })}</section>)}<button disabled={saving}>{saving ? "Submitting…" : "Submit test"}</button></form>}
    </>}
  </div>;
}
