package com.insa.education.service;

import com.insa.education.dto.request.ProgressReportDto;
import com.insa.education.dto.response.ProgressReportResponse;
import com.insa.education.entity.EducationContract;
import com.insa.education.entity.EducationProgressReport;
import com.insa.education.exception.ResourceNotFoundException;
import com.insa.education.mapper.EducationMapper;
import com.insa.education.repository.EducationContractRepository;
import com.insa.education.repository.EducationProgressReportRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProgressReportService {

    private static final Logger log = LoggerFactory.getLogger(ProgressReportService.class);

    private final EducationProgressReportRepository reportRepository;
    private final EducationContractRepository contractRepository;
    private final EducationMapper mapper;

    public ProgressReportService(EducationProgressReportRepository reportRepository,
                                 EducationContractRepository contractRepository,
                                 EducationMapper mapper) {
        this.reportRepository = reportRepository;
        this.contractRepository = contractRepository;
        this.mapper = mapper;
    }

    @Transactional
    public ProgressReportResponse create(ProgressReportDto dto) {
        EducationContract contract = contractRepository.findById(dto.getContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with id: " + dto.getContractId()));

        EducationProgressReport report = EducationProgressReport.builder()
                .contract(contract)
                .reportMonth(dto.getReportMonth())
                .description(dto.getDescription())
                .build();

        EducationProgressReport saved = reportRepository.save(report);
        log.info("Progress report submitted: id={}, contract={}", saved.getId(), dto.getContractId());
        return mapper.toProgressReportResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ProgressReportResponse> getByContractId(Long contractId, Pageable pageable) {
        return reportRepository.findByContractId(contractId, pageable).map(mapper::toProgressReportResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProgressReportResponse> getAll(Pageable pageable) {
        return reportRepository.findAll(pageable).map(mapper::toProgressReportResponse);
    }
}
