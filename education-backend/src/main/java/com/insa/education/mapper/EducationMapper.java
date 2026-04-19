package com.insa.education.mapper;

import com.insa.education.dto.request.*;
import com.insa.education.dto.response.*;
import com.insa.education.entity.*;
import com.insa.education.repository.EmployeeRepository;
import org.springframework.stereotype.Component;

@Component
public class EducationMapper {

    private final EmployeeRepository employeeRepository;

    public EducationMapper(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public EducationRequestResponse toEducationRequestResponse(EducationRequest entity) {
        String name   = entity.getEmployee() != null
                ? entity.getEmployee().getFirstName() + " " + entity.getEmployee().getLastName()
                : entity.getManualEmployeeName();
        String phone  = entity.getEmployee() != null
                ? entity.getEmployee().getPhone()
                : entity.getManualEmployeePhone();
        String dept   = entity.getEmployee() != null
                ? entity.getEmployee().getDepartment()
                : entity.getManualEmployeeDept();

        return EducationRequestResponse.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployee() != null ? entity.getEmployee().getId() : null)
                .employeeName(name)
                .opportunityId(entity.getOpportunity() != null ? entity.getOpportunity().getId() : null)
                .educationCategory(entity.getEducationCategory())
                .fieldOfStudy(entity.getFieldOfStudy())
                .institution(entity.getInstitution())
                .targetEducationLevel(entity.getTargetEducationLevel())
                .budgetYear(entity.getBudgetYear())
                .award(entity.getAward())
                .duration(entity.getDuration())
                .programTime(entity.getProgramTime())
                .location(entity.getLocation())
                .currentEducationLevel(entity.getCurrentEducationLevel())
                .workExperience(entity.getWorkExperience())
                .performanceScore(entity.getPerformanceScore())
                .employeePhone(phone)
                .employeeDepartment(dept)
                .description(entity.getDescription())
                .status(entity.getStatus())
                .commitmentSource(entity.getCommitmentSource() != null ? entity.getCommitmentSource().name() : null)
                .totalScore(entity.getTotalScore())
                .candidateId(entity.getCandidateId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public HRVerificationResponse toHRVerificationResponse(HRVerification entity) {
        return HRVerificationResponse.builder()
                .id(entity.getId())
                .requestId(entity.getRequest().getId())
                .semester1Score(entity.getSemester1Score())
                .semester2Score(entity.getSemester2Score())
                .averageScore(entity.getAverageScore())
                .status(entity.getStatus() != null ? entity.getStatus().name() : null)
                .verifiedBy(resolveIdentityName(entity.getVerifiedBy()))
                .verifiedAt(entity.getVerifiedAt())
                .experienceYears(entity.getExperienceYears())
                .experienceMonths(entity.getExperienceMonths())
                .isDisabled(entity.getIsDisabled())
                .gender(entity.getGender())
                .hasDiscipline(entity.getHasDiscipline())
                .disciplineDescription(entity.getDisciplineDescription())
                .experienceSubScore(entity.getExperienceSubScore())
                .performanceSubScore(entity.getPerformanceSubScore())
                .disciplineSubScore(entity.getDisciplineSubScore())
                .affirmativeBonus(entity.getAffirmativeBonus())
                .totalCalculatedScore(entity.getTotalCalculatedScore())
                .build();
    }

    public CommitteeDecisionResponse toCommitteeDecisionResponse(CommitteeDecision entity) {
        return CommitteeDecisionResponse.builder()
                .id(entity.getId())
                .requestId(entity.getRequest().getId())
                .decision(entity.getDecision())
                .comment(entity.getComment())
                .quota(entity.getQuota())
                .decidedBy(entity.getDecidedBy())
                .decisionDate(entity.getDecisionDate())
                .build();
    }

    public CDCScoringResponse toCDCScoringResponse(CDCScoring entity) {
        return CDCScoringResponse.builder()
                .id(entity.getId())
                .requestId(entity.getRequest().getId())
                .experienceScore(entity.getExperienceScore())
                .performanceScore(entity.getPerformanceScore())
                .disciplineScore(entity.getDisciplineScore())
                .totalScore(entity.getTotalScore())
                .gradedBy(resolveIdentityName(entity.getGradedBy()))
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public ContractResponse toContractResponse(EducationContract entity) {
        return ContractResponse.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployee() != null ? entity.getEmployee().getId() : null)
                .employeeName(entity.getEmployee() != null 
                        ? entity.getEmployee().getFirstName() + " " + entity.getEmployee().getLastName()
                        : (entity.getRequest() != null ? entity.getRequest().getManualEmployeeName() : ""))
                .requestId(entity.getRequest().getId())
                .university(entity.getUniversity())
                .program(entity.getProgram())
                .studyCountry(entity.getStudyCountry())
                .studyCity(entity.getStudyCity())
                .durationYears(entity.getDurationYears())
                .studyMode(entity.getStudyMode())
                .estimatedCost(entity.getEstimatedCost())
                .contractSignedDate(entity.getContractSignedDate())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public GuarantorResponse toGuarantorResponse(Guarantor entity) {
        return GuarantorResponse.builder()
                .id(entity.getId())
                .contractId(entity.getContract().getId())
                .fullName(entity.getFullName())
                .nationalId(entity.getNationalId())
                .phone(entity.getPhone())
                .address(entity.getAddress())
                .guarantorType(entity.getGuarantorType() != null ? entity.getGuarantorType().name() : null)
                .scannedDocument(entity.getScannedDocument())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public ProgressReportResponse toProgressReportResponse(EducationProgressReport entity) {
        return ProgressReportResponse.builder()
                .id(entity.getId())
                .contractId(entity.getContract().getId())
                .reportMonth(entity.getReportMonth())
                .description(entity.getDescription())
                .submittedAt(entity.getSubmittedAt())
                .build();
    }

    public EducationCompletionResponse toCompletionResponse(EducationCompletion entity) {
        return EducationCompletionResponse.builder()
                .id(entity.getId())
                .contractId(entity.getContract().getId())
                .completionDate(entity.getCompletionDate())
                .returnToWorkDate(entity.getReturnToWorkDate())
                .researchPresentationDate(entity.getResearchPresentationDate())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public ServiceObligationResponse toServiceObligationResponse(ServiceObligation entity) {
        return ServiceObligationResponse.builder()
                .id(entity.getId())
                .contractId(entity.getContract().getId())
                .studyYears(entity.getStudyYears())
                .requiredServiceYears(entity.getRequiredServiceYears())
                .serviceStartDate(entity.getServiceStartDate())
                .serviceEndDate(entity.getServiceEndDate())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public EmployeeResponse toEmployeeResponse(Employee entity) {
        return EmployeeResponse.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployeeId())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .gender(entity.getGender())
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .department(entity.getDepartment())
                .position(entity.getPosition())
                .role(entity.getRole())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private String resolveIdentityName(String identity) {
        if (identity == null || identity.isBlank()) return "-";
        try {
            // If it's already a full name (contains space and not a pure UUID format), keep it
            if (identity.contains(" ") && !identity.matches(".*[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-.*")) {
                return identity;
            }

            // 1. Try exact match on email
            var employee = employeeRepository.findByEmail(identity);

            // 2. Try case-insensitive match on email (lower)
            if (employee.isEmpty()) {
                employee = employeeRepository.findByEmail(identity.toLowerCase());
            }

            // 3. Try case-insensitive match on email (upper)
            if (employee.isEmpty()) {
                employee = employeeRepository.findByEmail(identity.toUpperCase());
            }

            // 4. Try exact match on employeeId (some systems store the UUID there)
            if (employee.isEmpty()) {
                employee = employeeRepository.findByEmployeeId(identity);
            }

            return employee.map(e -> e.getFirstName() + " " + e.getLastName())
                    .orElse(identity);
        } catch (Exception e) {
            // Safe fallback — never let name resolution crash the response
            return identity;
        }
    }
}
