import { createFileRoute } from "@tanstack/react-router";
import { createHash, timingSafeEqual } from "crypto";

const APP_URL = "https://web-app-share-hub.lovable.app";

function secretFor(token: string) {
  return createHash("sha256").update(`telegram-webhook:${token}`).digest("hex");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env["TELEGRAM_BOT_TOKEN"];
        if (!token) return new Response("not configured", { status: 500 });
        const got = request.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? "";
        if (!safeEqual(got, secretFor(token))) return new Response("Unauthorized", { status: 401 });

        const update = await request.json().catch(() => null);
        const msg = update?.message;
        const text: string = msg?.text ?? "";
        const chatId = msg?.chat?.id;
        if (chatId && text.startsWith("/start")) {
          const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text:
                "Assalomu alaykum! 🍕\n\nComo Pizza Delivery'ga xush kelibsiz!\n\nMenyu va buyurtma berish uchun pastdagi tugmani bosing 👇",
              reply_markup: {
                inline_keyboard: [[{ text: "🍕 Menyu va buyurtma", web_app: { url: APP_URL } }]],
              },
            }),
          });
          if (!res.ok) console.error("sendMessage failed", res.status, await res.text());
        }
        return Response.json({ ok: true });
      },
    },
  },
});
