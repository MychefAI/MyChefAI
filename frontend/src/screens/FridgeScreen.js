
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const CATEGORIES = ['전체', '채소', '과일', '육류', '유제품', '달걀', '기타'];

export default function FridgeScreen({ fridgeItems, setFridgeItems, isSidebarOpen, onToggleSidebar }) {
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [modalVisible, setModalVisible] = useState(false);

    // Add Modal State
    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('기타');
    const [newItemExpiry, setNewItemExpiry] = useState('');

    const filteredItems = selectedCategory === '전체'
        ? fridgeItems
        : fridgeItems.filter(item => item.category === selectedCategory);

    const getExpiryColor = (daysLeft) => {
        if (daysLeft <= 2) return { text: '#DC2626', bg: '#FEF2F2', border: '#FECACA' }; // Red
        if (daysLeft <= 5) return { text: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' }; // Orange
        return { text: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' }; // Green
    };

    const handleAddItem = () => {
        if (!newItemName.trim()) return;

        const newItem = {
            id: Date.now().toString(),
            name: newItemName,
            quantity: newItemQuantity || '1개',
            category: newItemCategory,
            expiryDate: newItemExpiry || '2026-01-31', // Default or need DatePicker
            daysLeft: 7 // Mock calculation
        };

        setFridgeItems(prev => [...prev, newItem]);
        setModalVisible(false);
        setNewItemName('');
        setNewItemQuantity('');
    };

    const handleDeleteItem = (id) => {
        setFridgeItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={onToggleSidebar} style={styles.menuButton}>
                        <Ionicons name="menu" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>나의 냉장고</Text>
                        <Text style={styles.headerSubtitle}>신선한 재료 관리하기</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add" size={20} color="white" />
                    <Text style={styles.addButtonText}>재료 추가</Text>
                </TouchableOpacity>
            </View>

            {/* Category Filter */}
            <View style={styles.categoryContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContent}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.categoryChip,
                                selectedCategory === cat && styles.categoryChipSelected
                            ]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === cat && styles.categoryTextSelected
                            ]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Stats Cards */}
            <ScrollView style={styles.content}>
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>전체 재료</Text>
                        <Text style={styles.statValue}>{fridgeItems.length}</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
                        <Text style={[styles.statLabel, { color: '#C2410C' }]}>유통기한 임박</Text>
                        <Text style={[styles.statValue, { color: '#EA580C' }]}>
                            {fridgeItems.filter(i => i.daysLeft <= 5).length}
                        </Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                        <Text style={[styles.statLabel, { color: '#15803D' }]}>신선한 재료</Text>
                        <Text style={[styles.statValue, { color: '#16A34A' }]}>
                            {fridgeItems.filter(i => i.daysLeft > 5).length}
                        </Text>
                    </View>
                </View>

                {/* Item Grid */}
                <View style={styles.grid}>
                    {filteredItems.map(item => {
                        const colors = getExpiryColor(item.daysLeft);
                        return (
                            <View key={item.id} style={styles.itemCard}>
                                <View style={styles.itemHeader}>
                                    <View>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemQuantity}>{item.quantity}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
                                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.tagRow}>
                                    <View style={styles.categoryTag}>
                                        <Text style={styles.categoryTagText}>{item.category}</Text>
                                    </View>
                                </View>

                                <View style={[styles.expiryTag, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                                    <Ionicons name="time-outline" size={14} color={colors.text} />
                                    <Text style={[styles.expiryText, { color: colors.text }]}>{item.daysLeft}일 남음</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {filteredItems.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
                        <Text style={styles.emptyStateText}>해당 카테고리에 재료가 없습니다</Text>
                    </View>
                )}
            </ScrollView>

            {/* Add Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>새로운 재료 추가</Text>

                        <Text style={styles.inputLabel}>이름</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="예: 사과"
                            value={newItemName}
                            onChangeText={setNewItemName}
                        />

                        <Text style={styles.inputLabel}>수량</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="예: 3개"
                            value={newItemQuantity}
                            onChangeText={setNewItemQuantity}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCancel}>
                                <Text style={styles.modalCancelText}>취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAddItem} style={styles.modalAdd}>
                                <Text style={styles.modalAddText}>추가하기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        padding: 16,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 40 : 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3B82F6', // Blue like the web version
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addButtonText: {
        color: 'white',
        marginLeft: 4,
        fontWeight: '600',
        fontSize: 14,
    },
    categoryContainer: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    categoryContent: {
        padding: 12,
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    categoryChipSelected: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    categoryText: {
        color: '#4B5563',
        fontWeight: '500',
    },
    categoryTextSelected: {
        color: 'white',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 11,
        color: '#6B7280',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingBottom: 24,
    },
    itemCard: {
        width: '48%',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    itemQuantity: {
        fontSize: 12,
        color: '#6B7280',
    },
    tagRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    categoryTag: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    categoryTagText: {
        fontSize: 10,
        color: '#1D4ED8',
        fontWeight: '500',
    },
    expiryTag: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    expiryText: {
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
        opacity: 0.5,
    },
    emptyStateText: {
        marginTop: 12,
        fontSize: 14,
        color: '#4B5563',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    modalCancel: {
        flex: 1,
        padding: 14,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        alignItems: 'center',
    },
    modalAdd: {
        flex: 1,
        padding: 14,
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        alignItems: 'center',
    },
    modalCancelText: {
        color: '#4B5563',
        fontWeight: '600',
    },
    modalAddText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
