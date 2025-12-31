// src/test-connection.js
// Run this in browser console to test the connection

async function testAPIConnection() {
    console.log('🔧 Testing API Connection...');

    // Import the api module (if running in module context)
    const { api } = await import('./services/api');

    console.log('Configuration:');
    console.log('- Base URL:', api.config.BASE_URL);
    console.log('- API Prefix:', api.config.API_PREFIX);

    // Test 1: Check if backend is reachable
    console.log('\n🔍 Test 1: Backend Reachability');
    const isAvailable = await api.isBackendAvailable();
    console.log(isAvailable ? '✅ Backend is reachable' : '❌ Backend is not reachable');

    // Test 2: Test specific endpoints
    console.log('\n🔍 Test 2: Endpoint Testing');
    const endpoints = [
        { name: 'Health Check', endpoint: '/api/health' },
        { name: 'User Login', endpoint: api.endpoints.USER_LOGIN },
        { name: 'User Register', endpoint: api.endpoints.USER_REGISTER }
    ];

    for (const test of endpoints) {
        try {
            const response = await fetch(`${api.config.BASE_URL}${test.endpoint}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            console.log(`${response.ok ? '✅' : '⚠️'} ${test.name}: ${response.status}`);
        } catch (error) {
            console.log(`❌ ${test.name}: ${error.message}`);
        }
    }

    // Test 3: Test CORS
    console.log('\n🔍 Test 3: CORS Configuration');
    const corsTest = await api.testCORS();
    if (corsTest.success) {
        console.log('✅ CORS is properly configured');
        console.log('Allowed Origins:', corsTest.headers['Access-Control-Allow-Origin']);
    } else {
        console.log('❌ CORS configuration issue:', corsTest.error);
    }

    console.log('\n🎉 Connection test completed!');
}

// Run the test
testAPIConnection();