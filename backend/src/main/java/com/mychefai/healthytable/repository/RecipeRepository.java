package com.mychefai.healthytable.repository;

import com.mychefai.healthytable.domain.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    // ID 목록으로 레시피 조회
    List<Recipe> findByIdIn(List<Long> ids);

    // 제목으로 검색
    List<Recipe> findByTitleContaining(String title);
}
