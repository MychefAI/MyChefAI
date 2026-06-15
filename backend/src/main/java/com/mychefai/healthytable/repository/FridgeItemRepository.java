package com.mychefai.healthytable.repository;

import com.mychefai.healthytable.domain.FridgeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FridgeItemRepository extends JpaRepository<FridgeItem, Long> {
    List<FridgeItem> findByUserIdOrderByExpiryDate(Long userId);

    List<FridgeItem> findByUserId(Long userId);
}
