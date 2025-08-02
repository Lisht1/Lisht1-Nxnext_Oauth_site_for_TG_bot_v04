// apps/web/src/app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            🚀 Telegram Tasks ↔︎ Google Calendar
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Вы успешно вошли через Google.&nbsp;Бот уже готов синхронизировать
            ваши задачи с календарём.
          </p>

          <div className="flex justify-center">
            <Button asChild size="lg">
              <Link href="https://t.me/YourBotUsername">
                Перейти в Telegram‑бот
              </Link>
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            После авторизации это окно можно закрыть.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
