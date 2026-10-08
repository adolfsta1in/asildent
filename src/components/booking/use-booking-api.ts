"use client";

import { useEffect, useState } from "react";
import type { ApiSlot } from "./types";

type State<T> = { data: T | null; loading: boolean; error: boolean };

function useJson<T>(url: string | null, reloadKey = 0): State<T> & { reload: () => void } {
  const [state, setState] = useState<State<T>>({ data: null, loading: Boolean(url), error: false });
  const [nonce, setNonce] = useState(0);
  const [prevKey, setPrevKey] = useState<string | null>(null);

  // Сброс состояния при смене запроса — во время рендера, без лишнего эффекта.
  const key = url ? `${url}#${reloadKey}#${nonce}` : null;
  if (key !== prevKey) {
    setPrevKey(key);
    setState({ data: null, loading: Boolean(url), error: false });
  }

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    fetch(url, { signal: controller.signal, cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: T) => setState({ data, loading: false, error: false }))
      .catch((e: unknown) => {
        if ((e as Error).name !== "AbortError") setState({ data: null, loading: false, error: true });
      });
    return () => controller.abort();
  }, [url, reloadKey, nonce]);

  return { ...state, reload: () => setNonce((n) => n + 1) };
}

/** Даты со свободным временем на весь горизонт записи. */
export function useAvailability(serviceId: string | undefined, doctor: string | undefined) {
  const url = serviceId && doctor ? `/api/availability?service=${serviceId}&doctor=${doctor}` : null;
  return useJson<{ dates: string[] }>(url);
}

/** Свободные слоты на конкретную дату. */
export function useSlots(serviceId: string | undefined, doctor: string | undefined, date: string | undefined, reloadKey = 0) {
  const url = serviceId && doctor && date ? `/api/slots?service=${serviceId}&doctor=${doctor}&date=${date}` : null;
  return useJson<{ slots: ApiSlot[] }>(url, reloadKey);
}
