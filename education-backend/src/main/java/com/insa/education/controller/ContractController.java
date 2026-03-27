package com.insa.education.controller;

import com.insa.education.dto.request.ContractDto;
import com.insa.education.dto.response.ContractResponse;
import com.insa.education.service.ContractService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contracts")
public class ContractController {

    private final ContractService contractService;

    public ContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CYBER_DEVELOPMENT_CENTER', 'ADMIN')")
    public ResponseEntity<ContractResponse> create(@Valid @RequestBody ContractDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contractService.create(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContractResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contractService.getById(id));
    }

    @GetMapping
    public ResponseEntity<Page<ContractResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(contractService.getAll(pageable));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<Page<ContractResponse>> getByEmployeeId(
            @PathVariable Long employeeId, Pageable pageable) {
        return ResponseEntity.ok(contractService.getByEmployeeId(employeeId, pageable));
    }
}
