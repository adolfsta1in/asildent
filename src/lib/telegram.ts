import "server-only";

/** Включены ли уведомления в Telegram (токен и chat_id заданы в .env). */
export function telegramEnabled(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Отправляет сообщение в чат клиники. Без настроек — ничего не делает. Ошибки только логируются. */
export async function sendTelegram(lines: string[]): Promise<void> {
  if (!telegramEnabled()) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: lines.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("[telegram] ошибка отправки:", res.status, await res.text());
  } catch (e) {
    console.error("[telegram] не удалось отправить уведомление:", e);
  }
}

export { escapeHtml };
