package com.insa.education.controller;

import com.insa.education.dto.request.EducationOpportunityDto;
import com.insa.education.dto.response.EducationOpportunityResponse;
import com.insa.education.service.EducationOpportunityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/education-opportunities")
@RequiredArgsConstructor
public class EducationOpportunityController {

    private final EducationOpportunityService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EDUCATION_CENTER')")
    public ResponseEntity<EducationOpportunityResponse> create(@Valid @RequestBody EducationOpportunityDto dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDUCATION_CENTER')")
    public ResponseEntity<EducationOpportunityResponse> update(@PathVariable Long id, @Valid @RequestBody EducationOpportunityDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDUCATION_CENTER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EducationOpportunityResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<Page<EducationOpportunityResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(service.getAll(pageable));
    }
}
