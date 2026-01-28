import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { ResponseType } from 'expo-auth-session';
import config from '../config';

import { KAKAO_APP_KEY, GOOGLE_CLIENT_IDS } from '../secrets';

// 1. Context 생성
const AuthContext = createContext();

// WebBrowser 초기화 (필수)
WebBrowser.maybeCompleteAuthSession();

// 2. Provider 컴포넌트
export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);

    // Google Login Request Setup
    const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
        ...GOOGLE_CLIENT_IDS,
        responseType: ResponseType.Token,
    });

    // Handle Google Response
    useEffect(() => {
        if (googleResponse?.type === 'success') {
            const { authentication } = googleResponse;
            handleBackendAuthentication('google', authentication.accessToken);
        }
    }, [googleResponse]);

    // Backend Authentication Handler
    const handleBackendAuthentication = async (provider, accessToken) => {
        setLoading(true);
        try {
            console.log(`Verifying ${provider} token with backend...`);
            const response = await axios.post(`${config.API_BASE_URL}/auth/${provider}`, {
                accessToken: accessToken
            });

            const { token: jwtToken, user: userData } = response.data;

            setToken(jwtToken);
            setUser(userData);
            setIsLoggedIn(true);
            console.log('Login successful:', userData.name);
            return true;
        } catch (error) {
            console.error('Backend authentication failed:', error);
            alert('로그인에 실패했습니다.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Login Function Exposed to Components
    const login = async (socialType) => {
        if (socialType === 'google') {
            await googlePromptAsync();
            return true;
        } else if (socialType === 'kakao') {
            try {
                // Kakao REST API Key (User Provided)
                // const KAKAO_APP_KEY = '...'; // Moved to secrets.js
                const REDIRECT_URI = AuthSession.makeRedirectUri({
                    useProxy: false,
                    path: 'kakao-redirect' // Optional path
                });

                // 1. Get Authorization Code
                const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_APP_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;

                const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

                if (result.type === 'success' && result.url) {
                    const params = new URLSearchParams(result.url.split('?')[1]);
                    const code = params.get('code');

                    if (code) {
                        // 2. Exchange Code for Token
                        const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', null, {
                            params: {
                                grant_type: 'authorization_code',
                                client_id: KAKAO_APP_KEY,
                                redirect_uri: REDIRECT_URI,
                                code: code,
                            },
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                            },
                        });

                        const { access_token } = tokenResponse.data;

                        // 3. Authenticate with Backend
                        return await handleBackendAuthentication('kakao', access_token);
                    }
                }
                return false;
            } catch (e) {
                console.error('Kakao login error:', e);
                return false;
            }
        }
        return false;
    };

    // Logout
    const logout = () => {
        setToken(null);
        setUser(null);
        setIsLoggedIn(false);
    };

    // Axios Interceptor for JWT
    useEffect(() => {
        const interceptor = axios.interceptors.request.use(
            (req) => {
                if (token) {
                    req.headers.Authorization = `Bearer ${token}`;
                }
                return req;
            },
            (error) => Promise.reject(error)
        );
        return () => axios.interceptors.request.eject(interceptor);
    }, [token]);

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
