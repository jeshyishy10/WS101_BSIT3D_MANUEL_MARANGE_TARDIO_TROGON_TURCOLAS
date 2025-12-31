// src/services/api.js
// ==================== IMPORTS ====================
import {
    API_CONFIG,
    ENDPOINTS,
    getFullUrl,
    getHeaders,
    DEBUG_CONFIG,
    isBackendAvailable
} from './config';

// ==================== CONSTANTS ====================
const REQUEST_TIMEOUT = API_CONFIG.TIMEOUT || 30000;

// ==================== LOGGING FUNCTIONS ====================
const log = {
    request: (url, method, data, headers) => {
        if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.LOG_REQUESTS) {
            console.group('🔗 API REQUEST');
            console.log('URL:', url);
            console.log('Method:', method);
            console.log('Headers:', headers);
            console.log('Data:', data);
            console.groupEnd();
        }
    },

    response: (url, status, data) => {
        if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.LOG_RESPONSES) {
            console.group('📥 API RESPONSE');
            console.log('URL:', url);
            console.log('Status:', status);
            console.log('Data:', data);
            console.groupEnd();
        }
    },

    error: (url, method, error, data) => {
        if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.LOG_ERRORS) {
            console.group('❌ API ERROR');
            console.log('URL:', url);
            console.log('Method:', method);
            console.log('Error:', error.message);
            console.log('Status:', error.status || 'N/A');
            if (data) console.log('Response Data:', data);
            console.groupEnd();
        }
    }
};

// ==================== ERROR HANDLER ====================
const handleApiError = (error, url) => {
    let userMessage = 'An unexpected error occurred';
    let status = error.status || 0;

    // Handle different types of errors
    if (error.name === 'AbortError') {
        userMessage = `Request timed out (${REQUEST_TIMEOUT/1000}s)`;
        status = 408;
    } else if (error.message.includes('Failed to fetch')) {
        userMessage = `Cannot connect to server at ${API_CONFIG.BASE_URL}`;
        status = 0;
    } else if (error.message.includes('JSON')) {
        userMessage = 'Invalid response from server';
    } else if (status === 401) {
        userMessage = 'Session expired. Please login again.';
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login after a delay
        setTimeout(() => {
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }, 1000);
    } else if (status === 403) {
        userMessage = 'Access forbidden. Insufficient permissions.';
    } else if (status === 404) {
        userMessage = 'Resource not found.';
    } else if (status === 405) {
        userMessage = 'Method not allowed for this endpoint.';
    } else if (status === 500) {
        userMessage = 'Server error. Please try again later.';
    }

    return {
        success: false,
        message: userMessage,
        error: error.message,
        status: status,
        url: url
    };
};

// ==================== MAIN API REQUEST FUNCTION ====================
export const apiRequest = async (
    endpoint,
    method = 'GET',
    data = null,
    requiresAuth = false,
    contentType = 'application/json'
) => {
    const url = getFullUrl(endpoint);
    const headers = getHeaders(requiresAuth, contentType);

    // Log request
    log.request(url, method, data, headers);

    // Setup timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    // Prepare request config
    const config = {
        method,
        headers,
        mode: 'cors',
        credentials: 'include',
        signal: controller.signal
    };

    // Add body for methods that require it
    if (data && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        if (contentType === 'application/json') {
            config.body = JSON.stringify(data);
        } else {
            config.body = data;
        }
    }

    try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        // Handle response
        const responseText = await response.text();
        let responseData = null;

        // Parse JSON response
        try {
            responseData = responseText ? JSON.parse(responseText) : null;
        } catch (parseError) {
            // If response is not JSON but is OK
            if (response.ok && responseText.trim() === '') {
                responseData = { success: true, message: 'Operation completed successfully' };
            } else {
                responseData = {
                    success: false,
                    message: responseText || 'Invalid response format',
                    raw: responseText
                };
            }
        }

        // Log response
        log.response(url, response.status, responseData);

        // Check if response is successful
        if (!response.ok) {
            const error = new Error(responseData?.message || `HTTP Error ${response.status}`);
            error.status = response.status;
            error.data = responseData;
            throw error;
        }

        // Return successful response
        return {
            success: true,
            data: responseData,
            status: response.status,
            headers: response.headers
        };

    } catch (error) {
        clearTimeout(timeoutId);

        // Log error
        log.error(url, method, error);

        // Handle error
        const errorResult = handleApiError(error, url);

        // Throw the error so it can be caught by the caller
        const apiError = new Error(errorResult.message);
        apiError.result = errorResult;
        throw apiError;
    }
};

