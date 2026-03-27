package com.insa.education.repository;

import com.insa.education.entity.EducationContract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EducationContractRepository extends JpaRepository<EducationContract, Long> {
    Page<EducationContract> findByEmployeeId(Long employeeId, Pageable pageable);
    Optional<EducationContract> findByRequestId(Long requestId);
    boolean existsByRequestId(Long requestId);
}
