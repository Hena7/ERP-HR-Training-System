package com.insa.training.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "training_trainees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingTrainee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private String employeeId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String department;
    private String email;
    private String phone;
    private String city;

    @Column(name = "house_no")
    private String houseNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_request_id")
    private TrainingRequest trainingRequest;
}
