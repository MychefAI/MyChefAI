package com.mychefai.healthytable.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        System.out.println("Processing Request: " + request.getMethod() + " " + path);

        try {
            String jwt = getJwtFromRequest(request);
            System.out.println("Extracted JWT: "
                    + (jwt != null ? "Present (" + jwt.substring(0, Math.min(10, jwt.length())) + "...)" : "Null"));

            if (StringUtils.hasText(jwt)) {
                boolean isValid = tokenProvider.validateToken(jwt);
                System.out.println("Token Validity: " + isValid);

                if (isValid) {
                    String userId = tokenProvider.getUserId(jwt);
                    System.out.println("User ID from Token: " + userId);

                    // For simplicity, we create a simple authentication token with the user ID
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userId, null, Collections.emptyList());

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("Security Context Set Successfully");
                } else {
                    System.out.println("Token Validation Failed");
                }
            } else {
                System.out.println("No Token Found in Request");
            }
        } catch (Exception ex) {
            System.err.println("Authentication Error: " + ex.getMessage());
            ex.printStackTrace();
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
