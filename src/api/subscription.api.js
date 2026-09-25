import api from "./axios";

const API_URL = "http://localhost:5000/api/subscriptions";

// ========================================
// SUPER ADMIN
// GET ALL SUBSCRIPTIONS
// ========================================

export const getAllSubscriptions = async () => {
    const response = api.get('/subscriptions');
    return response.data;
};

// ========================================
// SUPER ADMIN
// ACTIVATE PLAN
// ========================================

export const activateSubscription = async (data) => {
    const response = api.post('/subscriptions/activate', data);
    return response.data;
};

// ========================================
// INSTITUTE
// GET MY SUBSCRIPTION
// ========================================

export const getMySubscription = async () => {
    const response = api.get('/subscriptions/my');
    return response.data;
};

// ========================================
// INSTITUTE
// PURCHASE PLAN
// ========================================

export const purchaseSubscription = async (planId) => {
    const response = api.post('/subscriptions/purchase', { planId });
    return response.data;
};