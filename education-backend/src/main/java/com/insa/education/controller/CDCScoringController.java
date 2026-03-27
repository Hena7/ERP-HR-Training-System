package com.insa.education.controller;

import com.insa.education.dto.request.CDCScoringDto;
import com.insa.education.dto.response.CDCScoringResponse;
import com.insa.education.service.CDCScoringService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cdc-scorings")
public class CDCScoringController {

    private final CDCScoringService scoringService;

    public CDCScoringController(CDCScoringService scoringService) {
        this.scoringService = scoringService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CYBER_DEVELOPMENT_CENTER', 'ADMIN')")
    public ResponseEntity<CDCScoringResponse> score(@Valid @RequestBody CDCScoringDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(scoringService.score(dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CYBER_DEVELOPMENT_CENTER', 'ADMIN', 'COMMITTEE_MEMBER')")
    public ResponseEntity<Page<CDCScoringResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(scoringService.getAll(pageable));
    }

    @GetMapping("/request/{requestId}")
    @PreAuthorize("hasAnyRole('CYBER_DEVELOPMENT_CENTER', 'ADMIN', 'COMMITTEE_MEMBER')")
    public ResponseEntity<CDCScoringResponse> getByRequestId(@PathVariable Long requestId) {
        return ResponseEntity.ok(scoringService.getByRequestId(requestId));
    }
}
