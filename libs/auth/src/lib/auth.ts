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
    async signIn({ user, account, profile, trigger }: any) {
      // Логируем для отладки
      console.log('SignIn callback:', { 
        user: user?.email, 
        account: account?.provider,
        trigger
      });
      
      // В NextAuth v5 state передается через account.state
      if (account?.state) {
        console.log('Found state in account:', account.state);
        
        // Отправляем данные в бот
        try {
          const response = await fetch("https://tasksgptbot-production.up.railway.app/webhook/auth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "oauth_callback",
              telegram_user_id: account.state,
              auth_code: "success",
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
      } else {
        console.log('No state found in account');
      }
      
      return true;
    },
        async redirect({ url, baseUrl }: any) {
      console.log('Redirect callback:', { url, baseUrl });
      
      // Просто перенаправляем на главную страницу
      // State обрабатывается в signIn callback
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