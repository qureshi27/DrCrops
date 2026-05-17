"use client";

export async function fileToCompressedDataUrl(
  file: File | Blob,
  maxDim = 1600,
  quality = 0.92
): Promise<{ dataUrl: string; thumbnail: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unsupported");
  ctx.drawImage(bitmap, 0, 0, w, h);

  const dataUrl = canvas.toDataURL("image/jpeg", quality);

  // Tiny thumbnail (256px) for history list
  const tScale = Math.min(1, 256 / Math.max(w, h));
  const tw = Math.round(w * tScale);
  const th = Math.round(h * tScale);
  const tCanvas = document.createElement("canvas");
  tCanvas.width = tw;
  tCanvas.height = th;
  const tCtx = tCanvas.getContext("2d");
  if (!tCtx) throw new Error("Canvas 2D unsupported");
  tCtx.drawImage(canvas, 0, 0, tw, th);
  const thumbnail = tCanvas.toDataURL("image/jpeg", 0.7);

  return { dataUrl, thumbnail };
}
