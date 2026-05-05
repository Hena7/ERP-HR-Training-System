package com.insa.training.controller;

import com.insa.training.dto.TrainingWitnessDto;
import com.insa.training.dto.TrainingWitnessResponse;
import com.insa.training.service.TrainingWitnessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/training-witnesses")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('HR_OFFICER', 'ADMIN')")
public class TrainingWitnessController {

    private final TrainingWitnessService service;

    @PostMapping
    public ResponseEntity<TrainingWitnessResponse> create(@RequestBody TrainingWitnessDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<TrainingWitnessResponse>> getByContract(@PathVariable Long contractId) {
        return ResponseEntity.ok(service.getByContract(contractId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrainingWitnessResponse> update(@PathVariable Long id, @RequestBody TrainingWitnessDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
