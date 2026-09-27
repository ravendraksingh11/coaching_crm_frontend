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

export async function updateCourse(id, data) {
    const response = await api.put(`/institute/courses/${id}`, data);
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

export async function updateBatch(id, data) {
    const response = await api.put(`/institute/batches/${id}`, data);
    return response.data;
}

export async function updateStudent(id, data) {
    const response = await api.put(`/institute/students/${id}`, data);
    return response.data;
}

export async function deleteStudent(id) {
    const response = await api.delete(`/institute/students/${id}`);
    return response.data;
}

export async function createTest(data) {
    const response = await api.post('/tests', data);
    return response.data;
}

export async function getLatestToppers() {
    const response = await api.get('/tests/toppers/latest');
    return response.data;
}

export async function deactivateTest(id) {
    const response = await api.patch(`/tests/${id}/deactivate`);
    return response.data;
}

export async function getInstituteTests() {
    const response = await api.get("/tests/manage");
    return response.data;
}

export async function getInstituteTest(id) {
    const response = await api.get(`/tests/manage/${id}`);
    return response.data;
}

export async function updateInstituteTest(id, data) {
    const response = await api.put(`/tests/${id}`, data);
    return response.data;
}

export async function deleteInstituteTest(id) {
    const response = await api.delete(`/tests/${id}`);
    return response.data;
}

export async function getMyTests() {
    const response = await api.get('/tests/my');
    return response.data;
}

export async function startAssignedTest(id) {
    const response = await api.post(`/tests/${id}/start`);
    return response.data;
}

export async function getAssignedTest(id) {
    const response = await api.get(`/tests/${id}`);
    return response.data;
}

export async function submitAssignedTest(id, answers) {
    const response = await api.post(`/tests/${id}/submit`, { answers });
    return response.data;
}
