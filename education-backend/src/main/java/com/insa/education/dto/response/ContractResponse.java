package com.insa.education.dto.response;

import com.insa.education.enums.StudyMode;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeDepartment;
    private Long requestId;
    private String university;
    private String program;
    private String studyCountry;
    private String studyCity;
    private Integer durationYears;
    private StudyMode studyMode;
    private BigDecimal estimatedCost;
    private LocalDate contractSignedDate;
    private LocalDateTime createdAt;
}
