package com.insa.education.repository;

import com.insa.education.entity.CommitteeDecision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommitteeDecisionRepository extends JpaRepository<CommitteeDecision, Long> {
    Optional<CommitteeDecision> findByRequestId(Long requestId);
    boolean existsByRequestId(Long requestId);
}
