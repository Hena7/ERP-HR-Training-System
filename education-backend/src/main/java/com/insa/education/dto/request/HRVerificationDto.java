package com.insa.education.dto.request;

import com.insa.education.enums.HRVerificationStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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

    @NotNull(message = "Semester 1 score is required")
    @Min(value = 0, message = "Semester 1 score must be at least 0")
    @Max(value = 100, message = "Semester 1 score must not exceed 100")
    private Double semester1Score;

    @NotNull(message = "Semester 2 score is required")
    @Min(value = 0, message = "Semester 2 score must be at least 0")
    @Max(value = 100, message = "Semester 2 score must not exceed 100")
    private Double semester2Score;

    @NotNull(message = "HR verification status is required")
    private HRVerificationStatus status;
}
