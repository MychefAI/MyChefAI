package com.mychefai.healthytable.repository;

import com.mychefai.healthytable.domain.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    // 최신순으로 전체 게시글 조회
    List<CommunityPost> findAllByOrderByCreatedAtDesc();

    // 특정 사용자가 작성한 게시글 조회
    List<CommunityPost> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Batch 조회용
    List<CommunityPost> findByIdIn(List<Long> ids);
}
