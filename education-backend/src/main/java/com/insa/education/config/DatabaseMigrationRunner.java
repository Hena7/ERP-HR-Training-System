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
        };
    }
}
