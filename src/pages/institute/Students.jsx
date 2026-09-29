import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteStudent, getStudents } from "../../api/institute.api";

export default function Students() {
  const [students, setStudents] = useState([]);

  async function loadData() {
    try {
      const result = await getStudents();
      if (result.success) setStudents(result.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => { loadData(); }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div><h1>Students</h1><p>Manage student records and batches.</p></div>
        <Link className="button-link" to="/institute/students/create">Add Student</Link>
      </div>
      <div className="table-card"><table>
        <thead><tr><th>Name</th><th>Admission No.</th><th>Email</th><th>Phone</th><th>Course</th><th>Batch</th><th>Fee plan</th><th>Actions</th></tr></thead>
        <tbody>{students.map((student) => <tr key={student.id}>
          <td>{student.name}</td><td>{student.admission_number}</td><td>{student.email}</td>
          <td>{student.phone || "-"}</td><td>{student.course_name || "-"}</td><td>{student.batch_name || "-"}</td><td>{student.fee_applicable ? `${student.fee_frequency === "MONTHLY" ? "Monthly" : "One-time"} · ₹${Number(student.fee_amount).toLocaleString("en-IN")}` : "Not paying"}</td>
          <td><div className="action-row">
            <Link className="button-link secondary-link" to={`/institute/students/${student.id}/edit`}>Edit</Link>
            <button type="button" className="danger-button" onClick={async () => {
              if (!window.confirm(`Delete ${student.name}?`)) return;
              try { await deleteStudent(student.id); await loadData(); }
              catch (error) { alert(error.response?.data?.message || "Could not delete student"); }
            }}>Delete</button>
          </div></td>
        </tr>)}</tbody>
      </table></div>
    </div>
  );
}
