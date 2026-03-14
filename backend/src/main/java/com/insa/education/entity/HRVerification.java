package com.insa.education.entity;

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

    @Column(name = "work_experience")
    private Integer workExperience;

    @Column(name = "performance_score")
    private Integer performanceScore;

    @Column(name = "discipline_record")
    private Boolean disciplineRecord;

    @Column(name = "verified_by", length = 100)
    private String verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @PrePersist
    protected void onCreate() {
        this.verifiedAt = LocalDateTime.now();
    }
}
