package com.insa.training.controller;

import com.insa.training.dto.TrainingContractDto;
import com.insa.training.dto.TrainingContractResponse;
import com.insa.training.service.TrainingContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/training-contracts")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('HR_OFFICER', 'ADMIN')")
public class TrainingContractController {

    private final TrainingContractService service;

    @PostMapping
    public ResponseEntity<TrainingContractResponse> create(@RequestBody TrainingContractDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<TrainingContractResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainingContractResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }
}
