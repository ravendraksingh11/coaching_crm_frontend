import { useEffect, useState } from "react";

import {
    getStudents,
    getBatches,
    createStudent,
    updateStudent,
    deleteStudent,
} from "../../api/institute.api";

export default function Students() {
    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        admissionNumber: "",
        fatherName: "",
        motherName: "",
        dateOfBirth: "",
        batchId: "",
    });

    const loadData = async () => {
        try {
            const [
                studentResponse,
                batchResponse,
            ] = await Promise.all([
                getStudents(),
                getBatches(),
            ]);

            if (studentResponse.success) {
                setStudents(studentResponse.data);
            }

            if (batchResponse.success) {
                setBatches(batchResponse.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await createStudent({
                ...form,
                batchId: form.batchId || null,
            });

            alert("Student created successfully");

            setForm({
                name: "",
                email: "",
                phone: "",
                password: "",
                admissionNumber: "",
                fatherName: "",
                motherName: "",
                dateOfBirth: "",
                batchId: "",
            });

            await loadData();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to create student"
            );
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <h1>Students</h1>

            <form onSubmit={handleSubmit}>

                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Student name"
                    required
                />

                <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                />

                <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone"
                />

                <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                />

                <input
                    name="admissionNumber"
                    value={form.admissionNumber}
                    onChange={handleChange}
                    placeholder="Admission number"
                    required
                />

                <input
                    name="fatherName"
                    value={form.fatherName}
                    onChange={handleChange}
                    placeholder="Father name"
                />

                <input
                    name="motherName"
                    value={form.motherName}
                    onChange={handleChange}
                    placeholder="Mother name"
                />

                <input
                    name="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                />

                <select
                    name="batchId"
                    value={form.batchId}
                    onChange={handleChange}
                >
                    <option value="">
                        Select Batch
                    </option>

                    {batches.map((batch) => (
                        <option
                            key={batch.id}
                            value={batch.id}
                        >
                            {batch.name}
                        </option>
                    ))}
                </select>

                <button type="submit">
                    Add Student
                </button>
            </form>

            <hr />

            <table width="100%">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Admission No.</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Course</th>
                        <th>Batch</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {students.map((student) => (
                        <tr key={student.id}>
                            <td>{student.name}</td>
                            <td>
                                {student.admission_number}
                            </td>
                            <td>{student.email}</td>
                            <td>{student.phone || "-"}</td>
                            <td>
                                {student.course_name || "-"}
                            </td>
                            <td>
                                {student.batch_name || "-"}
                            </td>
                            <td><div className="action-row">
                                <button type="button" className="secondary-button" onClick={async () => {
                                    const name = window.prompt("Student name", student.name); if (name === null) return;
                                    const admissionNumber = window.prompt("Admission number", student.admission_number); if (admissionNumber === null) return;
                                    try { await updateStudent(student.id, { name, admissionNumber }); await loadData(); }
                                    catch (error) { alert(error.response?.data?.message || "Could not update student"); }
                                }}>Edit</button>
                                <button type="button" className="danger-button" onClick={async () => {
                                    if (!window.confirm(`Delete ${student.name}?`)) return;
                                    try { await deleteStudent(student.id); await loadData(); }
                                    catch (error) { alert(error.response?.data?.message || "Could not delete student"); }
                                }}>Delete</button>
                            </div></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
