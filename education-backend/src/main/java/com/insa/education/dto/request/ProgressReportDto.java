package com.insa.education.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressReportDto {

    @NotNull(message = "Contract ID is required")
    private Long contractId;

    @NotNull(message = "Report month is required")
    private LocalDate reportMonth;

    @NotBlank(message = "Description is required")
    private String description;
}
