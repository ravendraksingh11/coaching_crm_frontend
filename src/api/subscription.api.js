import api from "./axios";

// ========================================
// SUPER ADMIN
// GET ALL SUBSCRIPTIONS
// ========================================

export const getAllSubscriptions = async () => {
    const response = await api.get('/subscriptions');
    return response.data;
};

// ========================================
// SUPER ADMIN
// ACTIVATE PLAN
// ========================================

export const activateSubscription = async (data) => {
    const response = await api.post('/subscriptions/activate', data);
    return response.data;
};

// ========================================
// INSTITUTE
// GET MY SUBSCRIPTION
// ========================================

export const getMySubscription = async () => {
    const response = await api.get('/subscriptions/my');
    return response.data;
};

// ========================================
// INSTITUTE
// PURCHASE PLAN
// ========================================

export const purchaseSubscription = async (planId) => {
    const response = await api.post('/subscriptions/purchase', { planId });
    return response.data;
};
