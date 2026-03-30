package com.insa.training.dto;

import com.insa.training.enums.ContractStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingObligationDto {
    private Long contractId;
    private String employeeName;
    private String startDate;
    private String endDate;
    private Integer obligationMonths;
}
