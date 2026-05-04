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
import com.insa.education.util.IdentityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

        if (request.getStatus() != RequestStatus.SCORED && request.getStatus() != RequestStatus.COMMITTEE_REVIEW) {
            throw new BadRequestException("Request must be in SCORED or COMMITTEE_REVIEW status before committee decision.");
        }

        String currentUserId = IdentityUtils.getCurrentUserDisplayName(); // or username
        if (decisionRepository.existsByRequestIdAndDecidedBy(dto.getRequestId(), currentUserId)) {
            throw new DuplicateResourceException("You have already submitted a decision for this request.");
        }

        String decidedBy = IdentityUtils.getCurrentUserDisplayName();

        CommitteeDecision decision = CommitteeDecision.builder()
                .request(request)
                .decision(dto.getDecision())
                .comment(dto.getComment())
                .quota(dto.getQuota())
                .decidedBy(decidedBy)
                .build();

        CommitteeDecision saved = decisionRepository.save(decision);

        if (dto.getDecision() == DecisionStatus.APPROVED) {
            int currentCount = request.getCommitteeApprovalCount() != null ? request.getCommitteeApprovalCount() : 0;
            request.setCommitteeApprovalCount(currentCount + 1);
            
            if (request.getStatus() == RequestStatus.SCORED) {
                request.setStatus(RequestStatus.COMMITTEE_REVIEW);
            }
        } else {
            // If one person rejects, does it fail completely? 
            // In many systems, it just records the rejection. 
            // But let's stay with the user's "requires 4/7 approvals" logic.
            // If they want to reject the whole thing, we'd need a different rule.
            // For now, let's just record the rejection and not change status unless it's a hard reject.
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
