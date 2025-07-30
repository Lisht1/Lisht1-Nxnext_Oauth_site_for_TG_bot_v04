import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import ResendProvider from 'next-auth/providers/resend';

import { UpstashRedisAdapter } from '@auth/upstash-redis-adapter';
import { Redis } from '@upstash/redis';

/* ──────────── Redis (Upstash) ──────────── */
const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_URL!,   // обязательно в env
  token: process.env.UPSTASH_REDIS_TOKEN!, // обязательно в env
});

/* ──────────── NextAuth config ──────────── */
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: UpstashRedisAdapter(redis),
  trustHost: true,                         // важно для Railway‑прокси
  providers: [
    /* Google OAuth 2.0 */
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    /* Email magic‑link (Resend) */
    ResendProvider({
      apiKey: undefined,                   // оставляем undefined, чтобы письма не уходили
      async sendVerificationRequest({ url }) {
        console.log('\n>>> Magic Link:', url, '\n');
      },
    }),
  ],
});
