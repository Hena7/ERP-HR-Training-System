package com.insa.education.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HRVerificationDto {

    @NotNull(message = "Request ID is required")
    private Long requestId;

    @NotNull(message = "Work experience is required")
    private Integer workExperience;

    @NotNull(message = "Performance score is required")
    private Integer performanceScore;

    @NotNull(message = "Discipline record is required")
    private Boolean disciplineRecord;
}