// ==================== AUTHENTICATION API ====================
export const authAPI = {
    // Register new user - FIXED: Using direct endpoint
    register: async (userData) => {
        try {
            const result = await apiRequest(
                '/User/register',  // Changed from ENDPOINTS.USER_REGISTER
                'POST',
                userData,
                false
            );
            return result;
        } catch (error) {
            throw error;
        }
    },

    // Login user - FIXED: Using direct endpoint
    login: async (email, password) => {
        try {
            const result = await apiRequest(
                '/User/login',  // Changed from ENDPOINTS.USER_LOGIN
                'POST',
                { email, password },
                false
            );

            // Store token and user data if login successful
            if (result.success && result.data) {
                if (result.data.token) {
                    localStorage.setItem('token', result.data.token);
                }
                if (result.data.user) {
                    localStorage.setItem('user', JSON.stringify(result.data.user));
                }
            }

            return result;
        } catch (error) {
            throw error;
        }
    },

    // Verify token
    verifyToken: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return { success: false, message: 'No token found' };
            }

            const result = await apiRequest(
                ENDPOINTS.USER_VERIFY,
                'POST',
                { token },
                false
            );
            return result;
        } catch (error) {
            throw error;
        }
    },

    // Check email existence
    checkEmail: async (email) => {
        try {
            return await apiRequest(
                ENDPOINTS.USER_CHECK_EMAIL,
                'POST',
                { email },
                false
            );
        } catch (error) {
            throw error;
        }
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { success: true, message: 'Logged out successfully' };
    }
};

// ==================== USER API ====================
export const userAPI = {
    // Get all users (public)
    getAllUsers: async () => {
        try {
            return await apiRequest(ENDPOINTS.USER_LIST_ALL, 'GET', null, false);
        } catch (error) {
            throw error;
        }
    },

    // Get user profile (protected)
    getProfile: async () => {
        try {
            return await apiRequest(ENDPOINTS.USER_PROFILE, 'GET', null, true);
        } catch (error) {
            throw error;
        }
    },

    // Update profile (protected)
    updateProfile: async (userData) => {
        try {
            return await apiRequest(ENDPOINTS.USER_UPDATE, 'PUT', userData, true);
        } catch (error) {
            throw error;
        }
    },

    // Get user by ID (public)
    getUserById: async (userId) => {
        try {
            return await apiRequest(
                `${ENDPOINTS.USER_LIST_ALL}/${userId}`,
                'GET',
                null,
                false
            );
        } catch (error) {
            throw error;
        }
    },

    // Get current user
    getCurrentUser: async () => {
        try {
            return await apiRequest(ENDPOINTS.USER_PROFILE, 'GET', null, true);
        } catch (error) {
            throw error;
        }
    },

    // Admin: Get all users
    adminGetAllUsers: async () => {
        try {
            return await apiRequest(ENDPOINTS.USER_ADMIN, 'GET', null, true);
        } catch (error) {
            throw error;
        }
    },

    // Admin: Get user by ID
    adminGetUser: async (userId) => {
        try {
            return await apiRequest(
                `${ENDPOINTS.USER_ADMIN_STAFF}/${userId}`,
                'GET',
                null,
                true
            );
        } catch (error) {
            throw error;
        }
    },

    // Admin: Update user
    adminUpdateUser: async (userId, userData) => {
        try {
            return await apiRequest(
                `${ENDPOINTS.USER_ADMIN}/${userId}`,
                'PUT',
                userData,
                true
            );
        } catch (error) {
            throw error;
        }
    },

    // Admin: Delete user
    adminDeleteUser: async (userId) => {
        try {
            return await apiRequest(
                `${ENDPOINTS.USER_ADMIN}/${userId}`,
                'DELETE',
                null,
                true
            );
        } catch (error) {
            throw error;
        }
    }
};

