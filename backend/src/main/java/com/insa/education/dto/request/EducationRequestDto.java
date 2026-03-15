package com.insa.education.dto.request;

import com.insa.education.enums.StudyMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationRequestDto {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Opportunity ID is required")
    private Long opportunityId;

    @NotBlank(message = "Country is required")
    private String country;

    @NotNull(message = "Study mode is required")
    private StudyMode studyMode;

    private String description;
}
