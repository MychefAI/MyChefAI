package com.mychefai.healthytable.controller;

import com.mychefai.healthytable.dto.ChatDto;
import com.mychefai.healthytable.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {

    private final GeminiService geminiService;

    @PostMapping("/message")
    public Mono<ChatDto.Response> chat(@RequestBody ChatDto.Request request) {
        return geminiService.getChatResponse(request.getMessage(), request.getHistory())
                .map(ChatDto.Response::new);
    }

    @PostMapping("/stt") // STT Endpoint
    public Mono<Map<String, String>> speechToText(@RequestParam("audio") MultipartFile audioFile) {
        // Placeholder for VoiceService integration
        // In a real implementation, we would send this file to OpenAI Whisper API
        return Mono.just(Map.of("text", "음성 인식 기능은 아직 서버 키 설정이 필요합니다. (Mock Response)"));
    }
}
