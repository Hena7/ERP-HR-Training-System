package com.insa.training.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "training_guarantors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingGuarantor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "national_id", nullable = false)
    private String nationalId;

    @Column(name = "current_address", nullable = false)
    private String currentAddress;

    @Column(name = "birth_address")
    private String birthAddress;

    private String phone;

    @Column(name = "scanned_document")
    private String scannedDocument;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
