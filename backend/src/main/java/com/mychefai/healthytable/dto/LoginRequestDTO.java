package com.mychefai.healthytable.dto;

import lombok.Data;

@Data
public class LoginRequestDTO {
    private String accessToken;
    private String provider; // google, kakao
}
