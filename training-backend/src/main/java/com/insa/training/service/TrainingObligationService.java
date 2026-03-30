package com.insa.training.service;

import com.insa.training.dto.TrainingObligationDto;
import com.insa.training.dto.TrainingObligationResponse;
import com.insa.training.entity.TrainingObligation;
import com.insa.training.enums.ContractStatus;
import com.insa.training.repository.TrainingObligationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainingObligationService {

    private final TrainingObligationRepository repository;

    @Transactional
    public TrainingObligationResponse create(TrainingObligationDto dto) {
        TrainingObligation obligation = TrainingObligation.builder()
                .contractId(dto.getContractId())
                .employeeName(dto.getEmployeeName())
                .startDate(LocalDate.parse(dto.getStartDate()).atStartOfDay())
                .endDate(LocalDate.parse(dto.getEndDate()).atStartOfDay())
                .obligationMonths(dto.getObligationMonths())
                .status(ContractStatus.ACTIVE)
                .build();

        return mapToResponse(repository.save(obligation));
    }

    @Transactional(readOnly = true)
    public List<TrainingObligationResponse> getAll() {
        return repository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TrainingObligationResponse updateStatus(Long id, ContractStatus status) {
        TrainingObligation obligation = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Obligation not found"));
        
        obligation.setStatus(status);
        if (status == ContractStatus.COMPLETED) {
            obligation.setReleasedAt(LocalDateTime.now());
            obligation.setGuarantorReleased(true);
        }
        
        return mapToResponse(repository.save(obligation));
    }

    private TrainingObligationResponse mapToResponse(TrainingObligation obligation) {
        return TrainingObligationResponse.builder()
                .id(obligation.getId())
                .contractId(obligation.getContractId())
                .employeeName(obligation.getEmployeeName())
                .startDate(obligation.getStartDate())
                .endDate(obligation.getEndDate())
                .obligationMonths(obligation.getObligationMonths())
                .status(obligation.getStatus())
                .releasedAt(obligation.getReleasedAt())
                .guarantorReleased(obligation.getGuarantorReleased())
                .createdAt(obligation.getCreatedAt())
                .updatedAt(obligation.getUpdatedAt())
                .build();
    }
}
