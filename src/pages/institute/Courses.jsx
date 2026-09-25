import { useEffect, useState } from "react";
import {
    createCourse,
    getCourses,
} from "../../api/institute.api";

export default function Courses() {
    const [courses, setCourses] = useState([]);

    const [name, setName] = useState("");
    const [description, setDescription] =
        useState("");

    const [loading, setLoading] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            return;
        }

        try {
            setLoading(true);

            await createCourse({
                name,
                description,
            });

            setName("");
            setDescription("");

            await loadCourses();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to create course"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <h1>Courses</h1>

            <form onSubmit={handleSubmit}>
                <input
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                    placeholder="Course name"
                />

                <input
                    value={description}
                    onChange={(e) =>
                        setDescription(e.target.value)
                    }
                    placeholder="Description"
                />

                <button disabled={loading}>
                    {loading ? "Creating..." : "Add Course"}
                </button>
            </form>

            <hr />

            <table width="100%">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Batches</th>
                    </tr>
                </thead>

                <tbody>
                    {courses.map((course) => (
                        <tr key={course.id}>
                            <td>{course.name}</td>
                            <td>{course.description || "-"}</td>
                            <td>{course.batch_count}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}