package com.insa.training.repository;

import com.insa.training.entity.TrainingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingRequestRepository extends JpaRepository<TrainingRequest, Long> {
    List<TrainingRequest> findByRequesterId(String requesterId);
}
