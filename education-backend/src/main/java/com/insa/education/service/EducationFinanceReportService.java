package com.insa.education.service;

import com.insa.education.dto.request.FinanceReportDto;
import com.insa.education.entity.EducationFinanceReport;
import com.insa.education.repository.EducationFinanceReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EducationFinanceReportService {

    private final EducationFinanceReportRepository repository;

    public EducationFinanceReportService(EducationFinanceReportRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public EducationFinanceReport createReport(FinanceReportDto dto) {
        double total = (dto.getTuitionFees() != null ? dto.getTuitionFees() : 0) +
                       (dto.getLivingAllowance() != null ? dto.getLivingAllowance() : 0) +
                       (dto.getOtherExpenses() != null ? dto.getOtherExpenses() : 0);

        EducationFinanceReport report = EducationFinanceReport.builder()
                .contractId(dto.getContractId())
                .employeeId(dto.getEmployeeId())
                .reportingPeriod(dto.getReportingPeriod())
                .periodValue(dto.getPeriodValue())
                .tuitionFees(dto.getTuitionFees())
                .livingAllowance(dto.getLivingAllowance())
                .otherExpenses(dto.getOtherExpenses())
                .totalAmount(total)
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "ETB")
                .description(dto.getDescription())
                .submittedAt(LocalDateTime.now())
                .status("PENDING")
                .build();

        return repository.save(report);
    }

    @Transactional(readOnly = true)
    public List<EducationFinanceReport> getByContractId(Long contractId) {
        return repository.findByContractId(contractId);
    }

    @Transactional(readOnly = true)
    public List<EducationFinanceReport> getByEmployeeId(String employeeId) {
        return repository.findByEmployeeId(employeeId);
    }

    @Transactional(readOnly = true)
    public List<EducationFinanceReport> getAll() {
        return repository.findAll();
    }
}
