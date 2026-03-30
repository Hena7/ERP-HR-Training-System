package com.insa.training.dto;

import com.insa.training.enums.ContractStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingContractDto {
    private Long requestId;
    private String employeeId;
    private String employeeName;
    private String employeeDepartment;
    private String city;
    private String houseNo;
    private String email;
    private String phone;
    private String trainingCountry;
    private String trainingCity;
    private String trainingType;
    private Double totalCost;
    private Integer contractDurationMonths;
    private String signedDate; // Expecting ISO-8601
}
