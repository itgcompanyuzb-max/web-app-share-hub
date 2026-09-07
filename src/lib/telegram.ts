export type TgUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

type TgWebApp = {
  initData: string;
  initDataUnsafe: { user?: TgUser };
  ready: () => void;
  expand: () => void;
  colorScheme?: string;
  requestContact?: (cb: (ok: boolean, event?: any) => void) => void;
  HapticFeedback?: { notificationOccurred?: (t: string) => void };
  showAlert?: (msg: string) => void;
};

export function tg(): TgWebApp | null {
  if (typeof window === "undefined") return null;
  return (window as any).Telegram?.WebApp ?? null;
}

export function isTelegram(): boolean {
  const w = tg();
  return !!w && typeof w.initData === "string" && w.initData.length > 0;
}

export function tgUser(): TgUser | null {
  return tg()?.initDataUnsafe?.user ?? null;
}

export function tgReady() {
  const w = tg();
  if (!w) return;
  try {
    w.ready();
    w.expand();
  } catch {
    /* ignore */
  }
}

/** Telegram kontaktini so'rash. Muvaffaqiyatli bo'lsa contact ma'lumotini qaytaradi. */
export function requestContact(): Promise<{ ok: boolean; response?: string; contact?: any }> {
  return new Promise((resolve) => {
    const w = tg();
    if (!w?.requestContact) {
      resolve({ ok: false });
      return;
    }
    try {
      w.requestContact((ok: boolean, event?: any) => {
        resolve({
          ok: !!ok,
          response: event?.response,
          contact: event?.responseUnsafe?.contact ?? null,
        });
      });
    } catch {
      resolve({ ok: false });
    }
  });
}
