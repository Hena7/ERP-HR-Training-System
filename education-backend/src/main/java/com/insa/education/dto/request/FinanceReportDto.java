package com.insa.education.dto.request;

import lombok.Data;

@Data
public class FinanceReportDto {
    private Long contractId;
    private String employeeId;
    private String reportingPeriod;
    private String periodValue;
    private Double tuitionFees;
    private Double livingAllowance;
    private Double otherExpenses;
    private String currency;
    private String description;
}
