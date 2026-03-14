package com.insa.education.repository;

import com.insa.education.entity.EducationRequest;
import com.insa.education.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationRequestRepository extends JpaRepository<EducationRequest, Long> {
    Page<EducationRequest> findByEmployeeId(Long employeeId, Pageable pageable);
    Page<EducationRequest> findByStatus(RequestStatus status, Pageable pageable);
    List<EducationRequest> findByEmployeeIdAndStatus(Long employeeId, RequestStatus status);
}
