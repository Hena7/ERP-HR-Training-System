package com.insa.education.entity;

import com.insa.education.enums.HRVerificationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "hr_verifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HRVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false, unique = true)
    private EducationRequest request;

    @Column(name = "semester_1_score", nullable = false)
    private Double semester1Score;

    @Column(name = "semester_2_score", nullable = false)
    private Double semester2Score;

    @Column(name = "average_score", nullable = false)
    private Double averageScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private HRVerificationStatus status;

    @Column(name = "verified_by", length = 100)
    private String verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @PrePersist
    protected void onCreate() {
        this.verifiedAt = LocalDateTime.now();
        calculateAverage();
    }

    @PreUpdate
    protected void onUpdate() {
        calculateAverage();
    }

    private void calculateAverage() {
        if (semester1Score != null && semester2Score != null) {
            this.averageScore = (semester1Score + semester2Score) / 2.0;
        }
    }
}
