import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createStudent, getBatches, getNextAdmissionNumber, getStudents, updateStudent } from "../../api/institute.api";

const emptyForm = { name: "", email: "", phone: "", password: "", admissionNumber: "", fatherName: "", motherName: "", dateOfBirth: "", batchId: "", feePaying: false, feeFrequency: "ONE_TIME", feeAmount: "" };

export default function CreateStudent() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const isEditing = Boolean(studentId);
  const [form, setForm] = useState(emptyForm);
  const [batches, setBatches] = useState([]);
  const [admissionNumberError, setAdmissionNumberError] = useState("");
  const [loadingAdmissionNumber, setLoadingAdmissionNumber] = useState(true);

  useEffect(() => {
    getBatches().then((result) => setBatches(result.data || [])).catch((error) => {
      alert(error.response?.data?.message || "Could not load batches");
    });
    const loadStudentForm = isEditing
      ? getStudents().then((result) => {
        const student = (result.data || []).find((record) => record.id === studentId);
        if (!student) throw new Error("Student not found");
        setForm((current) => ({
          ...current,
          name: student.name || "",
          email: student.email || "",
          phone: student.phone || "",
          admissionNumber: student.admission_number || "",
          fatherName: student.father_name || "",
          motherName: student.mother_name || "",
          dateOfBirth: student.date_of_birth ? String(student.date_of_birth).slice(0, 10) : "",
        }));
      })
      : getNextAdmissionNumber().then((result) => {
        setForm((current) => ({ ...current, admissionNumber: result.data.admissionNumber }));
      });
    loadStudentForm.catch((error) => {
      setAdmissionNumberError(error.response?.data?.message || error.message || "Could not load student form");
    }).finally(() => setLoadingAdmissionNumber(false));
  }, [isEditing, studentId]);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      if (isEditing) {
        await updateStudent(studentId, {
          name: form.name,
          phone: form.phone || null,
          admissionNumber: form.admissionNumber,
          fatherName: form.fatherName || null,
          motherName: form.motherName || null,
          dateOfBirth: form.dateOfBirth || null,
        });
        alert("Student updated successfully");
      } else {
        await createStudent({ ...form, batchId: form.batchId || null });
        alert("Student created successfully");
      }
      navigate("/institute/students");
    } catch (error) {
      if (!isEditing && error.response?.status === 409 && error.response?.data?.message?.includes("Admission number")) {
        setLoadingAdmissionNumber(true);
        getNextAdmissionNumber().then((result) => {
          setForm((current) => ({ ...current, admissionNumber: result.data.admissionNumber }));
          setAdmissionNumberError("The suggested number was just used. A new number has been filled in; submit again.");
        }).catch((nextError) => {
          setAdmissionNumberError(nextError.response?.data?.message || "Could not generate an admission number");
        }).finally(() => setLoadingAdmissionNumber(false));
      } else {
        alert(error.response?.data?.message || (isEditing ? "Failed to update student" : "Failed to create student"));
      }
    }
  }

  return (
    <div className="page" style={{ padding: 24 }}>
      <div className="page-header">
        <div><h1>{isEditing ? "Edit Student" : "Add Student"}</h1><p>{isEditing ? "Update the student details below." : "Enter the student details below."}</p></div>
        <Link className="button-link secondary-link" to="/institute/students">Back to students</Link>
      </div>
      {admissionNumberError && <div className="error" role="alert">{admissionNumberError}</div>}
      <form onSubmit={handleSubmit} className="form-grid student-form" autoComplete="off">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Student name" required />
        {!isEditing && <input name="email" type="email" autoComplete="off" value={form.email} onChange={handleChange} placeholder="Email" required />}
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
        {!isEditing && <input name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} placeholder="Password" required />}
        <label>Admission number<input name="admissionNumber" value={form.admissionNumber} placeholder={loadingAdmissionNumber ? "Loading…" : "Admission number"} readOnly required /></label>
        <input name="fatherName" value={form.fatherName} onChange={handleChange} placeholder="Father name" />
        <input name="motherName" value={form.motherName} onChange={handleChange} placeholder="Mother name" />
        <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
        {!isEditing && <select name="batchId" value={form.batchId} required={form.feePaying && form.feeFrequency === "MONTHLY"} onChange={handleChange}>
          <option value="">Select Batch</option>
          {batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}{batch.end_date ? ` · ends ${String(batch.end_date).slice(0, 10)}` : " · no end date"}</option>)}
        </select>}
        {!isEditing && <label><input type="checkbox" name="feePaying" checked={form.feePaying} onChange={(e) => setForm((current) => ({ ...current, feePaying: e.target.checked }))} /> Student is paying fees</label>}
        {!isEditing && form.feePaying && <>
          <label>Fee amount<input name="feeAmount" type="number" min="0.01" step="0.01" required value={form.feeAmount} onChange={handleChange} placeholder="Amount" /></label>
          <label>Payment schedule<select name="feeFrequency" required value={form.feeFrequency} onChange={handleChange}><option value="ONE_TIME">One-time payment</option><option value="MONTHLY">Monthly</option></select></label>
          {form.feeFrequency === "MONTHLY" && <p className="form-hint">Monthly fees are due on the registration day of each month and stop at the selected batch end date.</p>}
        </>}
        <button type="submit" disabled={loadingAdmissionNumber || !form.admissionNumber}>{isEditing ? "Save changes" : "Add Student"}</button>
      </form>
    </div>
  );
}
