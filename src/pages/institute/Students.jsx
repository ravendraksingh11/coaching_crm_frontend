import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteStudent, getStudents } from "../../api/institute.api";
import DataTable from "../../components/DataTable";

export default function Students() {
  const [students, setStudents] = useState([]);

  const columns = [
    { key: "name", header: "Name", value: (student) => student.name },
    {
      key: "admission_number",
      header: "Admission No.",
      value: (student) => student.admission_number,
    },
    { key: "email", header: "Email", value: (student) => student.email },
    {
      key: "phone",
      header: "Phone",
      value: (student) => student.phone || "-",
    },
    {
      key: "course",
      header: "Course",
      value: (student) => student.course_name || "-",
    },
    {
      key: "batch",
      header: "Batch",
      value: (student) => student.batch_name || "-",
    },
    {
      key: "fee_plan",
      header: "Fee plan",
      value: (student) =>
        student.fee_applicable
          ? `${student.fee_frequency === "MONTHLY" ? "Monthly" : "One-time"} · ₹${Number(student.fee_amount).toLocaleString("en-IN")}`
          : "Not paying",
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      searchable: false,
      render: (student) => (
        <div className="action-row">
          <Link
            className="button-link secondary-link"
            to={`/institute/students/${student.id}/edit`}
          >
            Edit
          </Link>
          <button
            type="button"
            className="danger-button"
            onClick={async () => {
              if (!window.confirm(`Delete ${student.name}?`)) return;
              try {
                await deleteStudent(student.id);
                await loadData();
              } catch (error) {
                alert(
                  error.response?.data?.message || "Could not delete student",
                );
              }
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  async function loadData() {
    try {
      const result = await getStudents();
      if (result.success) setStudents(result.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>Manage student records and batches.</p>
        </div>
        <Link className="button-link" to="/institute/students/create">
          Add Student
        </Link>
      </div>
      <DataTable
        columns={columns}
        rows={students}
        rowKey={(student) => student.id}
        emptyMessage="No students found."
        searchPlaceholder="Search students..."
      />
    </div>
  );
}
