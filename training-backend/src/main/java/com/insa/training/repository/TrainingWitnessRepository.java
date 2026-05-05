package com.insa.training.repository;

import com.insa.training.entity.TrainingWitness;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TrainingWitnessRepository extends JpaRepository<TrainingWitness, Long> {
    List<TrainingWitness> findByContractId(Long contractId);
}
