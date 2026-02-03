package com.mychefai.healthytable.controller;

import com.mychefai.healthytable.domain.FridgeItem;
import com.mychefai.healthytable.repository.FridgeRepository;
import com.mychefai.healthytable.security.JwtTokenProvider;
import com.mychefai.healthytable.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fridge")
@RequiredArgsConstructor
public class FridgeController {

    private final FridgeRepository fridgeRepository;
    private final GeminiService geminiService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    public List<FridgeItem> getFridgeItems(@RequestHeader("Authorization") String token) {
        Long userId = Long.valueOf(jwtTokenProvider.getUserId(token.replace("Bearer ", "")));
        return fridgeRepository.findByUserIdOrderByExpiryDateAsc(userId);
    }

    @PostMapping
    public FridgeItem addFridgeItem(@RequestHeader("Authorization") String token, @RequestBody FridgeItem item) {
        Long userId = Long.valueOf(jwtTokenProvider.getUserId(token.replace("Bearer ", "")));
        item.setUserId(userId);
        return fridgeRepository.save(item);
    }

    @DeleteMapping("/{id}")
    public void deleteFridgeItem(@PathVariable Long id) {
        fridgeRepository.deleteById(id);
    }

    @PutMapping("/{id}")
    public FridgeItem updateFridgeItem(@PathVariable Long id,
            @RequestHeader("Authorization") String token,
            @RequestBody FridgeItem item) {
        Long userId = Long.valueOf(jwtTokenProvider.getUserId(token.replace("Bearer ", "")));

        return fridgeRepository.findById(id)
                .filter(existingItem -> existingItem.getUserId().equals(userId))
                .map(existingItem -> {
                    existingItem.setName(item.getName());
                    existingItem.setQuantity(item.getQuantity());
                    existingItem.setCategory(item.getCategory());
                    existingItem.setExpiryDate(item.getExpiryDate());
                    return fridgeRepository.save(existingItem);
                })
                .orElseThrow(() -> new RuntimeException("Item not found or unauthorized"));
    }

    @PatchMapping("/{id}/quantity")
    public FridgeItem adjustQuantity(@PathVariable Long id,
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> body) {
        Long userId = Long.valueOf(jwtTokenProvider.getUserId(token.replace("Bearer ", "")));
        String quantityStr = body.get("quantity");

        return fridgeRepository.findById(id)
                .filter(item -> item.getUserId().equals(userId))
                .map(item -> {
                    item.setQuantity(quantityStr);
                    return fridgeRepository.save(item);
                })
                .orElseThrow(() -> new RuntimeException("Item not found or unauthorized"));
    }

    @PostMapping("/scan")
    public Mono<String> scanReceipt(@RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> body) {
        String base64Image = body.get("image");
        if (base64Image == null || base64Image.isEmpty()) {
            return Mono.just("[]");
        }

        // Return Mono directly - Spring WebFlux will handle async properly
        return geminiService.analyzeReceipt(base64Image);
    }
}
