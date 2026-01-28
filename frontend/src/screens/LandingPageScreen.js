
import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function LandingPageScreen({ onNavigate }) {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => onNavigate('chat')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About MyChefAI</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="restaurant" size={64} color="white" />
                    </View>
                    <Text style={styles.heroTitle}>건강한 식탁의 시작,{'\n'}MyChef AI</Text>
                    <Text style={styles.heroSubtitle}>
                        당신의 건강 상태와 취향에 딱 맞는{'\n'}맞춤형 레시피를 AI가 추천해드립니다.
                    </Text>
                </View>

                {/* Features */}
                <View style={styles.featuresSection}>
                    <FeatureItem
                        icon="chatbubbles-outline"
                        title="AI 채팅 상담"
                        desc="냉장고 속 재료로 무엇을 해먹을지 고민될 때, AI 셰프에게 물어보세요."
                    />
                    <FeatureItem
                        icon="heart-outline"
                        title="건강 맞춤 케어"
                        desc="알레르기, 지병, 식습관을 분석하여 안전하고 건강한 식단을 제안합니다."
                    />
                    <FeatureItem
                        icon="calendar-outline"
                        title="스마트한 식단 관리"
                        desc="매일의 식사를 기록하고 영양 균형을 맞춰주는 캘린더 기능을 제공합니다."
                    />
                </View>

                {/* Call to Action */}
                <View style={styles.ctaSection}>
                    <Text style={styles.ctaTitle}>지금 바로 시작하세요!</Text>
                    <TouchableOpacity style={styles.ctaButton} onPress={() => onNavigate('chat')}>
                        <Text style={styles.ctaButtonText}>AI 셰프와 대화하기</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2026 MyChefAI. All rights reserved.</Text>
                </View>
            </ScrollView>
        </View>
    );
}

function FeatureItem({ icon, title, desc }) {
    return (
        <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
                <Ionicons name={icon} size={32} color={colors.primary} />
            </View>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDesc}>{desc}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    content: {
        flex: 1,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 60,
        backgroundColor: colors.primaryLight,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        marginBottom: 40,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        lineHeight: 38,
        marginBottom: 16,
    },
    heroSubtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    featuresSection: {
        paddingHorizontal: 24,
        gap: 32,
        marginBottom: 60,
    },
    featureItem: {
        alignItems: 'center',
    },
    featureIconBox: {
        width: 70,
        height: 70,
        borderRadius: 20,
        backgroundColor: '#FFF7ED', // Light Orange
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    featureDesc: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 280,
    },
    ctaSection: {
        marginHorizontal: 24,
        backgroundColor: '#1F2937', // Dark Gray
        borderRadius: 24,
        padding: 40,
        alignItems: 'center',
        marginBottom: 40,
    },
    ctaTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    ctaButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 100,
    },
    ctaButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    footerText: {
        color: '#9CA3AF',
        fontSize: 12,
    },
});
