package com.insa.education.dto.response;

import com.insa.education.enums.RequestStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationRequestResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Long opportunityId;
    private String educationType;
    private String educationLevel;
    private String institution;
    private String currentEducationLevel;
    private Double workExperience;
    private Double performanceScore;
    private String employeePhone;
    private String employeeDepartment;
    private String description;
    private RequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
