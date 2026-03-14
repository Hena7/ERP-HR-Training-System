package com.insa.education.controller;

import com.insa.education.dto.request.HRVerificationDto;
import com.insa.education.dto.response.HRVerificationResponse;
import com.insa.education.service.HRVerificationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hr-verifications")
public class HRVerificationController {

    private final HRVerificationService verificationService;

    public HRVerificationController(HRVerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HR_OFFICER', 'ADMIN')")
    public ResponseEntity<HRVerificationResponse> verify(@Valid @RequestBody HRVerificationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(verificationService.verify(dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('HR_OFFICER', 'ADMIN')")
    public ResponseEntity<Page<HRVerificationResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(verificationService.getAll(pageable));
    }

    @GetMapping("/request/{requestId}")
    @PreAuthorize("hasAnyRole('HR_OFFICER', 'ADMIN')")
    public ResponseEntity<HRVerificationResponse> getByRequestId(@PathVariable Long requestId) {
        return ResponseEntity.ok(verificationService.getByRequestId(requestId));
    }
}
