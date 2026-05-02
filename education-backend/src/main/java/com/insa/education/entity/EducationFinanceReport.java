package com.insa.education.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "education_finance_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EducationFinanceReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long contractId;
    private String employeeId;
    
    private String reportingPeriod; // Monthly, Termly
    private String periodValue; // e.g. "2024-09" or "Term 1"
    
    private Double tuitionFees;
    private Double livingAllowance;
    private Double otherExpenses;
    private Double totalAmount;
    
    private String currency;
    private String description;
    
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    
    private String status; // PENDING, APPROVED, REJECTED
}