// ==================== ITEM API ====================
export const itemAPI = {
    // Get all items (public)
    getAllItems: async () => {
        try {
            return await apiRequest(ENDPOINTS.ITEM_PUBLIC, 'GET', null, false);
        } catch (error) {
            throw error;
        }
    },

    // Get item by ID (public)
    getItemById: async (itemId) => {
        try {
            return await apiRequest(
                `${ENDPOINTS.ITEM_PUBLIC}/${itemId}`,
                'GET',
                null,
                false
            );
        } catch (error) {
            throw error;
        }
    },

    // Create item (protected)
    createItem: async (itemData) => {
        try {
            return await apiRequest(
                ENDPOINTS.ITEM_PUBLIC,
                'POST',
                itemData,
                true
            );
        } catch (error) {
            throw error;
        }
    },

    // Update item (protected)
    updateItem: async (itemId, itemData) => {
        try {
            return await apiRequest(
                `${ENDPOINTS.ITEM_PUBLIC}/${itemId}`,
                'PUT',
                itemData,
                true
            );
        } catch (error) {
            throw error;
        }
    },

    // Delete item (protected)
    deleteItem: async (itemId) => {
        try {
            return await apiRequest(
                `${ENDPOINTS.ITEM_PUBLIC}/${itemId}`,
                'DELETE',
                null,
                true
            );
        } catch (error) {
            throw error;
        }
    },

    // Get user's items (protected)
    getUserItems: async (userId) => {
        try {
            return await apiRequest(
                `${ENDPOINTS.ITEM_PUBLIC}/user/${userId}`,
                'GET',
                null,
                true
            );
        } catch (error) {
            throw error;
        }
    },

    // Search items (public)
    searchItems: async (query) => {
        try {
            return await apiRequest(
                `${ENDPOINTS.ITEM_SEARCH}?q=${encodeURIComponent(query)}`,
                'GET',
                null,
                false
            );
        } catch (error) {
            throw error;
        }
    },

    // Get categories (public)
    getCategories: async () => {
        try {
            return await apiRequest(ENDPOINTS.ITEM_CATEGORIES, 'GET', null, false);
        } catch (error) {
            throw error;
        }
    },

    // Admin: Get all items
    adminGetAllItems: async () => {
        try {
            return await apiRequest(ENDPOINTS.ADMIN_ITEM_ALL, 'GET', null, true);
        } catch (error) {
            throw error;
        }
    },

    // Admin: Create item
    adminCreateItem: async (userId, itemData) => {
        try {
            return await apiRequest(
                `${ENDPOINTS.ADMIN_ITEM_CREATE}/${userId}`,
                'POST',
                itemData,
                true
            );
        } catch (error) {
            throw error;
        }
    },

    // Admin: Delete item
    adminDeleteItem: async (itemId) => {
        try {
            return await apiRequest(
                `${ENDPOINTS.ADMIN_ITEM_DELETE}/${itemId}`,
                'DELETE',
                null,
                true
            );
        } catch (error) {
            throw error;
        }
    }
};

