
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const MENU_ITEMS = [
    { id: 'chat', label: 'AI 채팅', icon: 'chatbubbles', color: colors.secondary },
    { id: 'community', label: '커뮤니티', icon: 'people', color: '#10B981' },
    { id: 'fridge', label: '나의 냉장고', icon: 'nutrition', color: '#3B82F6' },
    { id: 'calendar', label: '식단 캘린더', icon: 'calendar', color: colors.primary },
    { id: 'health', label: '나의 건강정보', icon: 'heart', color: colors.health },
];

import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose, currentScreen, onNavigate }) {
    const { user, isLoggedIn, logout } = useAuth();

    if (!isOpen) return null;

    return (
        <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.sidebar}>
                    <View style={styles.header}>
                        <View style={styles.logoBox}>
                            <Ionicons name="restaurant" size={24} color="white" />
                        </View>
                        <View>
                            <Text style={styles.title}>{isLoggedIn && user ? user.name : 'Type 1 셰프'}</Text>
                            <Text style={styles.subtitle}>{isLoggedIn && user ? user.email : '당신만의 AI 요리사'}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.menuContainer}>
                        {MENU_ITEMS.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.menuItem,
                                    currentScreen === item.id && styles.menuItemSelected,
                                    currentScreen === item.id && { backgroundColor: item.color + '15' } // 10% opacity
                                ]}
                                onPress={() => {
                                    onNavigate(item.id);
                                    onClose();
                                }}
                            >
                                <View style={[
                                    styles.iconBox,
                                    { backgroundColor: currentScreen === item.id ? item.color : '#F3F4F6' }
                                ]}>
                                    <Ionicons
                                        name={item.icon}
                                        size={20}
                                        color={currentScreen === item.id ? 'white' : '#6B7280'}
                                    />
                                </View>
                                <Text style={[
                                    styles.menuLabel,
                                    currentScreen === item.id && { color: item.color, fontWeight: 'bold' }
                                ]}>
                                    {item.label}
                                </Text>
                                {currentScreen === item.id && (
                                    <View style={[styles.activeIndicator, { backgroundColor: item.color }]} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity style={[styles.accountButton, { marginBottom: 8 }]} onPress={() => { onNavigate('about'); onClose(); }}>
                            <Ionicons name="information-circle-outline" size={24} color="#4B5563" />
                            <Text style={styles.accountText}>About MyChefAI</Text>
                            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>
                        {isLoggedIn ? (
                            <TouchableOpacity style={styles.accountButton} onPress={() => { logout(); onClose(); }}>
                                <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                                <Text style={[styles.accountText, { color: '#EF4444' }]}>로그아웃</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.accountButton} onPress={() => { onNavigate('login'); onClose(); }}>
                                <Ionicons name="log-in-outline" size={24} color="#4B5563" />
                                <Text style={styles.accountText}>로그인</Text>
                                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <TouchableOpacity style={styles.overlayTouch} onPress={onClose} />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        flexDirection: 'row',
    },
    overlayTouch: {
        flex: 1,
    },
    sidebar: {
        width: '80%',
        maxWidth: 300,
        backgroundColor: 'white',
        height: '100%',
        padding: 20,
        // Removed border radius for standard side drawer look
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 40, // More top margin for safe area
    },
    logoBox: {
        width: 40,
        height: 40,
        backgroundColor: colors.primary,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    subtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    closeButton: {
        marginLeft: 'auto',
        padding: 4,
    },
    menuContainer: {
        gap: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        position: 'relative',
    },
    menuItemSelected: {
        // bg handled inline
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuLabel: {
        fontSize: 16,
        color: '#4B5563',
        fontWeight: '500',
    },
    activeIndicator: {
        width: 4,
        height: 20,
        borderRadius: 2,
        position: 'absolute',
        right: 12,
    },
    footer: {
        marginTop: 'auto',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    accountButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
    },
    accountText: {
        marginLeft: 12,
        color: '#374151',
        fontWeight: '600',
        fontSize: 14,
    },
});
