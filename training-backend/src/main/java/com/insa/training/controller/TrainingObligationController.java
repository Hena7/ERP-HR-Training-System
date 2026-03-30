package com.insa.training.controller;

import com.insa.training.dto.TrainingObligationDto;
import com.insa.training.dto.TrainingObligationResponse;
import com.insa.training.enums.ContractStatus;
import com.insa.training.service.TrainingObligationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/training-obligations")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('HR_OFFICER', 'ADMIN')")
public class TrainingObligationController {

    private final TrainingObligationService service;

    @PostMapping
    public ResponseEntity<TrainingObligationResponse> create(@RequestBody TrainingObligationDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<TrainingObligationResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TrainingObligationResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam ContractStatus status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }
}
