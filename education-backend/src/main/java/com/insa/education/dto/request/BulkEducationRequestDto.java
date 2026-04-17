package com.insa.education.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkEducationRequestDto {

    @NotEmpty(message = "At least one candidate must be nominated")
    private List<CandidateNominationDto> candidates;

    private Long opportunityId;

    private String educationCategory;

    @NotNull(message = "Education level is required")
    private String educationLevel;

    private String fieldOfStudy;

    private String institution;

    private Integer budgetYear;

    private String description;

    private String commitmentSource;

    private Double totalScore;
}
