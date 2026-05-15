import type { WallpaperItem } from '../api/wallpapers'

export type WallpaperDetailKind = 'pc' | 'mobile'

const key = (id: string) => `wallpaper-detail:v2:${id}`

export type CachedWallpaperDetail = WallpaperItem & { kind: WallpaperDetailKind }

export function cacheWallpaperForDetail(payload: CachedWallpaperDetail) {
  try {
    sessionStorage.setItem(key(String(payload.id)), JSON.stringify(payload))
  } catch {
    /* ignore quota / private mode */
  }
}

export function readWallpaperDetailCache(id: string): CachedWallpaperDetail | null {
  try {
    const raw = sessionStorage.getItem(key(id))
    if (!raw) return null
    const o = JSON.parse(raw) as CachedWallpaperDetail
    if (!o || typeof o.imageUrl !== 'string') return null
    return o
  } catch {
    return null
  }
}
