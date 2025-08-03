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