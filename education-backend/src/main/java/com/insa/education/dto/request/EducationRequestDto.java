package com.insa.education.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationRequestDto {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Opportunity ID is required")
    private Long opportunityId;

    @NotBlank(message = "Current education level is required")
    private String currentEducationLevel;

    private Double workExperience;

    private Double performanceScore;

    private String description;
}
