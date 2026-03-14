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
    private Integer workExperience;
    private Integer performanceScore;
    private Boolean disciplineRecord;
    private String verifiedBy;
    private LocalDateTime verifiedAt;
}
