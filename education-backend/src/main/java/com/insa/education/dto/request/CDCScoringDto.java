package com.insa.education.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CDCScoringDto {

    @NotNull(message = "Request ID is required")
    private Long requestId;

    @NotNull(message = "Experience score is required")
    @Min(value = 0, message = "Experience score must be at least 0")
    @Max(value = 100, message = "Experience score must not exceed 100")
    private Double experienceScore;

    @NotNull(message = "Performance score is required")
    @Min(value = 0, message = "Performance score must be at least 0")
    @Max(value = 100, message = "Performance score must not exceed 100")
    private Double performanceScore;

    @NotNull(message = "Discipline score is required")
    @Min(value = 0, message = "Discipline score must be at least 0")
    @Max(value = 100, message = "Discipline score must not exceed 100")
    private Double disciplineScore;

    @NotNull(message = "Total score is required")
    @Min(value = 0, message = "Total score must be at least 0")
    @Max(value = 110, message = "Total score must not exceed 110 (including bonus)")
    private Double totalScore;
}
