package com.insa.education.dto.response;

import com.insa.education.enums.DecisionStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommitteeDecisionResponse {
    private Long id;
    private Long requestId;
    private DecisionStatus decision;
    private String comment;
    private Integer quota;
    private String decidedBy;
    private LocalDateTime decisionDate;
}
