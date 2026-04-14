package com.insa.education.dto.request;

import com.insa.education.enums.DecisionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommitteeDecisionDto {

    @NotNull(message = "Request ID is required")
    private Long requestId;

    @NotNull(message = "Decision is required")
    private DecisionStatus decision;

    private String comment;

    private Integer quota;
}
