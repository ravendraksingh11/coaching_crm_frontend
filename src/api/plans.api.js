import api from "./axios";

// Get all plans
export const getPlans = () => {
    return api.get("/plans");
};

// Get only active plans
export const getActivePlans = () => {
    return api.get("/plans/active");
};

// Get single plan
export const getPlanById = (id) => {
    return api.get(`/plans/${id}`);
};

// Super Admin - create plan
export const createPlan = (data) => {
    return api.post("/plans", data);
};

// Super Admin - update plan
export const updatePlan = (id, data) => {
    return api.put(`/plans/${id}`, data);
};

// Super Admin - activate/deactivate plan
export const updatePlanStatus = (id, status) => {
    return api.patch(`/plans/${id}/status`, {
        status,
    });
};

// Super Admin - delete plan
export const deletePlan = (id) => {
    return api.delete(`/plans/${id}`);
};