import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

/* ──────────── NextAuth config ──────────── */
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,           // важно для Railway‑прокси
  callbacks: {
    async signIn({ user, account, profile }: any) {
      // Логируем для отладки
      console.log('SignIn callback:', { 
        user: user?.email, 
        account: account?.provider,
        state: account?.state 
      });
      
      // Получаем telegram_user_id из URL параметров
      if (!account?.state || typeof account.state !== 'string') {
        console.log('No state parameter or invalid state type');
        return true;
      }

      try {
        const url = new URL(account.state);
        const telegramUserId = url.searchParams.get('state');
        
        console.log('Telegram user ID from state:', telegramUserId);
        
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
            
            if (!response.ok) {
              console.error('Bot webhook error:', response.status, await response.text());
            }
          } catch (error) {
            console.error('Error sending OAuth callback to bot:', error);
          }
        }
      } catch (error) {
        console.error('Error parsing state URL:', error);
      }
      
      return true;
    },
    async redirect({ url, baseUrl }: any) {
      console.log('Redirect callback:', { url, baseUrl });
      
      // Перенаправляем на главную страницу с параметрами
      try {
        const urlObj = new URL(url);
        const telegramUserId = urlObj.searchParams.get('state');
        if (telegramUserId) {
          const redirectUrl = `${baseUrl}/?state=${telegramUserId}`;
          console.log('Redirecting to:', redirectUrl);
          return redirectUrl;
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