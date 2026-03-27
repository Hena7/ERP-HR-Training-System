package com.insa.education.service;

import com.insa.education.dto.request.EducationCompletionDto;
import com.insa.education.dto.response.EducationCompletionResponse;
import com.insa.education.entity.EducationCompletion;
import com.insa.education.entity.EducationContract;
import com.insa.education.entity.ServiceObligation;
import com.insa.education.enums.StudyMode;
import com.insa.education.exception.DuplicateResourceException;
import com.insa.education.exception.ResourceNotFoundException;
import com.insa.education.mapper.EducationMapper;
import com.insa.education.repository.EducationCompletionRepository;
import com.insa.education.repository.EducationContractRepository;
import com.insa.education.repository.ServiceObligationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EducationCompletionService {

    private static final Logger log = LoggerFactory.getLogger(EducationCompletionService.class);

    private final EducationCompletionRepository completionRepository;
    private final EducationContractRepository contractRepository;
    private final ServiceObligationRepository obligationRepository;
    private final EducationMapper mapper;

    public EducationCompletionService(EducationCompletionRepository completionRepository,
                                      EducationContractRepository contractRepository,
                                      ServiceObligationRepository obligationRepository,
                                      EducationMapper mapper) {
        this.completionRepository = completionRepository;
        this.contractRepository = contractRepository;
        this.obligationRepository = obligationRepository;
        this.mapper = mapper;
    }

    @Transactional
    public EducationCompletionResponse create(EducationCompletionDto dto) {
        EducationContract contract = contractRepository.findById(dto.getContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with id: " + dto.getContractId()));

        if (completionRepository.existsByContractId(dto.getContractId())) {
            throw new DuplicateResourceException("Completion record already exists for contract: " + dto.getContractId());
        }

        EducationCompletion completion = EducationCompletion.builder()
                .contract(contract)
                .completionDate(dto.getCompletionDate())
                .returnToWorkDate(dto.getReturnToWorkDate())
                .researchPresentationDate(dto.getResearchPresentationDate())
                .build();

        EducationCompletion saved = completionRepository.save(completion);

        // Automatically calculate service obligation
        calculateServiceObligation(contract);

        log.info("Education completion recorded: contract={}", dto.getContractId());
        return mapper.toCompletionResponse(saved);
    }

    private void calculateServiceObligation(EducationContract contract) {
        if (obligationRepository.existsByContractId(contract.getId())) {
            return;
        }

        int studyYears = contract.getDurationYears();
        int requiredServiceYears;

        if (contract.getStudyMode() == StudyMode.ON_JOB) {
            requiredServiceYears = studyYears;
        } else {
            requiredServiceYears = studyYears * 2;
        }

        ServiceObligation obligation = ServiceObligation.builder()
                .contract(contract)
                .studyYears(studyYears)
                .requiredServiceYears(requiredServiceYears)
                .build();

        obligationRepository.save(obligation);
        log.info("Service obligation calculated: contract={}, required years={}", contract.getId(), requiredServiceYears);
    }

    @Transactional(readOnly = true)
    public EducationCompletionResponse getByContractId(Long contractId) {
        EducationCompletion completion = completionRepository.findByContractId(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Completion not found for contract: " + contractId));
        return mapper.toCompletionResponse(completion);
    }

    @Transactional(readOnly = true)
    public Page<EducationCompletionResponse> getAll(Pageable pageable) {
        return completionRepository.findAll(pageable).map(mapper::toCompletionResponse);
    }
}
