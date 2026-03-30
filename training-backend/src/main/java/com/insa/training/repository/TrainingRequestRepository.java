package com.insa.training.repository;

import com.insa.training.entity.TrainingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainingRequestRepository extends JpaRepository<TrainingRequest, Long> {
}
