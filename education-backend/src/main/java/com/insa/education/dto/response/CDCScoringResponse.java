package com.insa.education.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CDCScoringResponse {
    private Long id;
    private Long requestId;
    private Double experienceScore;
    private Double performanceScore;
    private Double disciplineScore;
    private Double totalScore;
    private String gradedBy;
    private LocalDateTime createdAt;
}
