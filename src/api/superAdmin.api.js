import api from "./axios";


// Dashboard
export async function getDashboard() {
  const response =
    await api.get(
      "/super-admin/dashboard"
    );

  return response.data;
}


// Institutes
export async function getInstitutes() {
  const response =
    await api.get(
      "/super-admin/institutes"
    );

  return response.data;
}

export async function updateInstitute(id, data) {
  const response = await api.put(`/super-admin/institutes/${id}`, data);
  return response.data;
}

export async function updateInstituteStatus(id, status) {
  const response = await api.patch(`/super-admin/institutes/${id}/status`, { status });
  return response.data;
}

export async function deleteInstitute(id) {
  const response = await api.delete(`/super-admin/institutes/${id}`);
  return response.data;
}


// Create institute
export async function createInstitute(
  data
) {
  const response =
    await api.post(
      "/super-admin/institutes",
      data
    );

  return response.data;
}


// Subscription plans
export async function getPlans() {
  const response =
    await api.get(
      "/super-admin/plans"
    );

  return response.data;
}


// Create subscription plan
export async function createPlan(
  data
) {
  const response =
    await api.post(
      "/super-admin/plans",
      data
    );

  return response.data;
}

export async function updatePlan(id, data) {
  const response = await api.put(`/super-admin/plans/${id}`, data);
  return response.data;
}

export async function deletePlan(id) {
  const response = await api.delete(`/super-admin/plans/${id}`);
  return response.data;
}


// Assign subscription
export async function assignSubscription(
  instituteId,
  data
) {
  const response =
    await api.post(
      `/subscriptions/institutes/${instituteId}`,
      data
    );

  return response.data;
}

export async function assignLegacySubscription(instituteId, data) {
  const response = await api.post(`/subscriptions/institutes/${instituteId}`, data);
  return response.data;
}
