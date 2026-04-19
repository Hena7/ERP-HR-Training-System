package com.insa.education.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

/**
 * One-time schema patches that Hibernate ddl-auto=update cannot handle on its own
 * (e.g. dropping NOT NULL constraints on existing columns).
 * Runs AFTER Hibernate has finished its own DDL so it is always safe.
 */
@Configuration
public class SchemaMigration {

    private static final Logger log = LoggerFactory.getLogger(SchemaMigration.class);

    @Bean
    ApplicationRunner applySchemaPatches(DataSource dataSource) {
        return args -> {
            try (Connection conn = dataSource.getConnection();
                 Statement stmt = conn.createStatement()) {

                // Allow education_requests to be saved without a linked employee
                // (manual/external candidates who are not in the employees table).
                stmt.execute(
                    "ALTER TABLE IF EXISTS education_requests " +
                    "ALTER COLUMN employee_id DROP NOT NULL"
                );
                log.info("Schema patch applied: education_requests.employee_id is now nullable.");

                // Drop restrictive enum check constraint so newly added status like COMMITTEE_REPORTED can be saved
                stmt.execute(
                    "ALTER TABLE IF EXISTS education_requests " +
                    "DROP CONSTRAINT IF EXISTS education_requests_status_check"
                );
                log.info("Schema patch applied: Dropped education_requests_status_check constraint.");

            } catch (Exception e) {
                log.debug("Schema patch skipped (likely already applied or not applicable): {}", e.getMessage());
            }

            // Add new scoring columns to hr_verifications (safe - idempotent)
            String[] hrVerColumns = {
                "ALTER TABLE hr_verifications ADD COLUMN IF NOT EXISTS experience_years INTEGER",
                "ALTER TABLE hr_verifications ADD COLUMN IF NOT EXISTS experience_months INTEGER",
                "ALTER TABLE hr_verifications ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN",
                "ALTER TABLE hr_verifications ADD COLUMN IF NOT EXISTS gender VARCHAR(20)",
                "ALTER TABLE hr_verifications ADD COLUMN IF NOT EXISTS has_discipline BOOLEAN",
                "ALTER TABLE hr_verifications ADD COLUMN IF NOT EXISTS discipline_description TEXT",
                "ALTER TABLE hr_verifications ADD COLUMN IF NOT EXISTS experience_sub_score DOUBLE PRECISION",
                "ALTER TABLE hr_verifications ADD COLUMN IF NOT EXISTS performance_sub_score DOUBLE PRECISION",
                "ALTER TABLE hr_verifications ADD COLUMN IF NOT EXISTS discipline_sub_score DOUBLE PRECISION",
                "ALTER TABLE hr_verifications ADD COLUMN IF NOT EXISTS affirmative_bonus DOUBLE PRECISION",
                "ALTER TABLE hr_verifications ADD COLUMN IF NOT EXISTS total_calculated_score DOUBLE PRECISION"
            };
            for (String sql : hrVerColumns) {
                try (Connection c2 = dataSource.getConnection(); Statement s2 = c2.createStatement()) {
                    s2.execute(sql);
                    log.info("Schema patch applied: {}", sql);
                } catch (Exception ex) {
                    log.debug("Schema patch skipped: {}", ex.getMessage());
                }
            }
        };
    }
}
