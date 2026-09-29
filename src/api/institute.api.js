import api from "./axios";

export async function getInstituteSettings() {
    const response = await api.get("/institute/settings");
    return response.data;
}

export async function updateInstituteName(name) {
    const response = await api.put("/institute/settings/name", { name });
    return response.data;
}

export async function updateInstitutePassword(data) {
    const response = await api.put("/institute/settings/password", data);
    return response.data;
}

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

export async function getNextAdmissionNumber() {
    const response = await api.get("/institute/students/admission-number/next");
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

export async function getAssignedTestStudents(id) {
    const response = await api.get(`/tests/manage/${id}/students`);
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

export async function getTeachers() {
    const response = await api.get("/institute/teachers");
    return response.data;
}

export async function createAttendanceSession(data) {
    const response = await api.post("/attendance/sessions", data);
    return response.data;
}

export async function getAttendanceSessions(params = {}) {
    const response = await api.get("/attendance/sessions", { params });
    return response.data;
}

export async function getAttendanceSession(id) {
    const response = await api.get(`/attendance/sessions/${id}`);
    return response.data;
}

export async function saveSessionAttendance(id, records) {
    const response = await api.put(`/attendance/sessions/${id}/records`, { records });
    return response.data;
}

export async function updateAttendanceSessionStatus(id, status) {
    const response = await api.patch(`/attendance/sessions/${id}/status`, { status });
    return response.data;
}

export async function getBatchAttendanceReport(batchId) {
    const response = await api.get(`/attendance/reports/batches/${batchId}`);
    return response.data;
}

export async function getPendingFees(frequency) {
    const response = await api.get("/fees/pending", { params: frequency ? { frequency } : {} });
    return response.data;
}

export async function getStudentFees(studentId) {
    const response = await api.get(`/fees/students/${studentId}`);
    return response.data;
}

export async function receiveFee(feeId, data = {}) {
    const response = await api.patch(`/fees/${feeId}/receive`, data);
    return response.data;
}

export async function getFeeSummary() {
    const response = await api.get("/fees/summary");
    return response.data;
}

export async function getPendingFeeSubmissions() {
    const response = await api.get("/fees/submissions/pending");
    return response.data;
}

export async function approveFeeSubmission(id) {
    const response = await api.patch(`/fees/submissions/${id}/approve`);
    return response.data;
}

export async function getChildrenAttendance() {
    const response = await api.get("/attendance/parents/children");
    return response.data;
}

export async function getMyAttendance() {
    const response = await api.get("/attendance/student/me");
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

export async function getAssignedTestResult(id) {
    const response = await api.get(`/tests/${id}/result`);
    return response.data;
}

export async function getMyFees() {
    const response = await api.get("/fees/my");
    return response.data;
}

export async function submitMyFeePayment(feeId, data) {
    const response = await api.post(`/fees/${feeId}/submit`, data);
    return response.data;
}
