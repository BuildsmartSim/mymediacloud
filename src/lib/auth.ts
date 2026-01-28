import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const adminEmail = process.env.ADMIN_EMAIL;
                const adminPassword = process.env.ADMIN_PASSWORD;
                const guestEmail = process.env.GUEST_EMAIL;
                const guestPassword = process.env.GUEST_PASSWORD;

                if (
                    credentials?.email === adminEmail &&
                    credentials?.password === adminPassword
                ) {
                    return { id: "1", name: "Admin", email: adminEmail, role: "admin" };
                }

                if (
                    credentials?.email === guestEmail &&
                    credentials?.password === guestPassword
                ) {
                    return { id: "2", name: "Guest", email: guestEmail, role: "guest" };
                }

                // Check ADDITIONAL_USERS
                // Format: "email:pass;email2:pass2"
                const additionalUsersEnv = process.env.ADDITIONAL_USERS || "";
                if (additionalUsersEnv) {
                    const extraUsers = additionalUsersEnv.split(';').map(u => {
                        const [e, p] = u.split(':');
                        return { email: e?.trim(), password: p?.trim() };
                    });

                    const match = extraUsers.find(u =>
                        u.email === credentials?.email &&
                        u.password === credentials?.password
                    );

                    if (match && match.email) {
                        return {
                            id: `guest-${match.email}`,
                            name: "Guest",
                            email: match.email,
                            role: "guest"
                        };
                    }
                }

                return null;
            }
        })
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                (session.user as any).role = token.role;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
