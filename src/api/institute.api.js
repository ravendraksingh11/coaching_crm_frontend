import api from "./axios";
export async function getDashboard() {
    const response =
        await api.get(
            "/institute/dashboard"
        );

    return response.data;
}

// Students

export async function getStudents() {
    const response = await api.get(
        "/institute/students"
    );

    return response.data;
}

export async function createStudent(data) {
    const response = await api.post(
        "/institute/students",
        data
    );

    return response.data;
}


// Courses

export async function getCourses() {
    const response = await api.get(
        "/institute/courses"
    );

    return response.data;
}

export async function createCourse(data) {
    const response = await api.post(
        "/institute/courses",
        data
    );

    return response.data;
}

export async function deleteCourse(id) {
    const response = await api.delete(
        `/institute/courses/${id}`
    );

    return response.data;
}


// Batches

export async function getBatches() {
    const response = await api.get(
        "/institute/batches"
    );

    return response.data;
}

export async function createBatch(data) {
    const response = await api.post(
        "/institute/batches",
        data
    );

    return response.data;
}

export async function deleteBatch(id) {
    const response = await api.delete(
        `/institute/batches/${id}`
    );

    return response.data;
}