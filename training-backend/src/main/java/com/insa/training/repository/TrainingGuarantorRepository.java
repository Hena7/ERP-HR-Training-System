package com.insa.training.repository;

import com.insa.training.entity.TrainingGuarantor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingGuarantorRepository extends JpaRepository<TrainingGuarantor, Long> {
    List<TrainingGuarantor> findByContractId(Long contractId);
}