// ==================== REQUEST API ====================
export const requestAPI = {
    // Get all requests (public)
    getAllRequests: async () => {
        try {
            return await apiRequest(ENDPOINTS.REQUEST_PUBLIC, 'GET', null, false);
        } catch (error) {
            throw error;
        }
    },

    // Get request by ID (public)
    getRequestById: async (requestId) => {
        try {
            return await apiRequest(
                `${ENDPOINTS.REQUEST_PUBLIC}/${requestId}`,
                'GET',
                null,
                false
            );
        } catch (error) {
            throw error;
        }
    },

    // Create request (protected)
    createRequest: async (requestData) => {
        try {
            return await apiRequest(
                ENDPOINTS.REQUEST_PUBLIC,
                'POST',
                requestData,
                true
            );
        } catch (error) {
            throw error;
        }
    },

    // Update request (protected)
    updateRequest: async (requestId, requestData) => {
        try {
            return await apiRequest(
                `${ENDPOINTS.REQUEST_PUBLIC}/${requestId}`,
                'PUT',
                requestData,
                true
            );
        } catch (error) {
            throw error;
        }
    },

    // Delete request (protected)
    deleteRequest: async (requestId) => {
        try {
            return await apiRequest(
                `${ENDPOINTS.REQUEST_PUBLIC}/${requestId}`,
                'DELETE',
                null,
                true
            );
        } catch (error) {
            throw error;
        }
    },

    // Get user's requests (protected)
    getUserRequests: async (userId) => {
        try {
            return await apiRequest(
                `${ENDPOINTS.REQUEST_PUBLIC}/user/${userId}`,
                'GET',
                null,
                true
            );
        } catch (error) {
            throw error;
        }
    },

    // Get item requests (protected)
    getItemRequests: async (itemId) => {
        try {
            return await apiRequest(
                `${ENDPOINTS.REQUEST_PUBLIC}/item/${itemId}`,
                'GET',
                null,
                true
            );
        } catch (error) {
            throw error;
        }
    },

    // Update request status (protected)
    updateRequestStatus: async (requestId, status) => {
        try {
            return await apiRequest(
                `${ENDPOINTS.REQUEST_PUBLIC}/${requestId}/status`,
                'PUT',
                { status },
                true
            );
        } catch (error) {
            throw error;
        }
    },

    // Admin: Get all requests
    adminGetAllRequests: async () => {
        try {
            return await apiRequest(ENDPOINTS.ADMIN_REQUEST_ALL, 'GET', null, true);
        } catch (error) {
            throw error;
        }
    },

    // Admin: Approve request
    adminApproveRequest: async (requestId) => {
        try {
            return await apiRequest(
                `${ENDPOINTS.ADMIN_REQUEST_APPROVE}/${requestId}`,
                'PUT',
                null,
                true
            );
        } catch (error) {
            throw error;
        }
    },

    // Admin: Reject request
    adminRejectRequest: async (requestId) => {
        try {
            return await apiRequest(
                `${ENDPOINTS.ADMIN_REQUEST_REJECT}/${requestId}`,
                'PUT',
                null,
                true
            );
        } catch (error) {
            throw error;
        }
    },

    // Admin: Create request
    adminCreateRequest: async (requestData) => {
        try {
            return await apiRequest(
                ENDPOINTS.ADMIN_REQUEST_CREATE,
                'POST',
                requestData,
                true
            );
        } catch (error) {
            throw error;
        }
    }
};

// ==================== UTILITY FUNCTIONS ====================
export const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
        return null;
    }

    try {
        const user = JSON.parse(userStr);
        return { token, user, isAuthenticated: true };
    } catch (error) {
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
    }
};

export const isAuthenticated = () => {
    return checkAuth() !== null;
};

export const getCurrentUser = () => {
    const auth = checkAuth();
    return auth ? auth.user : null;
};

export const getAuthToken = () => {
    return localStorage.getItem('token');
};

export const setAuthData = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const isAdmin = () => {
    const user = getCurrentUser();
    return user && user.role === 'ADMIN';
};

export const isStaff = () => {
    const user = getCurrentUser();
    return user && user.role === 'STAFF';
};

export const isUser = () => {
    const user = getCurrentUser();
    return user && user.role === 'USER';
};

export const hasRole = (role) => {
    const user = getCurrentUser();
    return user && user.role === role;
};

