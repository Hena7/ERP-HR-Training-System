package com.insa.education.entity;

import com.insa.education.enums.DecisionStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "committee_decisions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommitteeDecision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false, unique = true)
    private EducationRequest request;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DecisionStatus decision;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "decided_by", length = 100)
    private String decidedBy;

    @Column(name = "decision_date")
    private LocalDateTime decisionDate;

    @PrePersist
    protected void onCreate() {
        this.decisionDate = LocalDateTime.now();
    }
}
