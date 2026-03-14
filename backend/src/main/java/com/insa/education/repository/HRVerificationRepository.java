package com.insa.education.repository;

import com.insa.education.entity.HRVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HRVerificationRepository extends JpaRepository<HRVerification, Long> {
    Optional<HRVerification> findByRequestId(Long requestId);
    boolean existsByRequestId(Long requestId);
}
