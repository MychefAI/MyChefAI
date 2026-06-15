package com.mychefai.healthytable.controller;

import com.mychefai.healthytable.domain.MealLog;
import com.mychefai.healthytable.domain.User;
import com.mychefai.healthytable.dto.MealLogDTO;
import com.mychefai.healthytable.repository.UserRepository;
import com.mychefai.healthytable.service.MealLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meallogs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MealLogController {

    private final MealLogService mealLogService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userIdStr = (String) authentication.getPrincipal(); // Based on JwtTokenProvider setting subject as
                                                                   // userId
        return userRepository.findById(Long.parseLong(userIdStr))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<MealLog>> getMyMealLogs() {
        User user = getCurrentUser();
        return ResponseEntity.ok(mealLogService.getMealLogs(user));
    }

    @PostMapping
    public ResponseEntity<MealLog> saveMealLog(@RequestBody MealLogDTO dto) {
        User user = getCurrentUser();
        // The DTO needs to be updated or we need to ensure the service handles the new
        // fields mapping if DTO has them.
        // Assuming we need to update DTO first. Wait, let me check DTO.
        return ResponseEntity.ok(mealLogService.saveOrUpdateMealLog(user, dto));
    }

    @GetMapping("/analysis/monthly")
    public ResponseEntity<String> getMonthlyAnalysis(@RequestParam int year, @RequestParam int month) {
        User user = getCurrentUser();
        return ResponseEntity.ok(mealLogService.getMonthlyAnalysis(user, year, month));
    }
}
