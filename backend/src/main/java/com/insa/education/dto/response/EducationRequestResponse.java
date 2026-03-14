package com.insa.education.dto.response;

import com.insa.education.enums.RequestStatus;
import com.insa.education.enums.StudyMode;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationRequestResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String requestedField;
    private String requestedLevel;
    private String university;
    private String country;
    private StudyMode studyMode;
    private String description;
    private RequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
