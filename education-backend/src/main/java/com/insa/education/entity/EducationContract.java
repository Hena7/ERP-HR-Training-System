package com.insa.education.entity;

import com.insa.education.enums.StudyMode;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "education_contracts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationContract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = true)
    private Employee employee;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false, unique = true)
    private EducationRequest request;

    @Column(nullable = false, length = 200)
    private String university;

    @Column(nullable = false, length = 200)
    private String program;

    @Column(name = "study_country", nullable = false, length = 100)
    private String studyCountry;

    @Column(name = "study_city", nullable = false, length = 100)
    private String studyCity;

    @Column(name = "duration_years", nullable = false)
    private Integer durationYears;

    @Enumerated(EnumType.STRING)
    @Column(name = "study_mode", nullable = false)
    private StudyMode studyMode;

    @Column(name = "estimated_cost", precision = 15, scale = 2)
    private BigDecimal estimatedCost;

    @Column(name = "contract_signed_date")
    private LocalDate contractSignedDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
