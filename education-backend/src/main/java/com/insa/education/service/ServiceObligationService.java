package com.insa.education.service;

import com.insa.education.dto.response.ServiceObligationResponse;
import com.insa.education.entity.ServiceObligation;
import com.insa.education.exception.ResourceNotFoundException;
import com.insa.education.mapper.EducationMapper;
import com.insa.education.repository.ServiceObligationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ServiceObligationService {

    private static final Logger log = LoggerFactory.getLogger(ServiceObligationService.class);

    private final ServiceObligationRepository obligationRepository;
    private final EducationMapper mapper;

    public ServiceObligationService(ServiceObligationRepository obligationRepository,
                                    EducationMapper mapper) {
        this.obligationRepository = obligationRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public ServiceObligationResponse getByContractId(Long contractId) {
        ServiceObligation obligation = obligationRepository.findByContractId(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Service obligation not found for contract: " + contractId));
        return mapper.toServiceObligationResponse(obligation);
    }

    @Transactional(readOnly = true)
    public Page<ServiceObligationResponse> getAll(Pageable pageable) {
        return obligationRepository.findAll(pageable).map(mapper::toServiceObligationResponse);
    }
}
