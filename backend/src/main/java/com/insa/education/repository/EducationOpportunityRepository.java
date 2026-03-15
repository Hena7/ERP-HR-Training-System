package com.insa.education.repository;

import com.insa.education.entity.EducationOpportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EducationOpportunityRepository extends JpaRepository<EducationOpportunity, Long> {
}
