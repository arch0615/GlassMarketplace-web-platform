/**
 * Client-side image compression helper.
 *
 * Phone cameras commonly produce 5-12 MB JPEGs that blow past upload limits
 * and waste bandwidth on mobile connections. This wrapper compresses an
 * image to a sensible size before we send it to the backend, while leaving
 * non-images (PDFs, etc.) untouched.
 *
 * Defaults target ~1 MB / 1920 px longest side at quality 0.82 — visually
 * lossless for recetas and product photos, but small enough to upload in
 * seconds on a 3G connection.
 *
 * Skips compression when the input is already small enough (< maxSizeMB),
 * which avoids the recompression artifacts the library introduces even
 * when the file is fine.
 */
export async function compressImage(file, opts = {}) {
  if (!file) return file
  if (!file.type?.startsWith('image/')) return file

  // GIFs are usually animations; the library flattens them. Skip.
  if (file.type === 'image/gif') return file

  const maxSizeMB = opts.maxSizeMB ?? 1
  if (file.size <= maxSizeMB * 1024 * 1024 * 0.8) {
    return file
  }

  const { default: imageCompression } = await import('browser-image-compression')
  try {
    const compressed = await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight: opts.maxWidthOrHeight ?? 1920,
      initialQuality: opts.quality ?? 0.82,
      useWebWorker: true,
      fileType: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
    })

    // Preserve the original name so the backend's MIME inference still works.
    const finalName = compressed.name || file.name
    return new File([compressed], finalName, {
      type: compressed.type || file.type,
      lastModified: Date.now(),
    })
  } catch (err) {
    // If compression fails for any reason (unsupported codec, OOM on tiny
    // devices, etc.), fall back to the original file so the user can still
    // upload — they'll just get slower upload speed.
    console.warn('[imageCompression] falling back to original file:', err)
    return file
  }
}
