'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LinkPage() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const tgId = searchParams.get('tgId');
    
    if (tgId) {
      console.log('Found tgId:', tgId);
      
      // Отправляем данные в бот
      fetch("https://tasksgptbot-production.up.railway.app/webhook/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "oauth_callback",
          telegram_user_id: tgId,
          auth_code: "success",
          error: null
        }),
      })
      .then(response => {
        console.log('OAuth callback sent to bot:', response.status);
        if (!response.ok) {
          console.error('Bot webhook error:', response.status);
        }
      })
      .catch(error => {
        console.error('Error sending OAuth callback to bot:', error);
      });
      
      // Показываем сообщение об успехе
      document.body.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
          <div style="text-align: center; padding: 2rem; border: 1px solid #ccc; border-radius: 8px;">
            <h2>✅ Авторизация успешна!</h2>
            <p>Google Calendar подключен к вашему боту.</p>
            <p>Можете закрыть эту страницу и вернуться в Telegram.</p>
          </div>
        </div>
      `;
    } else {
      // Показываем ошибку
      document.body.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
          <div style="text-align: center; padding: 2rem; border: 1px solid #ff6b6b; border-radius: 8px; color: #ff6b6b;">
            <h2>❌ Ошибка авторизации</h2>
            <p>Не удалось получить ID пользователя Telegram.</p>
            <p>Попробуйте еще раз через команду /google_auth в боте.</p>
          </div>
        </div>
      `;
    }
  }, [searchParams]);
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>Обработка авторизации...</div>
    </div>
  );
} 