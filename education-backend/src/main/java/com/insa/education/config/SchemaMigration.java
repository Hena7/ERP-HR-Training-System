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

            } catch (Exception e) {
                // Column is already nullable – nothing to do.
                log.debug("Schema patch skipped (likely already applied): {}", e.getMessage());
            }
        };
    }
}
