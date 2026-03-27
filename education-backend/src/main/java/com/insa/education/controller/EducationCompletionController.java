package com.insa.education.controller;

import com.insa.education.dto.request.EducationCompletionDto;
import com.insa.education.dto.response.EducationCompletionResponse;
import com.insa.education.service.EducationCompletionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/education-completions")
public class EducationCompletionController {

    private final EducationCompletionService completionService;

    public EducationCompletionController(EducationCompletionService completionService) {
        this.completionService = completionService;
    }

    @PostMapping
    public ResponseEntity<EducationCompletionResponse> create(@Valid @RequestBody EducationCompletionDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(completionService.create(dto));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<EducationCompletionResponse> getByContractId(@PathVariable Long contractId) {
        return ResponseEntity.ok(completionService.getByContractId(contractId));
    }

    @GetMapping
    public ResponseEntity<Page<EducationCompletionResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(completionService.getAll(pageable));
    }
}
