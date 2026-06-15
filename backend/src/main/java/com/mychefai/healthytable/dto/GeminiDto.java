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
            return new Content(List.of(Part.text(text)), "user");
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
    public static class Part {
        private String text;
        private InlineData inline_data;

        public static Part text(String text) {
            return new Part(text, null);
        }

        public static Part image(String mimeType, String base64Data) {
            return new Part(null, new InlineData(mimeType, base64Data));
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class InlineData {
        private String mime_type;
        private String data; // Base64
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
