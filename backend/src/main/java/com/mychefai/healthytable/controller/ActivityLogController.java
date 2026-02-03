package com.mychefai.healthytable.controller;

import com.mychefai.healthytable.domain.User;
import com.mychefai.healthytable.repository.UserRepository;
import com.mychefai.healthytable.security.JwtTokenProvider;
import com.mychefai.healthytable.service.ActivityLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @PostMapping("/log")
    public ResponseEntity<?> logActivity(HttpServletRequest request, @RequestBody Map<String, Boolean> body) {
        User user = getUserFromRequest(request);
        if (user == null)
            return ResponseEntity.status(401).body("Unauthorized");

        boolean isAi = body.getOrDefault("isAi", false);
        return ResponseEntity.ok(activityLogService.logActivity(user, isAi));
    }

    @GetMapping
    public ResponseEntity<?> getActivityLogs(HttpServletRequest request) {
        User user = getUserFromRequest(request);
        if (user == null)
            return ResponseEntity.status(401).body("Unauthorized");

        return ResponseEntity.ok(activityLogService.getActivityLogs(user));
    }

    private User getUserFromRequest(HttpServletRequest request) {
        String token = jwtTokenProvider.resolveToken(request);
        if (token != null && jwtTokenProvider.validateToken(token)) {
            String userId = jwtTokenProvider.getUserId(token);
            return userRepository.findById(Long.parseLong(userId)).orElse(null);
        }
        return null;
    }
}
