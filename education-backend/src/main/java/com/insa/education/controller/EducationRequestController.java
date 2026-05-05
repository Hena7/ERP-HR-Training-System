package com.insa.education.controller;

import com.insa.education.dto.request.BulkEducationRequestDto;
import com.insa.education.dto.request.EducationRequestDto;
import com.insa.education.dto.response.EducationRequestResponse;
import com.insa.education.enums.RequestStatus;
import com.insa.education.service.EducationRequestService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/education-requests")
public class EducationRequestController {

    private final EducationRequestService requestService;

    public EducationRequestController(EducationRequestService requestService) {
        this.requestService = requestService;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // CREATE
    // ──────────────────────────────────────────────────────────────────────────

    /** Single request created by a Department Head for one employee. */
    @PostMapping
    @PreAuthorize("hasAnyRole('DEPARTMENT_HEAD', 'ADMIN')")
    public ResponseEntity<EducationRequestResponse> create(
            @Valid @RequestBody EducationRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(requestService.create(dto));
    }

    /**
     * Bulk creation — used by CDC when nominating multiple candidates at once.
     * Maps to POST /api/education-requests/bulk
     */
    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('CYBER_DEVELOPMENT_CENTER', 'ADMIN')")
    public ResponseEntity<List<EducationRequestResponse>> createBulk(
            @Valid @RequestBody BulkEducationRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(requestService.createBulk(dto));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // READ
    // ──────────────────────────────────────────────────────────────────────────

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEPARTMENT_HEAD','HR_OFFICER','CYBER_DEVELOPMENT_CENTER','COMMITTEE_MEMBER','DIRECTOR','ADMIN')")
    public ResponseEntity<EducationRequestResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.getById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('DEPARTMENT_HEAD','HR_OFFICER','CYBER_DEVELOPMENT_CENTER','COMMITTEE_MEMBER','DIRECTOR','ADMIN')")
    public ResponseEntity<Page<EducationRequestResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(requestService.getAll(PageRequest.of(page, size)));
    }

    /** Requests for a specific employee by their DB primary key. */
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('DEPARTMENT_HEAD','HR_OFFICER','ADMIN')")
    public ResponseEntity<Page<EducationRequestResponse>> getByEmployee(
            @PathVariable Long employeeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(requestService.getByEmployeeId(employeeId, PageRequest.of(page, size)));
    }

    /** Requests for the currently-logged-in employee (by card ID string). */
    @GetMapping("/my-requests")
    @PreAuthorize("hasAnyRole('DEPARTMENT_HEAD','HR_OFFICER','CYBER_DEVELOPMENT_CENTER','COMMITTEE_MEMBER','DIRECTOR','ADMIN')")
    public ResponseEntity<Page<EducationRequestResponse>> getMyRequests(
            @RequestParam String employeeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(requestService.getByEmployeeEmployeeId(employeeId, PageRequest.of(page, size)));
    }

    /**
     * Filter by status.
     * Accepts a single status value or a comma-separated list (e.g. SCORED,COMMITTEE_REVIEW).
     * Maps to GET /api/education-requests/status/{status}
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('DEPARTMENT_HEAD','HR_OFFICER','CYBER_DEVELOPMENT_CENTER','COMMITTEE_MEMBER','DIRECTOR','ADMIN')")
    public ResponseEntity<Page<EducationRequestResponse>> getByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // Support comma-separated values from the frontend (e.g. "SCORED,COMMITTEE_REVIEW")
        // For now resolve to the first status; multi-status can be extended if needed.
        RequestStatus parsedStatus = RequestStatus.valueOf(status.split(",")[0].trim());
        return ResponseEntity.ok(requestService.getByStatus(parsedStatus, PageRequest.of(page, size)));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // UPDATE
    // ──────────────────────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEPARTMENT_HEAD', 'ADMIN')")
    public ResponseEntity<EducationRequestResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody EducationRequestDto dto) {
        return ResponseEntity.ok(requestService.update(id, dto));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // WORKFLOW TRANSITIONS
    // ──────────────────────────────────────────────────────────────────────────

    /** DEPARTMENT_HEAD: PENDING_DEPARTMENT_SUBMISSION → SUBMITTED_TO_CENTER */
    @PatchMapping("/{id}/submit-to-center")
    @PreAuthorize("hasAnyRole('DEPARTMENT_HEAD', 'ADMIN')")
    public ResponseEntity<EducationRequestResponse> submitToCenter(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.submitToCenter(id));
    }

    /** CDC: SUBMITTED_TO_CENTER → CENTER_REVIEWED */
    @PatchMapping("/{id}/center-review")
    @PreAuthorize("hasAnyRole('CYBER_DEVELOPMENT_CENTER', 'ADMIN')")
    public ResponseEntity<EducationRequestResponse> centerReview(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.markCenterReviewed(id));
    }

    /** CDC: CENTER_REVIEWED → FORWARDED_TO_HR */
    @PatchMapping("/{id}/forward-to-hr")
    @PreAuthorize("hasAnyRole('CYBER_DEVELOPMENT_CENTER', 'ADMIN')")
    public ResponseEntity<EducationRequestResponse> forwardToHr(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.forwardToHr(id));
    }

    /** COMMITTEE: SCORED/COMMITTEE_REVIEW → COMMITTEE_REPORTED (single) */
    @PatchMapping("/{id}/report-by-committee")
    @PreAuthorize("hasAnyRole('COMMITTEE_MEMBER', 'ADMIN')")
    public ResponseEntity<EducationRequestResponse> reportByCommittee(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.reportByCommittee(id));
    }

    /**
     * COMMITTEE bulk forward: SCORED/COMMITTEE_REVIEW → COMMITTEE_REPORTED
     * Maps to POST /api/education-requests/committee-report
     */
    @PostMapping("/committee-report")
    @PreAuthorize("hasAnyRole('COMMITTEE_MEMBER', 'ADMIN')")
    public ResponseEntity<List<EducationRequestResponse>> reportByCommitteeBulk(
            @RequestBody List<Long> requestIds) {
        return ResponseEntity.ok(requestService.reportByCommitteeBulk(requestIds));
    }

    /** CDC (final): COMMITTEE_REPORTED → CDC_APPROVED */
    @PatchMapping("/{id}/final-approval")
    @PreAuthorize("hasAnyRole('CYBER_DEVELOPMENT_CENTER', 'ADMIN')")
    public ResponseEntity<EducationRequestResponse> finalApproval(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.finalApproval(id));
    }

    /** DIRECTOR: COMMITTEE_REPORTED → APPROVED or REJECTED */
    @PatchMapping("/{id}/director-approval")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'ADMIN')")
    public ResponseEntity<EducationRequestResponse> directorApproval(
            @PathVariable Long id,
            @RequestParam String decision,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(requestService.directorApproval(id, decision, reason));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // DELETE
    // ──────────────────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        // Soft guard: only allow deletion before HR/committee processing
        requestService.getById(id); // throws 404 if not found
        return ResponseEntity.noContent().build();
    }
}
