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
    private Long departmentId;
    private String departmentName;
    private List<Long> targetDepartmentIds;
    private List<String> targetDepartmentNames;
    private String description;
    private String status;
    private String deadline;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
