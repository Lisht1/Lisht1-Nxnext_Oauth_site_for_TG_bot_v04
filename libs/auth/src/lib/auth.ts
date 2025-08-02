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
    async redirect({ url, baseUrl }: any) {
      console.log('Redirect callback:', { url, baseUrl });
      
             // Проверяем, является ли URL URL бота (не наш домен)
       if (url.includes('tasksgptbot-production.up.railway.app')) {
         console.log('Redirecting to bot URL, extracting state from original request');
         console.log('Full URL:', url);
         
         // Получаем state из оригинального запроса
         // В NextAuth v5 state передается через URL параметры при инициализации
         try {
           // Извлекаем state из URL бота
           const urlObj = new URL(url);
           console.log('URL search params:', urlObj.searchParams.toString());
           const state = urlObj.searchParams.get('state');
           
           if (state) {
             console.log('Found state parameter from bot URL:', state);
            
            // Отправляем данные в бот
            try {
              const response = await fetch("https://tasksgptbot-production.up.railway.app/webhook/auth", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  type: "oauth_callback",
                  telegram_user_id: state,
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
          }
        } catch (error) {
          console.error('Error parsing bot URL:', error);
        }
        
        // Перенаправляем на главную страницу Next.js
        return baseUrl;
      }
      
      // Для обычных URL просто перенаправляем
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