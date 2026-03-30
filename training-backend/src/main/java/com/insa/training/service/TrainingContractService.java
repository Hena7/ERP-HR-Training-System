package com.insa.training.service;

import com.insa.training.dto.TrainingContractDto;
import com.insa.training.dto.TrainingContractResponse;
import com.insa.training.entity.TrainingContract;
import com.insa.training.entity.TrainingRequest;
import com.insa.training.enums.ContractStatus;
import com.insa.training.enums.TrainingStatus;
import com.insa.training.repository.TrainingContractRepository;
import com.insa.training.repository.TrainingRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainingContractService {

    private final TrainingContractRepository repository;
    private final TrainingRequestRepository requestRepository;

    @Transactional
    public TrainingContractResponse create(TrainingContractDto dto) {
        TrainingRequest request = requestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new RuntimeException("Training Request not found"));

        TrainingContract contract = TrainingContract.builder()
                .requestId(dto.getRequestId())
                .employeeId(dto.getEmployeeId())
                .employeeName(dto.getEmployeeName())
                .employeeDepartment(dto.getEmployeeDepartment())
                .city(dto.getCity())
                .houseNo(dto.getHouseNo())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .trainingCountry(dto.getTrainingCountry())
                .trainingCity(dto.getTrainingCity())
                .trainingType(dto.getTrainingType())
                .totalCost(dto.getTotalCost())
                .contractDurationMonths(dto.getContractDurationMonths())
                .signedDate(LocalDate.parse(dto.getSignedDate()).atStartOfDay())
                .status(ContractStatus.ACTIVE)
                .build();

        TrainingContract savedContract = repository.save(contract);

        // Update Request status and link contract
        request.setStatus(TrainingStatus.CONTRACT_CREATED);
        request.setContractId(savedContract.getId());
        requestRepository.save(request);

        return mapToResponse(savedContract);
    }

    @Transactional(readOnly = true)
    public List<TrainingContractResponse> getAll() {
        return repository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TrainingContractResponse getById(Long id) {
        return repository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Training Contract not found"));
    }

    private TrainingContractResponse mapToResponse(TrainingContract contract) {
        return TrainingContractResponse.builder()
                .id(contract.getId())
                .requestId(contract.getRequestId())
                .employeeId(contract.getEmployeeId())
                .employeeName(contract.getEmployeeName())
                .employeeDepartment(contract.getEmployeeDepartment())
                .city(contract.getCity())
                .houseNo(contract.getHouseNo())
                .email(contract.getEmail())
                .phone(contract.getPhone())
                .trainingCountry(contract.getTrainingCountry())
                .trainingCity(contract.getTrainingCity())
                .trainingType(contract.getTrainingType())
                .totalCost(contract.getTotalCost())
                .contractDurationMonths(contract.getContractDurationMonths())
                .signedDate(contract.getSignedDate())
                .status(contract.getStatus())
                .createdAt(contract.getCreatedAt())
                .build();
    }
}
