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
}
