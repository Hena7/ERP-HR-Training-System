package com.insa.training.entity;

import com.insa.training.enums.ContractStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "training_contracts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingContract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_id", nullable = false)
    private Long requestId;

    @Column(name = "employee_id", nullable = false)
    private String employeeId;

    @Column(name = "employee_name", nullable = false)
    private String employeeName;

    @Column(name = "employee_department", nullable = false)
    private String employeeDepartment;

    private String city;

    @Column(name = "house_no")
    private String houseNo;

    private String email;

    private String phone;

    @Column(name = "training_country", nullable = false)
    private String trainingCountry;

    @Column(name = "training_city", nullable = false)
    private String trainingCity;

    @Column(name = "training_type", nullable = false)
    private String trainingType;

    @Column(name = "total_cost", nullable = false)
    private Double totalCost;

    @Column(name = "contract_duration_months", nullable = false)
    private Integer contractDurationMonths;

    @Column(name = "signed_date", nullable = false)
    private LocalDateTime signedDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ContractStatus status = ContractStatus.ACTIVE;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
