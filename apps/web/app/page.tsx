import Link from "next/link";

export default function HomePage() {
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
          🚀 Telegram Tasks ↔︎ Google Calendar
        </h1>
        <p style={{ color: "#888", marginBottom: 32 }}>
          Вы успешно вошли через Google.<br />
          Бот уже готов синхронизировать ваши задачи с календарём.
        </p>
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
        <p style={{ fontSize: 12, color: "#aaa" }}>
          После авторизации это окно можно закрыть.
        </p>
      </div>
    </main>
  );
}
