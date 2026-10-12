"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { compressImage } from "@/lib/client/compress-image";

/**
 * Поле загрузки фото для форм админки: перед отправкой фото сжимается в браузере
 * (подменяется файл в самом <input>, поэтому форма отправляется как обычно).
 */
export function ImageInput({
  id,
  name,
  required,
  onPreview,
  maxSide,
}: {
  id: string;
  name: string;
  required?: boolean;
  onPreview?: (url: string | null) => void;
  maxSide?: number;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type="file"
        required={required}
        accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
        className="h-auto py-2"
        onChange={async (ev) => {
          const input = ev.currentTarget;
          const original = input.files?.[0];
          if (!original) return onPreview?.(null);
          setBusy(true);
          try {
            const file = await compressImage(original, maxSide);
            if (file !== original) {
              const dt = new DataTransfer();
              dt.items.add(file);
              input.files = dt.files;
            }
            onPreview?.(URL.createObjectURL(file));
          } finally {
            setBusy(false);
          }
        }}
      />
      {busy && (
        <span className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" /> Сжимаем…
        </span>
      )}
    </div>
  );
}
