package com.insa.education.service;

import com.insa.education.dto.request.BulkEducationRequestDto;
import com.insa.education.dto.request.EducationRequestDto;
import com.insa.education.dto.response.EducationRequestResponse;
import com.insa.education.entity.EducationOpportunity;
import com.insa.education.entity.EducationRequest;
import com.insa.education.entity.Employee;
import com.insa.education.enums.RequestStatus;
import com.insa.education.exception.BadRequestException;
import com.insa.education.exception.ResourceNotFoundException;
import com.insa.education.mapper.EducationMapper;
import com.insa.education.repository.EducationOpportunityRepository;
import com.insa.education.repository.EducationRequestRepository;
import com.insa.education.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EducationRequestService {

    private static final Logger log = LoggerFactory.getLogger(EducationRequestService.class);

    private final EducationRequestRepository requestRepository;
    private final EmployeeRepository employeeRepository;
    private final EducationOpportunityRepository opportunityRepository;
    private final EducationMapper mapper;

    public EducationRequestService(EducationRequestRepository requestRepository,
                                   EmployeeRepository employeeRepository,
                                   EducationOpportunityRepository opportunityRepository,
                                   EducationMapper mapper) {
        this.requestRepository = requestRepository;
        this.employeeRepository = employeeRepository;
        this.opportunityRepository = opportunityRepository;
        this.mapper = mapper;
    }

    /**
     * Department Head creates a request draft for an employee in their department.
     * Initial workflow state:
     * PENDING_DEPARTMENT_SUBMISSION
     */
    @Transactional
    public EducationRequestResponse create(EducationRequestDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + dto.getEmployeeId()));

        EducationOpportunity opportunity = opportunityRepository.findById(dto.getOpportunityId())
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with id: " + dto.getOpportunityId()));

        validateOpportunityAccess(employee, opportunity);

        EducationRequest request = EducationRequest.builder()
                .employee(employee)
                .opportunity(opportunity)
                .currentEducationLevel(dto.getCurrentEducationLevel())
                .workExperience(dto.getWorkExperience())
                .performanceScore(dto.getPerformanceScore())
                .description(dto.getDescription())
                .status(RequestStatus.PENDING_DEPARTMENT_SUBMISSION)
                .build();

        EducationRequest saved = requestRepository.save(request);
        log.info("Education request created: id={}, employee={}, by={}", saved.getId(), employee.getEmployeeId(), currentUsername());

        return mapper.toEducationRequestResponse(saved);
    }

    /**
     * Bulk creation of education requests for multiple employees.
     */
    @Transactional
    public List<EducationRequestResponse> createBulk(BulkEducationRequestDto dto) {
        EducationOpportunity opportunity = opportunityRepository.findById(dto.getOpportunityId())
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with id: " + dto.getOpportunityId()));

        return dto.getEmployeeIds().stream().map(employeeId -> {
            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

            validateOpportunityAccess(employee, opportunity);

            EducationRequest request = EducationRequest.builder()
                    .employee(employee)
                    .opportunity(opportunity)
                    .currentEducationLevel(dto.getCurrentEducationLevel())
                    .workExperience(dto.getWorkExperience())
                    .performanceScore(dto.getPerformanceScore())
                    .description(dto.getDescription())
                    .status(RequestStatus.PENDING_DEPARTMENT_SUBMISSION)
                    .build();

            EducationRequest saved = requestRepository.save(request);
            log.info("Education request created in bulk: id={}, employee={}, opportunity={}, by={}",
                    saved.getId(), employee.getEmployeeId(), opportunity.getId(), currentUsername());

            return mapper.toEducationRequestResponse(saved);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EducationRequestResponse getById(Long id) {
        EducationRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Education request not found with id: " + id));

        return mapper.toEducationRequestResponse(request);
    }

    @Transactional(readOnly = true)
    public Page<EducationRequestResponse> getAll(Pageable pageable) {
        return requestRepository.findAll(pageable)
                .map(mapper::toEducationRequestResponse);
    }

    @Transactional(readOnly = true)
    public Page<EducationRequestResponse> getByEmployeeId(Long employeeId, Pageable pageable) {
        return requestRepository.findByEmployeeId(employeeId, pageable)
                .map(mapper::toEducationRequestResponse);
    }

    @Transactional(readOnly = true)
    public Page<EducationRequestResponse> getByEmployeeEmployeeId(String employeeId, Pageable pageable) {
        return requestRepository.findByEmployee_EmployeeId(employeeId, pageable)
                .map(mapper::toEducationRequestResponse);
    }

    @Transactional(readOnly = true)
    public Page<EducationRequestResponse> getByStatus(RequestStatus status, Pageable pageable) {
        return requestRepository.findByStatus(status, pageable)
                .map(mapper::toEducationRequestResponse);
    }

    /**
     * Update request details.
     * Allowed before HR/committee/final contract stage.
     */
    @Transactional
    public EducationRequestResponse update(Long id, EducationRequestDto dto) {
        EducationRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Education request not found with id: " + id));

        if (isLockedForEdit(request.getStatus())) {
            throw new BadRequestException("Cannot edit request after HR/committee processing has started");
        }

        EducationOpportunity opportunity = opportunityRepository.findById(dto.getOpportunityId())
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with id: " + dto.getOpportunityId()));

        validateOpportunityAccess(request.getEmployee(), opportunity);

        request.setOpportunity(opportunity);
        request.setCurrentEducationLevel(dto.getCurrentEducationLevel());
        request.setWorkExperience(dto.getWorkExperience());
        request.setPerformanceScore(dto.getPerformanceScore());
        request.setDescription(dto.getDescription());

        EducationRequest saved = requestRepository.save(request);
        log.info("Education request updated: id={}, by={}", saved.getId(), currentUsername());

        return mapper.toEducationRequestResponse(saved);
    }

    /**
     * DEPARTMENT_HEAD step:
     * PENDING_DEPARTMENT_SUBMISSION -> SUBMITTED_TO_CENTER
     */
    @Transactional
    public EducationRequestResponse submitToCenter(Long requestId) {
        return transitionStatus(
                requestId,
                RequestStatus.PENDING_DEPARTMENT_SUBMISSION,
                RequestStatus.SUBMITTED_TO_CENTER,
                "Department submission to Cyber Development Center"
        );
    }

    /**
     * CYBER_DEVELOPMENT_CENTER step:
     * SUBMITTED_TO_CENTER -> CENTER_REVIEWED
     */
    @Transactional
    public EducationRequestResponse markCenterReviewed(Long requestId) {
        return transitionStatus(
                requestId,
                RequestStatus.SUBMITTED_TO_CENTER,
                RequestStatus.CENTER_REVIEWED,
                "Cyber Development Center review completed"
        );
    }

    /**
     * CYBER_DEVELOPMENT_CENTER step:
     * CENTER_REVIEWED -> FORWARDED_TO_HR
     */
    @Transactional
    public EducationRequestResponse forwardToHr(Long requestId) {
        return transitionStatus(
                requestId,
                RequestStatus.CENTER_REVIEWED,
                RequestStatus.FORWARDED_TO_HR,
                "Forwarded to HR by Cyber Development Center"
        );
    }

    /**
     * Generic guarded status transition helper.
     */
    @Transactional
    public EducationRequestResponse transitionStatus(Long requestId,
                                                     RequestStatus expectedCurrent,
                                                     RequestStatus target,
                                                     String actionDescription) {
        EducationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Education request not found with id: " + requestId));

        if (request.getStatus() != expectedCurrent) {
            throw new BadRequestException(
                    String.format("Invalid status transition. Expected %s but found %s",
                            expectedCurrent, request.getStatus())
            );
        }

        request.setStatus(target);
        EducationRequest saved = requestRepository.save(request);

        log.info("{}: requestId={}, from={}, to={}, by={}",
                actionDescription, requestId, expectedCurrent, target, currentUsername());

        return mapper.toEducationRequestResponse(saved);
    }

    private boolean isLockedForEdit(RequestStatus status) {
        return status == RequestStatus.HR_VERIFIED
                || status == RequestStatus.COMMITTEE_REVIEW
                || status == RequestStatus.APPROVED
                || status == RequestStatus.REJECTED
                || status == RequestStatus.CONTRACT_CREATED;
    }

    private void validateOpportunityAccess(Employee employee, EducationOpportunity opportunity) {
        String employeeDepartment = normalizeDepartment(employee.getDepartment());
        List<String> targetDepartments = opportunity.getTargetDepartments();

        if (employeeDepartment == null) {
            throw new BadRequestException("Employee department is required to apply for an education opportunity");
        }

        if (targetDepartments == null || targetDepartments.isEmpty()) {
            String legacyDepartment = normalizeDepartment(opportunity.getDepartment());
            if (legacyDepartment == null || !legacyDepartment.equals(employeeDepartment)) {
                throw new BadRequestException("This education opportunity is not assigned to the employee's department");
            }
            return;
        }

        boolean allowed = targetDepartments.stream()
                .map(this::normalizeDepartment)
                .anyMatch(employeeDepartment::equals);

        if (!allowed) {
            throw new BadRequestException("This education opportunity is not assigned to the employee's department");
        }
    }

    private String normalizeDepartment(String department) {
        if (department == null) {
            return null;
        }

        String normalized = department.trim().toLowerCase();
        return normalized.isEmpty() ? null : normalized;
    }

    private String currentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "system";
    }
}
