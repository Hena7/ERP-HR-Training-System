package com.insa.education.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuarantorResponse {
    private Long id;
    private Long contractId;
    private String fullName;
    private String nationalId;
    private String phone;
    private String address;
    private String guarantorType;
    private String scannedDocument;
    private LocalDateTime createdAt;
}
