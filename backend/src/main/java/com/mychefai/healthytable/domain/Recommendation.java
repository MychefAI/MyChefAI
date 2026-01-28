package com.mychefai.healthytable.domain;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Recommendation {
    private Long id;
    private Long userId;
    private Long recipeId;
    private Double score; // AI score for relevance
    private String reason; // Why this was recommended
    private LocalDateTime createdAt;
}
