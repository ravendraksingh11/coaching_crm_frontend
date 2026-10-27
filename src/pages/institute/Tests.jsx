import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";
import "jodit/es2021/jodit.min.css";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import DataTable from "../../components/DataTable";
import { removeScanResult, saveScanResult } from "../../utils/scanResultsStorage";
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

let nextQuestionKey = 0;

const createQuestionKey = () => `question-${nextQuestionKey++}`;

const emptyQuestion = () => ({
  key: createQuestionKey(),
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOption: "A",
  marks: 1,
});

function getDraftStorageKey() {
  const user = JSON.parse(localStorage.getItem("user") || "{}") || {};
  const instituteKey =
    user.instituteId || user.institute_id || user.userId || user.id || "current";
  return `coaching-saas:test-drafts:${instituteKey}`;
}

function readTestDrafts() {
  const drafts = JSON.parse(localStorage.getItem(getDraftStorageKey()) || "[]");
  if (!Array.isArray(drafts)) {
    throw new Error("Saved test drafts could not be loaded.");
  }
  return drafts;
}

function hasQuestionContent(content) {
  const document = new DOMParser().parseFromString(String(content || ""), "text/html");
  return Boolean(
    document.body.textContent.trim() || document.body.querySelector("img[src]"),
  );
}

export default function Tests({ createMode = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [toppers, setToppers] = useState([]);
  const [tests, setTests] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [editingTestId, setEditingTestId] = useState(null);
  const [editingDraftId, setEditingDraftId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    totalMarks: '',
    durationMinutes: "",
    testDate: "",
    dueDate: "",
    resultDeclarationDate: "",
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
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanFile, setScanFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [scanError, setScanError] = useState("");
  const submissionLock = useRef(false);
  const questionEditorConfig = useMemo(
    () => ({
      readonly: false,
      height: 260,
      placeholder: "Write the question here...",
      toolbarAdaptive: false,
      buttons: [
        "bold",
        "italic",
        "underline",
        "|",
        "ul",
        "ol",
        "|",
        "image",
        "link",
        "|",
        "undo",
        "redo",
      ],
      uploader: {
        insertImageAsBase64URI: true,
      },
    }),
    [],
  );

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
      setDrafts(readTestDrafts());
    } catch (e) {
      setError(e.response?.data?.message || "Could not load test data");
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const scanDraft = location.state?.scanDraft;
    if (scanDraft) {
      if (scanDraft.form) setForm(scanDraft.form);
      if (Array.isArray(scanDraft.questions) && scanDraft.questions.length) {
        setQuestions(scanDraft.questions);
      }
      if (scanDraft.editingTestId) setEditingTestId(scanDraft.editingTestId);
      if (scanDraft.editingDraftId) setEditingDraftId(scanDraft.editingDraftId);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

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

  function closeScanModal() {
    if (scanning) return;
    setScanModalOpen(false);
    setScanFile(null);
    setScanError("");
    setScanStatus("");
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Could not save a scanned page preview."));
        },
        "image/jpeg",
        0.85,
      );
    });
  }

  async function scanDocument() {
    if (!scanFile) {
      setScanError("Choose an image or PDF to scan.");
      return;
    }

    const isPdf =
      scanFile.type === "application/pdf" ||
      scanFile.name.toLowerCase().endsWith(".pdf");

    const isImage =
      scanFile.type.startsWith("image/") ||
      /\.(png|jpe?g|gif|bmp|webp|tiff?)$/i.test(scanFile.name);

    if (!isPdf && !isImage) {
      setScanError("Choose an image or PDF file.");
      return;
    }

    const scanId =
      crypto.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const resultTab = window.open("about:blank", "_blank");

    if (!resultTab) {
      setScanError("Allow pop-ups to open scan results in a new tab.");
      return;
    }

    resultTab.document.title = "Scanning document";
    const loadingMessage = resultTab.document.createElement("main");

    loadingMessage.style.cssText =
      "font:16px Arial,sans-serif;padding:32px;color:#1f2937";

    const loadingTitle = resultTab.document.createElement("h1");

    loadingTitle.textContent = "Scanning document…";

    const loadingDescription = resultTab.document.createElement("p");
    loadingDescription.textContent =
      "Recognized text and figure previews will appear here when scanning is complete.";
    loadingMessage.append(loadingTitle, loadingDescription);
    resultTab.document.body.append(loadingMessage);

    setScanning(true);
    setScanError("");
    setScanStatus("Preparing scanner...");

    let worker;
    let pdf;
    let pdfLoadingTask;
    let hasSavedResult = false;
    try {
      const { createWorker } = await import("tesseract.js");
      worker = await createWorker("eng", 1, {
        logger: ({ progress, status }) => {
          if (typeof progress === "number") {
            setScanStatus(
              `${status || "Scanning"}${isPdf ? " PDF pages" : ""} (${Math.round(progress * 100)}%)`,
            );
          } else if (status) {
            setScanStatus(status);
          }
        },
      });

      let scannedText;
      const figures = [];
      if (isPdf) {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
        pdfLoadingTask = pdfjs.getDocument({
          data: new Uint8Array(await scanFile.arrayBuffer()),
        });
        pdf = await pdfLoadingTask.promise;

        const pageTexts = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          setScanStatus(`Scanning PDF page ${pageNumber} of ${pdf.numPages}...`);
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const context = canvas.getContext("2d");
          if (!context) {
            throw new Error("Could not prepare a PDF page for scanning.");
          }
          await page.render({ canvas, canvasContext: context, viewport }).promise;
          const { data } = await worker.recognize(canvas);
          pageTexts.push(`Page ${pageNumber}\n${data.text.trim()}`);
          figures.push({
            label: `PDF page ${pageNumber}`,
            blob: await canvasToBlob(canvas),
          });
          canvas.width = 0;
          canvas.height = 0;
        }
        scannedText = pageTexts.filter(Boolean).join("\n\n");
      } else {
        setScanStatus("Scanning image...");
        const { data } = await worker.recognize(scanFile);
        scannedText = data.text.trim();
        figures.push({ label: scanFile.name, blob: scanFile });
      }

      if (!scannedText && !figures.length) {
        throw new Error("No readable text or figures were found in this file.");
      }

      await saveScanResult({
        id: scanId,
        scannedText,
        figures,
        returnTo: location.pathname,
        draft: { form, questions, editingTestId, editingDraftId },
      });
      hasSavedResult = true;
    } catch (e) {
      resultTab.close();
      if (hasSavedResult) {
        try {
          await removeScanResult(scanId);
        } catch (cleanupError) {
          console.error("Could not remove a failed scan result", cleanupError);
        }
      }
      setScanError(e.message || "Could not scan the selected file.");
      return;
    } finally {
      const cleanupResults = await Promise.allSettled([
        typeof pdfLoadingTask?.destroy === "function"
          ? pdfLoadingTask.destroy()
          : undefined,
        worker?.terminate(),
      ]);
      cleanupResults
        .filter((result) => result.status === "rejected")
        .forEach((result) =>
          console.error("Could not clean up scanner resources", result.reason),
        );
      setScanning(false);
      setScanStatus("");
    }

    setScanModalOpen(false);
    setScanFile(null);
    await new Promise((resolve) =>
      window.requestAnimationFrame(() =>
        window.requestAnimationFrame(resolve),
      ),
    );
    resultTab.opener = null;
    resultTab.location.replace(
      `${window.location.origin}/institute/tests/scan-results?scanId=${encodeURIComponent(scanId)}`,
    );
  }

  async function submit(e) {
    e.preventDefault();
    if (submissionLock.current) return;
    setError("");
    if (!form.batchId && !form.studentId) {
      setError("Assign the test to a batch or an individual student.");
      return;
    }
    if (
      questions.some(
        (q) =>
          !hasQuestionContent(q.question) ||
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
    submissionLock.current = true;
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
        questions: questions.map((q) => ({
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctOption: q.correctOption,
          marks: Number(q.marks),
        })),
      };
      if (editingTestId) await updateInstituteTest(editingTestId, payload);
      else await createTest(payload);
      if (editingDraftId) {
        const remainingDrafts = readTestDrafts().filter(
          (draft) => draft.id !== editingDraftId,
        );
        localStorage.setItem(getDraftStorageKey(), JSON.stringify(remainingDrafts));
        setDrafts(remainingDrafts);
      }
      setEditingTestId(null);
      setEditingDraftId(null);
      setForm({
        title: "",
        description: "",
        totalMarks: 50,
        durationMinutes: "",
        testDate: "",
        dueDate: "",
        resultDeclarationDate: "",
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
      submissionLock.current = false;
    }
  }

  function saveDraft() {
    if (submissionLock.current) return;
    submissionLock.current = true;
    setSaving(true);
    setError("");
    try {
      const currentDrafts = readTestDrafts();
      const id = editingDraftId || `draft-${crypto.randomUUID?.() || Date.now()}`;
      const draft = {
        id,
        isDraft: true,
        title: form.title.trim() || "Untitled draft",
        description: form.description,
        total_marks: form.totalMarks,
        duration_minutes: form.durationMinutes,
        test_date: form.testDate,
        result_declaration_date: form.resultDeclarationDate,
        question_count: questions.length,
        submission_count: 0,
        attempt_count: 0,
        status: "DRAFT",
        created_at: new Date().toISOString(),
        form,
        questions,
        editingTestId,
      };
      const nextDrafts = [
        draft,
        ...currentDrafts.filter((current) => current.id !== id),
      ];
      localStorage.setItem(getDraftStorageKey(), JSON.stringify(nextDrafts));
      setDrafts(nextDrafts);
      setEditingDraftId(id);
      alert("Draft saved. Continue editing or create and assign it when ready.");
    } catch (e) {
      setError(e.message || "Could not save this test draft.");
    } finally {
      setSaving(false);
      submissionLock.current = false;
    }
  }

  function editDraft(draft) {
    setForm(draft.form);
    setQuestions(
      draft.questions.map((question) => ({
        ...question,
        key: question.key || createQuestionKey(),
      })),
    );
    setEditingDraftId(draft.id);
    setEditingTestId(draft.editingTestId || null);
    setError("");
    navigate("/institute/tests/create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removeDraft(id) {
    try {
      const nextDrafts = readTestDrafts().filter((draft) => draft.id !== id);
      localStorage.setItem(getDraftStorageKey(), JSON.stringify(nextDrafts));
      setDrafts(nextDrafts);
    } catch (e) {
      setError(e.message || "Could not delete this test draft.");
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
        resultDeclarationDate: test.result_declaration_date
          ? String(test.result_declaration_date).slice(0, 10)
          : "",
        batchId: assignment.batchId || "", studentId: assignment.studentId || "",
        screenRecording: test.screen_recording, autoSubmitOnLeave: test.auto_submit_on_leave,
      });
      setQuestions((test.questions || []).map((q) => ({
        key: createQuestionKey(),
        question: q.question, optionA: q.option_a || "", optionB: q.option_b || "",
        optionC: q.option_c || "", optionD: q.option_d || "",
        correctOption: q.correct_option || "A", marks: q.marks || 1,
      })));
      setEditingTestId(test.id);
      setEditingDraftId(null);
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

  const topperColumns = [
    { key: "test", header: "Test", value: (topper) => topper.title },
    {
      key: "student",
      header: "Student",
      value: (topper) => topper.topper_name,
    },
    {
      key: "marks",
      header: "Marks",
      value: (topper) => topper.marks_obtained,
    },
    {
      key: "score",
      header: "Score",
      value: (topper) => `${Number(topper.percentage).toFixed(1)}%`,
    },
  ];
  const testColumns = [
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
      key: "questions",
      header: "Questions",
      value: (test) => test.question_count ?? test.questions?.length ?? 0,
    },
    {
      key: "duration",
      header: "Duration",
      value: (test) =>
        test.duration_minutes ? `${test.duration_minutes} min` : "—",
    },
    {
      key: "resultDeclaration",
      header: "Result declaration",
      value: (test) =>
        test.result_declaration_date
          ? new Date(
            `${String(test.result_declaration_date).slice(0, 10)}T00:00:00`,
          ).toLocaleDateString()
          : "Immediately after submission",
    },
    {
      key: "submissions",
      header: "Submissions",
      value: (test) => test.submission_count ?? 0,
    },
    { key: "status", header: "Status", value: (test) => test.status },
    {
      key: "actions",
      header: "Actions",
      searchable: false,
      sortable: false,
      value: () => "",
      render: (test) =>
        test.isDraft ? (
          <div className="action-row">
            <button type="button" onClick={() => editDraft(test)}>Edit</button>
            <button
              type="button"
              className="danger-button"
              onClick={() => removeDraft(test.id)}
            >
              Delete draft
            </button>
          </div>
        ) : (
          <div className="action-row">
            <Link className="button-link" to={`/institute/tests/${test.id}/view`}>View</Link>
            <Link className="button-link secondary-link" to={`/institute/tests/${test.id}/students`}>Assign Student</Link>
            <button type="button" onClick={() => editTest(test.id)} disabled={Number(test.submission_count) > 0 || Number(test.attempt_count) > 0}>Edit</button>
            <button type="button" className="danger-button" onClick={() => removeTest(test.id)}>Delete</button>
            {test.status === "ACTIVE" && <button type="button" className="danger-button" onClick={() => closeTest(test.id)}>Deactivate</button>}
          </div>
        ),
    },
  ];
  const allTests = [...drafts, ...tests];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{createMode ? (editingDraftId ? "Continue test draft" : editingTestId ? "Edit test" : "Create test") : "Tests"}</h1>
          <p>{createMode ? "Add test details, questions, and assign it to students." : "Manage tests, assignments, and results."}</p>
        </div>
        {createMode ? (
          <div className="page-header-actions">
            <button
              type="button"
              onClick={() => {
                setScanError("");
                setScanModalOpen(true);
              }}
            >
              Scan doc/image
            </button>
            <Link className="button-link secondary-link" to="/institute/tests">
              Back to tests
            </Link>
          </div>
        ) : (
          <Link className="button-link" to="/institute/tests/create">Create Test</Link>
        )}
      </div>
      {scanModalOpen && (
        <div
          className="test-scan-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeScanModal();
          }}
        >
          <section
            className="test-scan-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="test-scan-title"
          >
            <div className="test-scan-modal-header">
              <h2 id="test-scan-title">Scan a document or image</h2>
              <button
                type="button"
                className="secondary-button"
                onClick={closeScanModal}
                disabled={scanning}
              >
                Close
              </button>
            </div>
            <p>
              Select an image or PDF. The browser will recognize text and
              display the source image or scanned PDF pages in a new tab.
            </p>
            <small className="question-markup-help">
              OCR and PDF processing run in your browser. The open-source OCR
              engine and English language data download on first use.
            </small>
            <label>
              Select file
              <input
                type="file"
                accept="image/*,application/pdf,.pdf"
                disabled={scanning}
                onChange={(event) => {
                  setScanFile(event.target.files?.[0] || null);
                  setScanError("");
                }}
              />
            </label>
            {scanStatus && (
              <p className="test-scan-status" role="status">{scanStatus}</p>
            )}
            {scanError && <div className="error" role="alert">{scanError}</div>}
            <div className="test-scan-actions">
              <button
                type="button"
                onClick={() => void scanDocument()}
                disabled={scanning || !scanFile}
              >
                {scanning ? "Scanning…" : "Scan"}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={closeScanModal}
                disabled={scanning}
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}
      {error && <div className="error">{error}</div>}
      {!createMode && <>
        <div className="dashboard-card">
          <h2>Latest toppers</h2>
          {toppers.length ? (
            <DataTable
              columns={topperColumns}
              rows={toppers}
              rowKey={(topper, index) => `${topper.test_id}-${index}`}
              searchPlaceholder="Search toppers..."
              showPagination={false}
            />
          ) : (
            <p>No test results available yet.</p>
          )}
        </div>
        <div className="dashboard-card">
          <h2>Created tests</h2>
          {allTests.length ? (
            <DataTable
              columns={testColumns}
              rows={allTests}
              rowKey={(test) => test.id}
              searchPlaceholder="Search tests..."
            />
          ) : <p>No tests created yet.</p>}
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
            Result declaration date (optional)
            <input
              type="date"
              value={form.resultDeclarationDate}
              onChange={(e) =>
                setForm({ ...form, resultDeclarationDate: e.target.value })
              }
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
            <section className="question-editor" key={q.key}>
              <h3>Question {i + 1}</h3>
              <JoditEditor
                value={q.question}
                config={questionEditorConfig}
                onBlur={(content) => updateQuestion(i, "question", content)}
              />
              <small className="question-markup-help">
                Format the question or insert an image using the editor toolbar.
              </small>
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
        <div className="question-actions">
          <button
            type="button"
            onClick={() =>
              setQuestions((current) => [...current, emptyQuestion()])
            }
          >
            Add question
          </button>
          <button type="button" className="secondary-button" onClick={saveDraft} disabled={saving}>
            {saving ? "Saving…" : "Save & Continue"}
          </button>
          <button
            type="button"
            className="danger-button"
            disabled={questions.length === 1}
            onClick={() =>
              setQuestions((current) =>
                current.length > 1 ? current.slice(0, -1) : current,
              )
            }
          >
            Delete question
          </button>
          {(editingTestId || editingDraftId) && <button type="button" className="secondary-link" onClick={() => { setEditingTestId(null); setEditingDraftId(null); setQuestions([emptyQuestion()]); setError(""); navigate("/institute/tests"); }}>Cancel edit</button>}
          <button disabled={saving}>
            {saving ? "Saving…" : editingTestId ? "Save changes" : "Create and assign test"}
          </button>

        </div>
      </form>}
    </div>
  );
}
