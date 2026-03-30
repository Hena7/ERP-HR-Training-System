package com.insa.training.repository;

import com.insa.training.entity.TrainingContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrainingContractRepository extends JpaRepository<TrainingContract, Long> {
    Optional<TrainingContract> findByRequestId(Long requestId);
}
