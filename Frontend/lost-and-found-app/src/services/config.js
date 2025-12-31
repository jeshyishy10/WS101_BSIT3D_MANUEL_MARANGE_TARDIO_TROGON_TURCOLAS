// src/services/config.js

export const API_CONFIG = {
    BASE_URL: 'http://localhost:8082',
    API_PREFIX: '', // Empty if no prefix like '/api'
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

export const ENDPOINTS = {
    // Authentication endpoints - FIX THESE
    USER_REGISTER: '/User/register',  // Changed from whatever it was
    USER_LOGIN: '/User/login',        // Changed from whatever it was
    USER_LOGOUT: '/User/logout',
    USER_VERIFY: '/User/verify',
    USER_CHECK_EMAIL: '/User/check-email',

    // User endpoints
    USER_PROFILE: '/User/profile',
    USER_UPDATE: '/User/update',
    USER_LIST_ALL: '/User/all',

    // Admin endpoints
    USER_ADMIN: '/User/admin',
    USER_ADMIN_STAFF: '/User/admin/staff',

    // Health check
    HEALTH_CHECK: '/actuator/health',

    // API test
    API_TEST: '/api/test',

    // Item endpoints
    ITEM_PUBLIC: '/Item',
    ITEM_SEARCH: '/Item/search',
    ITEM_CATEGORIES: '/Item/categories',
    ADMIN_ITEM_ALL: '/Item/admin/all',
    ADMIN_ITEM_CREATE: '/Item/admin/create',
    ADMIN_ITEM_DELETE: '/Item/admin/delete',

    // Request endpoints
    REQUEST_PUBLIC: '/Request',
    ADMIN_REQUEST_ALL: '/Request/admin/all',
    ADMIN_REQUEST_APPROVE: '/Request/admin/approve',
    ADMIN_REQUEST_REJECT: '/Request/admin/reject',
    ADMIN_REQUEST_CREATE: '/Request/admin/create'
};

// Helper function to get full URL
export const getFullUrl = (endpoint) => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Get headers for requests
export const getHeaders = (requiresAuth = false, contentType = 'application/json') => {
    const headers = {
        'Accept': 'application/json',
        'Content-Type': contentType
    };

    if (requiresAuth) {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
};

// Debug configuration
export const DEBUG_CONFIG = {
    ENABLED: process.env.NODE_ENV === 'development',
    LOG_REQUESTS: true,
    LOG_RESPONSES: true,
    LOG_ERRORS: true
};

// Check if backend is available
export const isBackendAvailable = async () => {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.HEALTH_CHECK || '/actuator/health'}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};