import Keycloak, { KeycloakInitOptions, KeycloakTokenParsed } from "keycloak-js";
import { AuthResponse, UserRole } from "@/types";

type TokenClaims = KeycloakTokenParsed & {
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<
    string,
    {
      roles?: string[];
    }
  >;
  department?: string;
  employee_id?: string | number;
  employeeId?: string | number;
  preferred_username?: string;
  name?: string;
  email?: string;
};

const rolePriority: UserRole[] = [
  "ADMIN",
  "DIRECTOR",
  "CYBER_DEVELOPMENT_CENTER",
  "HR_OFFICER",
  "COMMITTEE_MEMBER",
  "DEPARTMENT_HEAD",
  "PROCUREMENT",
  "EMPLOYEE",
];

const supportedRoles = new Set<UserRole>(rolePriority);

let keycloak: Keycloak | null = null;
let initPromise: Promise<boolean> | null = null;
let initialized = false;

function getRedirectUri(path: string) {
  if (typeof window === "undefined") {
    return undefined;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${window.location.origin}${normalizedPath}`;
}

function collectRoles(claims: TokenClaims): string[] {
  const realmRoles = claims.realm_access?.roles ?? [];
  const clientRoles = Object.values(claims.resource_access ?? {})
    .flatMap((client) => client.roles ?? []);

  return [...realmRoles, ...clientRoles].map((role) => role.toUpperCase());
}

function resolveRole(claims: TokenClaims): UserRole {
  const roles = collectRoles(claims);

  for (const candidate of rolePriority) {
    if (roles.includes(candidate)) {
      return candidate;
    }
  }

  const firstSupportedRole = roles.find((role): role is UserRole =>
    supportedRoles.has(role as UserRole),
  );

  return firstSupportedRole ?? "EMPLOYEE";
}

function parseNumeric(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function getKeycloakClient() {
  if (!keycloak) {
    keycloak = new Keycloak({
      url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8081",
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "insa-erp",
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "erp-frontend",
    });
  }

  return keycloak;
}

export async function initKeycloak(
  options: KeycloakInitOptions = {},
): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  if (initialized) {
    return !!getKeycloakClient().authenticated;
  }

  if (!initPromise) {
    const client = getKeycloakClient();
    const defaultOptions: KeycloakInitOptions = {
      onLoad: "check-sso",
      pkceMethod: "S256",
      checkLoginIframe: false,
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
    };

    initPromise = client
      .init({
        ...defaultOptions,
        ...options,
      })
      .then((authenticated) => {
        initialized = true;
        return authenticated;
      })
      .catch((error) => {
        initPromise = null;
        throw error;
      });
  }

  return initPromise;
}

export async function keycloakLogin() {
  const client = getKeycloakClient();
  await client.login({
    redirectUri: getRedirectUri("/dashboard"),
  });
}

export async function keycloakLogout() {
  const client = getKeycloakClient();
  await client.logout({
    redirectUri: getRedirectUri("/login"),
  });
}

export async function getValidAccessToken(minValidity = 30) {
  const client = getKeycloakClient();
  if (!client.authenticated) {
    return null;
  }

  try {
    await client.updateToken(minValidity);
    return client.token ?? null;
  } catch {
    return null;
  }
}

export function mapTokenToUser(): AuthResponse | null {
  const client = getKeycloakClient();
  const claims = client.tokenParsed as TokenClaims | undefined;
  const token = client.token;

  if (!claims || !token) {
    return null;
  }

  const fullName =
    claims.name ||
    [claims.given_name, claims.family_name].filter(Boolean).join(" ") ||
    claims.preferred_username ||
    claims.email ||
    "User";

  const employeeId = parseNumeric(claims.employee_id ?? claims.employeeId);
  const department =
    typeof claims.department === "string" ? claims.department : undefined;

  return {
    id: employeeId,
    token,
    email: claims.email || claims.preferred_username || "",
    fullName,
    role: resolveRole(claims),
    employeeId,
    department,
  };
}
