import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID || "nextjs-frontend",
      clientSecret: process.env.KEYCLOAK_SECRET || "",
      issuer: process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/erp-system",
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token and id_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }: any) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken;
      
      // Decode JWT token to extract roles and department if needed
      if (token.accessToken) {
        try {
          const payloadBase64 = String(token.accessToken).split('.')[1];
          const decodedJson = Buffer.from(payloadBase64, 'base64').toString();
          const decoded = JSON.parse(decodedJson);
          
          if (decoded.realm_access && decoded.realm_access.roles) {
            session.user.roles = decoded.realm_access.roles;
          }
          if (decoded.department) {
            session.user.department = decoded.department;
          }
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
    signIn: '/login', // Optional: route to a custom login page if you don't want the default NextAuth login page
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
