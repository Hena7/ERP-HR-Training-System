package com.insa.education.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationOpportunityResponse {
    private Long id;
    private String educationType;
    private String educationLevel;
    private String institution;
    private String department;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
