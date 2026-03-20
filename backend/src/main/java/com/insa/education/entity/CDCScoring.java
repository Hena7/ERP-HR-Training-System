package com.insa.education.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cdc_scorings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CDCScoring {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false, unique = true)
    private EducationRequest request;

    /**
     * Raw score (0–100) for work experience, weighted at 30%.
     */
    @Column(name = "experience_score", nullable = false)
    private Double experienceScore;

    /**
     * Raw score (0–100) for academic performance, weighted at 50%.
     */
    @Column(name = "performance_score", nullable = false)
    private Double performanceScore;

    /**
     * Raw score (0–100) for discipline record, weighted at 20%.
     */
    @Column(name = "discipline_score", nullable = false)
    private Double disciplineScore;

    /**
     * Total weighted score (%):
     * totalScore = (experienceScore * 0.30) + (performanceScore * 0.50) + (disciplineScore * 0.20)
     */
    @Column(name = "total_score", nullable = false)
    private Double totalScore;

    @Column(name = "graded_by", length = 100)
    private String gradedBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
