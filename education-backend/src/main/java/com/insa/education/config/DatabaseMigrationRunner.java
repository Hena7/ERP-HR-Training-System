package com.insa.education.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseMigrationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseMigrationRunner.class);

    @Bean
    public CommandLineRunner runDatabaseMigrations(JdbcTemplate jdbcTemplate) {
        return args -> {
            log.info("Running custom database migrations...");
            try {
                jdbcTemplate.execute("ALTER TABLE education_contracts ALTER COLUMN employee_id DROP NOT NULL;");
                log.info("Successfully dropped NOT NULL constraint on education_contracts.employee_id");
            } catch (Exception e) {
                log.warn("Migration skipped or failed (constraint may already be relaxed): {}", e.getMessage());
            }

            try {
                jdbcTemplate.execute("ALTER TABLE education_requests ALTER COLUMN employee_id DROP NOT NULL;");
                log.info("Successfully dropped NOT NULL constraint on education_requests.employee_id");
            } catch (Exception e) {
                log.warn("Migration skipped or failed for education_requests: {}", e.getMessage());
            }

            // Department Migration
            try {
                // Check if the old string column still exists
                Integer columnExists = jdbcTemplate.queryForObject(
                        "SELECT count(*) FROM information_schema.columns WHERE table_name='employees' AND column_name='department'",
                        Integer.class
                );

                if (columnExists != null && columnExists > 0) {
                    log.info("Starting department data migration...");
                    // 1. Insert unique departments into departments table
                    jdbcTemplate.execute(
                            "INSERT INTO departments (name, created_at) " +
                            "SELECT DISTINCT department, CURRENT_TIMESTAMP " +
                            "FROM employees " +
                            "WHERE department IS NOT NULL AND department != '' " +
                            "ON CONFLICT (name) DO NOTHING"
                    );

                    // 2. Update employees with the new department_id
                    jdbcTemplate.execute(
                            "UPDATE employees e " +
                            "SET department_id = d.id " +
                            "FROM departments d " +
                            "WHERE e.department = d.name"
                    );

                    // 3. Drop the old string column
                    jdbcTemplate.execute("ALTER TABLE employees DROP COLUMN department");
                    log.info("Successfully migrated department data and dropped old column.");
                }
            } catch (Exception e) {
                log.warn("Department migration skipped or failed: {}", e.getMessage());
            }

            // Education Opportunities Migration
            try {
                // Check if the old string column still exists in education_opportunities
                Integer oppColumnExists = jdbcTemplate.queryForObject(
                        "SELECT count(*) FROM information_schema.columns WHERE table_name='education_opportunities' AND column_name='department'",
                        Integer.class
                );

                if (oppColumnExists != null && oppColumnExists > 0) {
                    log.info("Starting education_opportunities data migration...");
                    // 1. Insert unique departments from education_opportunities
                    jdbcTemplate.execute(
                            "INSERT INTO departments (name, created_at) " +
                            "SELECT DISTINCT department, CURRENT_TIMESTAMP " +
                            "FROM education_opportunities " +
                            "WHERE department IS NOT NULL AND department != '' " +
                            "ON CONFLICT (name) DO NOTHING"
                    );

                    // 2. Update education_opportunities with new department_id
                    jdbcTemplate.execute(
                            "UPDATE education_opportunities e " +
                            "SET department_id = d.id " +
                            "FROM departments d " +
                            "WHERE e.department = d.name"
                    );

                    // 3. Drop old column
                    jdbcTemplate.execute("ALTER TABLE education_opportunities DROP COLUMN department");
                    log.info("Successfully migrated education_opportunities department column.");
                }

                // Check if the old string column still exists in education_opportunity_target_departments
                Integer targetColumnExists = jdbcTemplate.queryForObject(
                        "SELECT count(*) FROM information_schema.columns WHERE table_name='education_opportunity_target_departments' AND column_name='department_name'",
                        Integer.class
                );

                if (targetColumnExists != null && targetColumnExists > 0) {
                    log.info("Starting education_opportunity_target_departments data migration...");
                    // 1. Insert unique departments from target_departments
                    jdbcTemplate.execute(
                            "INSERT INTO departments (name, created_at) " +
                            "SELECT DISTINCT department_name, CURRENT_TIMESTAMP " +
                            "FROM education_opportunity_target_departments " +
                            "WHERE department_name IS NOT NULL AND department_name != '' " +
                            "ON CONFLICT (name) DO NOTHING"
                    );

                    // 2. Update education_opportunity_target_departments with new department_id
                    // Note: Since target_departments is essentially a join table now, we can just populate department_id
                    // Hibernate will create the column, but we must populate it before dropping department_name
                    
                    // First, ensure department_id column exists (Hibernate creates it usually, but if we beat it...)
                    jdbcTemplate.execute("ALTER TABLE education_opportunity_target_departments ADD COLUMN IF NOT EXISTS department_id BIGINT");
                    
                    jdbcTemplate.execute(
                            "UPDATE education_opportunity_target_departments t " +
                            "SET department_id = d.id " +
                            "FROM departments d " +
                            "WHERE t.department_name = d.name"
                    );

                    // 3. Drop old column
                    jdbcTemplate.execute("ALTER TABLE education_opportunity_target_departments DROP COLUMN department_name");
                    log.info("Successfully migrated education_opportunity_target_departments.");
                }
            } catch (Exception e) {
                log.warn("Education Opportunities department migration skipped or failed: {}", e.getMessage());
            }
        };
    }
}
