package com.insa.education.service;

import com.insa.education.dto.request.EducationOpportunityDto;
import com.insa.education.dto.response.EducationOpportunityResponse;
import com.insa.education.entity.EducationOpportunity;
import com.insa.education.repository.EducationOpportunityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EducationOpportunityService {

    private final EducationOpportunityRepository repository;

    @Transactional
    public EducationOpportunityResponse create(EducationOpportunityDto dto) {
        EducationOpportunity opportunity = EducationOpportunity.builder()
                .educationType(dto.getEducationType())
                .educationLevel(dto.getEducationLevel())
                .institution(dto.getInstitution())
                .department(dto.getDepartment())
                .description(dto.getDescription())
                .build();
        EducationOpportunity saved = repository.save(opportunity);
        return mapToResponse(saved);
    }

    @Transactional
    public EducationOpportunityResponse update(Long id, EducationOpportunityDto dto) {
        EducationOpportunity opportunity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Education Opportunity not found with id: " + id));

        opportunity.setEducationType(dto.getEducationType());
        opportunity.setEducationLevel(dto.getEducationLevel());
        opportunity.setInstitution(dto.getInstitution());
        opportunity.setDepartment(dto.getDepartment());
        opportunity.setDescription(dto.getDescription());

        EducationOpportunity saved = repository.save(opportunity);
        return mapToResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Education Opportunity not found with id: " + id);
        }
        repository.deleteById(id);
    }

    public EducationOpportunityResponse getById(Long id) {
        EducationOpportunity opportunity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Education Opportunity not found with id: " + id));
        return mapToResponse(opportunity);
    }

    public Page<EducationOpportunityResponse> getAll(Pageable pageable) {
        return repository.findAll(pageable).map(this::mapToResponse);
    }

    private EducationOpportunityResponse mapToResponse(EducationOpportunity opportunity) {
        return EducationOpportunityResponse.builder()
                .id(opportunity.getId())
                .educationType(opportunity.getEducationType())
                .educationLevel(opportunity.getEducationLevel())
                .institution(opportunity.getInstitution())
                .department(opportunity.getDepartment())
                .description(opportunity.getDescription())
                .createdAt(opportunity.getCreatedAt())
                .updatedAt(opportunity.getUpdatedAt())
                .build();
    }
}
