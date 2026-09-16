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
      "/subscription-plans",
      data
    );

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