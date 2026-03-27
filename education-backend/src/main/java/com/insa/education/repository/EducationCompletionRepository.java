package com.insa.education.repository;

import com.insa.education.entity.EducationCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EducationCompletionRepository extends JpaRepository<EducationCompletion, Long> {
    Optional<EducationCompletion> findByContractId(Long contractId);
    boolean existsByContractId(Long contractId);
}
