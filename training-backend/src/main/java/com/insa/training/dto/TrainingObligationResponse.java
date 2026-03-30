package com.insa.training.dto;

import com.insa.training.enums.ContractStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingObligationResponse {
    private Long id;
    private Long contractId;
    private String employeeName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer obligationMonths;
    private ContractStatus status;
    private LocalDateTime releasedAt;
    private Boolean guarantorReleased;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
