import type { NextRequest } from 'next/server';

/**
 * Server-side handler for /link?tgId=XXXX
 * 1. Extracts tgId from query-string.
 * 2. Sends webhook to Telegram bot backend from the server (no CORS issues).
 * 3. Returns a minimal HTML page indicating success / failure to the user.
 */

const BOT_WEBHOOK = 'https://tasksgptbot-production.up.railway.app/webhook/auth';

export async function GET(req: NextRequest) {
  const tgId = req.nextUrl.searchParams.get('tgId');

  if (tgId) {
    // Webhook is now sent from NextAuth signIn callback with real tokens
    // This page just shows success message
    console.log('Showing success page for user:', tgId);

    return new Response(successHtml(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  return new Response(errorHtml(), {
    status: 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

function successHtml() {
  return `<!DOCTYPE html>
  <html lang="ru"><head><meta charset="UTF-8"><title>Авторизация успешна</title></head>
  <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial,sans-serif">
    <div style="text-align:center;padding:2rem;">
      <h2 style="color:#16a34a;">✅ Авторизация успешна!</h2>
      <p>Google Calendar подключен к вашему боту.</p>
      <p>Можете закрыть эту вкладку и вернуться в Telegram.</p>
    </div>
  </body></html>`;
}

function errorHtml() {
  return `<!DOCTYPE html>
  <html lang="ru"><head><meta charset="UTF-8"><title>Ошибка авторизации</title></head>
  <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial,sans-serif">
    <div style="text-align:center;padding:2rem;color:#dc2626;">
      <h2>❌ Ошибка авторизации</h2>
      <p>Отсутствует ID пользователя Telegram.</p>
      <p>Попробуйте ещё раз через команду <b>/google_auth</b> в боте.</p>
    </div>
  </body></html>`;
}
