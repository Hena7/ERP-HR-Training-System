import { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

/**
 * Helper function to refresh the access token using the refresh_token.
 */
async function refreshAccessToken(token: any) {
  try {
    const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_ID || "nextjs-frontend",
        client_secret: process.env.KEYCLOAK_SECRET || "",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID || "nextjs-frontend",
      clientSecret: process.env.KEYCLOAK_SECRET || "",
      issuer: process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/erp-system",
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        return {
          accessToken: account.access_token,
          accessTokenExpires: (account.expires_at || 0) * 1000,
          refreshToken: account.refresh_token,
          idToken: account.id_token,
          user,
        };
      }

      // Return previous token if the access token has not expired yet
      // We check if it expires in less than 60 seconds
      if (Date.now() < (token.accessTokenExpires as number) - 60000) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      session.error = token.error;

      if (token.accessToken) {
        try {
          const payloadBase64 = String(token.accessToken).split(".")[1];
          const decodedJson = Buffer.from(payloadBase64, "base64").toString();
          const decoded = JSON.parse(decodedJson);

          if (decoded.realm_access && decoded.realm_access.roles) {
            session.user.roles = decoded.realm_access.roles;
          }
          if (decoded.name) session.user.name = decoded.name;
          else if (decoded.preferred_username) session.user.name = decoded.preferred_username;
          else if (decoded.given_name) session.user.name = decoded.given_name;

          if (decoded.employee_id) session.user.employeeId = decoded.employee_id;
          if (decoded.department) session.user.department = decoded.department;
          if (decoded.phone) session.user.phone = decoded.phone;
          if (decoded.gender) session.user.gender = decoded.gender;
          if (decoded.position) session.user.position = decoded.position;
        } catch (e) {
          console.error("Failed to parse token payload", e);
        }
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
};
