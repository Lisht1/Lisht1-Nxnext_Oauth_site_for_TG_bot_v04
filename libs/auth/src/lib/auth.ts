import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';

import { UpstashRedisAdapter } from '@auth/upstash-redis-adapter';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: UpstashRedisAdapter(redis),
  trustHost: true,
  providers: [
    Resend({
      apiKey: undefined, // REMINDER: keep undefined to avoid sending emails
      async sendVerificationRequest(params) {
        console.log('');
        console.log(`>>> Magic Link: ${params.url}`);
        console.log('');
      },
    }),
  ],
});
