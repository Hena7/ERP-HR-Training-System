package com.insa.education.repository;

import com.insa.education.entity.EducationOpportunity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EducationOpportunityRepository extends JpaRepository<EducationOpportunity, Long> {

    @Query("""
            SELECT DISTINCT eo
            FROM EducationOpportunity eo
            LEFT JOIN eo.targetDepartments td
            WHERE (LOWER(eo.department) = LOWER(:department)
               OR LOWER(td) = LOWER(:department))
               AND eo.status = 'OPEN'
            """)
    Page<EducationOpportunity> findVisibleByDepartment(@Param("department") String department, Pageable pageable);
}
