import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      orgId: string;
      role: string;
    } & DefaultSession['user'];
  }

  interface User {
    orgId?: string;
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    orgId: string;
    role: string;
  }
}
