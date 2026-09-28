import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createStudent, getBatches, getNextAdmissionNumber } from "../../api/institute.api";

const emptyForm = { name: "", email: "", phone: "", password: "", admissionNumber: "", fatherName: "", motherName: "", dateOfBirth: "", batchId: "" };

export default function CreateStudent() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [batches, setBatches] = useState([]);
  const [admissionNumberError, setAdmissionNumberError] = useState("");
  const [loadingAdmissionNumber, setLoadingAdmissionNumber] = useState(true);

  useEffect(() => {
    getBatches().then((result) => setBatches(result.data || [])).catch((error) => {
      alert(error.response?.data?.message || "Could not load batches");
    });
    getNextAdmissionNumber().then((result) => {
      setForm((current) => ({ ...current, admissionNumber: result.data.admissionNumber }));
    }).catch((error) => {
      setAdmissionNumberError(error.response?.data?.message || "Could not generate an admission number");
    }).finally(() => setLoadingAdmissionNumber(false));
  }, []);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await createStudent({ ...form, batchId: form.batchId || null });
      alert("Student created successfully");
      navigate("/institute/students");
    } catch (error) {
      if (error.response?.status === 409 && error.response?.data?.message?.includes("Admission number")) {
        setLoadingAdmissionNumber(true);
        getNextAdmissionNumber().then((result) => {
          setForm((current) => ({ ...current, admissionNumber: result.data.admissionNumber }));
          setAdmissionNumberError("The suggested number was just used. A new number has been filled in; submit again.");
        }).catch((nextError) => {
          setAdmissionNumberError(nextError.response?.data?.message || "Could not generate an admission number");
        }).finally(() => setLoadingAdmissionNumber(false));
      } else {
        alert(error.response?.data?.message || "Failed to create student");
      }
    }
  }

  return (
    <div className="page" style={{ padding: 24 }}>
      <div className="page-header">
        <div><h1>Add Student</h1><p>Enter the student details below.</p></div>
        <Link className="button-link secondary-link" to="/institute/students">Back to students</Link>
      </div>
      {admissionNumberError && <div className="error" role="alert">{admissionNumberError}</div>}
      <form onSubmit={handleSubmit} className="form-grid student-form" autoComplete="off">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Student name" required />
        <input name="email" type="email" autoComplete="off" value={form.email} onChange={handleChange} placeholder="Email" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
        <input name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} placeholder="Password" required />
        <label>Admission number<input name="admissionNumber" value={form.admissionNumber} placeholder={loadingAdmissionNumber ? "Generating…" : "Admission number"} readOnly required /></label>
        <input name="fatherName" value={form.fatherName} onChange={handleChange} placeholder="Father name" />
        <input name="motherName" value={form.motherName} onChange={handleChange} placeholder="Mother name" />
        <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
        <select name="batchId" value={form.batchId} onChange={handleChange}>
          <option value="">Select Batch</option>
          {batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
        </select>
        <button type="submit" disabled={loadingAdmissionNumber || !form.admissionNumber}>Add Student</button>
      </form>
    </div>
  );
}