// ==================== TEST FUNCTIONS ====================
export const testBackendConnection = async () => {
    console.log('🚀 Testing backend connection...');
    console.log(`🔗 Base URL: ${API_CONFIG.BASE_URL}`);
    console.log(`📁 API Prefix: ${API_CONFIG.API_PREFIX}`);

    const tests = [
        {
            name: 'Root Endpoint',
            url: `${API_CONFIG.BASE_URL}/`,
            method: 'GET',
            expected: 'Spring Boot application'
        },
        {
            name: 'Health Check',
            url: `${API_CONFIG.BASE_URL}${ENDPOINTS.HEALTH_CHECK}`,
            method: 'GET',
            expected: 'Health status'
        },
        {
            name: 'Public API Test',
            url: `${API_CONFIG.BASE_URL}${ENDPOINTS.API_TEST}`,
            method: 'GET',
            expected: 'Test endpoint'
        },
        {
            name: 'User Login Endpoint',
            url: getFullUrl(ENDPOINTS.USER_LOGIN),
            method: 'OPTIONS',
            expected: 'CORS headers'
        }
    ];

    const results = [];

    for (const test of tests) {
        try {
            const startTime = Date.now();
            const response = await fetch(test.url, {
                method: test.method,
                headers: { 'Accept': 'application/json' },
                mode: 'cors'
            });
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            results.push({
                test: test.name,
                url: test.url,
                method: test.method,
                status: response.status,
                statusText: response.statusText,
                responseTime: `${responseTime}ms`,
                success: response.ok || response.status === 200 || response.status === 404,
                message: response.ok ? '✅ Connected' : `⚠️ ${response.status} ${response.statusText}`
            });

            if (DEBUG_CONFIG.ENABLED) {
                console.log(`${response.ok ? '✅' : '⚠️'} ${test.name}: ${response.status} ${response.statusText} (${responseTime}ms)`);
            }

        } catch (error) {
            results.push({
                test: test.name,
                url: test.url,
                method: test.method,
                status: 'ERROR',
                statusText: error.message,
                responseTime: 'N/A',
                success: false,
                message: `❌ ${error.message}`
            });

            if (DEBUG_CONFIG.ENABLED) {
                console.error(`❌ ${test.name}: ${error.message}`);
            }
        }
    }

    // Summary
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    console.log(`\n📊 Connection Test Summary:`);
    console.log(`✅ ${successCount}/${totalCount} tests passed`);

    if (successCount === totalCount) {
        console.log('🎉 All connections successful! Backend is ready.');
    } else if (successCount > 0) {
        console.log('⚠️ Some connections failed. Check the failed endpoints.');
    } else {
        console.log('❌ All connections failed. Backend may not be running.');
        console.log('🔧 Troubleshooting:');
        console.log('1. Make sure Spring Boot is running on port 8082');
        console.log('2. Check if CORS is configured in Spring Boot');
        console.log('3. Verify the backend URL in config.js');
        console.log('4. Check Spring Boot logs for errors');
    }

    return results;
};

export const testCORS = async () => {
    console.log('🔍 Testing CORS configuration...');

    try {
        const response = await fetch(getFullUrl('/User/login'), {
            method: 'OPTIONS',
            headers: {
                'Origin': window.location.origin,
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            },
            mode: 'cors'
        });

        const corsHeaders = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
            'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
            'Access-Control-Max-Age': response.headers.get('Access-Control-Max-Age')
        };

        console.log('CORS Headers:', corsHeaders);

        return {
            success: response.ok,
            headers: corsHeaders
        };

    } catch (error) {
        console.error('CORS Test Error:', error);
        return { success: false, error: error.message };
    }
};

// ==================== DEFAULT EXPORT ====================
const api = {
    // Main request function
    request: apiRequest,

    // API modules
    auth: authAPI,
    users: userAPI,
    items: itemAPI,
    requests: requestAPI,

    // Auth utilities
    checkAuth,
    isAuthenticated,
    getCurrentUser,
    getAuthToken,
    setAuthData,
    clearAuthData,
    isAdmin,
    isStaff,
    isUser,
    hasRole,

    // Testing
    testConnection: testBackendConnection,
    testCORS,
    isBackendAvailable,

    // Configuration
    config: API_CONFIG,
    endpoints: ENDPOINTS
};

export default api;