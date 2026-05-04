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

            // Education Completions Workflow Migration
            try {
                jdbcTemplate.execute("ALTER TABLE education_completions ADD COLUMN IF NOT EXISTS sent_to_hr BOOLEAN DEFAULT false;");
                jdbcTemplate.execute("ALTER TABLE education_completions ADD COLUMN IF NOT EXISTS notified_kmc BOOLEAN DEFAULT false;");
                jdbcTemplate.execute("ALTER TABLE education_completions ADD COLUMN IF NOT EXISTS hr_acknowledged BOOLEAN DEFAULT false;");
                jdbcTemplate.execute("ALTER TABLE education_completions ADD COLUMN IF NOT EXISTS kmc_acknowledged BOOLEAN DEFAULT false;");
                log.info("Successfully applied education_completions workflow columns patch.");
            } catch (Exception e) {
                log.warn("Education Completions workflow migration skipped or failed: {}", e.getMessage());
            }
        };
    }
}
