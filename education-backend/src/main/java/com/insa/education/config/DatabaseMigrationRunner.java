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

            // Committee Multi-vote Migration
            try {
                jdbcTemplate.execute("ALTER TABLE education_requests ADD COLUMN IF NOT EXISTS committee_approval_count INTEGER DEFAULT 0;");
                // Drop the unique constraint if it exists. Postgres automatically names it something like committee_decisions_request_id_key
                // We'll use a safer way to drop it by looking it up or just attempting common names.
                // Alternatively, just DROP CONSTRAINT if we know the name, but Hibernate usually generates it.
                // A more robust way in Postgres:
                jdbcTemplate.execute("ALTER TABLE committee_decisions DROP CONSTRAINT IF EXISTS committee_decisions_request_id_key;");
                log.info("Successfully applied committee multi-vote patch.");
            } catch (Exception e) {
                log.warn("Committee multi-vote migration skipped or failed: {}", e.getMessage());
            }

            // Education Opportunities Department Migration
            try {
                // If department_id exists, rename it to department. This helps recover legacy data.
                // We'll use a series of try-catches to handle different states safely.
                try {
                    jdbcTemplate.execute("ALTER TABLE education_opportunities RENAME COLUMN department_id TO department;");
                    log.info("Renamed department_id to department in education_opportunities");
                } catch (Exception e) {
                    // Ignore if department_id doesn't exist
                }

                try {
                    jdbcTemplate.execute("ALTER TABLE education_opportunities ALTER COLUMN department TYPE VARCHAR(255);");
                } catch (Exception e) {
                    // Ignore if cannot alter
                }

                jdbcTemplate.execute("ALTER TABLE education_opportunities ADD COLUMN IF NOT EXISTS department VARCHAR(255);");
                log.info("Successfully ensured department column exists in education_opportunities.");
            } catch (Exception e) {
                log.warn("Education Opportunities department migration skipped or failed: {}", e.getMessage());
            }
        };
    }
}
