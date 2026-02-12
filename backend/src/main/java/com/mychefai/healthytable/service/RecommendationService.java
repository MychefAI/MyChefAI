package com.mychefai.healthytable.service;

import com.mychefai.healthytable.domain.*;
import com.mychefai.healthytable.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mychefai.healthytable.dto.RecommendationDTO;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RecipeRepository recipeRepository;
    private final FridgeItemRepository fridgeItemRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final RecommendationRepository recommendationRepository;

    /**
     * 사용자의 냉장고와 건강 정보를 기반으로 추천 생성
     */
    @Transactional
    public List<Recommendation> generateRecommendations(Long userId) {
        // 1. 데이터 준비
        List<Recipe> allRecipes = recipeRepository.findAll();
        List<FridgeItem> fridgeItems = fridgeItemRepository.findByUserId(userId);
        HealthProfile healthProfile = healthProfileRepository.findByUserId(userId).orElse(null);

        List<String> fridgeItemNames = fridgeItems.stream()
                .map(FridgeItem::getName)
                .collect(Collectors.toList());

        List<String> allergies = (healthProfile != null && healthProfile.getAllergies() != null)
                ? healthProfile.getAllergies()
                : new ArrayList<>();

        // 기존 추천 삭제
        recommendationRepository.deleteByUserId(userId);

        List<Recommendation> recommendations = new ArrayList<>();

        for (Recipe recipe : allRecipes) {
            double score = calculateScore(recipe, fridgeItemNames, allergies);

            if (score > 0) {
                Recommendation recommendation = new Recommendation();
                recommendation.setUserId(userId);
                recommendation.setRecipeId(recipe.getId());
                recommendation.setScore(score);
                recommendation.setReason(generateReason(recipe, fridgeItemNames));
                recommendations.add(recommendationRepository.save(recommendation));
            }
        }

        return recommendations;
    }

    private double calculateScore(Recipe recipe, List<String> userIngredients, List<String> allergies) {
        double score = 0;
        List<String> recipeIngredients = recipe.getIngredients();

        if (recipeIngredients == null)
            return 0;

        // 알러지 필터링
        for (String allergy : allergies) {
            for (String ri : recipeIngredients) {
                if (ri.contains(allergy)) {
                    return -100; // 알러지 유발 음시는 배제
                }
            }
        }

        // 재료 매칭 점수 (개당 10점)
        for (String recipeIng : recipeIngredients) {
            for (String userIng : userIngredients) {
                if (recipeIng.contains(userIng) || userIng.contains(recipeIng)) {
                    score += 10;
                }
            }
        }

        return score;
    }

    private String generateReason(Recipe recipe, List<String> userIngredients) {
        List<String> matched = new ArrayList<>();
        List<String> recipeIngredients = recipe.getIngredients();

        if (recipeIngredients != null) {
            for (String recipeIng : recipeIngredients) {
                for (String userIng : userIngredients) {
                    if (recipeIng.contains(userIng) || userIng.contains(recipeIng)) {
                        matched.add(userIng);
                        break;
                    }
                }
            }
        }

        if (matched.isEmpty()) {
            return "건강 정보를 고려한 추천입니다.";
        }

        return "냉장고 속 " + String.join(", ", matched.stream().limit(2).collect(Collectors.toList())) + "을(를) 활용한 레시피예요!";
    }

    public List<RecommendationDTO> getRecommendations(Long userId) {
        List<Recommendation> results = recommendationRepository.findByUserIdOrderByScoreDesc(userId);
        if (results.isEmpty()) {
            generateRecommendations(userId);
            results = recommendationRepository.findByUserIdOrderByScoreDesc(userId);
        }

        if (results.isEmpty())
            return new ArrayList<>();

        List<Long> recipeIds = results.stream().map(Recommendation::getRecipeId).collect(Collectors.toList());
        Map<Long, Recipe> recipeMap = recipeRepository.findByIdIn(recipeIds).stream()
                .collect(Collectors.toMap(Recipe::getId, r -> r));

        return results.stream().map(reco -> {
            Recipe recipe = recipeMap.get(reco.getRecipeId());
            return new RecommendationDTO(
                    reco.getId(),
                    reco.getRecipeId(),
                    recipe != null ? recipe.getTitle() : "알 수 없는 레시피",
                    recipe != null ? recipe.getDescription() : "",
                    recipe != null ? recipe.getImageUrl() : "",
                    reco.getScore(),
                    reco.getReason());
        }).collect(Collectors.toList());
    }
}
