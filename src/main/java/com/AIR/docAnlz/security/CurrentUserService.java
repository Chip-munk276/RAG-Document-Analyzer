package com.AIR.docAnlz.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    public Long getCurrentUserId() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (!(authentication instanceof JwtAuthenticationToken jwtAuth)) {
            throw new IllegalStateException(
                    "User is not authenticated"
            );
        }

        Number userId =
                jwtAuth.getToken()
                        .getClaim("userId");

        if (userId == null) {
            throw new IllegalStateException(
                    "User session does not contain userId"
            );
        }

        return userId.longValue();
    }
}