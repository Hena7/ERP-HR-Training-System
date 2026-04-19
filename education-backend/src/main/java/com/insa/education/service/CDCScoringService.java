package com.insa.education.service;

import com.insa.education.dto.request.CDCScoringDto;
import com.insa.education.dto.response.CDCScoringResponse;
import com.insa.education.entity.CDCScoring;
import com.insa.education.entity.EducationRequest;
import com.insa.education.enums.RequestStatus;
import com.insa.education.exception.BadRequestException;
import com.insa.education.exception.DuplicateResourceException;
import com.insa.education.exception.ResourceNotFoundException;
import com.insa.education.mapper.EducationMapper;
import com.insa.education.repository.CDCScoringRepository;
import com.insa.education.repository.EducationRequestRepository;
import com.insa.education.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CDCScoringService {

    private static final Logger log = LoggerFactory.getLogger(CDCScoringService.class);

    /**
     * Scoring weights (must sum to 1.0).
     */
    private static final double WEIGHT_EXPERIENCE   = 0.30;
    private static final double WEIGHT_PERFORMANCE  = 0.50;
    private static final double WEIGHT_DISCIPLINE   = 0.20;

    private final CDCScoringRepository scoringRepository;
    private final EducationRequestRepository requestRepository;
    private final EmployeeRepository employeeRepository;
    private final EducationMapper mapper;

    public CDCScoringService(CDCScoringRepository scoringRepository,
                             EducationRequestRepository requestRepository,
                             EmployeeRepository employeeRepository,
                             EducationMapper mapper) {
        this.scoringRepository = scoringRepository;
        this.requestRepository = requestRepository;
        this.employeeRepository = employeeRepository;
        this.mapper = mapper;
    }

    /**
     * CDC assigns weighted percentage scores to an HR-verified request.
     * Only requests with status {@code HR_VERIFIED} may be scored.
     * After scoring the request status advances to {@code SCORED}.
     */
    @Transactional
    public CDCScoringResponse score(CDCScoringDto dto) {
        EducationRequest request = requestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Education request not found with id: " + dto.getRequestId()));

        if (request.getStatus() != RequestStatus.HR_VERIFIED) {
            throw new BadRequestException(
                    "Request must be in HR_VERIFIED status before CDC scoring");
        }

        if (scoringRepository.existsByRequestId(dto.getRequestId())) {
            throw new DuplicateResourceException(
                    "CDC scoring already exists for request: " + dto.getRequestId());
        }

        validateRawScore(dto.getExperienceScore(),  "Experience score");
        validateRawScore(dto.getPerformanceScore(), "Performance score");
        validateRawScore(dto.getDisciplineScore(),  "Discipline score");

        double totalScore = dto.getTotalScore() != null ? dto.getTotalScore() : calculateTotalScore(
                dto.getExperienceScore(),
                dto.getPerformanceScore(),
                dto.getDisciplineScore()
        );

        // Retrieve the display name from the Keycloak JWT claims
        String gradedBy;
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            var claims = jwtAuth.getToken().getClaims();
            String name = (String) claims.get("name");
            if (name == null || name.isBlank()) name = (String) claims.get("preferred_username");
            if (name == null || name.isBlank()) name = (String) claims.get("given_name");
            gradedBy = (name != null && !name.isBlank()) ? name : auth.getName();
        } else {
            gradedBy = auth.getName();
        }

        CDCScoring scoring = CDCScoring.builder()
                .request(request)
                .experienceScore(dto.getExperienceScore())
                .performanceScore(dto.getPerformanceScore())
                .disciplineScore(dto.getDisciplineScore())
                .totalScore(totalScore)
                .gradedBy(gradedBy)
                .build();

        CDCScoring saved = scoringRepository.save(scoring);

        request.setStatus(RequestStatus.SCORED);
        request.setTotalScore(totalScore);
        requestRepository.save(request);

        log.info("CDC scoring for request {}: experience={}, performance={}, discipline={}, total={}%",
                dto.getRequestId(),
                dto.getExperienceScore(),
                dto.getPerformanceScore(),
                dto.getDisciplineScore(),
                totalScore);

        return mapper.toCDCScoringResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<CDCScoringResponse> getAll(Pageable pageable) {
        return scoringRepository.findAll(pageable)
                .map(mapper::toCDCScoringResponse);
    }

    @Transactional(readOnly = true)
    public CDCScoringResponse getByRequestId(Long requestId) {
        CDCScoring scoring = scoringRepository.findByRequestId(requestId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "CDC scoring not found for request: " + requestId));
        return mapper.toCDCScoringResponse(scoring);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────

    private double calculateTotalScore(double experience, double performance, double discipline) {
        double raw = (experience  * WEIGHT_EXPERIENCE)
                   + (performance * WEIGHT_PERFORMANCE)
                   + (discipline  * WEIGHT_DISCIPLINE);
        // Round to 2 decimal places
        return Math.round(raw * 100.0) / 100.0;
    }

    private void validateRawScore(Double score, String fieldName) {
        if (score == null) {
            throw new BadRequestException(fieldName + " is required");
        }
        if (score < 0 || score > 100) {
            throw new BadRequestException(fieldName + " must be between 0 and 100");
        }
    }
}
