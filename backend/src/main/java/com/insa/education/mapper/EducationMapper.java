package com.insa.education.mapper;

import com.insa.education.dto.request.*;
import com.insa.education.dto.response.*;
import com.insa.education.entity.*;
import org.springframework.stereotype.Component;

@Component
public class EducationMapper {

    public EducationRequestResponse toEducationRequestResponse(EducationRequest entity) {
        return EducationRequestResponse.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployee().getId())
                .employeeName(entity.getEmployee().getFirstName() + " " + entity.getEmployee().getLastName())
                .opportunityId(entity.getOpportunity().getId())
                .educationType(entity.getOpportunity().getEducationType())
                .educationLevel(entity.getOpportunity().getEducationLevel())
                .institution(entity.getOpportunity().getInstitution())
                .currentEducationLevel(entity.getCurrentEducationLevel())
                .workExperience(entity.getWorkExperience())
                .performanceScore(entity.getPerformanceScore())
                .employeePhone(entity.getEmployee().getPhone())
                .employeeDepartment(entity.getEmployee().getDepartment())
                .description(entity.getDescription())
                .status(entity.getStatus())
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
                .verifiedBy(entity.getVerifiedBy())
                .verifiedAt(entity.getVerifiedAt())
                .build();
    }

    public CommitteeDecisionResponse toCommitteeDecisionResponse(CommitteeDecision entity) {
        return CommitteeDecisionResponse.builder()
                .id(entity.getId())
                .requestId(entity.getRequest().getId())
                .decision(entity.getDecision())
                .comment(entity.getComment())
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
                .gradedBy(entity.getGradedBy())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public ContractResponse toContractResponse(EducationContract entity) {
        return ContractResponse.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployee().getId())
                .employeeName(entity.getEmployee().getFirstName() + " " + entity.getEmployee().getLastName())
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
}
