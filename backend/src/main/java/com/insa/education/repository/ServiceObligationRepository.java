package com.insa.education.repository;

import com.insa.education.entity.ServiceObligation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ServiceObligationRepository extends JpaRepository<ServiceObligation, Long> {
    Optional<ServiceObligation> findByContractId(Long contractId);
    boolean existsByContractId(Long contractId);
}
