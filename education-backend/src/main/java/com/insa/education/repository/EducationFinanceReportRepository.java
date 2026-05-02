package com.insa.education.repository;

import com.insa.education.entity.EducationFinanceReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EducationFinanceReportRepository extends JpaRepository<EducationFinanceReport, Long> {
    List<EducationFinanceReport> findByContractId(Long contractId);
    List<EducationFinanceReport> findByEmployeeId(String employeeId);
}
