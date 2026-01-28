
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { colors } from '../theme/colors';
import config from '../config';

export default function CommunityScreen({ onToggleSidebar, onNavigate }) {
    const [activeTab, setActiveTab] = useState('discover'); // 'discover' or 'feed'
    const [feedItems, setFeedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Mock Data for Discover Tab
    const featuredRecipe = {
        id: 101,
        title: "트러플 버섯 리조또",
        description: "풍미 가득한 트러플 오일과 신선한 버섯의 조화",
        calories: 450,
        time: 30,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80",
        reason: "버섯을 좋아하시는 사용자님을 위한 맞춤 추천!"
    };

    const recommendedRecipes = [
        { id: 1, title: "아보카도 명란 덮밥", rating: 4.7, time: 10, image: "https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=400&q=80" },
        { id: 2, title: "닭가슴살 콥 샐러드", rating: 4.9, time: 15, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80" },
        { id: 3, title: "연어 포케", rating: 4.6, time: 20, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80" },
    ];

    const popularRecipes = [
        { id: 4, title: "마라탕 (저염 버전)", views: 1250, likes: 320, image: "https://images.unsplash.com/photo-1626045431776-8e0e6e7fb7da?w=400&q=80" },
        { id: 5, title: "통밀 파스타", views: 980, likes: 210, image: "https://images.unsplash.com/photo-1551183053-bf91b1dca034?w=400&q=80" },
    ];

    // Feed Data Fetching
    const fetchFeed = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/community/feed`);
            setFeedItems(response.data);
        } catch (error) {
            console.error('피드 로딩 실패:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchFeed();
    };

    // Helper Functions
    const getTimeAgo = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return '방금';
        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
        return past.toLocaleDateString('ko-KR');
    };

    const renderRecipeCard = (item, isPopular = false) => (
        <TouchableOpacity key={item.id} style={styles.card} onPress={() => onNavigate && onNavigate('recipe-detail', item)}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.cardMeta}>
                    {isPopular ? (
                        <>
                            <Ionicons name="eye-outline" size={14} color={colors.textSecondary} />
                            <Text style={styles.metaText}>{item.views}</Text>
                            <Ionicons name="heart-outline" size={14} color={colors.accent} style={{ marginLeft: 8 }} />
                            <Text style={styles.metaText}>{item.likes}</Text>
                        </>
                    ) : (
                        <>
                            <Ionicons name="star" size={14} color="#F59E0B" />
                            <Text style={styles.metaText}>{item.rating}</Text>
                            <Ionicons name="time-outline" size={14} color={colors.textSecondary} style={{ marginLeft: 8 }} />
                            <Text style={styles.metaText}>{item.time}분</Text>
                        </>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderFeedItem = (item) => (
        <View key={item.shareId} style={styles.feedCard}>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={20} color="white" />
                    </View>
                    <View>
                        <Text style={styles.userName}>{item.userName}</Text>
                        <Text style={styles.timeAgo}>{getTimeAgo(item.sharedAt)}</Text>
                    </View>
                </View>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>
            <Image source={{ uri: item.recipeImageUrl }} style={styles.recipeImage} />
            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="heart-outline" size={24} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="chatbubble-outline" size={23} color={colors.text} />
                </TouchableOpacity>
            </View>
            <View style={styles.content}>
                <Text style={styles.recipeTitle}>{item.recipeTitle}</Text>
                <Text style={styles.shareMessage}>
                    <Text style={styles.bold}>{item.userName}</Text> {item.shareMessage}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onToggleSidebar} style={{ marginRight: 12 }}>
                    <Ionicons name="menu" size={28} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>커뮤니티</Text>
                </View>
                <TouchableOpacity onPress={() => onNavigate && onNavigate('search')}>
                    <Ionicons name="search" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
                    onPress={() => setActiveTab('discover')}
                >
                    <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>🔥 추천</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'feed' && styles.activeTab]}
                    onPress={() => setActiveTab('feed')}
                >
                    <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>👥 피드</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.feed}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {activeTab === 'discover' ? (
                    <View style={{ paddingBottom: 40 }}>
                        {/* Hero */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>오늘의 AI 추천 👨‍🍳</Text>
                            <TouchableOpacity style={styles.heroCard} onPress={() => onNavigate && onNavigate('recipe-detail', featuredRecipe)}>
                                <Image source={{ uri: featuredRecipe.image }} style={styles.heroImage} />
                                <View style={styles.heroOverlay}>
                                    <View style={styles.heroBadge}>
                                        <Text style={styles.heroBadgeText}>AI Pick</Text>
                                    </View>
                                    <Text style={styles.heroTitle}>{featuredRecipe.title}</Text>
                                    <Text style={styles.heroDesc}>{featuredRecipe.description}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Lists */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>맞춤 추천 레시피</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                                {recommendedRecipes.map(item => renderRecipeCard(item))}
                            </ScrollView>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>지금 뜨는 인기 요리 🔥</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                                {popularRecipes.map(item => renderRecipeCard(item, true))}
                            </ScrollView>
                        </View>
                    </View>
                ) : (
                    <View>
                        {loading && feedItems.length === 0 ? (
                            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                        ) : feedItems.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="people-outline" size={64} color={colors.textTertiary} />
                                <Text style={styles.emptyTitle}>아직 공유된 레시피가 없어요</Text>
                            </View>
                        ) : (
                            feedItems.map((item) => renderFeedItem(item))
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 40 : 16,
        paddingBottom: 12,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    activeTabText: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    feed: {
        flex: 1,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
    },
    horizontalList: {
        gap: 16,
    },
    heroCard: {
        height: 220,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'black',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        opacity: 0.7,
    },
    heroOverlay: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    heroBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    heroBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    heroTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    heroDesc: {
        color: '#E5E5E5',
        fontSize: 14,
    },
    card: {
        width: 150,
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cardImage: {
        width: '100%',
        height: 100,
        backgroundColor: '#F3F4F6',
    },
    cardContent: {
        padding: 12,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 11,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    feedCard: {
        backgroundColor: 'white',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        alignItems: 'center',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.textTertiary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    userName: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    timeAgo: {
        color: colors.textSecondary,
        fontSize: 11,
    },
    recipeImage: {
        width: '100%',
        height: 300,
        backgroundColor: '#F3F4F6',
    },
    actions: {
        flexDirection: 'row',
        padding: 12,
        gap: 16,
    },
    content: {
        paddingHorizontal: 12,
        paddingBottom: 16,
    },
    recipeTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    shareMessage: {
        fontSize: 14,
        lineHeight: 20,
    },
    bold: {
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        marginTop: 16,
        color: colors.textSecondary,
        fontSize: 16,
    },
});
