package com.insa.training.controller;

import com.insa.training.dto.TrainingGuarantorDto;
import com.insa.training.dto.TrainingGuarantorResponse;
import com.insa.training.service.TrainingGuarantorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/training-guarantors")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('HR_OFFICER', 'ADMIN')")
public class TrainingGuarantorController {

    private final TrainingGuarantorService service;

    @PostMapping
    public ResponseEntity<TrainingGuarantorResponse> create(@RequestBody TrainingGuarantorDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<TrainingGuarantorResponse>> getByContract(@PathVariable Long contractId) {
        return ResponseEntity.ok(service.getByContract(contractId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrainingGuarantorResponse> update(@PathVariable Long id, @RequestBody TrainingGuarantorDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
