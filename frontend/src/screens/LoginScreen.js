
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function LoginScreen({ onLogin, onGuest }) {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSocialLogin = async (type) => {
        setLoading(true);
        const success = await login(type);
        setLoading(false);
        if (success) {
            onLogin(); // Navigate to main screen
        }
    };
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <View style={styles.content}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircleOuter}>
                            <View style={styles.logoCircleInner}>
                                <Ionicons name="restaurant" size={48} color={colors.primary} />
                            </View>
                        </View>
                        {/* Decorative bubbles */}
                        <View style={[styles.bubble, styles.bubble1]} />
                        <View style={[styles.bubble, styles.bubble2]} />
                    </View>

                    <Text style={styles.appName}>Type 1 셰프</Text>
                    <Text style={styles.tagline}>내 손안의 AI 건강 요리사</Text>
                </View>

                {/* Login Actions */}
                <View style={styles.actionSection}>
                    <View style={styles.buttonStack}>
                        {/* Kakao - Official Brand Color */}
                        <TouchableOpacity
                            style={[styles.socialButton, { backgroundColor: '#FEE500' }]}
                            onPress={() => handleSocialLogin('kakao')}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#3C1E1E" /> : (
                                <>
                                    <Ionicons name="chatbubble-sharp" size={20} color="#3C1E1E" style={styles.socialIcon} />
                                    <Text style={[styles.buttonText, { color: '#3C1E1E' }]}>카카오로 3초만에 시작하기</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Naver - Official Brand Color */}
                        <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#03C75A' }]} onPress={() => handleSocialLogin('naver')}>
                            <Text style={[styles.nIcon, { color: 'white' }]}>N</Text>
                            <Text style={[styles.buttonText, { color: 'white' }]}>네이버로 시작하기</Text>
                        </TouchableOpacity>

                        {/* Google - Clean White */}
                        <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={() => handleSocialLogin('google')}>
                            <Ionicons name="logo-google" size={20} color="#333" style={styles.socialIcon} />
                            <Text style={[styles.buttonText, { color: '#333' }]}>Google로 계속하기</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={onGuest} style={styles.guestButton}>
                        <Text style={styles.guestText}>로그인 없이 둘러보기</Text>
                        <Ionicons name="arrow-forward" size={14} color={colors.textTertiary} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center', // Center vertically
        paddingHorizontal: 40, // More whitespace
        paddingBottom: 40,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 60, // Space between hero and buttons
    },
    logoContainer: {
        position: 'relative',
        marginBottom: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoCircleOuter: {
        width: 100, // Smaller logo
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    logoCircleInner: {
        width: 70, // Smaller logo
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        ...colors.shadow.md,
    },
    bubble: {
        position: 'absolute',
        backgroundColor: colors.primary,
        borderRadius: 50,
        opacity: 0.1,
    },
    bubble1: {
        width: 16,
        height: 16,
        top: 0,
        right: 0,
    },
    bubble2: {
        width: 10,
        height: 10,
        bottom: 0,
        left: 10,
    },
    appName: {
        fontSize: 26, // Slightly smaller
        fontWeight: 'bold',
        color: colors.text,
        letterSpacing: -0.5,
        marginBottom: 6,
    },
    tagline: {
        fontSize: 15,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    actionSection: {
        width: '100%',
        alignItems: 'center',
    },
    buttonStack: {
        width: '100%',
        gap: 12,
        marginBottom: 24,
    },
    socialButton: {
        width: '100%',
        height: 50, // Standard height
        borderRadius: 8, // Standard 'simple' radius
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 0, // Flat look
        borderWidth: 0,
    },
    googleButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB', // Subtle border
    },
    socialIcon: {
        position: 'absolute',
        left: 16, // Fixed icon position
    },
    nIcon: {
        fontSize: 16,
        fontWeight: '900',
        position: 'absolute',
        left: 20,
    },
    buttonText: {
        fontSize: 15, // Standard text size
        fontWeight: '600',
    },
    guestButton: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    guestText: {
        color: colors.textTertiary,
        fontSize: 13,
    },
});
