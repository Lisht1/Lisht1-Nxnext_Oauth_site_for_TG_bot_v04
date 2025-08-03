import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

/* ──────────── NextAuth config ──────────── */
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,           // важно для Railway‑прокси
  // Добавляем правильную конфигурацию для продакшн
  basePath: '/api/auth',
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('SignIn event:', { 
        user: user?.email, 
        account: account?.provider,
        isNewUser
      });
      
      // В NextAuth v5 state передается через URL параметры в redirect
      // Обработка будет в redirect callback
    },
  },
  callbacks: {
    async signIn({ user, account, profile, trigger, request }: any) {
      // Логируем для отладки
      console.log('SignIn callback:', { 
        user: user?.email, 
        account: account?.provider,
        trigger
      });
      
      // Отправляем webhook с реальными токенами
      if (account?.provider === 'google' && account?.access_token) {
        try {
          // Извлекаем telegram_user_id из callbackUrl в request
          let telegramUserId = null;
          
          if (request?.url) {
            const url = new URL(request.url);
            const callbackUrl = url.searchParams.get('callbackUrl');
            if (callbackUrl) {
              const decodedUrl = decodeURIComponent(callbackUrl);
              const match = decodedUrl.match(/tgId=(\d+)/);
              if (match) {
                telegramUserId = match[1];
                console.log('Extracted telegram_user_id from callbackUrl:', telegramUserId);
              }
            }
          }
          
          if (telegramUserId) {
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
            
            console.log('OAuth callback sent to bot from signIn:', response.status);
          } else {
            console.log('Could not extract telegram_user_id from request');
            // Temporary: use hardcoded user ID for testing
            const response = await fetch("https://tasksgptbot-production.up.railway.app/webhook/auth", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                type: "oauth_callback",
                telegram_user_id: "141683480", // Your test user ID
                auth_code: account.access_token,
                error: null
              }),
            });
            
            console.log('OAuth callback sent to bot (hardcoded user):', response.status);
          }
        } catch (error) {
          console.error('Error sending OAuth callback from signIn:', error);
        }
      }
      
      return true;
    },
    
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
  ],
}); 