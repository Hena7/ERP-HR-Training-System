package com.insa.education.controller;

import com.insa.education.dto.request.FinanceReportDto;
import com.insa.education.entity.EducationFinanceReport;
import com.insa.education.service.EducationFinanceReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/finance-reports")
public class EducationFinanceReportController {

    private final EducationFinanceReportService service;

    public EducationFinanceReportController(EducationFinanceReportService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<EducationFinanceReport> create(@RequestBody FinanceReportDto dto) {
        return ResponseEntity.ok(service.createReport(dto));
    }

    @GetMapping("/contract/{contractId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_OFFICER', 'EMPLOYEE')")
    public ResponseEntity<List<EducationFinanceReport>> getByContract(@PathVariable Long contractId) {
        return ResponseEntity.ok(service.getByContractId(contractId));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_OFFICER', 'EMPLOYEE')")
    public ResponseEntity<List<EducationFinanceReport>> getByEmployee(@PathVariable String employeeId) {
        return ResponseEntity.ok(service.getByEmployeeId(employeeId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_OFFICER')")
    public ResponseEntity<List<EducationFinanceReport>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }
}
