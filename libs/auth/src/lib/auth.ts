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
  trustHost: true,           // важно для Railway‑прокси
  callbacks: {
    async signIn({ user, account, profile }) {
      // Получаем telegram_user_id из URL параметров
      const url = new URL(account?.state || '');
      const telegramUserId = url.searchParams.get('state');
      
      if (telegramUserId && account?.access_token) {
        try {
          // Отправляем данные в бот
          const response = await fetch("https://tasksgptbot-production.up.railway.app/webhook/auth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "oauth_callback",
              telegram_user_id: telegramUserId,
              auth_code: account.access_token,
              error: null
            }),
          });
          
          console.log('OAuth callback sent to bot:', response.status);
        } catch (error) {
          console.error('Error sending OAuth callback to bot:', error);
        }
      }
      
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Перенаправляем на главную страницу с параметрами
      const telegramUserId = new URL(url).searchParams.get('state');
      if (telegramUserId) {
        return `${baseUrl}/?state=${telegramUserId}`;
      }
      return baseUrl;
    }
  },
  providers: [
    /* Google OAuth 2.0 + Calendar */
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/calendar.events' , // полный доступ
            // 'https://www.googleapis.com/auth/calendar.readonly' // если нужен только read‑only
          ].join(' ')
        }
      }
    }),

    /* Email magic‑link (Resend) */
    ResendProvider({
      apiKey: undefined, // оставляем undefined, чтобы письма не уходили
      async sendVerificationRequest({ url }) {
        console.log('\n>>> Magic Link:', url, '\n');
      },
    }),
  ],
});
