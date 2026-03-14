package com.insa.education.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressReportResponse {
    private Long id;
    private Long contractId;
    private LocalDate reportMonth;
    private String description;
    private LocalDateTime submittedAt;
}
