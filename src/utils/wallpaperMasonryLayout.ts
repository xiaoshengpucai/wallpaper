import type { WallpaperItem } from '../api/wallpapers'

export type MasonryLayoutCell = WallpaperItem & {
  x: number
  y: number
  w: number
  h: number
}

/** 稳定哈希，用于无分辨率时的占位比例 */
export function stableHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/**
 * 竖屏手机壁纸常见高/宽比分布（近似市场占比）：
 * 9:16、19.5:9、20:9 加长屏等，用于无 resolution 时的占位高度。
 */
export function estimateMobileTileHeight(columnWidth: number, item: WallpaperItem): number {
  const res = item.resolution
  if (res) {
    const m = res.match(/(\d+)\s*[x×]\s*(\d+)/i)
    if (m) {
      const w = parseInt(m[1], 10)
      const h = parseInt(m[2], 10)
      if (w > 0 && h > 0) return columnWidth * (h / w)
    }
  }
  const bucket = stableHash(String(item.id)) % 100
  let heightOverWidth: number
  if (bucket < 52) heightOverWidth = 16 / 9
  else if (bucket < 78) heightOverWidth = 19.5 / 9
  else if (bucket < 90) heightOverWidth = 20 / 9
  else if (bucket < 96) heightOverWidth = 21 / 9
  else heightOverWidth = 18.5 / 9
  return columnWidth * heightOverWidth
}

export function buildMasonryLayout(
  items: readonly WallpaperItem[],
  columnCount: number,
  contentWidth: number,
  gap: number,
): { cells: MasonryLayoutCell[]; totalHeight: number } {
  if (columnCount < 1 || contentWidth <= 0) return { cells: [], totalHeight: 0 }

  const colHeights = new Array(columnCount).fill(0)
  const totalGaps = (columnCount - 1) * gap
  const columnWidth = (contentWidth - totalGaps) / columnCount

  const cells: MasonryLayoutCell[] = []
  for (const item of items) {
    const h = estimateMobileTileHeight(columnWidth, item)
    const col = colHeights.indexOf(Math.min(...colHeights))
    const x = col * (columnWidth + gap)
    const cur = colHeights[col]
    const y = cur === 0 ? 0 : cur + gap
    colHeights[col] = y + h
    cells.push({ ...item, x, y, w: columnWidth, h })
  }

  const totalHeight = colHeights.length ? Math.max(...colHeights) : 0
  return { cells, totalHeight }
}
