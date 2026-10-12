/**
 * Уменьшает фото перед загрузкой: длинная сторона до maxSide, JPEG. Фото с телефона весят 3–8 МБ,
 * а запрос к серверу на Vercel ограничен 4,5 МБ. SVG и маленькие файлы возвращаются как есть;
 * если браузер не умеет открыть формат (например, HEIC в Chrome) — тоже как есть, сервер ответит понятной ошибкой.
 */
export async function compressImage(file: File, maxSide = 2000, quality = 0.85): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const browserFriendly = ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type);
  if (scale === 1 && file.size <= 1_000_000 && browserFriendly) {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.fillStyle = "#fff"; // прозрачный PNG → белый фон, а не чёрный
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) return file;
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "photo"}.jpg`, { type: "image/jpeg" });
}
