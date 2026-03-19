package com.insa.education.service;

import com.insa.education.dto.request.EducationOpportunityDto;
import com.insa.education.dto.response.EducationOpportunityResponse;
import com.insa.education.entity.EducationOpportunity;
import com.insa.education.entity.Employee;
import com.insa.education.exception.BadRequestException;
import com.insa.education.exception.ResourceNotFoundException;
import com.insa.education.repository.EducationOpportunityRepository;
import com.insa.education.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EducationOpportunityService {

    private final EducationOpportunityRepository repository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public EducationOpportunityResponse create(EducationOpportunityDto dto) {
        List<String> normalizedTargets = normalizeTargetDepartments(dto.getTargetDepartments());

        if (normalizedTargets.isEmpty()) {
            throw new BadRequestException("At least one target department is required");
        }

        EducationOpportunity opportunity = EducationOpportunity.builder()
                .educationType(dto.getEducationType())
                .educationLevel(dto.getEducationLevel())
                .institution(dto.getInstitution())
                .department(resolveLegacyDepartment(dto, normalizedTargets))
                .targetDepartments(normalizedTargets)
                .description(dto.getDescription())
                .build();

        EducationOpportunity saved = repository.save(opportunity);
        return mapToResponse(saved);
    }

    @Transactional
    public EducationOpportunityResponse update(Long id, EducationOpportunityDto dto) {
        EducationOpportunity opportunity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Education Opportunity not found with id: " + id));

        List<String> normalizedTargets = normalizeTargetDepartments(dto.getTargetDepartments());

        if (normalizedTargets.isEmpty()) {
            throw new BadRequestException("At least one target department is required");
        }

        opportunity.setEducationType(dto.getEducationType());
        opportunity.setEducationLevel(dto.getEducationLevel());
        opportunity.setInstitution(dto.getInstitution());
        opportunity.setDepartment(resolveLegacyDepartment(dto, normalizedTargets));
        opportunity.setTargetDepartments(normalizedTargets);
        opportunity.setDescription(dto.getDescription());

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

        Employee currentEmployee = findCurrentEmployee(authentication);
        if (currentEmployee == null) {
            return repository.findAll(pageable).map(this::mapToResponse);
        }

        String role = currentEmployee.getRole().name();
        if (isPrivilegedRole(role)) {
            return repository.findAll(pageable).map(this::mapToResponse);
        }

        String department = normalizeDepartment(currentEmployee.getDepartment());
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

        Employee currentEmployee = findCurrentEmployee(authentication);
        if (currentEmployee == null) {
            return true;
        }

        String role = currentEmployee.getRole().name();
        if (isPrivilegedRole(role)) {
            return true;
        }

        String userDepartment = normalizeDepartment(currentEmployee.getDepartment());
        if (userDepartment == null) {
            return false;
        }

        if (matchesDepartment(opportunity.getDepartment(), userDepartment)) {
            return true;
        }

        if (opportunity.getTargetDepartments() == null) {
            return false;
        }

        return opportunity.getTargetDepartments().stream()
                .map(this::normalizeDepartment)
                .anyMatch(userDepartment::equals);
    }

    private boolean isPrivilegedRole(String role) {
        return "ADMIN".equals(role)
                || "CYBER_DEVELOPMENT_CENTER".equals(role)
                || "HR_OFFICER".equals(role)
                || "COMMITTEE_MEMBER".equals(role)
                || "DIRECTOR".equals(role);
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

    private List<String> normalizeTargetDepartments(List<String> targetDepartments) {
        List<String> result = new ArrayList<>();
        if (targetDepartments == null) {
            return result;
        }

        for (String department : targetDepartments) {
            String normalized = normalizeDepartment(department);
            if (normalized != null && !result.contains(normalized)) {
                result.add(normalized);
            }
        }
        return result;
    }

    private String resolveLegacyDepartment(EducationOpportunityDto dto, List<String> normalizedTargets) {
        String legacyDepartment = normalizeDepartment(dto.getDepartment());
        if (legacyDepartment != null) {
            return legacyDepartment;
        }
        return normalizedTargets.get(0);
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

    private EducationOpportunityResponse mapToResponse(EducationOpportunity opportunity) {
        return EducationOpportunityResponse.builder()
                .id(opportunity.getId())
                .educationType(opportunity.getEducationType())
                .educationLevel(opportunity.getEducationLevel())
                .institution(opportunity.getInstitution())
                .department(opportunity.getDepartment())
                .targetDepartments(opportunity.getTargetDepartments())
                .description(opportunity.getDescription())
                .createdAt(opportunity.getCreatedAt())
                .updatedAt(opportunity.getUpdatedAt())
                .build();
    }
}
