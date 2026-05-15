function guessExtension(url: string, mime: string | null): string {
  const path = (url.split('?')[0] ?? '').toLowerCase()
  const m = path.match(/\.([a-z0-9]+)$/)
  if (m) {
    const ext = m[1]
    if (ext === 'jpeg') return '.jpg'
    return `.${ext}`
  }
  const mtype = (mime ?? '').toLowerCase()
  if (mtype.includes('webp')) return '.webp'
  if (mtype.includes('png')) return '.png'
  if (mtype.includes('jpeg') || mtype.includes('jpg')) return '.jpg'
  return '.jpg'
}

function sanitizeFilenameBase(base: string): string {
  const s = base.trim().replace(/[^\w\-._\u4e00-\u9fa5]+/g, '_')
  return s.slice(0, 96) || 'wallpaper'
}

function pageOrigin(): string {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

function isSamePageOrigin(url: string): boolean {
  try {
    return new URL(url, pageOrigin() + '/').origin === pageOrigin()
  } catch {
    return false
  }
}

async function blobFromFetch(url: string, credentials: RequestCredentials): Promise<Blob> {
  const res = await fetch(url, { mode: 'cors', credentials })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const blob = await res.blob()
  if (!blob.size) throw new Error('空文件')
  return blob
}

/** 在支持 CORS 的图片上，用 canvas 导出为 PNG（部分环境下 fetch 不可用时的补充） */
function blobFromImageCanvas(url: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width
        const h = img.naturalHeight || img.height
        if (!w || !h) {
          reject(new Error('图片尺寸无效'))
          return
        }
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('无法创建画布'))
          return
        }
        ctx.drawImage(img, 0, 0)
        canvas.toBlob(
          (b) => {
            if (b && b.size > 0) resolve(b)
            else reject(new Error('无法导出图片'))
          },
          'image/png',
          0.92,
        )
      } catch (e) {
        reject(e instanceof Error ? e : new Error('画布导出失败'))
      }
    }
    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = url
  })
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(href)
}

/** 将已拿到的 Blob 触发浏览器下载（与 {@link downloadImageFile} 共用命名规则） */
export function saveBlobAsDownload(blob: Blob, filenameBase: string, urlHint = ''): void {
  const trimmed = urlHint.trim()
  const base = sanitizeFilenameBase(filenameBase)
  const t = (blob.type || '').toLowerCase()
  const extFromBlob = t.includes('png')
    ? '.png'
    : t.includes('webp')
      ? '.webp'
      : t.includes('jpeg') || t.includes('jpg')
        ? '.jpg'
        : guessExtension(trimmed, blob.type || null)
  const name = base.toLowerCase().endsWith(extFromBlob) ? base : `${base}${extFromBlob}`
  triggerBlobDownload(blob, name)
}

/**
 * 将图片保存到本地：仅使用 Blob 落盘，不再用打开新标签代替下载。
 * 依次尝试 fetch（omit / 同源 include）、canvas 导出（需图片响应带 CORS）。
 */
export async function downloadImageFile(url: string, filenameBase: string): Promise<void> {
  const trimmed = url.trim()
  if (!trimmed) throw new Error('缺少下载地址')
  if (typeof window === 'undefined') throw new Error('仅支持浏览器环境')

  const base = sanitizeFilenameBase(filenameBase)
  let blob: Blob | null = null
  let lastErr: Error | null = null

  try {
    blob = await blobFromFetch(trimmed, 'omit')
  } catch (e) {
    lastErr = e instanceof Error ? e : new Error(String(e))
  }

  if (!blob && isSamePageOrigin(trimmed)) {
    try {
      blob = await blobFromFetch(trimmed, 'include')
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e))
    }
  }

  if (!blob) {
    try {
      blob = await blobFromImageCanvas(trimmed)
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e))
    }
  }

  if (!blob) {
    throw new Error(
      lastErr
        ? `无法保存到本地（${lastErr.message}）。请为图片地址配置 CORS，或使用与站点同源的下载地址。`
        : '无法保存到本地',
    )
  }

  saveBlobAsDownload(blob, base, trimmed)
}
