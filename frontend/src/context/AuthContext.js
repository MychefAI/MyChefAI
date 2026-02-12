import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';
import SafeStorage from '../utils/storage';
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
    const [loading, setLoading] = useState(true); // Loading true by default for restoration
    const processedResponse = useRef(null); // Track processed auth responses to avoid loops

    // 🔄 Restore Auth State on Mount
    useEffect(() => {
        console.log('[AUTH_TRACE] AuthProvider Mounted');
        const timer = setTimeout(() => {
            loadAuthState();
        }, 1000); // 1s delay for runtime readiness
        return () => clearTimeout(timer);
    }, []);

    const loadAuthState = async () => {
        try {
            const storedToken = await SafeStorage.getItem('user_token');
            const storedUser = await SafeStorage.getItem('user_data');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                setIsLoggedIn(true);
                console.log('[AUTH_TRACE] Restored auth session from storage');
            } else {
                console.log('[AUTH_TRACE] No session found in storage');
            }
        } catch (e) {
            console.error('Failed to load auth state:', e);
        } finally {
            // Ensure loading is set to false even if storage fails
            setTimeout(() => setLoading(false), 500);
        }
    };

    // Google Login Request Setup
    const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
        ...GOOGLE_CLIENT_IDS,
        redirectUri: AuthSession.makeRedirectUri({
            scheme: 'mychefai',
            // For development, especially on web, this helps resolve to localhost:PORT
            preferLocalhost: true,
        }),
    });

    useEffect(() => {
        if (googleRequest) {
            console.log('Google Redirect URI:', googleRequest.redirectUri);
        }
    }, [googleRequest]);


    // Handle Google Response
    useEffect(() => {
        if (googleResponse) {
            console.log('[AUTH_TRACE] Google Response:', googleResponse.type);
        }
        if (googleResponse?.type === 'success' && processedResponse.current !== googleResponse.authentication?.accessToken) {
            const { authentication } = googleResponse;
            console.log('[AUTH_TRACE] Processing Google success response');
            processedResponse.current = authentication.accessToken; // Mark as processed
            handleBackendAuthentication('google', authentication.accessToken, true);
        }
    }, [googleResponse]);

    // Backend Authentication Handler
    const handleBackendAuthentication = async (provider, accessToken, keepLoggedIn = true) => {
        setLoading(true);
        try {
            console.log(`Verifying ${provider} token with backend... (KeepLoggedIn: ${keepLoggedIn})`);
            const response = await axios.post(`${config.API_BASE_URL}/auth/${provider}`, {
                accessToken: accessToken
            });

            const { token: jwtToken, user: userData } = response.data;

            setToken(jwtToken);
            setUser(userData);
            setIsLoggedIn(true);

            // Save to Storage ONLY if requested
            if (keepLoggedIn) {
                await SafeStorage.setItem('user_token', jwtToken);
                await SafeStorage.setItem('user_data', JSON.stringify(userData));
                console.log('Session saved for auto-login');
            } else {
                console.log('Session NOT saved (One-time login)');
            }

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
    const login = async (socialType, keepLoggedIn = true) => {
        if (socialType === 'google') {
            // Store the flag temporarily for the Google response effector
            // Or handle as a separate param in future refactor
            await googlePromptAsync();
            return true;
        } else if (socialType === 'kakao') {
            try {
                // Use Native SDK
                const { login } = require('@react-native-seoul/kakao-login');
                const tokenResult = await login();

                if (tokenResult && tokenResult.accessToken) {
                    console.log('Kakao Native Login Success');
                    return await handleBackendAuthentication('kakao', tokenResult.accessToken, keepLoggedIn);
                }
                return false;
            } catch (e) {
                console.error('Kakao native login error:', e);
                return false;
            }
        }
        return false;
    };

    // Logout
    const logout = async () => {
        try {
            await SafeStorage.removeItem('user_token');
            await SafeStorage.removeItem('user_data');
            setToken(null);
            setUser(null);
            setIsLoggedIn(false);
        } catch (e) {
            console.error('Logout error:', e);
        }
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
        <AuthContext.Provider value={{ isLoggedIn, user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
