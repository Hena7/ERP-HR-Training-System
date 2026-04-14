package com.insa.education.controller;

import com.insa.education.dto.request.BulkEducationRequestDto;
import com.insa.education.dto.request.EducationRequestDto;
import com.insa.education.dto.response.EducationRequestResponse;
import com.insa.education.enums.RequestStatus;
import com.insa.education.service.EducationRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/education-requests")
@RequiredArgsConstructor
public class EducationRequestController {

    private final EducationRequestService requestService;

    /**
     * Department Head creates a request draft for an employee in their department.
     * Initial workflow status:
     * PENDING_DEPARTMENT_SUBMISSION
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('DEPARTMENT_HEAD', 'ADMIN')")
    public ResponseEntity<EducationRequestResponse> create(@Valid @RequestBody EducationRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(requestService.create(dto));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('DEPARTMENT_HEAD', 'ADMIN')")
    public ResponseEntity<List<EducationRequestResponse>> createBulk(@Valid @RequestBody BulkEducationRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(requestService.createBulk(dto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEPARTMENT_HEAD', 'HR_OFFICER', 'CYBER_DEVELOPMENT_CENTER', 'COMMITTEE_MEMBER', 'ADMIN')")
    public ResponseEntity<EducationRequestResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.getById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('DEPARTMENT_HEAD', 'HR_OFFICER', 'CYBER_DEVELOPMENT_CENTER', 'COMMITTEE_MEMBER', 'ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Page<EducationRequestResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(requestService.getAll(pageable));
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'DEPARTMENT_HEAD', 'ADMIN')")
    public ResponseEntity<Page<EducationRequestResponse>> getMyRequests(
            @RequestParam String employeeId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(requestService.getByEmployeeEmployeeId(employeeId, pageable));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('DEPARTMENT_HEAD', 'HR_OFFICER', 'CYBER_DEVELOPMENT_CENTER', 'ADMIN')")
    public ResponseEntity<Page<EducationRequestResponse>> getByEmployeeId(
            @PathVariable Long employeeId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(requestService.getByEmployeeId(employeeId, pageable));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('DEPARTMENT_HEAD', 'HR_OFFICER', 'CYBER_DEVELOPMENT_CENTER', 'COMMITTEE_MEMBER', 'ADMIN')")
    public ResponseEntity<Page<EducationRequestResponse>> getByStatus(
            @PathVariable RequestStatus status,
            Pageable pageable
    ) {
        return ResponseEntity.ok(requestService.getByStatus(status, pageable));
    }

    /**
     * Department Head can update request details before downstream processing starts.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEPARTMENT_HEAD', 'ADMIN')")
    public ResponseEntity<EducationRequestResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody EducationRequestDto dto
    ) {
        return ResponseEntity.ok(requestService.update(id, dto));
    }

    /**
     * Department Head submits request package to Cyber Development Center.
     * Workflow:
     * PENDING_DEPARTMENT_SUBMISSION -> SUBMITTED_TO_CENTER
     */
    @PatchMapping("/{id}/submit-to-center")
    @PreAuthorize("hasAnyRole('DEPARTMENT_HEAD', 'ADMIN')")
    public ResponseEntity<EducationRequestResponse> submitToCenter(@PathVariable Long id) {
        return ResponseEntity.ok(
                requestService.transitionStatus(
                        id,
                        RequestStatus.PENDING_DEPARTMENT_SUBMISSION,
                        RequestStatus.SUBMITTED_TO_CENTER,
                        "Department submission to Cyber Development Center"
                )
        );
    }

    /**
     * Cyber Development Center reviews request submitted by department.
     * Workflow:
     * SUBMITTED_TO_CENTER -> CENTER_REVIEWED
     */
    @PatchMapping("/{id}/center-review")
    @PreAuthorize("hasAnyRole('CYBER_DEVELOPMENT_CENTER', 'ADMIN')")
    public ResponseEntity<EducationRequestResponse> centerReview(@PathVariable Long id) {
        return ResponseEntity.ok(
                requestService.transitionStatus(
                        id,
                        RequestStatus.SUBMITTED_TO_CENTER,
                        RequestStatus.CENTER_REVIEWED,
                        "Cyber Development Center review completed"
                )
        );
    }

    /**
     * Cyber Development Center forwards reviewed request to HR.
     * Workflow:
     * CENTER_REVIEWED -> FORWARDED_TO_HR
     */
    @PatchMapping("/{id}/forward-to-hr")
    @PreAuthorize("hasAnyRole('CYBER_DEVELOPMENT_CENTER', 'ADMIN')")
    public ResponseEntity<EducationRequestResponse> forwardToHr(@PathVariable Long id) {
        return ResponseEntity.ok(
                requestService.transitionStatus(
                        id,
                        RequestStatus.CENTER_REVIEWED,
                        RequestStatus.FORWARDED_TO_HR,
                        "Forwarded to HR by Cyber Development Center"
                )
        );
    /**
     * Committee members report their selection results to CDC.
     * Workflow:
     * COMMITTEE_REVIEW -> COMMITTEE_REPORTED
     */
    @PatchMapping("/{id}/report-by-committee")
    @PreAuthorize("hasAnyRole('COMMITTEE_MEMBER', 'ADMIN')")
    public ResponseEntity<EducationRequestResponse> reportByCommittee(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.reportByCommittee(id));
    }

    @PostMapping("/committee-report")
    @PreAuthorize("hasAnyRole('COMMITTEE_MEMBER', 'ADMIN')")
    public ResponseEntity<List<EducationRequestResponse>> reportByCommitteeBulk(@RequestBody List<Long> ids) {
        return ResponseEntity.ok(requestService.reportByCommitteeBulk(ids));
    }

    /**
     * CDC provides final sign-off on committee selections.
     * Workflow:
     * COMMITTEE_REPORTED -> CDC_APPROVED
     */
    @PatchMapping("/{id}/final-approval")
    @PreAuthorize("hasAnyRole('CYBER_DEVELOPMENT_CENTER', 'ADMIN')")
    public ResponseEntity<EducationRequestResponse> finalApproval(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.finalApproval(id));
    }
}
