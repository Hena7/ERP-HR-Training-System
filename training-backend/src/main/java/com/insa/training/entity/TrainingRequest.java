package com.insa.training.entity;

import com.insa.training.enums.TrainingStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "training_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String department;

    private String sector;

    @Column(name = "training_title", nullable = false)
    private String trainingTitle;

    @Column(name = "estimated_cost", nullable = false)
    private Double estimatedCost;

    @Column(name = "num_trainees", nullable = false)
    private Integer numTrainees;

    @Column(name = "training_duration", nullable = false)
    private String trainingDuration;

    @Column(name = "training_location", nullable = false)
    private String trainingLocation;

    @Column(name = "budget_source", nullable = false)
    private String budgetSource;

    @Column(columnDefinition = "TEXT")
    private String specification;

    @Column(name = "requester_name")
    private String requesterName;

    @Column(name = "requester_id")
    private String requesterId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TrainingStatus status = TrainingStatus.SUBMITTED;

    @Column(name = "review_note", columnDefinition = "TEXT")
    private String reviewNote;

    @Column(name = "contract_id")
    private Long contractId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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
