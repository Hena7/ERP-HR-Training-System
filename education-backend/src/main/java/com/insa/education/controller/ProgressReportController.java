package com.insa.education.controller;

import com.insa.education.dto.request.ProgressReportDto;
import com.insa.education.dto.response.ProgressReportResponse;
import com.insa.education.service.ProgressReportService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress-reports")
public class ProgressReportController {

    private final ProgressReportService reportService;

    public ProgressReportController(ProgressReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<ProgressReportResponse> create(@Valid @RequestBody ProgressReportDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.create(dto));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<Page<ProgressReportResponse>> getByContractId(
            @PathVariable Long contractId, Pageable pageable) {
        return ResponseEntity.ok(reportService.getByContractId(contractId, pageable));
    }

    @GetMapping
    public ResponseEntity<Page<ProgressReportResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(reportService.getAll(pageable));
    }
}
