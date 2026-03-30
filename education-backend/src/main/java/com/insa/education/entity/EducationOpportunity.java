package com.insa.education.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "education_opportunity_target_departments",
            joinColumns = @JoinColumn(name = "opportunity_id")
    )
    @Column(name = "department_name", nullable = false)
    @Builder.Default
    private List<String> targetDepartments = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private String status = "OPEN";

    @Column
    private LocalDateTime deadline;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        normalizeTargetDepartments();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        normalizeTargetDepartments();
    }

    private void normalizeTargetDepartments() {
        if (this.targetDepartments == null) {
            this.targetDepartments = new ArrayList<>();
            return;
        }

        this.targetDepartments = this.targetDepartments.stream()
                .filter(value -> value != null && !value.trim().isEmpty())
                .map(String::trim)
                .distinct()
                .toList();
    }
}
