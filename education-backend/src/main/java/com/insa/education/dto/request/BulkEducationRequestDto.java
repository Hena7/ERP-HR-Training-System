package com.insa.education.dto.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkEducationRequestDto {

    private List<CandidateNominationDto> candidates;

    private Long opportunityId;

    private String educationCategory;

    private String educationLevel;

    private String fieldOfStudy;

    private String institution;

    private Integer budgetYear;

    private String description;

    private String commitmentSource;

    private Double totalScore;
}
