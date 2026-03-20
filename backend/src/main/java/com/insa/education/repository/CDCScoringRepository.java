package com.insa.education.repository;

import com.insa.education.entity.CDCScoring;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CDCScoringRepository extends JpaRepository<CDCScoring, Long> {

    boolean existsByRequestId(Long requestId);

    Optional<CDCScoring> findByRequestId(Long requestId);

    Page<CDCScoring> findAll(Pageable pageable);
}
