import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, Modal, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Speech from 'expo-speech'; // TTS
import Voice from '@react-native-voice/voice'; // Voice Recognition
import { colors } from '../theme/colors';
import config from '../config';
import { useAuth } from '../context/AuthContext';

// Helper to clean markdown
const cleanAiResponse = (text) => {
    return text
        .replace(/\*\*/g, '')
        .replace(/###/g, '')
        .replace(/^\* /gm, '• ')
        .replace(/`/g, '')
        .trim();
};

const Typewriter = ({ text, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, 20);
            return () => clearTimeout(timeout);
        } else {
            if (onComplete) onComplete();
        }
    }, [currentIndex, text]);

    return <Text style={styles.aiText}>{displayedText}</Text>;
};

export default function ChatScreen({ messages, setMessages, healthProfile, setMealData, isSidebarOpen, onToggleSidebar, onLoginPress }) {
    const { isLoggedIn } = useAuth();
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [useFridge, setUseFridge] = useState(true); // Default ON
    const flatListRef = useRef(null);

    // Meal Plan Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRecipeToAdd, setSelectedRecipeToAdd] = useState(null);
    const [targetDate, setTargetDate] = useState(new Date());
    const [targetMealType, setTargetMealType] = useState('lunch');
    const [recipeDetails, setRecipeDetails] = useState({ title: '', fullText: '' });

    // TTS State
    const [speakingMessageId, setSpeakingMessageId] = useState(null);
    const [bestVoice, setBestVoice] = useState(null);

    // 🎙️ Cooking Mode State (NEW)
    const [isCookingMode, setIsCookingMode] = useState(false);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        const findBestVoice = async () => {
            try {
                const voices = await Speech.getAvailableVoicesAsync();
                if (voices && voices.length > 0) {
                    // Filter for Korean voices
                    const koVoices = voices.filter(v => v.language.includes('ko'));

                    if (koVoices.length > 0) {
                        // Prefer voices with 'Siri' or 'Premium' or 'Enhanced' in identifier if available
                        const premiumVoice = koVoices.find(v =>
                            v.identifier.toLowerCase().includes('siri') ||
                            v.identifier.toLowerCase().includes('premium') ||
                            v.quality === Speech.VoiceQuality.Enhanced
                        );

                        setBestVoice(premiumVoice || koVoices[0]);
                    }
                }
            } catch (e) {
                console.log("Voice fetch failed", e);
            }
        };

        findBestVoice();
    }, []);

    // 🎙️ Voice Recognition Setup
    useEffect(() => {
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;

        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    const onSpeechResults = (e) => {
        if (e.value && e.value.length > 0) {
            const recognizedText = e.value[0];
            console.log('Recognized:', recognizedText);

            // Auto send to AI
            sendMessage(recognizedText);
        }
    };

    const onSpeechError = (e) => {
        console.error('Speech error:', e);
        setIsListening(false);
    };

    const toggleCookingMode = async () => {
        if (!isLoggedIn) {
            Alert.alert("회원 전용 기능", "요리 모드는 로그인 후 이용 가능합니다.");
            return;
        }

        if (isCookingMode) {
            // Turn off Cooking Mode
            await Voice.stop();
            setIsCookingMode(false);
            setIsListening(false);
            Speech.speak("요리 모드를 종료합니다.", { language: 'ko-KR' });
        } else {
            // Turn on Cooking Mode
            setIsCookingMode(true);
            Speech.speak("요리 모드를 시작합니다. 무엇을 도와드릴까요?", { language: 'ko-KR' });
            startListening();
        }
    };

    const startListening = async () => {
        try {
            setIsListening(true);
            await Voice.start('ko-KR');
        } catch (e) {
            console.error(e);
            setIsListening(false);
        }
    };

    // Auto restart listening after response (Cooking Mode only)
    useEffect(() => {
        if (isCookingMode && !loading && !isListening) {
            const timer = setTimeout(() => {
                startListening();
            }, 2000); // Wait 2s after AI response, then listen again
            return () => clearTimeout(timer);
        }
    }, [isCookingMode, loading, isListening]);

    const sendMessage = async (text = null) => {
        const messageText = typeof text === 'string' ? text : inputText;
        if (!messageText.trim()) return;

        const userMessage = { id: Date.now(), text: messageText, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setLoading(true);

        // 📝 Record AI Activity
        if (isLoggedIn) {
            axios.post(`${config.API_BASE_URL}/activities/log`, { isAi: true }).catch(e => console.log("AI Activity log failed", e));
        }

        try {
            // Prepare History for Context
            const history = messages.slice(-10).map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                content: msg.text
            }));

            console.log('🔍 [DEBUG] Sending to AI:', { useFridge, messageText });

            const response = await axios.post(`${config.API_BASE_URL}/chat/message`, {
                message: messageText,
                history: history,
                useFridge: useFridge
            });

            console.log('✅ [DEBUG] AI Response received');

            const rawAiText = response.data.reply;
            const cleanedText = cleanAiResponse(rawAiText);

            const aiMessage = {
                id: Date.now() + 1,
                text: cleanedText,
                sender: 'ai',
                isTyping: true
            };

            setMessages(prev => [...prev, aiMessage]);

            // 🎙️ Auto TTS in Cooking Mode
            if (isCookingMode) {
                // Wait for typing animation to finish, then speak
                setTimeout(() => {
                    const cleanText = cleanedText.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
                    Speech.speak(cleanText, {
                        language: 'ko-KR',
                        rate: 0.9,
                        onDone: () => setIsListening(false) // Will trigger auto-restart
                    });
                }, 1000);
            }
        } catch (error) {
            console.error(error);
            const errorMessage = { id: Date.now() + 1, text: '죄송해요, 연결이 원활하지 않네요. 다시 말씀해 주시겠어요? 😥', sender: 'ai' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const handleStreamingComplete = (messageId) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, isTyping: false } : msg
        ));
    };

    const speak = (text, id) => {
        if (!isLoggedIn) {
            Alert.alert("멤버십 기능 🔒", "음성 듣기 기능은 로그인 후 이용 가능합니다.");
            return;
        }

        if (speakingMessageId === id) {
            Speech.stop();
            setSpeakingMessageId(null);
        } else {
            Speech.stop();
            setSpeakingMessageId(id);

            // 이모지만 제거 (한글/영어/숫자/문장부호는 유지)
            const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

            const options = {
                language: 'ko-KR',
                onDone: () => setSpeakingMessageId(null),
                onStopped: () => setSpeakingMessageId(null),
                rate: 0.9,
                pitch: 1.0,
            };

            if (bestVoice) {
                options.voice = bestVoice.identifier;
            }

            Speech.speak(cleanText || text, options);
        }
    };

    const openPlanModal = (text) => {
        // Extract recipe title (first line or truncated text)
        const lines = text.split('\n');
        let title = lines[0].replace(/\*\*/g, '').replace(/제목: /g, '').trim();
        if (title.length > 30) title = title.substring(0, 27) + '...';

        setSelectedRecipeToAdd(title);
        setRecipeDetails({ title: title, fullText: text });
        setModalVisible(true);
    };

    const confirmAddToPlan = async () => {


        if (!isLoggedIn) {
            Alert.alert("로그인 필요", "식단 기록은 회원만 가능합니다.");
            return;
        }

        const dateKey = targetDate.toISOString().split('T')[0];

        // Looks for patterns like "120kcal", "120 kcal", "120 칼로리"
        const calorieMatch = recipeDetails.fullText.match(/(\d+)\s*(kcal|칼로리)/i);
        const calories = calorieMatch ? parseInt(calorieMatch[1]) : null;

        try {
            // Prepare mealDetails JSON
            const detailsPayload = JSON.stringify({
                [targetMealType]: { // breakfast, lunch, or dinner
                    fullText: recipeDetails.fullText,
                    savedAt: new Date().toISOString()
                }
            });



            const payload = {
                recordDate: dateKey,
                [targetMealType]: selectedRecipeToAdd, // User edited title
                [`${targetMealType}Calories`]: calories,
                [`isAi${targetMealType.charAt(0).toUpperCase() + targetMealType.slice(1)}`]: true,
                mealDetails: detailsPayload
            };

            await axios.post(`${config.API_BASE_URL}/meallogs`, payload);

            Alert.alert("✅ 저장 완료", "식단에 추가되었습니다!");

            // Update local state to reflect change immediately
            setMealData(prev => ({
                ...prev,
                [dateKey]: {
                    ...(prev[dateKey] || {}),
                    [targetMealType]: selectedRecipeToAdd,
                    [`${targetMealType}Calories`]: calories,
                    [`isAi${targetMealType.charAt(0).toUpperCase() + targetMealType.slice(1)}`]: true
                }
            }));

            setModalVisible(false);

        } catch (error) {
            console.error('Failed to save meal log:', error);
            Alert.alert("오류", "저장 실패: " + error.message);
        }
    };

    const renderItem = ({ item }) => (
        <View style={[
            styles.messageBubble,
            item.sender === 'user' ? styles.userBubble : styles.aiBubble
        ]}>
            {item.sender === 'ai' && (
                <View style={styles.aiAvatar}>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 10 }}>AI</Text>
                </View>
            )}
            <View style={{ flexShrink: 1 }}>
                {item.sender === 'ai' && item.isTyping ? (
                    <Typewriter
                        text={item.text}
                        onComplete={() => handleStreamingComplete(item.id)}
                    />
                ) : (
                    <Text style={[
                        styles.messageText,
                        item.sender === 'user' ? styles.userText : styles.aiText
                    ]}>
                        {item.text}
                    </Text>
                )}

                {/* AI Message Actions */}
                {item.sender === 'ai' && !item.isTyping && (
                    <View style={styles.messageActions}>
                        {/* TTS Button */}
                        <TouchableOpacity
                            style={styles.actionIconButton}
                            onPress={() => speak(item.text, item.id)}
                        >
                            <Ionicons
                                name={speakingMessageId === item.id ? "volume-high" : "volume-medium-outline"}
                                size={16}
                                color={speakingMessageId === item.id ? colors.primary : "#9CA3AF"}
                            />
                        </TouchableOpacity>

                        {/* Add to Plan Button (Logged in only) */}
                        {isLoggedIn && (
                            <TouchableOpacity
                                style={styles.addToPlanButton}
                                onPress={() => openPlanModal(item.text)}
                            >
                                <Ionicons name="calendar-outline" size={14} color={colors.secondary} />
                                <Text style={styles.addToPlanText}>식단에 추가</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={onToggleSidebar} style={styles.menuButton}>
                        <Ionicons name="menu" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>AI 셰프</Text>
                        <Text style={styles.headerSubtitle}>무엇이든 물어보세요</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {/* 🎙️ Cooking Mode Toggle */}
                    {isLoggedIn && (
                        <TouchableOpacity
                            style={[styles.cookingModeButton, isCookingMode && styles.cookingModeActive]}
                            onPress={toggleCookingMode}
                        >
                            <Ionicons
                                name={isCookingMode ? "mic" : "mic-outline"}
                                size={20}
                                color={isCookingMode ? "white" : colors.primary}
                            />
                            {isListening && (
                                <View style={styles.listeningIndicator} />
                            )}
                        </TouchableOpacity>
                    )}
                    {!isLoggedIn && (
                        <TouchableOpacity style={styles.loginButton} onPress={onLoginPress}>
                            <Text style={styles.loginButtonText}>로그인</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {messages.length <= 1 ? (
                <View style={styles.emptyStateContainer}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="chatbubbles" size={48} color="white" />
                    </View>
                    <Text style={styles.emptyTitle}>대화를 시작해보세요!</Text>
                    <Text style={styles.emptySubtitle}>"오이 채썰기는 어떻게 해?"{"\n"}"오늘 저녁 메뉴 추천해줘"</Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    style={styles.list}
                />
            )}

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.secondary} />
                    <Text style={styles.loadingText}>답변을 생각하고 있어요...</Text>
                </View>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
                style={styles.inputContainer}
            >
                {/* Options Bar (Above Input) */}
                <View style={styles.optionsBar}>
                    {isLoggedIn && (
                        <TouchableOpacity
                            style={[styles.fridgeChip, useFridge && styles.fridgeChipActive]}
                            onPress={() => setUseFridge(!useFridge)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={useFridge ? "snow" : "close-circle"}
                                size={16}
                                color={useFridge ? colors.primary : "#EF4444"}
                            />
                            <Text style={[styles.fridgeChipText, useFridge && styles.fridgeChipTextActive]}>
                                {useFridge ? "❄️ 냉장고 활용 중" : "🚫 냉장고 미사용"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.inputWrapper}>
                    {/* STT Button (Placeholder) */}
                    <TouchableOpacity style={styles.micButton} onPress={() => Alert.alert("준비 중", "음성 인식 기능은 준비 중입니다.")}>
                        <Ionicons name="mic-outline" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder="메시지를 입력하세요..."
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={sendMessage}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading}>
                        <Ionicons name="send" size={20} color="white" />
                    </TouchableOpacity>

                </View>
            </KeyboardAvoidingView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeaderTitleRow}>
                            <Ionicons name="calendar" size={24} color={colors.primary} />
                            <Text style={styles.modalTitle}>식단 기록하기</Text>
                        </View>

                        <View style={styles.recipeCard}>
                            <Text style={styles.inputLabel}>메뉴 이름 (수정 가능)</Text>
                            <TextInput
                                style={styles.titleInput}
                                value={selectedRecipeToAdd}
                                onChangeText={setSelectedRecipeToAdd}
                                placeholder="메뉴 이름을 입력하세요"
                            />
                            <Text style={styles.recipePreviewHint}>
                                * 레시피 상세 내용은 자동으로 저장되어 캘린더에서 볼 수 있습니다.
                            </Text>
                        </View>

                        <Text style={styles.inputLabel}>날짜 선택</Text>
                        <View style={styles.selectionRow}>
                            <TouchableOpacity
                                style={[styles.selectButton, targetDate.toDateString() === new Date().toDateString() && styles.selectButtonActive]}
                                onPress={() => setTargetDate(new Date())}
                            >
                                <Text style={[styles.selectButtonText, targetDate.toDateString() === new Date().toDateString() && styles.selectButtonTextActive]}>오늘</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.selectButton, targetDate.toDateString() === new Date(Date.now() + 86400000).toDateString() && styles.selectButtonActive]}
                                onPress={() => setTargetDate(new Date(Date.now() + 86400000))}
                            >
                                <Text style={[styles.selectButtonText, targetDate.toDateString() === new Date(Date.now() + 86400000).toDateString() && styles.selectButtonTextActive]}>내일</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>식사 종류</Text>
                        <View style={styles.selectionRow}>
                            {['breakfast', 'lunch', 'dinner'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.selectButton, targetMealType === type && styles.selectButtonActive]}
                                    onPress={() => setTargetMealType(type)}
                                >
                                    <Text style={[styles.selectButtonText, targetMealType === type && styles.selectButtonTextActive]}>
                                        {type === 'breakfast' ? '아침' : type === 'lunch' ? '점심' : '저녁'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={confirmAddToPlan} style={[styles.confirmButton, { backgroundColor: '#8B5CF6' }]}>
                                <Text style={styles.confirmButtonText}>저장 (TEST)</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { padding: 16, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'android' ? 40 : 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    menuButton: { padding: 8, marginRight: 8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    headerSubtitle: { fontSize: 12, color: '#6B7280' },
    loginButton: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
    loginButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    list: { flex: 1 },
    listContent: { padding: 16, paddingBottom: 20 },
    messageBubble: { padding: 12, borderRadius: 16, marginBottom: 16, maxWidth: '85%', flexDirection: 'row', alignItems: 'flex-start' },
    userBubble: { backgroundColor: '#374151', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
    aiBubble: { backgroundColor: 'white', alignSelf: 'flex-start', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
    aiAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginTop: 2 },
    messageText: { fontSize: 15, lineHeight: 22 },
    userText: { color: 'white' },
    aiText: { color: '#1F2937' },
    messageActions: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },
    addToPlanButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
    addToPlanText: { color: colors.secondary, fontSize: 12, fontWeight: '600', marginLeft: 4 },
    actionIconButton: { padding: 4 },
    loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12 },
    loadingText: { marginLeft: 10, color: '#6B7280', fontSize: 14 },
    inputContainer: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingBottom: Platform.OS === 'ios' ? 20 : 0
    },
    optionsBar: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        gap: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
    micButton: { padding: 10, marginRight: 4 },
    input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, marginRight: 8, maxHeight: 100 },
    sendButton: { backgroundColor: colors.secondary, borderRadius: 24, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    logoContainer: { width: 80, height: 80, backgroundColor: colors.primary, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 40 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalHeaderTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
    recipeCard: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: colors.primary, marginBottom: 20 },
    titleInput: { fontSize: 16, color: '#1F2937', fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingVertical: 4, marginBottom: 8 },
    recipePreviewHint: { fontSize: 12, color: '#6B7280', marginTop: 4 },
    recipePreview: { fontSize: 16, color: '#374151', fontWeight: '500' },
    inputLabel: { fontSize: 14, fontWeight: 'bold', color: '#4B5563', marginBottom: 8, marginLeft: 4 },
    selectionRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    selectButton: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
    selectButtonActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
    selectButtonText: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
    selectButtonTextActive: { color: colors.primary, fontWeight: 'bold' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    cancelButton: { flex: 1, padding: 16, backgroundColor: '#F3F4F6', borderRadius: 12, alignItems: 'center' },
    confirmButton: { flex: 2, padding: 16, backgroundColor: colors.primary, borderRadius: 12, alignItems: 'center' },
    cancelButtonText: { color: '#374151', fontWeight: '600' },
    confirmButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    // 🎙️ Cooking Mode Styles
    cookingModeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.primary,
        position: 'relative',
    },
    cookingModeActive: {
        backgroundColor: colors.primary,
    },
    listeningIndicator: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#EF4444', // Red
        borderWidth: 2,
        borderColor: 'white',
    },
    fridgeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        gap: 6,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    fridgeChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    fridgeChipText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '700',
        letterSpacing: -0.2
    },
    fridgeChipTextActive: {
    },
    toggleDotOn: {
        backgroundColor: colors.primary
    },
    toggleDotOff: {
        backgroundColor: '#D1D5DB'
    }
});
