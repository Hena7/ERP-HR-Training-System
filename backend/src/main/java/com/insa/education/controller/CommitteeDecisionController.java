package com.insa.education.controller;

import com.insa.education.dto.request.CommitteeDecisionDto;
import com.insa.education.dto.response.CommitteeDecisionResponse;
import com.insa.education.service.CommitteeDecisionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/committee-decisions")
public class CommitteeDecisionController {

    private final CommitteeDecisionService decisionService;

    public CommitteeDecisionController(CommitteeDecisionService decisionService) {
        this.decisionService = decisionService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COMMITTEE_MEMBER', 'ADMIN')")
    public ResponseEntity<CommitteeDecisionResponse> decide(@Valid @RequestBody CommitteeDecisionDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(decisionService.decide(dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('COMMITTEE_MEMBER', 'ADMIN')")
    public ResponseEntity<Page<CommitteeDecisionResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(decisionService.getAll(pageable));
    }

    @GetMapping("/request/{requestId}")
    @PreAuthorize("hasAnyRole('COMMITTEE_MEMBER', 'ADMIN')")
    public ResponseEntity<CommitteeDecisionResponse> getByRequestId(@PathVariable Long requestId) {
        return ResponseEntity.ok(decisionService.getByRequestId(requestId));
    }
}
