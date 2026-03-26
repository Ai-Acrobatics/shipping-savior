// Auth stub — will be replaced by Phase 2 (NextAuth v5)
// This provides a mock session so the platform shell can render during development.

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  orgId: string;
  role: string;
}

export interface Session {
  user: SessionUser;
}

export async function auth(): Promise<Session | null> {
  return {
    user: {
      id: "stub",
      name: "Demo User",
      email: "user@example.com",
      image: null,
      orgId: "stub-org",
      role: "owner",
    },
  };
}
