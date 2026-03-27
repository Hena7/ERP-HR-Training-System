package com.insa.education.controller;

import com.insa.education.dto.response.ServiceObligationResponse;
import com.insa.education.service.ServiceObligationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/service-obligations")
public class ServiceObligationController {

    private final ServiceObligationService obligationService;

    public ServiceObligationController(ServiceObligationService obligationService) {
        this.obligationService = obligationService;
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<ServiceObligationResponse> getByContractId(@PathVariable Long contractId) {
        return ResponseEntity.ok(obligationService.getByContractId(contractId));
    }

    @GetMapping
    public ResponseEntity<Page<ServiceObligationResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(obligationService.getAll(pageable));
    }
}
