package com.insa.education.service;

import com.insa.education.dto.request.BulkEducationRequestDto;
import com.insa.education.dto.request.EducationRequestDto;
import com.insa.education.dto.response.EducationRequestResponse;
import com.insa.education.entity.EducationOpportunity;
import com.insa.education.entity.EducationRequest;
import com.insa.education.entity.Employee;
import com.insa.education.enums.CommitmentSource;
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

        EducationOpportunity opportunity = null;
        if (dto.getOpportunityId() != null) {
            opportunity = opportunityRepository.findById(dto.getOpportunityId())
                    .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with id: " + dto.getOpportunityId()));
            validateOpportunityAccess(employee, opportunity);
        }

        EducationRequest request = EducationRequest.builder()
                .employee(employee)
                .opportunity(opportunity)
                .educationCategory(dto.getEducationCategory())
                .fieldOfStudy(dto.getFieldOfStudy())
                .institution(dto.getInstitution())
                .targetEducationLevel(dto.getTargetEducationLevel())
                .budgetYear(dto.getBudgetYear())
                .award(dto.getAward())
                .duration(dto.getDuration())
                .programTime(dto.getProgramTime())
                .location(dto.getLocation())
                .currentEducationLevel(dto.getCurrentEducationLevel())
                .workExperience(dto.getWorkExperience())
                .performanceScore(dto.getPerformanceScore())
                .description(dto.getDescription())
                .status(RequestStatus.PENDING_DEPARTMENT_SUBMISSION)
                .commitmentSource(dto.getCommitmentSource() != null ? CommitmentSource.valueOf(dto.getCommitmentSource()) : CommitmentSource.STANDARD)
                .candidateId(dto.getCandidateId())
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
        if (dto.getCandidates() == null || dto.getCandidates().isEmpty()) {
            throw new BadRequestException("At least one candidate must be nominated");
        }

        EducationOpportunity opportunity = null;
        if (dto.getOpportunityId() != null) {
            opportunity = opportunityRepository.findById(dto.getOpportunityId())
                    .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with id: " + dto.getOpportunityId()));
        }

        final EducationOpportunity finalOpp = opportunity;
        return dto.getCandidates().stream().map(cand -> {
            // Resolve the employee: by numeric ID, by card string ID, or keep null for external candidates
            Employee employee = null;
            String resolvedName = cand.getName();
            String resolvedDept = cand.getDept();
            String resolvedPhone = cand.getPhone();

            if (cand.getEmployeeId() != null) {
                // From employee list: look up by DB primary key
                employee = employeeRepository.findById(cand.getEmployeeId())
                        .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + cand.getEmployeeId()));
            } else if (cand.getCandidateId() != null && !cand.getCandidateId().isBlank()) {
                // Manual entry: try to look up by employee card ID
                var found = employeeRepository.findByEmployeeId(cand.getCandidateId());
                if (found.isPresent()) {
                    employee = found.get();
                }
                // If not found: employee stays null → treated as external candidate
            }

            if (employee != null && finalOpp != null) {
                validateOpportunityAccess(employee, finalOpp);
            }

            // For display: prefer DB values, fall back to manual typed-in values
            String displayName  = (employee != null)
                    ? employee.getFirstName() + " " + employee.getLastName()
                    : (resolvedName != null ? resolvedName : cand.getCandidateId());
            String displayDept  = (employee != null) ? employee.getDepartment() : resolvedDept;
            String displayPhone = (employee != null) ? employee.getPhone()  : resolvedPhone;

            EducationRequest request = EducationRequest.builder()
                    .employee(employee)
                    .manualEmployeeName(employee == null ? displayName  : null)
                    .manualEmployeeDept(employee == null ? displayDept  : null)
                    .manualEmployeePhone(employee == null ? displayPhone : null)
                    .opportunity(finalOpp)
                    .educationCategory(dto.getEducationCategory())
                    .fieldOfStudy(dto.getFieldOfStudy())
                    .institution(dto.getInstitution())
                    .targetEducationLevel(dto.getEducationLevel())
                    .budgetYear(dto.getBudgetYear())
                    .award(cand.getAward())
                    .duration(cand.getDuration())
                    .programTime(cand.getProgramTime())
                    .location(cand.getLocation())
                    .currentEducationLevel("N/A")
                    .description(dto.getDescription())
                    .status(RequestStatus.SUBMITTED_TO_CENTER)
                    .commitmentSource(dto.getCommitmentSource() != null ? CommitmentSource.valueOf(dto.getCommitmentSource()) : CommitmentSource.STANDARD)
                    .candidateId(cand.getCandidateId())
                    .build();

            EducationRequest saved = requestRepository.save(request);
            log.info("Education request created in bulk: candidateId={}, employee={}, by={}",
                    cand.getCandidateId(), employee != null ? employee.getEmployeeId() : "EXTERNAL", currentUsername());

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

        EducationOpportunity opportunity = null;
        if (dto.getOpportunityId() != null) {
            opportunity = opportunityRepository.findById(dto.getOpportunityId())
                    .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with id: " + dto.getOpportunityId()));
            validateOpportunityAccess(request.getEmployee(), opportunity);
        }

        request.setOpportunity(opportunity);
        request.setEducationCategory(dto.getEducationCategory());
        request.setFieldOfStudy(dto.getFieldOfStudy());
        request.setInstitution(dto.getInstitution());
        request.setTargetEducationLevel(dto.getTargetEducationLevel());
        request.setBudgetYear(dto.getBudgetYear());
        request.setAward(dto.getAward());
        request.setDuration(dto.getDuration());
        request.setProgramTime(dto.getProgramTime());
        request.setLocation(dto.getLocation());
        request.setCurrentEducationLevel(dto.getCurrentEducationLevel());
        request.setWorkExperience(dto.getWorkExperience());
        request.setPerformanceScore(dto.getPerformanceScore());
        request.setDescription(dto.getDescription());
        request.setCandidateId(dto.getCandidateId());

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
     * COMMITTEE step:
     * SCORED -> COMMITTEE_REPORTED
     */
    @Transactional
    public EducationRequestResponse reportByCommittee(Long requestId) {
        return transitionStatus(
                requestId,
                RequestStatus.SCORED,
                RequestStatus.COMMITTEE_REPORTED,
                "Reported by Committee for final CDC sign-off"
        );
    }

    /**
     * CYBER_DEVELOPMENT_CENTER (Final) step:
     * COMMITTEE_REPORTED -> CDC_APPROVED
     */
    @Transactional
    public EducationRequestResponse finalApproval(Long requestId) {
        return transitionStatus(
                requestId,
                RequestStatus.COMMITTEE_REPORTED,
                RequestStatus.CDC_APPROVED,
                "Final approval granted by CDC"
        );
    }

    @Transactional
    public List<EducationRequestResponse> reportByCommitteeBulk(List<Long> requestIds) {
        return requestIds.stream()
                .map(this::reportByCommittee)
                .collect(Collectors.toList());
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
                || status == RequestStatus.COMMITTEE_REPORTED
                || status == RequestStatus.CDC_APPROVED
                || status == RequestStatus.APPROVED
                || status == RequestStatus.REJECTED
                || status == RequestStatus.CONTRACT_CREATED;
    }

    private void validateOpportunityAccess(Employee employee, EducationOpportunity opportunity) {
        if (opportunity == null) return;

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
