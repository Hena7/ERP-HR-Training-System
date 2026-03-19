package com.insa.education.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

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
    private List<String> targetDepartments;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
