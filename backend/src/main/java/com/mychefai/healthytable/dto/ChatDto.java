package com.mychefai.healthytable.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class ChatDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Message {
        private String role; // "user" or "model"
        private String content;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String message;
        private List<Message> history;
        private boolean useFridge = true; // Default to true
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String reply;
    }
}
