package com.insa.training.dto;

import com.insa.training.enums.TrainingStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingRequestDto {
    private String department;
    private String sector;
    private String trainingTitle;
    private Double estimatedCost;
    private Integer numTrainees;
    private String trainingDuration;
    private String trainingLocation;
    private String budgetSource;
    private String specification;
    private String requesterName;
    private String requesterId;
    private String requesterEmail;
    private String requesterPhone;
    private String requesterGender;
    private String requesterPosition;
}
