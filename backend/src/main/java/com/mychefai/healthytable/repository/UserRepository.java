package com.mychefai.healthytable.repository;

import com.mychefai.healthytable.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    // ID 목록으로 사용자 조회
    List<User> findByIdIn(List<Long> ids);
}
