# ERP HR Training System

Education Module for INSA HR Training ERP System.

## Keycloak Setup (Implemented)

This repository now includes a local Keycloak setup and integrated auth wiring for both backend and frontend.

### 1. Start Keycloak

From repo root:

```powershell
docker compose -f docker-compose.keycloak.yml up -d
```

Keycloak URLs:
- Admin console: `http://localhost:8081/admin`
- Realm issuer: `http://localhost:8081/realms/insa-erp`

Bootstrapped admin credentials:
- Username: `admin`
- Password: `admin`

Imported realm file:
- `keycloak/realm/insa-erp-realm.json`

Included sample users (password for all: `admin123`):
- `admin.user` (role: `ADMIN`)
- `hr.officer` (role: `HR_OFFICER`)
- `department.head` (role: `DEPARTMENT_HEAD`)
- `cdc.user` (role: `CYBER_DEVELOPMENT_CENTER`)

### 2. Run Backend (Spring Boot)

```powershell
cd backend
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`.

Backend is configured as OAuth2 Resource Server and validates Keycloak JWTs using:

- `spring.security.oauth2.resourceserver.jwt.issuer-uri`

Default issuer is:
- `http://localhost:8081/realms/insa-erp`

Override with env var if needed:
- `KEYCLOAK_ISSUER_URI`

### 3. Run Frontend (Next.js)

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

Create frontend env file from example:

```powershell
cd frontend
Copy-Item .env.example .env.local
```

Default env values already point to local setup:
- `NEXT_PUBLIC_API_URL=http://localhost:8080`
- `NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8081`
- `NEXT_PUBLIC_KEYCLOAK_REALM=insa-erp`
- `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=erp-frontend`

## Notes

- Login page now uses Keycloak redirect login flow.
- Backend security now validates Keycloak JWT and maps realm/client roles to Spring `ROLE_*` authorities.
- Frontend business module APIs are still using the existing local mock data implementation in `frontend/src/lib/api.ts`.
