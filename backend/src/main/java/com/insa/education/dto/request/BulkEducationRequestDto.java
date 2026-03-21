package com.insa.education.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkEducationRequestDto {

    @NotEmpty(message = "At least one employee must be selected")
    private List<Long> employeeIds;

    @NotNull(message = "Education opportunity is required")
    private Long opportunityId;

    @NotNull(message = "Current education level is required")
    private String currentEducationLevel;

    @NotNull(message = "Work experience is required")
    private Double workExperience;

    @NotNull(message = "Performance score is required")
    private Double performanceScore;

    private String description;
}
