package com.insa.education.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtRoleConverter jwtRoleConverter;

    public SecurityConfig(JwtRoleConverter jwtRoleConverter) {
        this.jwtRoleConverter = jwtRoleConverter;
    }

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
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            );

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwtRoleConverter);
        return converter;
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
