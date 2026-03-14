package com.insa.education.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "education_progress_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationProgressReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private EducationContract contract;

    @Column(name = "report_month", nullable = false)
    private LocalDate reportMonth;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        this.submittedAt = LocalDateTime.now();
    }
}
