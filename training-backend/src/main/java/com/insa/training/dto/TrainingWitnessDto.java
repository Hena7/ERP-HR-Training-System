package com.insa.training.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingWitnessDto {
    private Long contractId;
    private String fullName;
    private String nationalId;
    private String address;
    private String phone;
}
