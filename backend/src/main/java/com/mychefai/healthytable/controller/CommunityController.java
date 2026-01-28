package com.mychefai.healthytable.controller;

import com.mychefai.healthytable.dto.CommunityFeedItemDTO;
import com.mychefai.healthytable.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CommunityController {

    private final CommunityService communityService;

    @GetMapping("/feed")
    public List<CommunityFeedItemDTO> getPublicFeed() {
        return communityService.getPublicFeed();
    }

    @PostMapping("/share")
    public ResponseEntity<?> shareRecipe(@RequestBody com.mychefai.healthytable.dto.RecipeShareRequestDTO request) {
        communityService.shareRecipe(
                request.getUserId(),
                request.getRecipeId(),
                request.getMessage(),
                request.getVisibility());
        return ResponseEntity.ok("레시피가 공유되었습니다.");
    }
}
