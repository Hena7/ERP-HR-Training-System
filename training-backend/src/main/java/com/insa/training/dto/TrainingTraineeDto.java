package com.insa.training.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingTraineeDto {
    private Long id;
    private String employeeId;
    private String fullName;
    private String department;
    private String email;
    private String phone;
    private String city;
    private String houseNo;
}
