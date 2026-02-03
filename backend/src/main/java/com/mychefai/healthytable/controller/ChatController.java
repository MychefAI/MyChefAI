package com.mychefai.healthytable.controller;

import com.mychefai.healthytable.domain.FridgeItem;
import com.mychefai.healthytable.dto.ChatDto;
import com.mychefai.healthytable.repository.FridgeItemRepository;
import com.mychefai.healthytable.security.JwtTokenProvider;
import com.mychefai.healthytable.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {

    private final GeminiService geminiService;
    private final JwtTokenProvider jwtTokenProvider;
    private final FridgeItemRepository fridgeItemRepository;

    @PostMapping("/message")
    public Mono<ChatDto.Response> chat(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody ChatDto.Request request) {

        String enhancedMessage = request.getMessage();

        // If user is authenticated, enhance message with fridge context
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                if (jwtTokenProvider.validateToken(token)) {
                    String userId = jwtTokenProvider.getUserId(token);
                    Long userIdLong = Long.parseLong(userId);

                    // Get fridge items
                    List<FridgeItem> fridgeItems = fridgeItemRepository.findByUserIdOrderByExpiryDate(userIdLong);

                    // Build context
                    if (!fridgeItems.isEmpty()) {
                        StringBuilder context = new StringBuilder();
                        context.append("\n\n[냉장고에 있는 식재료]\n");
                        String fridgeInfo = fridgeItems.stream()
                                .map(item -> String.format("- %s (%s, 유통기한: %s)",
                                        item.getName(), item.getQuantity(), item.getExpiryDate()))
                                .collect(Collectors.joining("\n"));
                        context.append(fridgeInfo);

                        enhancedMessage = request.getMessage() + context.toString();
                        System.out.println(">>> AI에게 전달되는 컨텍스트 포함 메시지:");
                        System.out.println(enhancedMessage);
                    }
                }
            } catch (Exception e) {
                System.err.println("컨텍스트 추가 중 오류 (무시하고 계속): " + e.getMessage());
            }
        }

        return geminiService.getChatResponse(enhancedMessage, request.getHistory())
                .map(ChatDto.Response::new);
    }

    @PostMapping("/stt") // STT Endpoint
    public Mono<Map<String, String>> speechToText(@RequestParam("audio") MultipartFile audioFile) {
        // Placeholder for VoiceService integration
        // In a real implementation, we would send this file to OpenAI Whisper API
        return Mono.just(Map.of("text", "음성 인식 기능은 아직 서버 키 설정이 필요합니다. (Mock Response)"));
    }
}
