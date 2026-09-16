import api from "./axios";

export async function getDashboard() {
    const response =
        await api.get(
            "/institute/dashboard"
        );

    return response.data;
}

export async function getStudents() {
    const response =
        await api.get(
            "/institute/students"
        );

    return response.data;
}

export async function getTeachers() {
    const response =
        await api.get(
            "/institute/teachers"
        );

    return response.data;
}

export async function createTeacher(data) {
    const response =
        await api.post(
            "/institute/teachers",
            data
        );

    return response.data;
}

export async function getCourses() {
    const response =
        await api.get(
            "/institute/courses"
        );

    return response.data;
}

export async function createCourse(data) {
    const response =
        await api.post(
            "/institute/courses",
            data
        );

    return response.data;
}