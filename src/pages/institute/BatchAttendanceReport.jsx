import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "../../components/DataTable";
import {
  getBatches,
  getBatchAttendanceReport,
} from "../../api/institute.api";

export default function BatchAttendanceReport() {
  const isTeacher =
    JSON.parse(localStorage.getItem("user") || "{}").role === "TEACHER";
  const attendanceBasePath = isTeacher
    ? "/teacher/attendance"
    : "/institute/attendance";
  const [batches, setBatches] = useState([]);
  const [reportBatchId, setReportBatchId] = useState("");
  const [report, setReport] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState("");

  const reportColumns = [
    {
      key: "student",
      header: "Student",
      value: (student) => student.name,
      render: (student) => (
        <>
          {student.name}
          <small>{student.admission_number}</small>
        </>
      ),
    },
    {
      key: "classes",
      header: "Classes",
      value: (student) => student.total_classes,
    },
    { key: "present", header: "Present", value: (student) => student.present },
    { key: "absent", header: "Absent", value: (student) => student.absent },
    { key: "late", header: "Late", value: (student) => student.late },
    { key: "leave", header: "Leave", value: (student) => student.leave },
    {
      key: "attendance",
      header: "Attendance",
      value: (student) => student.percentage,
      render: (student) => (
        <span
          className={`status ${Number(student.percentage) < 75 ? "trial" : "active"}`}
        >
          {student.percentage}%
          {Number(student.percentage) < 75 ? " · Below 75%" : ""}
        </span>
      ),
    },
  ];

  useEffect(() => {
    getBatches()
      .then((result) => setBatches(result.data || []))
      .catch((e) =>
        setError(e.response?.data?.message || "Could not load batches"),
      );
  }, []);

  function loadReport(batchId) {
    setReportBatchId(batchId);
    setSearchName("");
    setReport([]);
    setLoadingReport(Boolean(batchId));
    setError("");
  }

  useEffect(() => {
    if (!reportBatchId) return undefined;

    let active = true;
    const timer = setTimeout(async () => {
      setLoadingReport(true);
      setError("");
      try {
        const result = await getBatchAttendanceReport(
          reportBatchId,
          searchName.trim(),
        );
        if (active) setReport(result.data || []);
      } catch (e) {
        if (active) {
          setError(e.response?.data?.message || "Could not load batch report");
        }
      } finally {
        if (active) setLoadingReport(false);
      }
    }, searchName.trim() ? 300 : 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [reportBatchId, searchName]);

  async function exportReport() {
    try {
      const { default: ExcelJS } = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Attendance");
      worksheet.columns = [
        { header: "Student", key: "name", width: 28 },
        { header: "Admission number", key: "admission_number", width: 22 },
        { header: "Classes", key: "total_classes", width: 12 },
        { header: "Present", key: "present", width: 12 },
        { header: "Absent", key: "absent", width: 12 },
        { header: "Late", key: "late", width: 12 },
        { header: "Leave", key: "leave", width: 12 },
        { header: "Attendance %", key: "percentage", width: 16 },
      ];
      worksheet.addRows(report);
      worksheet.getRow(1).font = { bold: true };

      const workbookData = await workbook.xlsx.writeBuffer();
      const url = URL.createObjectURL(
        new Blob([workbookData], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "attendance-report.xlsx";
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message || "Could not export attendance report");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Batch attendance report</h1>
          <p>Review attendance totals for students in a batch.</p>
        </div>
        <Link
          className="button-link secondary-link"
          to={attendanceBasePath}
        >
          Back to attendance
        </Link>
      </div>
      {error && <div className="error">{error}</div>}

      <section className="dashboard-card">
        <div className="action-row" style={{ width: '100%' }}>
          <h2>Batch attendance report</h2>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
            {report.length > 0 && (
              <button
                className="compact-cta"
                type="button"
                onClick={exportReport}
              >
                Export Excel
              </button>
            )}
          </div>
        </div>
        <label>
          <select
            value={reportBatchId}
            onChange={(e) => loadReport(e.target.value)}
          >
            <option value="">Select a batch</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
        </label>
        {reportBatchId && loadingReport && <p>Searching attendance...</p>}
        {reportBatchId &&
          !loadingReport &&
          <DataTable
            columns={reportColumns}
            rows={report}
            rowKey={(student) => student.student_id}
            emptyMessage="No attendance records found for this batch."
            searchPlaceholder="Search by student name..."
            searchValue={searchName}
            onSearchChange={(value) => {
              setLoadingReport(true);
              setSearchName(value);
            }}
            toolbarActions={
              report.length > 0 && (
                <button
                  className="compact-cta"
                  type="button"
                  onClick={exportReport}
                >
                  Export Excel
                </button>
              )
            }
          />}
      </section>
    </div>
  );
}
