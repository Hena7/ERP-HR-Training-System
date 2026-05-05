package com.insa.training.service;

import com.insa.training.dto.TrainingWitnessDto;
import com.insa.training.dto.TrainingWitnessResponse;
import com.insa.training.entity.TrainingWitness;
import com.insa.training.repository.TrainingWitnessRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainingWitnessService {

    private final TrainingWitnessRepository repository;

    @Transactional
    public TrainingWitnessResponse create(TrainingWitnessDto dto) {
        TrainingWitness witness = TrainingWitness.builder()
                .contractId(dto.getContractId())
                .fullName(dto.getFullName())
                .nationalId(dto.getNationalId())
                .address(dto.getAddress())
                .phone(dto.getPhone())
                .build();

        TrainingWitness saved = repository.save(witness);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TrainingWitnessResponse> getByContract(Long contractId) {
        return repository.findByContractId(contractId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TrainingWitnessResponse update(Long id, TrainingWitnessDto dto) {
        TrainingWitness witness = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Witness not found"));
        
        witness.setFullName(dto.getFullName());
        witness.setNationalId(dto.getNationalId());
        witness.setAddress(dto.getAddress());
        witness.setPhone(dto.getPhone());
        
        return mapToResponse(repository.save(witness));
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private TrainingWitnessResponse mapToResponse(TrainingWitness witness) {
        return TrainingWitnessResponse.builder()
                .id(witness.getId())
                .contractId(witness.getContractId())
                .fullName(witness.getFullName())
                .nationalId(witness.getNationalId())
                .address(witness.getAddress())
                .phone(witness.getPhone())
                .createdAt(witness.getCreatedAt())
                .build();
    }
}
