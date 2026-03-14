package com.insa.education.service;

import com.insa.education.dto.request.GuarantorDto;
import com.insa.education.dto.response.GuarantorResponse;
import com.insa.education.entity.EducationContract;
import com.insa.education.entity.Guarantor;
import com.insa.education.exception.BadRequestException;
import com.insa.education.exception.ResourceNotFoundException;
import com.insa.education.mapper.EducationMapper;
import com.insa.education.repository.EducationContractRepository;
import com.insa.education.repository.GuarantorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GuarantorService {

    private static final Logger log = LoggerFactory.getLogger(GuarantorService.class);

    private final GuarantorRepository guarantorRepository;
    private final EducationContractRepository contractRepository;
    private final EducationMapper mapper;

    public GuarantorService(GuarantorRepository guarantorRepository,
                            EducationContractRepository contractRepository,
                            EducationMapper mapper) {
        this.guarantorRepository = guarantorRepository;
        this.contractRepository = contractRepository;
        this.mapper = mapper;
    }

    @Transactional
    public GuarantorResponse create(GuarantorDto dto) {
        EducationContract contract = contractRepository.findById(dto.getContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with id: " + dto.getContractId()));

        long currentCount = guarantorRepository.countByContractId(dto.getContractId());
        if (currentCount >= 2) {
            throw new BadRequestException("Maximum of 2 guarantors allowed per contract");
        }

        Guarantor guarantor = Guarantor.builder()
                .contract(contract)
                .fullName(dto.getFullName())
                .nationalId(dto.getNationalId())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .build();

        Guarantor saved = guarantorRepository.save(guarantor);
        log.info("Guarantor added: id={}, contract={}", saved.getId(), dto.getContractId());
        return mapper.toGuarantorResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<GuarantorResponse> getByContractId(Long contractId) {
        return guarantorRepository.findByContractId(contractId)
                .stream()
                .map(mapper::toGuarantorResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(Long id) {
        if (!guarantorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Guarantor not found with id: " + id);
        }
        guarantorRepository.deleteById(id);
        log.info("Guarantor deleted: id={}", id);
    }
}
