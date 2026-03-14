package com.insa.education.dto.response;

import com.insa.education.enums.Gender;
import com.insa.education.enums.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeResponse {
    private Long id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private Gender gender;
    private String phone;
    private String email;
    private String department;
    private String position;
    private Role role;
    private LocalDateTime createdAt;
}
