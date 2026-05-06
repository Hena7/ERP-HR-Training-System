# ERP HR Training System

Education and training management modules for the INSA ERP-HR system.

This repository contains a Next.js frontend and Spring Boot backend services for managing employee education opportunities, education requests, approvals, contracts, guarantors, progress reporting, completions, service obligations, and training workflows.

## Contents

- [Project Overview](#project-overview)
- [Modules](#modules)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Project](#running-the-project)
- [Authentication and Roles](#authentication-and-roles)
- [Common Commands](#common-commands)
- [Troubleshooting](#troubleshooting)

## Project Overview

The system supports HR-related education and training operations across multiple departments and approval levels. The frontend communicates with two active backend services:

- Education service: `http://localhost:8081`
- Training service: `http://localhost:8082`

Authentication is handled through Keycloak using NextAuth on the frontend and OAuth2 resource server JWT validation on the backend.

## Modules

### Education Module

- Education opportunity management
- Education request submission and tracking
- HR verification workflow
- CDC scoring and approval
- Committee decision workflow
- Director approval
- Education contracts and commitments
- Guarantor management
- Progress reports
- Completion tracking
- HR and KMC completion views
- Service obligation tracking
- Finance reports
- Education reports and analytics

### Training Module

- Training request submission
- Training request list and review
- Procurement review
- Training contract creation
- Training guarantor management
- Training obligation tracking
- Training reports and analytics
- Training settings

### Administration

- Dashboard
- Employee management
- User management
- Role-based navigation
- English and Amharic UI translations

## Technology Stack

### Frontend

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- NextAuth
- Axios
- Lucide React icons
- Recharts

### Backend

- Java 17
- Spring Boot 3.4.3
- Spring Web
- Spring Data JPA
- Spring Security
- OAuth2 Resource Server
- Bean Validation
- PostgreSQL
- H2 for development/test runtime support
- Lombok
- Maven

### Authentication

- Keycloak
- JWT bearer tokens
- Realm roles used for authorization

## Repository Structure

```text
.
|-- frontend/              # Next.js frontend application
|-- education-backend/     # Main education Spring Boot service
|-- training-backend/      # Training Spring Boot service
|-- .gitignore
`-- README.md
```

The active backend services are `education-backend` and `training-backend`.

## Prerequisites

Install the following before running the project:

- Node.js 18 or newer
- npm
- Java 17
- Maven 3.9 or newer
- PostgreSQL
- Keycloak

## Configuration

### Frontend Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8081
NEXT_PUBLIC_TRAINING_URL=http://localhost:8082

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-random-secret

KEYCLOAK_ID=nextjs-frontend
KEYCLOAK_SECRET=
KEYCLOAK_ISSUER=http://localhost:8080/realms/erp-system
```

### Education Backend

Default file: `education-backend/src/main/resources/application.properties`

Important defaults:

```properties
server.port=8081
spring.datasource.url=jdbc:postgresql://localhost:5432/education_db
spring.datasource.username=postgres
spring.datasource.password=1234
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8080/realms/erp-system
```

### Training Backend

Default file: `training-backend/src/main/resources/application.properties`

Important defaults:

```properties
server.port=8082
spring.datasource.url=jdbc:postgresql://localhost:5432/training_db
spring.datasource.username=postgres
spring.datasource.password=1234
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8080/realms/erp-system
```

For shared or production environments, move secrets out of committed properties files and provide them through environment variables, deployment secrets, or profile-specific configuration.

## Database Setup

Create the PostgreSQL databases expected by the services:

```sql
CREATE DATABASE education_db;
CREATE DATABASE training_db;
```

The services use:

```properties
spring.jpa.hibernate.ddl-auto=update
```

This allows Hibernate to update tables during local development. The education module also includes a manual schema reference at:

```text
education-backend/src/main/resources/schema.sql
```

## Running the Project

Run each service in a separate terminal.

### 1. Start Keycloak

Start Keycloak on:

```text
http://localhost:8080
```

Expected realm:

```text
erp-system
```

Expected frontend client:

```text
nextjs-frontend
```

Make sure users have the realm roles needed by the application.

### 2. Start the Education Backend

```bash
cd education-backend
mvn spring-boot:run
```

Service URL:

```text
http://localhost:8081
```

### 3. Start the Training Backend

```bash
cd training-backend
mvn spring-boot:run
```

Service URL:

```text
http://localhost:8082
```

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

## Authentication and Roles

The frontend signs users in with Keycloak through NextAuth. Backend APIs validate JWT access tokens and authorize requests using roles.

Common roles used by the project:

- `EMPLOYEE`
- `DEPARTMENT_HEAD`
- `HR_OFFICER`
- `CYBER_DEVELOPMENT_CENTER`
- `COMMITTEE_MEMBER`
- `DIRECTOR`
- `ADMIN`
- `PROCUREMENT`

These roles control sidebar navigation and backend API access.

## API Areas

### Education Service

Base URL:

```text
http://localhost:8081
```

Main API groups:

- `/api/auth`
- `/api/employees`
- `/api/education-opportunities`
- `/api/education-requests`
- `/api/hr-verifications`
- `/api/cdc-scorings`
- `/api/committee-decisions`
- `/api/contracts`
- `/api/guarantors`
- `/api/progress-reports`
- `/api/education-completions`
- `/api/service-obligations`
- `/api/finance-reports`

### Training Service

Base URL:

```text
http://localhost:8082
```

Main API groups:

- `/api/training-requests`
- `/api/training-contracts`
- `/api/training-guarantors`
- `/api/training-witnesses`
- `/api/training-obligations`

## Common Commands

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run start
npm run lint
```

### Education Backend

```bash
cd education-backend
mvn spring-boot:run
mvn test
mvn clean package
```

### Training Backend

```bash
cd training-backend
mvn spring-boot:run
mvn test
mvn clean package
```

## Troubleshooting

### Frontend cannot reach APIs

Check that:

- `NEXT_PUBLIC_API_URL` points to `http://localhost:8081`
- `NEXT_PUBLIC_TRAINING_URL` points to `http://localhost:8082`
- Both Spring Boot services are running
- Browser requests include a valid bearer token

### Login or token validation fails

Check that:

- Keycloak is running on `http://localhost:8080`
- Realm name is `erp-system`
- Frontend client ID is `nextjs-frontend`
- `KEYCLOAK_ISSUER` matches the backend `issuer-uri`
- User roles are configured as realm roles

### Database connection fails

Check that:

- PostgreSQL is running
- `education_db` and `training_db` exist
- Database username and password match the service configuration
- Ports and credentials are not overridden by another profile

### CORS errors

The backends are configured for local frontend origins such as:

```text
http://localhost:3000
http://localhost:3001
```

If the frontend runs on a different port, update the backend CORS configuration.

## Notes for Contributors

- Keep module-specific code inside its service or frontend route area.
- Do not commit real credentials, production secrets, or private Keycloak client secrets.
- Prefer focused changes with matching tests for backend service logic.
- Keep frontend API base URLs configurable through environment variables.
