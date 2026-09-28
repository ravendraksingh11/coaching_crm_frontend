import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getCourses,
    updateCourse,
    deleteCourse,
} from "../../api/institute.api";

export default function Courses() {
    const [courses, setCourses] = useState([]);

    const loadCourses = async () => {
        try {
            const response = await getCourses();

            if (response.success) {
                setCourses(response.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadCourses();
    }, []);

    return (
        <div className="page" style={{ padding: 24 }}>
            <div className="page-header">
                <div><h1>Courses</h1><p>Manage courses and their batches.</p></div>
                <Link className="button-link" to="/institute/courses/create">Add Course</Link>
            </div>
            <div className="table-card"><table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Batches</th><th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {courses.map((course) => (
                        <tr key={course.id}>
                            <td>{course.name}</td>
                            <td>{course.description || "-"}</td>
                            <td>{course.batch_count}</td>
                            <td><div className="action-row"><button type="button" className="secondary-button" onClick={async () => {
                                const updatedName = window.prompt("Course name", course.name); if (updatedName === null) return;
                                const updatedDescription = window.prompt("Description", course.description || ""); if (updatedDescription === null) return;
                                try { await updateCourse(course.id, { name: updatedName, description: updatedDescription }); await loadCourses(); }
                                catch (error) { alert(error.response?.data?.message || "Could not update course"); }
                            }}>Edit</button><button type="button" className="danger-button" onClick={async () => {
                                if (!window.confirm(`Delete ${course.name}?`)) return;
                                try { await deleteCourse(course.id); await loadCourses(); }
                                catch (error) { alert(error.response?.data?.message || "Could not delete course"); }
                            }}>Delete</button></div></td>
                        </tr>
                    ))}
                </tbody>
            </table></div>
        </div>
    );
}
