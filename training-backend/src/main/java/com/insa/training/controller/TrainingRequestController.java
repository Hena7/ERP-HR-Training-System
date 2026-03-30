package com.insa.training.controller;

import com.insa.training.dto.TrainingRequestDto;
import com.insa.training.dto.TrainingRequestResponse;
import com.insa.training.enums.TrainingStatus;
import com.insa.training.service.TrainingRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/training-requests")
@RequiredArgsConstructor
public class TrainingRequestController {

    private final TrainingRequestService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'DEPARTMENT_HEAD', 'ADMIN')")
    public ResponseEntity<TrainingRequestResponse> create(@RequestBody TrainingRequestDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('HR_OFFICER', 'ADMIN', 'DEPARTMENT_HEAD')")
    public ResponseEntity<List<TrainingRequestResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainingRequestResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('HR_OFFICER', 'ADMIN')")
    public ResponseEntity<TrainingRequestResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam TrainingStatus status,
            @RequestParam(required = false) String note) {
        return ResponseEntity.ok(service.updateStatus(id, status, note));
    }
}
