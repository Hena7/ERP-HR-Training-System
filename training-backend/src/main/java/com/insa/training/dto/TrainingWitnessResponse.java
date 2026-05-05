package com.insa.training.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingWitnessResponse {
    private Long id;
    private Long contractId;
    private String fullName;
    private String nationalId;
    private String address;
    private String phone;
    private LocalDateTime createdAt;
}
