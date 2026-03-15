package com.insa.education.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "education_opportunities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationOpportunity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "education_type", nullable = false)
    private String educationType;

    @Column(name = "education_level", nullable = false)
    private String educationLevel;

    @Column(nullable = false)
    private String institution;

    @Column(nullable = false)
    private String department;

    @Column(columnDefinition = "TEXT")
    private String description;

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
