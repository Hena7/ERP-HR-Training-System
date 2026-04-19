package com.insa.education.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HRVerificationResponse {
    private Long id;
    private Long requestId;
    private Double semester1Score;
    private Double semester2Score;
    private Double averageScore;
    private String status;
    private String verifiedBy;
    private LocalDateTime verifiedAt;

    // Scoring fields
    private Integer experienceYears;
    private Integer experienceMonths;
    private Boolean isDisabled;
    private String gender;
    private Boolean hasDiscipline;
    private String disciplineDescription;
    private Double experienceSubScore;
    private Double performanceSubScore;
    private Double disciplineSubScore;
    private Double affirmativeBonus;
    private Double totalCalculatedScore;
}
