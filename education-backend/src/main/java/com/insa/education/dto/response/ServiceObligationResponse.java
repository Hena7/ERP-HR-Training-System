package com.insa.education.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceObligationResponse {
    private Long id;
    private Long contractId;
    private Integer studyYears;
    private Integer requiredServiceYears;
    private LocalDate serviceStartDate;
    private LocalDate serviceEndDate;
    private LocalDateTime createdAt;
}
