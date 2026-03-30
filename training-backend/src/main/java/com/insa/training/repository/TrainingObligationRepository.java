package com.insa.training.repository;

import com.insa.training.entity.TrainingObligation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrainingObligationRepository extends JpaRepository<TrainingObligation, Long> {
    Optional<TrainingObligation> findByContractId(Long contractId);
}
