package com.insa.education.repository;

import com.insa.education.entity.EducationProgressReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EducationProgressReportRepository extends JpaRepository<EducationProgressReport, Long> {
    Page<EducationProgressReport> findByContractId(Long contractId, Pageable pageable);
}
