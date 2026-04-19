package com.insa.education.service;

import com.insa.education.dto.request.HRVerificationDto;
import com.insa.education.dto.response.HRVerificationResponse;
import com.insa.education.entity.EducationRequest;
import com.insa.education.entity.HRVerification;
import com.insa.education.enums.HRVerificationStatus;
import com.insa.education.enums.RequestStatus;
import com.insa.education.exception.BadRequestException;
import com.insa.education.exception.DuplicateResourceException;
import com.insa.education.exception.ResourceNotFoundException;
import com.insa.education.mapper.EducationMapper;
import com.insa.education.repository.EducationRequestRepository;
import com.insa.education.repository.EmployeeRepository;
import com.insa.education.repository.HRVerificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HRVerificationService {

    private static final Logger log = LoggerFactory.getLogger(HRVerificationService.class);

    private final HRVerificationRepository verificationRepository;
    private final EducationRequestRepository requestRepository;
    private final EmployeeRepository employeeRepository;
    private final EducationMapper mapper;

    public HRVerificationService(HRVerificationRepository verificationRepository,
                                 EducationRequestRepository requestRepository,
                                 EmployeeRepository employeeRepository,
                                 EducationMapper mapper) {
        this.verificationRepository = verificationRepository;
        this.requestRepository = requestRepository;
        this.employeeRepository = employeeRepository;
        this.mapper = mapper;
    }

    @Transactional
    public HRVerificationResponse verify(HRVerificationDto dto) {
        EducationRequest request = requestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Education request not found with id: " + dto.getRequestId()));

        if (request.getStatus() != RequestStatus.FORWARDED_TO_HR) {
            throw new BadRequestException(
                    "Request must be in FORWARDED_TO_HR status for HR verification");
        }

        if (verificationRepository.existsByRequestId(dto.getRequestId())) {
            throw new DuplicateResourceException(
                    "HR verification already exists for request: " + dto.getRequestId());
        }

        validateScore(dto.getSemester1Score(), "Semester 1 score");
        validateScore(dto.getSemester2Score(), "Semester 2 score");

        HRVerificationStatus verificationStatus =
                dto.getStatus() == null ? HRVerificationStatus.VERIFIED : dto.getStatus();

        double averageScore = calculateAverage(dto.getSemester1Score(), dto.getSemester2Score());
        
        // Retrieve the display name from the Keycloak JWT claims
        String verifiedBy;
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            var claims = jwtAuth.getToken().getClaims();
            String name = (String) claims.get("name");
            if (name == null || name.isBlank()) name = (String) claims.get("preferred_username");
            if (name == null || name.isBlank()) name = (String) claims.get("given_name");
            verifiedBy = (name != null && !name.isBlank()) ? name : auth.getName();
        } else {
            verifiedBy = auth.getName();
        }

        HRVerification verification = HRVerification.builder()
                .request(request)
                .semester1Score(dto.getSemester1Score())
                .semester2Score(dto.getSemester2Score())
                .averageScore(averageScore)
                .status(verificationStatus)
                .verifiedBy(verifiedBy)
                .experienceYears(dto.getExperienceYears())
                .experienceMonths(dto.getExperienceMonths())
                .isDisabled(dto.getIsDisabled())
                .gender(dto.getGender())
                .hasDiscipline(dto.getHasDiscipline())
                .disciplineDescription(dto.getDisciplineDescription())
                .experienceSubScore(dto.getExperienceSubScore())
                .performanceSubScore(dto.getPerformanceSubScore())
                .disciplineSubScore(dto.getDisciplineSubScore())
                .affirmativeBonus(dto.getAffirmativeBonus())
                .totalCalculatedScore(dto.getTotalCalculatedScore())
                .build();

        HRVerification saved = verificationRepository.save(verification);

        if (verificationStatus == HRVerificationStatus.VERIFIED) {
            request.setStatus(RequestStatus.HR_VERIFIED);
        } else {
            request.setStatus(RequestStatus.REJECTED);
        }
        requestRepository.save(request);

        log.info(
                "HR verification completed for request: {}, status: {}, averageScore: {}",
                dto.getRequestId(),
                verificationStatus,
                averageScore
        );

        return mapper.toHRVerificationResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<HRVerificationResponse> getAll(Pageable pageable) {
        return verificationRepository.findAll(pageable)
                .map(mapper::toHRVerificationResponse);
    }

    @Transactional(readOnly = true)
    public HRVerificationResponse getByRequestId(Long requestId) {
        HRVerification verification = verificationRepository.findByRequestId(requestId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "HR verification not found for request: " + requestId));
        return mapper.toHRVerificationResponse(verification);
    }

    private void validateScore(Double score, String fieldName) {
        if (score == null) {
            throw new BadRequestException(fieldName + " is required");
        }

        if (score < 0 || score > 100) {
            throw new BadRequestException(fieldName + " must be between 0 and 100");
        }
    }

    private double calculateAverage(Double semester1Score, Double semester2Score) {
        return (semester1Score + semester2Score) / 2.0;
    }
}
