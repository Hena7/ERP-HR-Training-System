-- PostgreSQL Schema for INSA Education Module
-- Run this script to create the database schema manually if needed

CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    department VARCHAR(100),
    position VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS education_opportunities (
    id SERIAL PRIMARY KEY,
    education_type VARCHAR(200) NOT NULL,
    education_level VARCHAR(100) NOT NULL,
    institution VARCHAR(200) NOT NULL,
    department VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS education_opportunity_target_departments (
    opportunity_id INT NOT NULL REFERENCES education_opportunities(id) ON DELETE CASCADE,
    department_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (opportunity_id, department_name)
);

CREATE TABLE IF NOT EXISTS education_requests (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id),
    requested_field VARCHAR(200) NOT NULL,
    requested_level VARCHAR(50) NOT NULL,
    university VARCHAR(200) NOT NULL,
    country VARCHAR(100) NOT NULL,
    study_mode VARCHAR(20) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_DEPARTMENT_SUBMISSION',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hr_verifications (
    id SERIAL PRIMARY KEY,
    request_id INT NOT NULL UNIQUE REFERENCES education_requests(id),
    semester1_score NUMERIC(5, 2) NOT NULL,
    semester2_score NUMERIC(5, 2) NOT NULL,
    average_score NUMERIC(5, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    verified_by VARCHAR(100),
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS committee_decisions (
    id SERIAL PRIMARY KEY,
    request_id INT NOT NULL UNIQUE REFERENCES education_requests(id),
    decision VARCHAR(20) NOT NULL,
    comment TEXT,
    decided_by VARCHAR(100),
    decision_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS education_contracts (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id),
    request_id INT NOT NULL UNIQUE REFERENCES education_requests(id),
    university VARCHAR(200) NOT NULL,
    program VARCHAR(200) NOT NULL,
    study_country VARCHAR(100) NOT NULL,
    study_city VARCHAR(100) NOT NULL,
    duration_years INT NOT NULL,
    study_mode VARCHAR(20) NOT NULL,
    estimated_cost NUMERIC(15, 2),
    contract_signed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guarantors (
    id SERIAL PRIMARY KEY,
    contract_id INT NOT NULL REFERENCES education_contracts(id),
    full_name VARCHAR(200) NOT NULL,
    national_id VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS education_progress_reports (
    id SERIAL PRIMARY KEY,
    contract_id INT NOT NULL REFERENCES education_contracts(id),
    report_month DATE NOT NULL,
    description TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS education_completions (
    id SERIAL PRIMARY KEY,
    contract_id INT NOT NULL UNIQUE REFERENCES education_contracts(id),
    completion_date DATE NOT NULL,
    return_to_work_date DATE,
    research_presentation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_obligations (
    id SERIAL PRIMARY KEY,
    contract_id INT NOT NULL UNIQUE REFERENCES education_contracts(id),
    study_years INT NOT NULL,
    required_service_years INT NOT NULL,
    service_start_date DATE,
    service_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
