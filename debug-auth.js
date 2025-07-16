const https = require('https');
const http = require('http');
const querystring = require('querystring');

// Test the auth flow
async function testAuth() {
    console.log('🔍 Testing authentication flow...\n');
    
    // Test 1: Check if NextAuth API is accessible
    try {
        const response = await fetch('https://apideas.fun/api/auth/session');
        console.log('✅ NextAuth API accessible');
        console.log('Session response status:', response.status);
        const sessionData = await response.json();
        console.log('Session data:', sessionData);
    } catch (error) {
        console.log('❌ NextAuth API error:', error.message);
    }

    console.log('\n---\n');

    // Test 2: Try to authenticate with test credentials
    try {
        const loginData = {
            email: 'test@example.com',
            password: 'test123',
            redirect: false
        };

        const response = await fetch('https://apideas.fun/api/auth/callback/credentials', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: querystring.stringify(loginData)
        });

        console.log('✅ Credentials endpoint accessible');
        console.log('Login response status:', response.status);
        console.log('Login response headers:', Object.fromEntries(response.headers));
        
        if (response.status === 200) {
            const loginResult = await response.json();
            console.log('Login result:', loginResult);
        } else {
            const errorText = await response.text();
            console.log('Login error:', errorText);
        }
    } catch (error) {
        console.log('❌ Credentials auth error:', error.message);
    }
}

testAuth();