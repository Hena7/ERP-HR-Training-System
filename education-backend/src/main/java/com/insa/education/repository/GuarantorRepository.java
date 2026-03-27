package com.insa.education.repository;

import com.insa.education.entity.Guarantor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuarantorRepository extends JpaRepository<Guarantor, Long> {
    List<Guarantor> findByContractId(Long contractId);
    long countByContractId(Long contractId);
}
