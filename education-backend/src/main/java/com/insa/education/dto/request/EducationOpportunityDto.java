package com.insa.education.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

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

    /**
     * Legacy single-department field kept for backward compatibility.
     * New logic should use targetDepartments.
     */
    private String department;

    @NotEmpty(message = "At least one target department is required")
    private List<@NotBlank(message = "Target department cannot be blank") String> targetDepartments;

    private String description;
}
