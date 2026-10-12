import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export type UploadFolder = "doctors" | "logo" | "certificates" | "cases";

export class UploadError extends Error {}

/**
 * Сохраняет загруженное изображение и возвращает публичный URL.
 * С BLOB_READ_WRITE_TOKEN — в Vercel Blob (на Vercel файловая система только для чтения),
 * без него — в public/uploads (локальный демо-режим).
 */
export async function saveImage(file: File, folder: UploadFolder): Promise<string> {
  const ext = ALLOWED[file.type];
  if (!ext) throw new UploadError("Поддерживаются JPG, PNG, WebP, AVIF и SVG");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("Файл больше 4 МБ");
  if (ext === "svg" && folder !== "logo") throw new UploadError("SVG можно загрузить только как логотип");

  const name = `${folder}/${randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(name, file, { access: "public", contentType: file.type });
    return blob.url;
  }

  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(process.cwd(), "public", "uploads", name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

/** Удаляет ранее загруженный файл (Vercel Blob или public/uploads). Файлы из репозитория (/doctors/…) не трогает. */
export async function deleteImage(url: string | null | undefined): Promise<void> {
  if (!url) return;
  try {
    if (url.includes(".blob.vercel-storage.com/") && process.env.BLOB_READ_WRITE_TOKEN) {
      const { del } = await import("@vercel/blob");
      await del(url);
    } else if (url.startsWith("/uploads/") && !url.includes("..")) {
      await unlink(path.join(process.cwd(), "public", url));
    }
  } catch (e) {
    // Не удалось удалить файл — запись в базе всё равно удаляем, лишний файл не мешает.
    console.error("[storage] delete failed", url, e);
  }
}
