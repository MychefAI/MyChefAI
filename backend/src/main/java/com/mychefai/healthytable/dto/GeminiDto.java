package com.mychefai.healthytable.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;

public class GeminiDto {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Request {
        private List<Content> contents;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Content {
        private List<Part> parts;
        private String role; // "user" or "model"

        public static Content user(String text) {
            return new Content(List.of(new Part(text)), "user");
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Part {
        private String text;
    }

    @Data
    @NoArgsConstructor
    public static class Response {
        private List<Candidate> candidates;
    }

    @Data
    @NoArgsConstructor
    public static class Candidate {
        private Content content;
    }
}
