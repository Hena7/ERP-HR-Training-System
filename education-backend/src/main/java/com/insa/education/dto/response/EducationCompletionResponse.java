package com.insa.education.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationCompletionResponse {
    private Long id;
    private Long contractId;
    private LocalDate completionDate;
    private LocalDate returnToWorkDate;
    private LocalDate researchPresentationDate;
    private LocalDateTime createdAt;
}
