import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    Alert,
    Platform,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { colors } from '../theme/colors';
import config from '../config';

export default function PostDetailScreen({ post, user, onNavigate, onBack }) {
    const [postData, setPostData] = useState(post);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        loadPostDetails();
        loadComments();
    }, [post.id]);

    const loadPostDetails = async () => {
        try {
            const response = await axios.get(
                `${config.API_BASE_URL}/community/posts/${post.id}?currentUserId=${user?.id || ''}`
            );
            setPostData(response.data);
        } catch (error) {
            console.error('게시글 로딩 실패:', error);
        }
    };

    const loadComments = async () => {
        try {
            const response = await axios.get(
                `${config.API_BASE_URL}/community/posts/${post.id}/comments`
            );
            setComments(response.data);
        } catch (error) {
            console.error('댓글 로딩 실패:', error);
        }
    };

    const handleLike = async () => {
        if (!user) {
            Alert.alert('알림', '로그인이 필요합니다.');
            return;
        }

        try {
            const response = await axios.post(
                `${config.API_BASE_URL}/community/posts/${post.id}/like`,
                { userId: user.id }
            );
            setPostData({
                ...postData,
                isLikedByCurrentUser: response.data.isLiked,
                likeCount: response.data.likeCount
            });
        } catch (error) {
            console.error('좋아요 실패:', error);
        }
    };

    const handleAddComment = async () => {
        if (!user) {
            Alert.alert('알림', '로그인이 필요합니다.');
            return;
        }

        if (!newComment.trim()) {
            Alert.alert('알림', '댓글 내용을 입력해주세요.');
            return;
        }

        setSubmittingComment(true);
        try {
            await axios.post(
                `${config.API_BASE_URL}/community/posts/${post.id}/comments`,
                {
                    userId: user.id,
                    content: newComment.trim()
                }
            );
            setNewComment('');
            await loadComments();
            await loadPostDetails();
        } catch (error) {
            console.error('댓글 작성 실패:', error);
            Alert.alert('오류', '댓글 작성에 실패했습니다.');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        Alert.alert(
            '댓글 삭제',
            '댓글을 삭제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await axios.delete(
                                `${config.API_BASE_URL}/community/comments/${commentId}?userId=${user.id}`
                            );
                            await loadComments();
                            await loadPostDetails();
                        } catch (error) {
                            console.error('댓글 삭제 실패:', error);
                            Alert.alert('오류', error.response?.data || '댓글 삭제에 실패했습니다.');
                        }
                    }
                }
            ]
        );
    };

    const handleDeletePost = async () => {
        console.log('⚠️ handleDeletePost 함수 실행됨');
        console.log('Alert.alert 호출 직전');
        Alert.alert(
            '게시글 삭제',
            '게시글을 삭제하시겠습니까?',
            [
                {
                    text: '취소',
                    style: 'cancel',
                    onPress: () => console.log('❌ 취소 버튼 클릭됨')
                },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                        console.log('✅ 삭제 확인 버튼 클릭됨');
                        try {
                            console.log('게시글 삭제 요청:', {
                                postId: post.id,
                                userId: user.id,
                                url: `${config.API_BASE_URL}/community/posts/${post.id}?userId=${user.id}`
                            });

                            const response = await axios.delete(
                                `${config.API_BASE_URL}/community/posts/${post.id}?userId=${user.id}`
                            );

                            console.log('게시글 삭제 성공:', response.data);

                            Alert.alert('성공', '게시글이 삭제되었습니다.', [
                                { text: '확인', onPress: () => onNavigate && onNavigate('community') }
                            ]);
                        } catch (error) {
                            console.error('게시글 삭제 실패:', error);
                            console.error('에러 응답:', error.response?.data);
                            console.error('에러 상태:', error.response?.status);

                            let errorMessage = '게시글 삭제에 실패했습니다.';
                            if (error.response) {
                                errorMessage = `서버 오류 (${error.response.status}): ${error.response.data || '알 수 없는 오류'}`;
                            } else if (error.request) {
                                errorMessage = '서버에 연결할 수 없습니다.';
                            }

                            Alert.alert('오류', errorMessage);
                        }
                    }
                }
            ]
        );
        console.log('Alert.alert 호출 완료 (다이얼로그 표시되어야 함)');
    };

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

    const isAuthor = user && postData && user.id === postData.userId;

    // 디버깅 로그
    console.log('🔍 PostDetailScreen 디버깅:', {
        'user 객체': user,
        'user.id': user?.id,
        'postData.userId': postData?.userId,
        'isAuthor': isAuthor,
        '휴지통 버튼 표시 여부': isAuthor ? '예' : '아니오'
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>게시글</Text>
                {isAuthor && (
                    <TouchableOpacity onPress={async () => {
                        console.log('🗑️ 삭제 버튼 클릭됨 - 직접 삭제');
                        try {
                            const response = await axios.delete(
                                `${config.API_BASE_URL}/community/posts/${post.id}?userId=${user.id}`
                            );
                            console.log('삭제 성공:', response.data);
                            onNavigate && onNavigate('community');
                        } catch (error) {
                            console.error('삭제 실패:', error);
                        }
                    }}>
                        <Ionicons name="trash-outline" size={22} color={colors.error} />
                    </TouchableOpacity>
                )}
                {!isAuthor && <View style={{ width: 22 }} />}
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Post Header */}
                <View style={styles.postHeader}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={24} color="white" />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{postData.userName || '사용자'}</Text>
                        <Text style={styles.timeAgo}>{getTimeAgo(postData.createdAt)}</Text>
                    </View>
                </View>

                {/* Post Content */}
                <View style={styles.postContent}>
                    <Text style={styles.postTitle}>{postData.title}</Text>
                    <Text style={styles.postText}>{postData.content}</Text>

                    {postData.imageUrl && (
                        <Image source={{ uri: postData.imageUrl }} style={styles.postImage} />
                    )}

                    {/* Ingredients */}
                    {postData.ingredients && postData.ingredients.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🛒 재료</Text>
                            {postData.ingredients.map((item, index) => (
                                <Text key={index} style={styles.listItem}>• {item}</Text>
                            ))}
                        </View>
                    )}

                    {/* Steps */}
                    {postData.steps && postData.steps.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>👨‍🍳 조리 순서</Text>
                            {postData.steps.map((item, index) => (
                                <Text key={index} style={styles.stepItem}>
                                    {index + 1}. {item}
                                </Text>
                            ))}
                        </View>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                        <Ionicons
                            name={postData.isLikedByCurrentUser ? "heart" : "heart-outline"}
                            size={26}
                            color={postData.isLikedByCurrentUser ? colors.error : colors.text}
                        />
                        <Text style={styles.actionText}>{postData.likeCount || 0}</Text>
                    </TouchableOpacity>
                    <View style={styles.actionButton}>
                        <Ionicons name="chatbubble-outline" size={24} color={colors.text} />
                        <Text style={styles.actionText}>{postData.commentCount || 0}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Comments Section */}
                <View style={styles.commentsSection}>
                    <Text style={styles.commentsTitle}>댓글 {comments.length}</Text>

                    {comments.map((comment) => (
                        <View key={comment.id} style={styles.commentItem}>
                            <View style={styles.commentHeader}>
                                <View style={styles.commentUserInfo}>
                                    <View style={styles.commentAvatar}>
                                        <Ionicons name="person" size={16} color="white" />
                                    </View>
                                    <View>
                                        <Text style={styles.commentUserName}>{comment.userName}</Text>
                                        <Text style={styles.commentTime}>{getTimeAgo(comment.createdAt)}</Text>
                                    </View>
                                </View>
                                {user && user.id === comment.userId && (
                                    <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                                        <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <Text style={styles.commentText}>{comment.content}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Comment Input */}
            <View style={styles.commentInputContainer}>
                <TextInput
                    style={styles.commentInput}
                    placeholder="댓글을 입력하세요..."
                    placeholderTextColor={colors.textTertiary}
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleAddComment}
                    disabled={submittingComment}
                >
                    {submittingComment ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <Ionicons name="send" size={22} color={colors.primary} />
                    )}
                </TouchableOpacity>
            </View>
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
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 40 : 16,
        paddingBottom: 12,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    content: {
        flex: 1,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.surface,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.textTertiary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    timeAgo: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    postContent: {
        padding: 16,
        backgroundColor: colors.surface,
    },
    postTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
    },
    postText: {
        fontSize: 15,
        lineHeight: 22,
        color: colors.text,
    },
    postImage: {
        width: '100%',
        height: 250,
        borderRadius: 12,
        marginTop: 16,
        backgroundColor: colors.border,
    },
    section: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
    },
    listItem: {
        fontSize: 14,
        lineHeight: 24,
        color: colors.text,
    },
    stepItem: {
        fontSize: 14,
        lineHeight: 26,
        color: colors.text,
    },
    actions: {
        flexDirection: 'row',
        padding: 16,
        gap: 24,
        backgroundColor: colors.surface,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    divider: {
        height: 8,
        backgroundColor: colors.background,
    },
    commentsSection: {
        padding: 16,
        backgroundColor: colors.surface,
    },
    commentsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 16,
    },
    commentItem: {
        marginBottom: 20,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    commentUserInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.textTertiary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    commentUserName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    commentTime: {
        fontSize: 11,
        color: colors.textSecondary,
    },
    commentText: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.text,
        marginLeft: 36,
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    commentInput: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 14,
        maxHeight: 100,
        color: colors.text,
    },
    sendButton: {
        marginLeft: 8,
        padding: 8,
    },
});
