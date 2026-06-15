package com.mychefai.healthytable.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OAuthService {

    private final WebClient.Builder webClientBuilder;

    // Google Token Verification
    @SuppressWarnings("unchecked")
    public Map<String, Object> verifyGoogleToken(String accessToken) {
        return webClientBuilder.build()
                .get()
                .uri("https://www.googleapis.com/oauth2/v3/userinfo")
                .headers(headers -> headers.setBearerAuth(accessToken))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    // Kakao Token Verification
    @SuppressWarnings("unchecked")
    public Map<String, Object> verifyKakaoToken(String accessToken) {
        return webClientBuilder.build()
                .get()
                .uri("https://kapi.kakao.com/v2/user/me")
                .headers(headers -> headers.setBearerAuth(accessToken))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }
}
