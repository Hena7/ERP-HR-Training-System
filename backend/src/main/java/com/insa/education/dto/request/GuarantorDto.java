package com.insa.education.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuarantorDto {

    @NotNull(message = "Contract ID is required")
    private Long contractId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "National ID is required")
    private String nationalId;

    @NotBlank(message = "Phone is required")
    private String phone;

    private String address;
}
