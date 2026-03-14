package com.insa.education.service;

import com.insa.education.dto.request.HRVerificationDto;
import com.insa.education.dto.response.HRVerificationResponse;
import com.insa.education.entity.EducationRequest;
import com.insa.education.entity.HRVerification;
import com.insa.education.enums.RequestStatus;
import com.insa.education.exception.BadRequestException;
import com.insa.education.exception.DuplicateResourceException;
import com.insa.education.exception.ResourceNotFoundException;
import com.insa.education.mapper.EducationMapper;
import com.insa.education.repository.EducationRequestRepository;
import com.insa.education.repository.HRVerificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HRVerificationService {

    private static final Logger log = LoggerFactory.getLogger(HRVerificationService.class);

    private final HRVerificationRepository verificationRepository;
    private final EducationRequestRepository requestRepository;
    private final EducationMapper mapper;

    public HRVerificationService(HRVerificationRepository verificationRepository,
                                 EducationRequestRepository requestRepository,
                                 EducationMapper mapper) {
        this.verificationRepository = verificationRepository;
        this.requestRepository = requestRepository;
        this.mapper = mapper;
    }

    @Transactional
    public HRVerificationResponse verify(HRVerificationDto dto) {
        EducationRequest request = requestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Education request not found with id: " + dto.getRequestId()));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Request must be in PENDING status for HR verification");
        }

        if (verificationRepository.existsByRequestId(dto.getRequestId())) {
            throw new DuplicateResourceException("HR verification already exists for request: " + dto.getRequestId());
        }

        String verifiedBy = SecurityContextHolder.getContext().getAuthentication().getName();

        HRVerification verification = HRVerification.builder()
                .request(request)
                .workExperience(dto.getWorkExperience())
                .performanceScore(dto.getPerformanceScore())
                .disciplineRecord(dto.getDisciplineRecord())
                .verifiedBy(verifiedBy)
                .build();

        HRVerification saved = verificationRepository.save(verification);

        request.setStatus(RequestStatus.HR_VERIFIED);
        requestRepository.save(request);

        log.info("HR verification completed for request: {}", dto.getRequestId());
        return mapper.toHRVerificationResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<HRVerificationResponse> getAll(Pageable pageable) {
        return verificationRepository.findAll(pageable).map(mapper::toHRVerificationResponse);
    }

    @Transactional(readOnly = true)
    public HRVerificationResponse getByRequestId(Long requestId) {
        HRVerification verification = verificationRepository.findByRequestId(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("HR verification not found for request: " + requestId));
        return mapper.toHRVerificationResponse(verification);
    }
}
