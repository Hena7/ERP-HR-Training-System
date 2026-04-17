package com.insa.education.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateNominationDto {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    private String candidateId;

    private String award;

    private Double duration;

    private String programTime;

    private String location;

    private String dept;
}
