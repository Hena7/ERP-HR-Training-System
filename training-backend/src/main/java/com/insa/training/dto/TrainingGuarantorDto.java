package com.insa.training.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingGuarantorDto {
    private Long contractId;
    private String fullName;
    private String nationalId;
    private String currentAddress;
    private String birthAddress;
    private String phone;
    private String scannedDocument;
}
