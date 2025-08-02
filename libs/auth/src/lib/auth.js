const NextAuth = require('next-auth');
const GoogleProvider = require('next-auth/providers/google');
const ResendProvider = require('next-auth/providers/resend');

const { UpstashRedisAdapter } = require('@auth/upstash-redis-adapter');
const { Redis } = require('@upstash/redis');

/* ──────────── Redis (Upstash) ──────────── */
const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_URL,   // обязательно в env
  token: process.env.UPSTASH_REDIS_TOKEN, // обязательно в env
});

/* ──────────── NextAuth config ──────────── */
const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: UpstashRedisAdapter(redis),
  trustHost: true,           // важно для Railway‑прокси
  callbacks: {
    async signIn({ user, account, profile }) {
      // Получаем telegram_user_id из URL параметров
      if (!account?.state || typeof account.state !== 'string') {
        console.log('No state parameter or invalid state type');
        return true;
      }

      try {
        const url = new URL(account.state);
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
      } catch (error) {
        console.error('Error parsing state URL:', error);
      }
      
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Перенаправляем на главную страницу с параметрами
      try {
        const urlObj = new URL(url);
        const telegramUserId = urlObj.searchParams.get('state');
        if (telegramUserId) {
          return `${baseUrl}/?state=${telegramUserId}`;
        }
      } catch (error) {
        console.error('Error parsing redirect URL:', error);
      }
      return baseUrl;
    }
  },
  providers: [
    /* Google OAuth 2.0 + Calendar */
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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

module.exports = { handlers, signIn, signOut, auth }; 