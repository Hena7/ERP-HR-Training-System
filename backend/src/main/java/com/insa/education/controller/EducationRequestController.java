package com.insa.education.controller;

import com.insa.education.dto.request.EducationRequestDto;
import com.insa.education.dto.response.EducationRequestResponse;
import com.insa.education.enums.RequestStatus;
import com.insa.education.service.EducationRequestService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/education-requests")
public class EducationRequestController {

    private final EducationRequestService requestService;

    public EducationRequestController(EducationRequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<EducationRequestResponse> create(@Valid @RequestBody EducationRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(requestService.create(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EducationRequestResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.getById(id));
    }

    @GetMapping
    public ResponseEntity<Page<EducationRequestResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(requestService.getAll(pageable));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<Page<EducationRequestResponse>> getByEmployeeId(
            @PathVariable Long employeeId, Pageable pageable) {
        return ResponseEntity.ok(requestService.getByEmployeeId(employeeId, pageable));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<EducationRequestResponse>> getByStatus(
            @PathVariable RequestStatus status, Pageable pageable) {
        return ResponseEntity.ok(requestService.getByStatus(status, pageable));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<EducationRequestResponse> update(
            @PathVariable Long id, @Valid @RequestBody EducationRequestDto dto) {
        return ResponseEntity.ok(requestService.update(id, dto));
    }
}
