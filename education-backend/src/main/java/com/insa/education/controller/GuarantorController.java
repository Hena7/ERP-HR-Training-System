package com.insa.education.controller;

import com.insa.education.dto.request.GuarantorDto;
import com.insa.education.dto.response.GuarantorResponse;
import com.insa.education.service.GuarantorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guarantors")
public class GuarantorController {

    private final GuarantorService guarantorService;

    public GuarantorController(GuarantorService guarantorService) {
        this.guarantorService = guarantorService;
    }

    @PostMapping
    public ResponseEntity<GuarantorResponse> create(@Valid @RequestBody GuarantorDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(guarantorService.create(dto));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<GuarantorResponse>> getByContractId(@PathVariable Long contractId) {
        return ResponseEntity.ok(guarantorService.getByContractId(contractId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        guarantorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
