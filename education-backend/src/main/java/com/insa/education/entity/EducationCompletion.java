package com.insa.education.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "education_completions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false, unique = true)
    private EducationContract contract;

    @Column(name = "completion_date", nullable = false)
    private LocalDate completionDate;

    @Column(name = "return_to_work_date")
    private LocalDate returnToWorkDate;

    @Column(name = "research_presentation_date")
    private LocalDate researchPresentationDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "sent_to_hr")
    @Builder.Default
    private Boolean sentToHr = false;

    @Column(name = "notified_kmc")
    @Builder.Default
    private Boolean notifiedKmc = false;

    @Column(name = "hr_acknowledged")
    @Builder.Default
    private Boolean hrAcknowledged = false;

    @Column(name = "kmc_acknowledged")
    @Builder.Default
    private Boolean kmcAcknowledged = false;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
