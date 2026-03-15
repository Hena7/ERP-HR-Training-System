package com.insa.education.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationOpportunityDto {

    @NotBlank(message = "Education type is required")
    private String educationType;

    @NotBlank(message = "Education level is required")
    private String educationLevel;

    @NotBlank(message = "Institution is required")
    private String institution;

    @NotBlank(message = "Department is required")
    private String department;

    private String description;
}
