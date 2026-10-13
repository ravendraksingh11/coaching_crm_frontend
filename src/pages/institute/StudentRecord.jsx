import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DataTable from "../../components/DataTable";
import QuestionContent from "../../components/QuestionContent";
import { getInstituteTest, getStudentRecord } from "../../api/institute.api";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const answerOptions = [
  ["A", "option_a"],
  ["B", "option_b"],
  ["C", "option_c"],
  ["D", "option_d"],
];

export default function StudentRecord() {
  const { studentId } = useParams();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState("");
  const testRequestId = useRef(0);

  useEffect(() => {
    let active = true;
    getStudentRecord(studentId)
      .then((result) => {
        if (active) setRecord(result.data);
      })
      .catch((requestError) => {
        if (active) {
          setRecord(null);
          setError(
            requestError.response?.data?.message || "Could not load student record",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [studentId]);

  async function showTest(test) {
    const requestId = ++testRequestId.current;
    setActiveTest({ id: test.test_id, title: test.title });
    setTestLoading(true);
    setTestError("");
    try {
      const result = await getInstituteTest(test.test_id);
      if (requestId === testRequestId.current) setActiveTest(result.data);
    } catch (requestError) {
      if (requestId === testRequestId.current) {
        setTestError(
          requestError.response?.data?.message || "Could not load test questions",
        );
      }
    } finally {
      if (requestId === testRequestId.current) setTestLoading(false);
    }
  }

  function closeTestDetails() {
    testRequestId.current += 1;
    setActiveTest(null);
    setTestLoading(false);
    setTestError("");
  }

  const testColumns = [
    {
      key: "test",
      header: "Test",
      value: (test) => test.title,
      render: (test) => (
        <button
          type="button"
          className="student-record-test-link"
          onClick={() => showTest(test)}
        >
          {test.title}
        </button>
      ),
    },
    {
      key: "marks",
      header: "Marks",
      value: (test) =>
        test.marks_obtained == null
          ? "Not submitted"
          : `${test.marks_obtained} / ${test.total_marks}`,
    },
    {
      key: "attempted_questions",
      header: "Attempted questions",
      value: (test) =>
        `${test.attempted_questions} / ${test.total_questions}`,
    },
    {
      key: "started",
      header: "Started",
      value: (test) => new Date(test.started_at).toLocaleString(),
    },
    {
      key: "submitted",
      header: "Submitted",
      value: (test) =>
        test.submitted_at ? new Date(test.submitted_at).toLocaleString() : "Not submitted",
    },
  ];

  const feeColumns = [
    { key: "title", header: "Fee", value: (fee) => fee.title },
    {
      key: "due",
      header: "Due date",
      value: (fee) =>
        fee.due_date
          ? new Date(`${fee.due_date}T00:00:00`).toLocaleDateString()
          : "—",
    },
    { key: "amount", header: "Amount", value: (fee) => money(fee.amount) },
    { key: "paid", header: "Paid", value: (fee) => money(fee.paid_amount) },
    { key: "balance", header: "Balance", value: (fee) => money(fee.balance) },
    {
      key: "status",
      header: "Status",
      value: (fee) => fee.status,
      render: (fee) => (
        <span className={`status ${fee.status === "PAID" ? "active" : "trial"}`}>
          {fee.status}
        </span>
      ),
    },
  ];

  const submissionRows =
    record?.fees.flatMap((fee) =>
      fee.submissions.map((submission, index) => ({
        ...submission,
        id: `${fee.id}-${submission.created_at}-${index}`,
        feeTitle: fee.title,
      })),
    ) || [];
  const submissionColumns = [
    { key: "fee", header: "Fee", value: (submission) => submission.feeTitle },
    {
      key: "amount",
      header: "Submitted amount",
      value: (submission) => money(submission.amount),
    },
    {
      key: "method",
      header: "Method",
      value: (submission) => submission.payment_method,
    },
    {
      key: "reference",
      header: "Reference",
      value: (submission) => submission.transaction_id || "—",
    },
    {
      key: "submitted",
      header: "Submitted",
      value: (submission) =>
        new Date(submission.created_at).toLocaleString(),
    },
    {
      key: "status",
      header: "Status",
      value: (submission) =>
        submission.status === "PENDING" ? "Submitted · pending review" : "Approved",
    },
  ];

  const attendanceColumns = [
    {
      key: "date",
      header: "Session date",
      value: (session) =>
        new Date(`${session.session_date}T00:00:00`).toLocaleDateString(),
    },
    { key: "batch", header: "Batch", value: (session) => session.batch_name },
    {
      key: "time",
      header: "Time",
      value: (session) =>
        session.start_time ? String(session.start_time).slice(0, 5) : "—",
    },
    {
      key: "status",
      header: "Attendance",
      value: (session) => session.status,
      render: (session) => (
        <span
          className={`status ${session.status === "PRESENT" ? "active" : "trial"}`}
        >
          {session.status}
        </span>
      ),
    },
  ];

  if (loading || record?.student.id !== studentId) {
    return <div className="page-loading">Loading student record…</div>;
  }
  if (error) {
    return (
      <div className="page">
        <div className="error" role="alert">{error}</div>
        <Link className="button-link secondary-link" to="/institute/students">
          Back to students
        </Link>
      </div>
    );
  }
  if (!record) return null;

  const pendingFees = record.fees.filter((fee) => Number(fee.balance) > 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{record.student.name}</h1>
          <p>
            Student record · Admission number {record.student.admission_number}
          </p>
        </div>
        <Link className="button-link secondary-link" to="/institute/students">
          Back to students
        </Link>
      </div>

      <section className="stats-grid student-record-summary">
        <div className="stat-card">
          <div>
            <p>Tests attempted</p>
            <h2>{record.tests.length}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <p>Pending fee balance</p>
            <h2>
              {money(
                pendingFees.reduce((total, fee) => total + Number(fee.balance), 0),
              )}
            </h2>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <p>Completed sessions</p>
            <h2>{record.attendance.totalSessions}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <p>Present</p>
            <h2>{record.attendance.presentSessions}</h2>
          </div>
        </div>
      </section>

      <section className="dashboard-card student-record-section">
        <h2>Test attempts</h2>
        <DataTable
          columns={testColumns}
          rows={record.tests}
          rowKey={(test) => test.test_id}
          emptyMessage="No tests have been attempted."
          searchPlaceholder="Search tests..."
        />
      </section>

      <section className="dashboard-card student-record-section">
        <h2>Pending fees</h2>
        <DataTable
          columns={feeColumns}
          rows={pendingFees}
          rowKey={(fee) => fee.id}
          emptyMessage="No pending fees."
          searchPlaceholder="Search pending fees..."
        />
      </section>

      <section className="dashboard-card student-record-section">
        <h2>Submitted fee payments</h2>
        <DataTable
          columns={submissionColumns}
          rows={submissionRows}
          rowKey={(submission) => submission.id}
          emptyMessage="No fee payments have been submitted."
          searchPlaceholder="Search submitted fees..."
        />
      </section>

      <section className="dashboard-card student-record-section">
        <h2>Attendance by session</h2>
        <DataTable
          columns={attendanceColumns}
          rows={record.attendance.sessions}
          rowKey={(session) => session.session_id}
          emptyMessage="No completed attendance sessions."
          searchPlaceholder="Search sessions..."
        />
      </section>

      {activeTest && (
        <div
          className="student-record-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeTestDetails();
          }}
        >
          <section
            className="student-record-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-test-detail-title"
          >
            <div className="student-record-modal-header">
              <h2 id="student-test-detail-title">
                {activeTest.title || "Test questions"}
              </h2>
              <button
                type="button"
                className="secondary-button"
                onClick={closeTestDetails}
                aria-label="Close test details"
              >
                Close
              </button>
            </div>
            {testLoading ? (
              <p className="page-loading">Loading questions…</p>
            ) : testError ? (
              <div className="error" role="alert">{testError}</div>
            ) : (
              <div className="student-record-questions">
                {activeTest.questions?.map((question, index) => {
                  const correctOption = String(question.correct_option || "").toUpperCase();
                  const correctAnswer = answerOptions.find(
                    ([letter]) => letter === correctOption,
                  )?.[1];
                  return (
                    <article className="student-record-question" key={question.id}>
                      <h3>Question {index + 1}</h3>
                      <QuestionContent content={question.question} />
                      <ul className="student-record-options">
                        {answerOptions.map(([letter, key]) =>
                          question[key] ? (
                            <li
                              key={letter}
                              className={letter === correctOption ? "correct-answer" : ""}
                            >
                              <strong>{letter}.</strong> {question[key]}
                              {letter === correctOption && " · Correct answer"}
                            </li>
                          ) : null,
                        )}
                      </ul>
                      {(!correctAnswer || !question[correctAnswer]) && (
                        <p className="error">Correct answer is not available.</p>
                      )}
                    </article>
                  );
                })}
                {!activeTest.questions?.length && (
                  <p>No questions are available for this test.</p>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
