package com.AIR.docAnlz.dto;

public record AuthResponse(
        String token,
        Long userId,
        String email,
        String role
) {}