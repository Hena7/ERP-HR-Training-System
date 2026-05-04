package com.insa.education.service;

import com.insa.education.dto.request.EducationOpportunityDto;
import com.insa.education.dto.response.EducationOpportunityResponse;
import com.insa.education.entity.EducationOpportunity;
import com.insa.education.entity.Employee;
import com.insa.education.exception.BadRequestException;
import com.insa.education.exception.ResourceNotFoundException;
import com.insa.education.entity.Department;
import com.insa.education.repository.DepartmentRepository;
import com.insa.education.repository.EducationOpportunityRepository;
import com.insa.education.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EducationOpportunityService {

    private final EducationOpportunityRepository repository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional
    public EducationOpportunityResponse create(EducationOpportunityDto dto) {
        if (dto.getTargetDepartmentIds() == null || dto.getTargetDepartmentIds().isEmpty()) {
            throw new BadRequestException("At least one target department is required");
        }

        List<Department> targetDepartments = departmentRepository.findAllById(dto.getTargetDepartmentIds());
        if (targetDepartments.isEmpty()) {
            throw new BadRequestException("Invalid target department IDs provided");
        }

        Department department = null;
        if (dto.getDepartmentId() != null) {
            department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        } else {
            department = targetDepartments.get(0);
        }

        EducationOpportunity opportunity = EducationOpportunity.builder()
                .educationType(dto.getEducationType())
                .educationLevel(dto.getEducationLevel())
                .institution(dto.getInstitution())
                .department(department)
                .targetDepartments(new ArrayList<>(targetDepartments))
                .description(dto.getDescription())
                .status(dto.getStatus() != null ? dto.getStatus() : "OPEN")
                .deadline(parseDeadline(dto.getDeadline()))
                .build();

        EducationOpportunity saved = repository.save(opportunity);
        return mapToResponse(saved);
    }

    @Transactional
    public EducationOpportunityResponse update(Long id, EducationOpportunityDto dto) {
        EducationOpportunity opportunity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Education Opportunity not found with id: " + id));

        if (dto.getTargetDepartmentIds() == null || dto.getTargetDepartmentIds().isEmpty()) {
            throw new BadRequestException("At least one target department is required");
        }

        List<Department> targetDepartments = departmentRepository.findAllById(dto.getTargetDepartmentIds());
        if (targetDepartments.isEmpty()) {
            throw new BadRequestException("Invalid target department IDs provided");
        }

        Department department = null;
        if (dto.getDepartmentId() != null) {
            department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        } else {
            department = targetDepartments.get(0);
        }

        opportunity.setEducationType(dto.getEducationType());
        opportunity.setEducationLevel(dto.getEducationLevel());
        opportunity.setInstitution(dto.getInstitution());
        opportunity.setDepartment(department);
        opportunity.getTargetDepartments().clear();
        opportunity.getTargetDepartments().addAll(targetDepartments);
        opportunity.setDescription(dto.getDescription());
        if (dto.getStatus() != null) {
            opportunity.setStatus(dto.getStatus());
        }
        opportunity.setDeadline(parseDeadline(dto.getDeadline()));

        EducationOpportunity saved = repository.save(opportunity);
        return mapToResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Education Opportunity not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public EducationOpportunityResponse getById(Long id) {
        EducationOpportunity opportunity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Education Opportunity not found with id: " + id));

        if (!canViewOpportunity(opportunity)) {
            throw new ResourceNotFoundException("Education Opportunity not found with id: " + id);
        }

        return mapToResponse(opportunity);
    }

    @Transactional(readOnly = true)
    public Page<EducationOpportunityResponse> getAll(Pageable pageable) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (isUnauthenticated(authentication)) {
            return repository.findAll(pageable).map(this::mapToResponse);
        }

        if (isPrivilegedUser(authentication)) {
            return repository.findAll(pageable).map(this::mapToResponse);
        }

        String department = resolveUserDepartment(authentication);
        if (department == null) {
            return Page.empty(pageable);
        }

        return repository.findVisibleByDepartment(department, pageable)
                .map(this::mapToResponse);
    }

    private boolean canViewOpportunity(EducationOpportunity opportunity) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (isUnauthenticated(authentication)) {
            return true;
        }

        if (isPrivilegedUser(authentication)) {
            return true;
        }

        String userDepartment = resolveUserDepartment(authentication);
        if (userDepartment == null) {
            return false;
        }

        if (opportunity.getDepartment() != null && matchesDepartment(opportunity.getDepartment().getName(), userDepartment)) {
            return true;
        }

        if (opportunity.getTargetDepartments() == null || opportunity.getTargetDepartments().isEmpty()) {
            return false;
        }

        return opportunity.getTargetDepartments().stream()
                .map(dept -> normalizeDepartment(dept.getName()))
                .anyMatch(userDepartment::equals);
    }

    private boolean isPrivilegedUser(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(auth -> auth.equals("ROLE_ADMIN")
                        || auth.equals("ROLE_CYBER_DEVELOPMENT_CENTER")
                        || auth.equals("ROLE_HR_OFFICER")
                        || auth.equals("ROLE_COMMITTEE_MEMBER")
                        || auth.equals("ROLE_DIRECTOR"));
    }

    private String resolveUserDepartment(Authentication authentication) {
        // 1. Try to get from JWT claims if possible
        if (authentication instanceof JwtAuthenticationToken jwtToken) {
            Jwt jwt = jwtToken.getToken();
            if (jwt.hasClaim("department")) {
                return normalizeDepartment(jwt.getClaimAsString("department"));
            }
        }

        // 2. Fallback to Employee record in database
        Employee employee = findCurrentEmployee(authentication);
        if (employee != null) {
            return normalizeDepartment(employee.getDepartment() != null ? employee.getDepartment().getName() : null);
        }

        return null;
    }

    private boolean isUnauthenticated(Authentication authentication) {
        return authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken
                || "anonymousUser".equals(authentication.getName());
    }

    private Employee findCurrentEmployee(Authentication authentication) {
        return employeeRepository.findByEmail(authentication.getName()).orElse(null);
    }



    private boolean matchesDepartment(String departmentValue, String userDepartment) {
        String normalized = normalizeDepartment(departmentValue);
        return normalized != null && normalized.equals(userDepartment);
    }

    private String normalizeDepartment(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private LocalDateTime parseDeadline(String deadline) {
        if (deadline == null || deadline.trim().isEmpty()) {
            return null;
        }
        try {
            // Check if it's already a full ISO-8601 string or just a date
            if (deadline.contains("T")) {
                return LocalDateTime.parse(deadline, DateTimeFormatter.ISO_DATE_TIME);
            } else {
                return java.time.LocalDate.parse(deadline).atStartOfDay();
            }
        } catch (Exception e) {
            return null;
        }
    }

    private String formatDeadline(LocalDateTime deadline) {
        if (deadline == null) {
            return "";
        }
        return deadline.format(DateTimeFormatter.ISO_DATE_TIME);
    }

    private EducationOpportunityResponse mapToResponse(EducationOpportunity opportunity) {
        return EducationOpportunityResponse.builder()
                .id(opportunity.getId())
                .educationType(opportunity.getEducationType())
                .educationLevel(opportunity.getEducationLevel())
                .institution(opportunity.getInstitution())
                .departmentId(opportunity.getDepartment() != null ? opportunity.getDepartment().getId() : null)
                .departmentName(opportunity.getDepartment() != null ? opportunity.getDepartment().getName() : null)
                .targetDepartmentIds(opportunity.getTargetDepartments().stream().map(Department::getId).toList())
                .targetDepartmentNames(opportunity.getTargetDepartments().stream().map(Department::getName).toList())
                .description(opportunity.getDescription())
                .status(opportunity.getStatus())
                .deadline(formatDeadline(opportunity.getDeadline()))
                .createdAt(opportunity.getCreatedAt())
                .updatedAt(opportunity.getUpdatedAt())
                .build();
    }
}
