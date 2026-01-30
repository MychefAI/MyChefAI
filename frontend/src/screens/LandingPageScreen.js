import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, SafeAreaView, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function LandingPageScreen({ onNavigate }) {
    // Animation Value: 0 (Closed) -> 1 (Open)
    // Animation Value: 0 (Closed) -> 1 (Open)
    const openAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Simple, Clean, High-Performance Animation
        const timer = setTimeout(() => {
            Animated.timing(openAnim, {
                toValue: 1,
                duration: 1500, // Perfectly balanced speed
                easing: Easing.out(Easing.cubic), // Natural "Deceleration" curve
                useNativeDriver: true, // FRAME DROP FIX: Runs on UI Thread
            }).start();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // --- Interpolations ---
    const leftDoorTranslate = openAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -width / 2],
    });
    const rightDoorTranslate = openAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, width / 2],
    });

    // Content Scale: Slight zoom in
    const contentScale = openAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.94, 1],
    });
    const contentOpacity = openAnim.interpolate({
        inputRange: [0, 0.3, 1],
        outputRange: [0, 1, 1],
    });

    return (
        <SafeAreaView style={styles.container}>

            {/* --- Main Content (Interior) --- */}
            <Animated.View style={[
                styles.fridgeInterior,
                { opacity: contentOpacity, transform: [{ scale: contentScale }] }
            ]}>

                <ScrollView
                    style={styles.scrollContent}
                    contentContainerStyle={styles.scrollInner}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.headerSpacer} />

                    {/* HERO: Personalized & Premium */}
                    <View style={styles.heroSection}>
                        <View style={styles.heroIconCircle}>
                            <Ionicons name="sparkles" size={32} color={colors.primary} />
                        </View>
                        <Text style={styles.heroTitle}>
                            오직 당신만을 위한{'\n'}
                            <Text style={{ color: colors.primary }}>프라이빗 AI 키친</Text>
                        </Text>
                        <Text style={styles.heroSubtitle}>
                            단순한 레시피 추천이 아닙니다.{'\n'}
                            재료 관리부터 맞춤 식단 처방까지,{'\n'}
                            내 손 안의 셰프가 당신의 식탁을 책임집니다.
                        </Text>
                    </View>

                    {/* PHILOSOPHY: Empathy (Longer) */}
                    <View style={styles.quoteContainer}>
                        <Ionicons name="quote" size={40} color="#E2E8F0" style={styles.quoteIcon} />
                        <Text style={styles.quoteText}>
                            "바쁜 일상 속, 나를 위한 건강한 한 끼를{'\n'}
                            챙기는 것이 왜 이리 힘들까요?"
                        </Text>
                        <Text style={styles.quoteSub}>
                            매일 반복되는 "오늘 뭐 먹지?"라는 고민.{'\n'}
                            냉장고 속에서 시들어가는 아까운 식재료들.{'\n'}{'\n'}
                            이제 그 무거운 고민은 내려놓으세요.{'\n'}
                            <Text style={styles.boldText}>MyChef AI</Text>가 당신의 취향과 건강 상태를{'\n'}
                            완벽하게 분석하여 가장 스마트한 답을 드립니다.
                        </Text>
                    </View>

                    {/* DEEP DIVE 1: Economy (Proactive Management - Richer) */}
                    <View style={styles.featureCard}>
                        {/* Deco Background Icon */}
                        <Ionicons name="snow" size={120} color="#F0F9FF" style={styles.bgIconRight} />

                        <View style={styles.labelPillBlue}>
                            <Text style={styles.labelTextBlue}>SMART ECONOMY</Text>
                        </View>
                        <Text style={styles.cardTitle}>냉장고가 스스로{'\n'}식단을 관리하고 제안합니다.</Text>
                        <Text style={styles.cardDesc}>
                            혹시 냉장고 구석에 방치된 식재료가 있나요?{'\n'}
                            이제 AI가 당신 대신 기억합니다.{'\n'}{'\n'}
                            <Text style={styles.boldText}>유통기한 임박 재료</Text>를 실시간으로 체크하고,
                            가장 신선할 때 즐길 수 있는 최적의 레시피를
                            선제적으로 제안합니다. 버려지는 재료 없이,
                            월 평균 30만원의 절약 효과를 경험해보세요.
                        </Text>

                        {/* Visual Mockup */}
                        <View style={styles.mockupContainer}>
                            <View style={styles.mockupItem}>
                                <View style={[styles.iconCircle, { backgroundColor: '#FEF2F2' }]}>
                                    <Ionicons name="alert" size={18} color="#EF4444" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.mockItemTitle}>우유 (D-2)</Text>
                                    <Text style={styles.mockItemAction}>"상하기 전에 리코타 치즈 샐러드 어떠세요?"</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                            </View>
                        </View>
                    </View>

                    {/* DEEP DIVE 2: Health (Personal Doctor - Richer) */}
                    <View style={styles.featureCard}>
                        <Ionicons name="heart" size={120} color="#FFF1F2" style={styles.bgIconLeft} />

                        <View style={styles.labelPillPink}>
                            <Text style={styles.labelTextPink}>HEALTH SHIELD</Text>
                        </View>
                        <Text style={styles.cardTitle}>내 몸을 가장 잘 아는{'\n'}주방의 주치의.</Text>
                        <Text style={styles.cardDesc}>
                            건강 관리는 매일 먹는 음식에서 시작됩니다.{'\n'}
                            <Text style={styles.boldText}>당뇨, 고혈압, 알레르기</Text> 등 당신의 건강 데이터를
                            기반으로 위험한 성분은 철저히 배제합니다.{'\n'}{'\n'}
                            설탕 대신 스테비아를, 튀김 대신 오븐 조리를.
                            맛은 그대로 유지하면서 건강을 지키는
                            놀라운 대체 레시피를 경험하세요.
                        </Text>

                        <View style={styles.mockupContainer}>
                            <View style={styles.safetyRow}>
                                <Text style={styles.badIng}>🔴 설탕 사용 감지</Text>
                                <Ionicons name="arrow-forward" size={16} color="#CBD5E1" />
                                <View style={styles.goodBadge}>
                                    <Text style={styles.goodIng}>🟢 스테비아로 대체 처방</Text>
                                </View>
                            </View>
                            <View style={[styles.safetyRow, { marginTop: 8 }]}>
                                <Text style={styles.badIng}>🔴 밀가루 튀김 조리</Text>
                                <Ionicons name="arrow-forward" size={16} color="#CBD5E1" />
                                <View style={styles.goodBadge}>
                                    <Text style={styles.goodIng}>🟢 아몬드루 구이로 변경</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* DEEP DIVE 3: Community (Inspiration - Richer) */}
                    <View style={styles.featureCard}>
                        <Ionicons name="people" size={120} color="#F0FDF4" style={styles.bgIconRight} />

                        <View style={styles.labelPillGreen}>
                            <Text style={styles.labelTextGreen}>JOY OF COOKING</Text>
                        </View>
                        <Text style={styles.cardTitle}>건강한 미식가들의{'\n'}생생한 식탁을 엿보다.</Text>
                        <Text style={styles.cardDesc}>
                            요리는 혼자 하는 숙제가 아닙니다.{'\n'}
                            나와 비슷한 입맛과 건강 고민을 가진 이웃들은
                            오늘 어떤 건강한 요리를 먹었을까요?{'\n'}{'\n'}
                            이웃의 식탁에서 새로운 영감을 얻고,
                            나만의 시크릿 레시피를 공유하며
                            함께 성장하는 즐거움을 누려보세요.
                        </Text>

                        <View style={styles.recipeCardMock}>
                            <View style={styles.recipeHeader}>
                                <View style={styles.avatar} />
                                <View>
                                    <Text style={styles.recipeUser}>건강지킴이</Text>
                                    <Text style={styles.recipeTime}>방금 전 업데이트</Text>
                                </View>
                            </View>
                            <View style={styles.recipeImagePlaceholder}>
                                <Ionicons name="restaurant" size={32} color="white" />
                            </View>
                            <View style={styles.recipeFooter}>
                                <Text style={styles.recipeName}>현미와 두부로 만든 비건 함박스테이크</Text>
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                    <Ionicons name="heart" size={16} color="#EF4444" />
                                    <Text style={{ fontSize: 12, color: '#64748B' }}>128명이 저장함</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>

                {/* Floating CTA */}
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={styles.mainButton}
                        onPress={() => onNavigate('chat')}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.mainButtonText}>지금 나만의 전담 셰프 만나기</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                    </TouchableOpacity>
                </View>

            </Animated.View>

            {/* --- Realistic Doors --- */}
            <Animated.View style={[styles.door, styles.doorLeft, { transform: [{ translateX: leftDoorTranslate }] }]}>
                <View style={styles.doorSurface} />
                <View style={styles.doorHandleLeft} />
                <View style={[styles.doorEdge, { right: 0 }]} />
            </Animated.View>

            <Animated.View style={[styles.door, styles.doorRight, { transform: [{ translateX: rightDoorTranslate }] }]}>
                <View style={styles.doorSurface} />
                <View style={styles.doorHandleRight} />
                <View style={[styles.doorEdge, { left: 0 }]} />
            </Animated.View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    fridgeInterior: {
        flex: 1,
    },
    shadowOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black',
        zIndex: 50,
    },
    scrollContent: {
        flex: 1,
    },
    scrollInner: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    headerSpacer: {
        height: 80,
    },

    // --- Hero ---
    heroSection: {
        alignItems: 'center',
        marginBottom: 48,
        marginTop: 20,
    },
    heroIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FFEDD5',
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 16,
        textAlign: 'center',
        lineHeight: 44, // Increased for multi-lines
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 26,
    },

    // --- Philosophy Quote ---
    quoteContainer: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 32,
        marginBottom: 48,
        alignItems: 'center',
        position: 'relative',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        ...colors.shadow.sm,
    },
    quoteIcon: {
        position: 'absolute',
        top: 20,
        left: 20,
        opacity: 0.5,
    },
    quoteText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
        textAlign: 'center',
        lineHeight: 32,
        marginBottom: 20,
    },
    quoteSub: {
        fontSize: 15,
        color: '#475569',
        textAlign: 'center',
        lineHeight: 26, // Increased line height for longer text
    },

    // --- Feature Cards (Decorated) ---
    featureCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 28,
        marginBottom: 32,
        ...colors.shadow.sm,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
        position: 'relative',
    },
    bgIconRight: {
        position: 'absolute',
        right: -20,
        top: -20,
        opacity: 0.6,
    },
    bgIconLeft: {
        position: 'absolute',
        left: -20,
        top: -20,
        opacity: 0.6,
    },

    // Labels
    labelPillBlue: {
        backgroundColor: '#E0F2FE',
        paddingVertical: 6,
        paddingHorizontal: 12,
        alignSelf: 'flex-start',
        borderRadius: 100,
        marginBottom: 16,
    },
    labelTextBlue: { color: '#0284C7', fontWeight: 'bold', fontSize: 12, letterSpacing: 0.5 },

    labelPillPink: {
        backgroundColor: '#FCE7F3',
        paddingVertical: 6,
        paddingHorizontal: 12,
        alignSelf: 'flex-start',
        borderRadius: 100,
        marginBottom: 16,
    },
    labelTextPink: { color: '#BE185D', fontWeight: 'bold', fontSize: 12, letterSpacing: 0.5 },

    labelPillGreen: {
        backgroundColor: '#DCFCE7',
        paddingVertical: 6,
        paddingHorizontal: 12,
        alignSelf: 'flex-start',
        borderRadius: 100,
        marginBottom: 16,
    },
    labelTextGreen: { color: '#16A34A', fontWeight: 'bold', fontSize: 12, letterSpacing: 0.5 },

    // Card Content
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 16,
        lineHeight: 34,
    },
    cardDesc: {
        fontSize: 16,
        color: '#475569',
        lineHeight: 28, // Increased for readability of longer text
        marginBottom: 24,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#1E293B',
        backgroundColor: 'rgba(255,255,0,0.1)',
    },

    // --- Mockups ---
    mockupContainer: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    mockupItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 14, // Slightly larger
        borderRadius: 12,
        gap: 12,
        ...colors.shadow.sm,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mockItemTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    mockItemAction: {
        fontSize: 13, // Increased size
        color: '#334155', // Darker for readability
        marginTop: 4,
        fontStyle: 'italic', // Stylistic choice for "Dialogue"
    },

    // Safety Mock
    safetyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    badIng: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    goodBadge: {
        backgroundColor: '#ECFDF5',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    goodIng: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#059669',
    },

    // Recipe Mock
    recipeCardMock: {
        backgroundColor: 'white',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
        ...colors.shadow.sm,
    },
    recipeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#CBD5E1',
    },
    recipeUser: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    recipeTime: {
        fontSize: 11,
        color: '#94A3B8',
    },
    recipeImagePlaceholder: {
        height: 150,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    recipeFooter: {
        padding: 16,
    },
    recipeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 8,
    },

    // --- Door Styles (Same) ---
    door: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: width / 2,
        backgroundColor: '#E2E8F0',
        zIndex: 100,
        justifyContent: 'center',
        ...colors.shadow.lg,
    },
    doorLeft: { left: 0, borderRightWidth: 1, borderRightColor: '#94A3B8' },
    doorRight: { right: 0, borderLeftWidth: 1, borderLeftColor: '#94A3B8' },
    doorSurface: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#F1F5F9',
        opacity: 0.9,
    },
    doorEdge: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 15,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    doorHandleLeft: {
        position: 'absolute',
        right: 20,
        width: 12,
        height: 160,
        backgroundColor: '#CBD5E1',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#94A3B8',
        ...colors.shadow.md,
    },
    doorHandleRight: {
        position: 'absolute',
        left: 20,
        width: 12,
        height: 160,
        backgroundColor: '#CBD5E1',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#94A3B8',
        ...colors.shadow.md,
    },

    // --- Footer ---
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 40,
        backgroundColor: 'rgba(248, 250, 252, 0.95)',
    },
    mainButton: {
        backgroundColor: '#111827',
        paddingVertical: 18,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...colors.shadow.lg,
    },
    mainButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
