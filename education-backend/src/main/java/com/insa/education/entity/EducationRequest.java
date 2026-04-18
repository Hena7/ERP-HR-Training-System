package com.insa.education.entity;

import com.insa.education.enums.RequestStatus;
import com.insa.education.enums.CommitmentSource;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "education_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = true)
    private Employee employee;

    @Column(name = "manual_employee_name")
    private String manualEmployeeName;

    @Column(name = "manual_employee_dept")
    private String manualEmployeeDept;

    @Column(name = "manual_employee_phone")
    private String manualEmployeePhone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id", nullable = true)
    private EducationOpportunity opportunity;

    @Column(name = "education_category")
    private String educationCategory;

    @Column(name = "field_of_study")
    private String fieldOfStudy;

    @Column(name = "institution")
    private String institution;

    @Column(name = "target_education_level")
    private String targetEducationLevel;

    @Column(name = "budget_year")
    private Integer budgetYear;

    @Column(name = "award")
    private String award;

    @Column(name = "duration")
    private Double duration;

    @Column(name = "program_time")
    private String programTime;

    @Column(name = "location")
    private String location;

    @Column(name = "current_education_level", length = 100)
    private String currentEducationLevel;

    @Column(name = "work_experience")
    private Double workExperience;

    @Column(name = "performance_score")
    private Double performanceScore;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING_DEPARTMENT_SUBMISSION;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "commitment_source")
    private CommitmentSource commitmentSource;

    @Column(name = "total_score")
    private Double totalScore;

    @Column(name = "candidate_id", length = 50)
    private String candidateId;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
