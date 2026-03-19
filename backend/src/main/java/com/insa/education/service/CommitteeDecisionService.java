package com.insa.education.service;

import com.insa.education.dto.request.CommitteeDecisionDto;
import com.insa.education.dto.response.CommitteeDecisionResponse;
import com.insa.education.entity.CommitteeDecision;
import com.insa.education.entity.EducationRequest;
import com.insa.education.enums.DecisionStatus;
import com.insa.education.enums.RequestStatus;
import com.insa.education.exception.BadRequestException;
import com.insa.education.exception.DuplicateResourceException;
import com.insa.education.exception.ResourceNotFoundException;
import com.insa.education.mapper.EducationMapper;
import com.insa.education.repository.CommitteeDecisionRepository;
import com.insa.education.repository.EducationRequestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommitteeDecisionService {

    private static final Logger log = LoggerFactory.getLogger(CommitteeDecisionService.class);

    private final CommitteeDecisionRepository decisionRepository;
    private final EducationRequestRepository requestRepository;
    private final EducationMapper mapper;

    public CommitteeDecisionService(CommitteeDecisionRepository decisionRepository,
                                    EducationRequestRepository requestRepository,
                                    EducationMapper mapper) {
        this.decisionRepository = decisionRepository;
        this.requestRepository = requestRepository;
        this.mapper = mapper;
    }

    @Transactional
    public CommitteeDecisionResponse decide(CommitteeDecisionDto dto) {
        EducationRequest request = requestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Education request not found with id: " + dto.getRequestId()));

        if (request.getStatus() != RequestStatus.HR_VERIFIED) {
            throw new BadRequestException("Request must be in HR_VERIFIED status before committee decision");
        }

        if (decisionRepository.existsByRequestId(dto.getRequestId())) {
            throw new DuplicateResourceException("Committee decision already exists for request: " + dto.getRequestId());
        }

        String decidedBy = SecurityContextHolder.getContext().getAuthentication().getName();

        CommitteeDecision decision = CommitteeDecision.builder()
                .request(request)
                .decision(dto.getDecision())
                .comment(dto.getComment())
                .decidedBy(decidedBy)
                .build();

        CommitteeDecision saved = decisionRepository.save(decision);

        if (dto.getDecision() == DecisionStatus.APPROVED) {
            request.setStatus(RequestStatus.APPROVED);
        } else {
            request.setStatus(RequestStatus.REJECTED);
        }
        requestRepository.save(request);

        log.info("Committee decision for request {}: {}", dto.getRequestId(), dto.getDecision());
        return mapper.toCommitteeDecisionResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<CommitteeDecisionResponse> getAll(Pageable pageable) {
        return decisionRepository.findAll(pageable).map(mapper::toCommitteeDecisionResponse);
    }

    @Transactional(readOnly = true)
    public CommitteeDecisionResponse getByRequestId(Long requestId) {
        CommitteeDecision decision = decisionRepository.findByRequestId(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Committee decision not found for request: " + requestId));
        return mapper.toCommitteeDecisionResponse(decision);
    }
}
