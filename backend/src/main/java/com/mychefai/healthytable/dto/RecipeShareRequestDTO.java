package com.mychefai.healthytable.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeShareRequestDTO {
    private Long userId;
    private Long recipeId;
    private String message;
    private String visibility; // PUBLIC, PRIVATE
}
