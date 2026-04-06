package com.insa.education.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Education opportunities are posted by Cyber Development Center,
                // but department heads can read only the opportunities targeted to them
                .requestMatchers("/api/education-opportunities/**").hasAnyRole(
                    "DEPARTMENT_HEAD", "CYBER_DEVELOPMENT_CENTER", "ADMIN")

                // Requests originate from department heads and can be accessed through the workflow chain
                .requestMatchers("/api/education-requests/**").hasAnyRole(
                    "DEPARTMENT_HEAD", "HR_OFFICER", "CYBER_DEVELOPMENT_CENTER", "ADMIN")

                // HR receives forwarded requests and verifies them
                .requestMatchers("/api/hr-verifications/**").hasAnyRole(
                    "HR_OFFICER", "ADMIN")

                .requestMatchers("/api/committee-decisions/**").hasAnyRole(
                    "COMMITTEE_MEMBER", "ADMIN")

                // Contract handling after approvals
                .requestMatchers("/api/contracts/**").hasAnyRole(
                    "CYBER_DEVELOPMENT_CENTER", "HR_OFFICER", "ADMIN")

                .requestMatchers("/api/guarantors/**").hasAnyRole(
                    "DEPARTMENT_HEAD", "HR_OFFICER", "ADMIN")

                .requestMatchers("/api/progress-reports/**").hasAnyRole(
                    "DEPARTMENT_HEAD", "HR_OFFICER", "CYBER_DEVELOPMENT_CENTER", "ADMIN")

                .requestMatchers("/api/education-completions/**").hasAnyRole(
                    "DEPARTMENT_HEAD", "HR_OFFICER", "CYBER_DEVELOPMENT_CENTER", "ADMIN")

                .requestMatchers("/api/service-obligations/**").hasAnyRole(
                    "HR_OFFICER", "CYBER_DEVELOPMENT_CENTER", "ADMIN")

                .requestMatchers("/api/employees/**").hasAnyRole(
                    "HR_OFFICER", "ADMIN")

                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));

        return http.build();
    }

    @Bean
    public Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter scopesConverter = new JwtGrantedAuthoritiesConverter();

        return jwt -> {
            Set<GrantedAuthority> authorities = new HashSet<>();
            Collection<GrantedAuthority> scopeAuthorities = scopesConverter.convert(jwt);
            if (scopeAuthorities != null) {
                authorities.addAll(scopeAuthorities);
            }

            authorities.addAll(extractRolesFromAccessClaim(jwt.getClaims().get("realm_access")));

            Object resourceAccessClaim = jwt.getClaims().get("resource_access");
            if (resourceAccessClaim instanceof Map<?, ?> resourceAccessMap) {
                for (Object clientAccess : resourceAccessMap.values()) {
                    authorities.addAll(extractRolesFromAccessClaim(clientAccess));
                }
            }

            String principalName = jwt.getClaimAsString("preferred_username");
            if (principalName == null || principalName.isBlank()) {
                principalName = jwt.getSubject();
            }

            return new JwtAuthenticationToken(jwt, authorities, principalName);
        };
    }

    private Set<GrantedAuthority> extractRolesFromAccessClaim(Object accessClaim) {
        if (!(accessClaim instanceof Map<?, ?> accessMap)) {
            return Set.of();
        }

        Object roles = accessMap.get("roles");
        if (!(roles instanceof Collection<?> roleList)) {
            return Set.of();
        }

        return roleList.stream()
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(role -> !role.isBlank())
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toSet());
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
