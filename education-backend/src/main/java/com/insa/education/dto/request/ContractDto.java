package com.insa.education.dto.request;

import com.insa.education.enums.StudyMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractDto {

    private Long employeeId;

    @NotNull(message = "Request ID is required")
    private Long requestId;

    @NotBlank(message = "University is required")
    private String university;

    @NotBlank(message = "Program is required")
    private String program;

    @NotBlank(message = "Study country is required")
    private String studyCountry;

    @NotBlank(message = "Study city is required")
    private String studyCity;

    @NotNull(message = "Duration (years) is required")
    private Integer durationYears;

    @NotNull(message = "Study mode is required")
    private StudyMode studyMode;

    private BigDecimal estimatedCost;

    private LocalDate contractSignedDate;
}
