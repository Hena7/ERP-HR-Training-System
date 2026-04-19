package com.insa.education.util;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Map;

public class IdentityUtils {

    /**
     * Extracts a human-readable display name from the current security context.
     * Prioritizes 'name' claim, then 'preferred_username', then 'given_name',
     * and finally falls back to the principal name (often the UUID).
     */
    public static String getCurrentUserDisplayName() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return "System";

        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            Map<String, Object> claims = jwtAuth.getToken().getClaims();
            
            // Try common Keycloak/OIDC name claims
            String name = (String) claims.get("name");
            if (isInvalid(name)) name = (String) claims.get("preferred_username");
            if (isInvalid(name)) name = (String) claims.get("given_name");
            
            // If still no human name, combine given_name and family_name if available
            if (isInvalid(name)) {
                String gn = (String) claims.get("given_name");
                String fn = (String) claims.get("family_name");
                if (!isInvalid(gn) && !isInvalid(fn)) {
                    name = gn + " " + fn;
                } else if (!isInvalid(gn)) {
                    name = gn;
                } else if (!isInvalid(fn)) {
                    name = fn;
                }
            }

            return (name != null && !name.isBlank()) ? name : auth.getName();
        }

        return auth.getName();
    }

    private static boolean isInvalid(String s) {
        return s == null || s.isBlank();
    }
}
