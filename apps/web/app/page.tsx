"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function HomePage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleAuthSuccess = async () => {
      const telegramUserId = searchParams.get("state");
      const error = searchParams.get("error");
      
      if (error) {
        setStatus("error");
        setMessage("Ошибка авторизации: " + error);
        return;
      }

      if (!telegramUserId) {
        setStatus("error");
        setMessage("Отсутствует ID пользователя Telegram");
        return;
      }

      try {
        // Отправляем данные в бот через webhook
        const response = await fetch("https://tasksgptbot-production.up.railway.app/webhook/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "oauth_callback",
            telegram_user_id: telegramUserId,
            auth_code: "success", // NextAuth уже обработал код
            error: null
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          setStatus("success");
          setMessage("Авторизация успешно завершена!");
        } else {
          setStatus("error");
          setMessage("Ошибка при передаче данных в бот: " + (result.error || "Неизвестная ошибка"));
        }
      } catch (error) {
        setStatus("error");
        setMessage("Ошибка соединения с ботом: " + error);
      }
    };

    handleAuthSuccess();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: 400,
            width: "100%",
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            padding: 32,
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
            🔄 Обработка авторизации...
          </h1>
          <p style={{ color: "#888", marginBottom: 32 }}>
            Пожалуйста, подождите...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f9fa",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: 400,
          width: "100%",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          padding: 32,
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
          {status === "success" ? "✅ Успешно!" : "❌ Ошибка"}
        </h1>
        <p style={{ color: "#888", marginBottom: 32 }}>
          {message}
        </p>
        {status === "success" && (
          <Link href="https://t.me/L1MyTaskManagerBot">
            <button
              style={{
                background: "#2196f3",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px 32px",
                fontSize: 16,
                cursor: "pointer",
                fontWeight: 600,
                marginBottom: 24,
              }}
            >
              Перейти в Telegram-бот
            </button>
          </Link>
        )}
        <p style={{ fontSize: 12, color: "#aaa" }}>
          {status === "success" 
            ? "После авторизации это окно можно закрыть."
            : "Попробуйте еще раз через бот."
          }
        </p>
      </div>
    </main>
  );
}
