package com.mychefai.healthytable.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePostRequestDTO {
    private String title;
    private String content;
    private List<String> ingredients;
    private List<String> steps;
    private String imageUrl;
}
