package com.insa.education.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationCompletionDto {

    @NotNull(message = "Contract ID is required")
    private Long contractId;

    @NotNull(message = "Completion date is required")
    private LocalDate completionDate;

    private LocalDate returnToWorkDate;

    private LocalDate researchPresentationDate;
}
