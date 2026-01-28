package com.mychefai.healthytable.service;

import com.mychefai.healthytable.dto.ChatDto;
import com.mychefai.healthytable.dto.GeminiDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
public class GeminiService {

    private final WebClient webClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    // Using Gemini 2.0 Flash as requested by user
    private static final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    public GeminiService(WebClient webClient) {
        this.webClient = webClient;
    }

    public Mono<String> getChatResponse(String currentMessage, List<ChatDto.Message> history) {
        StringBuilder promptBuilder = new StringBuilder();

        // System Instruction (Persona)
        promptBuilder.append("System: 당신은 'MyChef AI'입니다. 친절하고 전문적인 셰프 페르소나를 유지하세요. ");
        promptBuilder.append("요리법, 식재료, 건강 식단에 대한 질문에 답변하고, 일상적인 대화도 자연스럽게 이어가세요. ");
        promptBuilder.append("답변은 한국어로, 이모지를 적절히 사용하여 친근하게 해주세요.\n");

        // Append History
        if (history != null) {
            for (ChatDto.Message msg : history) {
                String role = "user".equals(msg.getRole()) ? "User" : "Model";
                promptBuilder.append(role).append(": ").append(msg.getContent()).append("\n");
            }
        }

        // Current User Message
        promptBuilder.append("User: ").append(currentMessage).append("\n");
        promptBuilder.append("Model: ");

        GeminiDto.Request request = new GeminiDto.Request(List.of(GeminiDto.Content.user(promptBuilder.toString())));

        return webClient.post()
                .uri(API_URL + "?key=" + apiKey)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(GeminiDto.Response.class)
                .map(response -> {
                    if (response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                        return response.getCandidates().get(0).getContent().getParts().get(0).getText();
                    }
                    return "죄송해요, 답변을 생각하는 데 문제가 생겼어요. 🍳";
                })
                .onErrorResume(e -> {
                    e.printStackTrace();
                    return Mono.just("AI 연결 오류: " + e.getMessage());
                });
    }

    public Mono<String> getRecipeRecommendation(List<String> ingredients, String healthContext) {
        String prompt = String.format(
                "사용자가 가진 재료: [%s]. " +
                        "건강/상황 고려: [%s]. " +
                        "이 재료들을 활용해 만들 수 있는 맛있고 건강한 요리를 하나 추천해주세요. " +
                        "요리 이름, 간단한 설명, 필요한 재료(계량 포함), 조리 순서를 알려주세요.",
                String.join(", ", ingredients),
                healthContext);
        return getChatResponse(prompt, null);
    }
}
