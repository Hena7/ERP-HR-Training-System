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
     * Legacy single-department field mapped to departmentId.
     */
    private Long departmentId;

    @NotEmpty(message = "At least one target department is required")
    private List<Long> targetDepartmentIds;

    private String description;
    
    private String status;

    private String deadline;
}
