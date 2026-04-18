package com.insa.education.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateNominationDto {

    private Long employeeId;

    private String candidateId;

    private String name;

    private String phone;

    private String award;

    private Double duration;

    private String programTime;

    private String location;

    private String dept;
}
