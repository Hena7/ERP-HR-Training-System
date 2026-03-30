package com.insa.training.service;

import com.insa.training.dto.TrainingGuarantorDto;
import com.insa.training.dto.TrainingGuarantorResponse;
import com.insa.training.entity.TrainingGuarantor;
import com.insa.training.repository.TrainingGuarantorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainingGuarantorService {

    private final TrainingGuarantorRepository repository;

    @Transactional
    public TrainingGuarantorResponse create(TrainingGuarantorDto dto) {
        List<TrainingGuarantor> existing = repository.findByContractId(dto.getContractId());
        if (existing.size() >= 2) {
            throw new RuntimeException("Maximum 2 guarantors per training contract");
        }

        TrainingGuarantor guarantor = TrainingGuarantor.builder()
                .contractId(dto.getContractId())
                .fullName(dto.getFullName())
                .nationalId(dto.getNationalId())
                .currentAddress(dto.getCurrentAddress())
                .birthAddress(dto.getBirthAddress())
                .phone(dto.getPhone())
                .scannedDocument(dto.getScannedDocument())
                .build();

        return mapToResponse(repository.save(guarantor));
    }

    @Transactional(readOnly = true)
    public List<TrainingGuarantorResponse> getByContract(Long contractId) {
        return repository.findByContractId(contractId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TrainingGuarantorResponse update(Long id, TrainingGuarantorDto dto) {
        TrainingGuarantor guarantor = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guarantor not found"));
        
        guarantor.setFullName(dto.getFullName());
        guarantor.setNationalId(dto.getNationalId());
        guarantor.setCurrentAddress(dto.getCurrentAddress());
        guarantor.setBirthAddress(dto.getBirthAddress());
        guarantor.setPhone(dto.getPhone());
        guarantor.setScannedDocument(dto.getScannedDocument());
        
        return mapToResponse(repository.save(guarantor));
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private TrainingGuarantorResponse mapToResponse(TrainingGuarantor guarantor) {
        return TrainingGuarantorResponse.builder()
                .id(guarantor.getId())
                .contractId(guarantor.getContractId())
                .fullName(guarantor.getFullName())
                .nationalId(guarantor.getNationalId())
                .currentAddress(guarantor.getCurrentAddress())
                .birthAddress(guarantor.getBirthAddress())
                .phone(guarantor.getPhone())
                .scannedDocument(guarantor.getScannedDocument())
                .createdAt(guarantor.getCreatedAt())
                .build();
    }
}
