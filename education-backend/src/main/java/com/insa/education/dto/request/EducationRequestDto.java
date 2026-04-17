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

    private Long opportunityId;

    private String educationCategory;

    private String fieldOfStudy;

    private String institution;

    private String targetEducationLevel;

    private Integer budgetYear;

    private String award;

    private Double duration;

    private String programTime;

    private String location;

    @NotBlank(message = "Current education level is required")
    private String currentEducationLevel;

    private Double workExperience;

    private Double performanceScore;

    private String description;

    private String commitmentSource;

    private Double totalScore;

    private String candidateId;
}
