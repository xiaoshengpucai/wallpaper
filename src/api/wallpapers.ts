import { http } from './http'

export type WallpaperItem = {
  id: string | number
  /** 列表/预览用，优先接口 webpUrl（中等图） */
  imageUrl: string
  /** 原图地址（详情页大图预览）；缺省与列表一致用 imageUrl */
  originalUrl?: string
  /** 下载原图/大图用；缺省时与 imageUrl 相同 */
  downloadUrl?: string
  title?: string
  tags: string[]
  /** 后端原始 classificationTag 文本，如「动漫|二次元」 */
  classificationTag?: string
  /** 展示用分类/标签文案（来自接口 classificationTag 等，优先于 tags 里的 ID） */
  classificationTags?: string[]
  favoriteCount?: number
  downloadCount?: number
  /** 当前用户是否已收藏（若接口返回） */
  isFavorited?: boolean
  resolution?: string
  fileSizeLabel?: string
  /** 设备类型：pc 或 mobile */
  deviceType?: 'pc' | 'mobile'
}

type UnknownRecord = Record<string, unknown>

/** 拼接图片等静态资源用：相对路径需指向真实后端，而不是 Vite 端口 */
function getMediaBaseOrigin(): string {
  const explicit = import.meta.env.VITE_BACKEND_ORIGIN
  if (typeof explicit === 'string' && explicit.trim()) {
    return explicit.replace(/\/$/, '')
  }
  const base = import.meta.env.VITE_API_BASE_URL ?? ''
  if (base.startsWith('http')) {
    try {
      return new URL(base).origin
    } catch {
      /* ignore */
    }
  }
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

/** 将相对路径补全为可访问的绝对 URL */
export function resolveMediaUrl(raw: string): string {
  const s = raw.trim()
  if (!s) return ''
  if (/^https?:\/\//i.test(s)) return s
  const origin = getMediaBaseOrigin()
  if (!origin) return s
  if (s.startsWith('/')) return `${origin}${s}`
  return `${origin}/${s}`
}

function toNum(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

function pickString(obj: UnknownRecord, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v.length > 0) return v
  }
  return undefined
}

function pickUrlFromNested(obj: unknown, path: string[]): string | undefined {
  let cur: unknown = obj
  for (const key of path) {
    if (!cur || typeof cur !== 'object') return undefined
    cur = (cur as UnknownRecord)[key]
  }
  if (typeof cur === 'string' && cur.length > 0) return cur
  return undefined
}

/** 列表/卡片展示：优先中等 webp */
function pickDisplayImageRaw(row: UnknownRecord): string {
  const webp =
    pickString(row, [
      'webpUrl',
      'webp_url',
      'mediumWebpUrl',
      'medium_webp_url',
      'previewWebp',
      'preview_webp',
      'webp',
    ]) ?? ''
  if (webp) return webp
  return pickImageUrlRaw(row)
}

/** 详情/原图字段（与中等 webp 区分） */
function pickOriginalUrlRaw(row: UnknownRecord): string {
  return pickString(row, ['originalUrl', 'original_url', 'sourceUrl', 'source_url']) ?? ''
}

/** 下载用：优先原图/完整地址，避免仅用 webp */
function pickDownloadImageRaw(row: UnknownRecord): string {
  const full =
    pickString(row, [
      'downloadUrl',
      'download_url',
      'originalUrl',
      'original_url',
      'sourceUrl',
      'source_url',
      'fileUrl',
      'file_url',
      'fullUrl',
      'full_url',
      'imageUrl',
      'image_url',
      'url',
    ]) ?? ''
  if (full) return full
  return pickImageUrlRaw(row)
}

/** 从常见嵌套结构里取图片地址 */
function pickImageUrlRaw(row: UnknownRecord): string {
  const flat =
    pickString(row, [
      'imageUrl',
      'imageURL',
      'image_url',
      'url',
      'fileUrl',
      'file_url',
      'originalUrl',
      'original_url',
      'fullUrl',
      'full_url',
      'hdUrl',
      'hd_url',
      'src',
      'path',
      'picture',
      'cover',
      'coverUrl',
      'cover_url',
      'preview',
      'previewUrl',
      'preview_url',
      'thumbnail',
      'thumb',
      'thumbUrl',
      'thumb_url',
    ]) ?? ''

  if (flat) return flat

  const nestedPaths = [
    ['image', 'url'],
    ['image', 'src'],
    ['file', 'url'],
    ['file', 'path'],
    ['media', 'url'],
    ['cover', 'url'],
    ['thumbnail', 'url'],
    ['img', 'url'],
  ] as const

  for (const p of nestedPaths) {
    const u = pickUrlFromNested(row, [...p])
    if (u) return u
  }

  const imgArr = row.images
  if (Array.isArray(imgArr) && imgArr.length > 0) {
    const first = imgArr[0]
    if (first && typeof first === 'object') {
      const u = pickString(first as UnknownRecord, ['url', 'src', 'path', 'imageUrl'])
      if (u) return u
    }
    if (typeof first === 'string') return first
  }

  return ''
}

function pickId(obj: UnknownRecord): string | number {
  const id = obj.id ?? obj.wallpaperId ?? obj._id ?? obj.uuid
  if (typeof id === 'string' || typeof id === 'number') return id
  return String(Math.random())
}

/** 解析 classificationTag / classificationTags（字符串、数组或对象数组） */
function pickClassificationTags(row: UnknownRecord): string[] {
  const raw = row.classificationTag ?? row.classificationTags ?? row.classification_tags
  if (raw == null || raw === '') return []
  if (Array.isArray(raw)) {
    return raw
      .map((x) => {
        if (typeof x === 'string') return x.trim()
        if (x && typeof x === 'object') {
          return (pickString(x as UnknownRecord, ['name', 'label', 'title', 'text', 'value', 'tag']) ?? '').trim()
        }
        return ''
      })
      .filter((s) => s.length > 0)
  }
  if (typeof raw === 'string') {
    const s = raw.trim()
    if (s.startsWith('[')) {
      try {
        const parsed = JSON.parse(s) as unknown
        if (Array.isArray(parsed)) {
          return parsed
            .map((x) => (typeof x === 'string' ? x.trim() : ''))
            .filter((x) => x.length > 0)
        }
      } catch {
        /* 按普通字符串切分 */
      }
    }
    return s
      .split(/[,，;；|]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
  }
  return []
}

function pickClassificationTagText(row: UnknownRecord): string | undefined {
  const raw = row.classificationTag ?? row.classification_tags
  if (typeof raw === 'string') {
    const s = raw.trim()
    return s || undefined
  }
  return undefined
}

/** 疑似后端 ID / UUID / 长十六进制，不宜作为标签展示 */
export function isLikelyOpaqueTagToken(s: string): boolean {
  const t = String(s).trim()
  if (t.length === 0) return true
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)) return true
  if (t.length >= 24 && /^[0-9a-f]+$/i.test(t)) return true
  if (/^[0-9a-f]{12,}$/i.test(t) && t.length >= 16) return true
  return false
}

export function filterTagsForDisplay(tags: string[]): string[] {
  return tags.map((t) => String(t).trim()).filter((t) => t.length > 0 && !isLikelyOpaqueTagToken(t))
}

function pickTags(row: UnknownRecord): string[] {
  const raw = row.tags ?? row.tagNames ?? row.labels ?? row.keywords ?? row.tag_list
  if (Array.isArray(raw)) {
    return raw
      .map((x) => {
        if (typeof x === 'string') return x.trim()
        if (x && typeof x === 'object') {
          const o = x as UnknownRecord
          return (pickString(o, ['name', 'label', 'title', 'text', 'value']) ?? '').trim()
        }
        return ''
      })
      .filter((s) => s.length > 0)
  }
  if (typeof raw === 'string') {
    return raw
      .split(/[,，;；|]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  }
  return []
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function pickResolution(row: UnknownRecord): string | undefined {
  const s = pickString(row, ['resolution', 'Resolution', 'pixel', 'dimensions', 'dimension'])
  if (s) return s
  const w = toNum(row.width ?? row.w ?? row.imageWidth)
  const h = toNum(row.height ?? row.h ?? row.imageHeight)
  if (w && h) return `${w}x${h}`
  return undefined
}

function pickFileSizeLabel(row: UnknownRecord): string | undefined {
  const s = pickString(row, ['fileSize', 'file_size', 'sizeText', 'size_label', 'sizeLabel'])
  if (s) return s
  const bytes = toNum(row.size ?? row.fileSizeBytes ?? row.sizeBytes ?? row.file_size_bytes)
  if (bytes != null && bytes > 0) return formatBytes(bytes)
  return undefined
}

function pickIsFavorited(row: UnknownRecord): boolean | undefined {
  const v = row.isFavorite ?? row.isFavorited ?? row.favorited ?? row.liked ?? row.is_favorite
  if (typeof v === 'boolean') return v
  if (v === 1 || v === '1' || v === 'true') return true
  if (v === 0 || v === '0' || v === 'false') return false
  return undefined
}

function normalizeWallpaperRow(raw: unknown): WallpaperItem | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as UnknownRecord
  const displayRaw = pickDisplayImageRaw(row)
  const imageUrl = resolveMediaUrl(displayRaw)
  if (!imageUrl) return null

  const downloadRaw = pickDownloadImageRaw(row)
  const resolvedDownload = resolveMediaUrl(downloadRaw)
  const downloadUrl = resolvedDownload && resolvedDownload !== imageUrl ? resolvedDownload : undefined

  const originalRaw = pickOriginalUrlRaw(row)
  const resolvedOriginal = originalRaw ? resolveMediaUrl(originalRaw) : ''
  const originalUrl = resolvedOriginal || undefined

  const tags = pickTags(row)
  const classificationTags = pickClassificationTags(row)
  const favoriteCount =
    toNum(row.favoriteCount ?? row.favorites ?? row.likeCount ?? row.likes ?? row.starCount) ?? undefined
  const downloadCount =
    toNum(row.downloadCount ?? row.downloads ?? row.download_times ?? row.downloadTimes) ?? undefined
  const isFavorited = pickIsFavorited(row)

  return {
    id: pickId(row),
    imageUrl,
    originalUrl,
    downloadUrl: downloadUrl ?? undefined,
    title: pickString(row, ['title', 'name', 'caption', 'description']),
    tags,
    classificationTag: pickClassificationTagText(row),
    classificationTags: classificationTags.length > 0 ? classificationTags : undefined,
    favoriteCount,
    downloadCount,
    isFavorited,
    resolution: pickResolution(row),
    fileSizeLabel: pickFileSizeLabel(row),
  }
}

/**
 * 按参数顺序找到第一个「非空数组」；若只有空数组则退回该空数组；都没有则 []。
 * 避免 root.list: [] 挡住后面 data.items 里真实数据。
 */
function firstArrayCandidate(...candidates: unknown[]): unknown[] {
  let firstEmpty: unknown[] | undefined
  for (const c of candidates) {
    if (!Array.isArray(c)) continue
    if (c.length > 0) return c
    if (!firstEmpty) firstEmpty = c
  }
  return firstEmpty ?? []
}

function extractListAndTotal(payload: unknown): { list: unknown[]; total: number } {
  if (payload == null) return { list: [], total: 0 }

  if (Array.isArray(payload)) {
    return { list: payload, total: payload.length }
  }

  if (typeof payload !== 'object') return { list: [], total: 0 }

  const root = payload as UnknownRecord
  const nested = root.data
  const dataObj =
    nested && typeof nested === 'object' && !Array.isArray(nested) ? (nested as UnknownRecord) : null

  const list = firstArrayCandidate(
    Array.isArray(nested) ? nested : undefined,
    root.list,
    root.items,
    root.records,
    root.rows,
    root.result,
    root.wallpapers,
    root.body,
    Array.isArray(root.data) ? root.data : undefined,
    dataObj?.list,
    dataObj?.items,
    dataObj?.records,
    dataObj?.rows,
    dataObj?.wallpapers,
    dataObj?.data,
    dataObj?.result,
  )

  const totalRaw =
    toNum(root.total) ??
    toNum(root.totalCount) ??
    toNum(root.count) ??
    toNum(dataObj?.total) ??
    toNum(dataObj?.totalCount) ??
    toNum(dataObj?.count) ??
    (list.length > 0 ? list.length : undefined)

  const total = totalRaw !== undefined ? Math.max(0, totalRaw) : list.length

  return { list, total }
}

export type WallpaperSuggestTagListQuery = {
  tag?: string
  page?: number
  pageSize?: number
  sort?: string
}

export type WallpaperSuggestTagItem = {
  tag: string
  count: number
  listPath: string
  listQuery: WallpaperSuggestTagListQuery
}

function unwrapSuggestTagsData(root: unknown): UnknownRecord {
  if (!root || typeof root !== 'object') return {}
  const r = root as UnknownRecord
  const nested = r.data
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) return nested as UnknownRecord
  return r
}

function parseSuggestTagListQuery(o: unknown): WallpaperSuggestTagListQuery {
  if (!o || typeof o !== 'object') return {}
  const r = o as UnknownRecord
  return {
    tag: pickString(r, ['tag']),
    page: toNum(r.page),
    pageSize: toNum(r.pageSize ?? r.page_size),
    sort: pickString(r, ['sort']),
  }
}

function parseSuggestTagItemRow(raw: unknown): WallpaperSuggestTagItem | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as UnknownRecord
  const tag = pickString(row, ['tag'])?.trim()
  if (!tag) return null
  const count = toNum(row.count) ?? 0
  const listPath = pickString(row, ['listPath', 'list_path']) ?? '/api/v1/pc-wallpapers'
  const listQuery = parseSuggestTagListQuery(row.listQuery ?? row.list_query)
  return { tag, count, listPath: listPath || '/api/v1/pc-wallpapers', listQuery }
}

function parseSuggestTagsPayload(data: unknown): { items: WallpaperSuggestTagItem[]; query: string } {
  const root = unwrapSuggestTagsData(data)
  const itemsRaw = root.items
  const query = pickString(root, ['query']) ?? ''
  const items: WallpaperSuggestTagItem[] = []
  if (!Array.isArray(itemsRaw)) return { items, query }
  const seen = new Set<string>()
  for (const raw of itemsRaw) {
    const it = parseSuggestTagItemRow(raw)
    if (!it) continue
    const k = it.tag.toLowerCase()
    if (seen.has(k)) continue
    seen.add(k)
    items.push(it)
  }
  return { items, query }
}

export type FetchWallpaperSuggestTagsQuery = {
  /** 最长 50；不传或空串时后端返回热门标签 */
  q?: string
  /** 1–30，默认 10 */
  limit?: number
  signal?: AbortSignal
}

/**
 * GET `/wallpapers/suggest-tags`（相对 `VITE_API_BASE_URL`，如 `/api/v1`）。
 */
export async function fetchWallpaperSuggestTags(
  query: FetchWallpaperSuggestTagsQuery,
): Promise<{ items: WallpaperSuggestTagItem[]; query: string }> {
  const limit = Math.min(30, Math.max(1, query.limit ?? 10))
  const qRaw = query.q?.trim().slice(0, 50) ?? ''
  const params: Record<string, string | number> = { limit }
  if (qRaw) params.q = qRaw

  const { data } = await http.get<unknown>('/wallpapers/suggest-tags', {
    params,
    signal: query.signal,
  })

  if (import.meta.env.DEV) {
    try {
      const preview = typeof data === 'string' ? data.slice(0, 400) : JSON.stringify(data)?.slice(0, 600)
      console.debug('[wallpapers/suggest-tags] preview:', preview)
    } catch {
      console.debug('[wallpapers/suggest-tags] (unserializable)', data)
    }
  }

  return parseSuggestTagsPayload(data)
}

export type WallpapersPageResult = {
  items: WallpaperItem[]
  total: number
}

/** 与后端约定：默认每页条数、默认排序 */
export const DEFAULT_WALLPAPER_PAGE_SIZE = 16
export const DEFAULT_WALLPAPER_SORT = '-createdAt'

export type FetchWallpapersQuery = {
  page: number
  /** 默认 {@link DEFAULT_WALLPAPER_PAGE_SIZE} */
  pageSize?: number
  /** 关键词检索（搜索框），与下方结构化参数可同时存在，由后端 AND 组合 */
  tag?: string
  /** 默认 {@link DEFAULT_WALLPAPER_SORT} */
  sort?: string
  /** 按 ID 列表筛选（用于个人主页收藏列表等场景） */
  ids?: string[]
  /**
   * 结构化筛选（与 Mongo 文档字段对应，均为可选；前端点选筛选按钮时写入，不占用搜索框）。
   *
   * --- 后端联调（GET `/api/v1/pc-wallpapers`）---
   * 建议在保留 `page` / `pageSize` / `sort` / `tag` 的基础上，增加查询参数（snake_case 亦可，需与前端约定一致）：
   * - `hotLabel`：匹配 `hotLabels` 数组包含该文案（如「最新」「昨日热门」）；可与 `sort` 同时生效。
   * - `wallpaperKind`：等值匹配 `wallpaperKind`（如「静态壁纸」）。
   * - `classificationTag`：等值匹配 `classificationTag`（如「自然|风景」）；建议后端对 `|` 两侧空格做规范化。
   * - `resolutionLabel`：等值匹配 `resolutionLabel`（如「3 K」）。
   * - `colorTone`：等值匹配 `colorTone`（如「灰/白」）。
   * - `resolution`：自定义分辨率，如 `1920x1080`；可做区间或就近匹配 `width`/`height`。
   * 未实现的参数请忽略或返回明确错误，避免静默无结果。
   */
  hotLabel?: string
  wallpaperKind?: string
  classificationTag?: string
  resolutionLabel?: string
  colorTone?: string
  resolution?: string
}

export type RecommendationDeviceType = 'Mobile' | 'PC'

function appendQueryParam(params: Record<string, string | number>, key: string, val: string | undefined) {
  const s = val?.trim()
  if (s) params[key] = s
}

/**
 * 电脑壁纸列表。
 * `GET /api/v1/pc-wallpapers`（相对 `VITE_API_BASE_URL` 的路径为 `/pc-wallpapers`）。
 * 与 `GET /api/v1/wallpapers` 等价时可由后端择一实现。
 */
export async function fetchWallpapersPage(query: FetchWallpapersQuery): Promise<WallpapersPageResult> {
  const pageSize = query.pageSize ?? DEFAULT_WALLPAPER_PAGE_SIZE
  const sort = query.sort ?? DEFAULT_WALLPAPER_SORT

  const params: Record<string, string | number> = {
    page: query.page,
    pageSize,
    sort,
  }
  appendQueryParam(params, 'tag', query.tag)
  appendQueryParam(params, 'hotLabel', query.hotLabel)
  appendQueryParam(params, 'wallpaperKind', query.wallpaperKind)
  appendQueryParam(params, 'classificationTag', query.classificationTag)
  appendQueryParam(params, 'resolutionLabel', query.resolutionLabel)
  appendQueryParam(params, 'colorTone', query.colorTone)
  appendQueryParam(params, 'resolution', query.resolution)
  if (query.ids?.length) (params as Record<string, unknown>).ids = query.ids.join(',')

  const { data } = await http.get<unknown>('/pc-wallpapers', {
    params,
  })

  if (import.meta.env.DEV) {
    try {
      const preview = typeof data === 'string' ? data.slice(0, 400) : JSON.stringify(data)?.slice(0, 600)
      console.debug('[pc-wallpapers] response preview:', preview)
    } catch {
      console.debug('[pc-wallpapers] response (unserializable)', data)
    }
  }

  const { list, total } = extractListAndTotal(data)
  const items = list.map(normalizeWallpaperRow).filter((x): x is WallpaperItem => x != null)

  if (import.meta.env.DEV && list.length > 0 && items.length === 0) {
    console.warn(
      '[pc-wallpapers] 接口返回了',
      list.length,
      '条记录，但无法解析出图片地址。请检查字段名或把一条原始 JSON 发给前端。',
      list[0],
    )
  }

  return { items, total }
}

/**
 * 详情页相关推荐专用：
 * - 手机壁纸：`GET /api/v1/mobieWallpaper`
 * - 电脑壁纸：`GET /api/v1/PcWallpapers`
 * 同时透传 `deviceType=Mobile|PC`
 */
export async function fetchDetailRecommendationsPage(
  query: FetchWallpapersQuery & { deviceType: RecommendationDeviceType },
): Promise<WallpapersPageResult> {
  const pageSize = query.pageSize ?? DEFAULT_WALLPAPER_PAGE_SIZE
  const sort = query.sort ?? DEFAULT_WALLPAPER_SORT

  const params: Record<string, string | number> = {
    page: query.page,
    pageSize,
    sort,
    deviceType: query.deviceType,
  }
  appendQueryParam(params, 'tag', query.tag)
  appendQueryParam(params, 'hotLabel', query.hotLabel)
  appendQueryParam(params, 'wallpaperKind', query.wallpaperKind)
  appendQueryParam(params, 'classificationTag', query.classificationTag)
  appendQueryParam(params, 'resolutionLabel', query.resolutionLabel)
  appendQueryParam(params, 'colorTone', query.colorTone)
  appendQueryParam(params, 'resolution', query.resolution)

  const endpoint = query.deviceType === 'Mobile' ? '/mobile-wallpapers' : '/pc-wallpapers'
  const fallbackEndpoint = query.deviceType === 'Mobile' ? '/mobile-wallpapers' : '/pc-wallpapers'
  const debugLabel = query.deviceType === 'Mobile' ? 'mobile-recommendations' : 'pc-recommendations'

  let data: unknown
  try {
    const res = await http.get<unknown>(endpoint, {
      params,
    })
    data = res.data
  } catch (err) {
    const status = (err as { api?: { status?: number } })?.api?.status
    if (status !== 404) throw err

    if (import.meta.env.DEV) {
      console.warn(`[${debugLabel}] 主路由 ${endpoint} 不存在，回退到 ${fallbackEndpoint}`)
    }

    const fallbackRes = await http.get<unknown>(fallbackEndpoint, {
      params,
    })
    data = fallbackRes.data
  }

  if (import.meta.env.DEV) {
    try {
      const preview = typeof data === 'string' ? data.slice(0, 400) : JSON.stringify(data)?.slice(0, 600)
      console.debug(`[${debugLabel}] response preview:`, preview)
    } catch {
      console.debug(`[${debugLabel}] response (unserializable)`, data)
    }
  }

  const { list, total } = extractListAndTotal(data)
  const items = list.map(normalizeWallpaperRow).filter((x): x is WallpaperItem => x != null)

  if (import.meta.env.DEV && list.length > 0 && items.length === 0) {
    console.warn(
      `[${debugLabel}] 接口返回了`,
      list.length,
      '条记录，但无法解析出图片地址。请检查字段名或把一条原始 JSON 发给前端。',
      list[0],
    )
  }

  return { items, total }
}

/** 手机壁纸列表默认分页与排序（与 `GET /mobile-wallpapers` 一致） */
export const DEFAULT_MOBILE_WALLPAPER_PAGE_SIZE = 20
export const DEFAULT_MOBILE_WALLPAPER_SORT = '-createdAt'

export type FetchMobileWallpapersQuery = {
  page: number
  pageSize?: number
  sort?: string
  /** 关键词搜索（搜索框） */
  tag?: string
  /** 按 ID 列表筛选（用于个人主页收藏列表等场景） */
  ids?: string[]
  /** 结构化筛选 */
  hotLabel?: string
  wallpaperKind?: string
  classificationTag?: string
  resolutionLabel?: string
  colorTone?: string
  resolution?: string
  signal?: AbortSignal
}

/**
 * 手机壁纸列表。`GET /api/v1/mobile-wallpapers`（相对 base 为 `/mobile-wallpapers`）。
 */
export async function fetchMobileWallpapersPage(
  query: FetchMobileWallpapersQuery,
): Promise<WallpapersPageResult> {
  const pageSize = query.pageSize ?? DEFAULT_MOBILE_WALLPAPER_PAGE_SIZE
  const sort = query.sort ?? DEFAULT_MOBILE_WALLPAPER_SORT

  const params: Record<string, string | number> = { page: query.page, pageSize, sort }
  appendQueryParam(params, 'tag', query.tag)
  appendQueryParam(params, 'hotLabel', query.hotLabel)
  appendQueryParam(params, 'wallpaperKind', query.wallpaperKind)
  appendQueryParam(params, 'classificationTag', query.classificationTag)
  appendQueryParam(params, 'resolutionLabel', query.resolutionLabel)
  appendQueryParam(params, 'colorTone', query.colorTone)
  appendQueryParam(params, 'resolution', query.resolution)
  if (query.ids?.length) (params as Record<string, unknown>).ids = query.ids.join(',')

  const { data } = await http.get<unknown>('/mobile-wallpapers', {
    params,
    signal: query.signal,
  })

  if (import.meta.env.DEV) {
    try {
      const preview = typeof data === 'string' ? data.slice(0, 400) : JSON.stringify(data)?.slice(0, 600)
      console.debug('[mobile-wallpapers] response preview:', preview)
    } catch {
      console.debug('[mobile-wallpapers] response (unserializable)', data)
    }
  }

  const { list, total } = extractListAndTotal(data)
  const items = list.map(normalizeWallpaperRow).filter((x): x is WallpaperItem => x != null)

  if (import.meta.env.DEV && list.length > 0 && items.length === 0) {
    console.warn(
      '[mobile-wallpapers] 接口返回了',
      list.length,
      '条记录，但无法解析出图片地址。',
      list[0],
    )
  }

  return { items, total }
}

/**
 * 电脑壁纸上传（需登录）。`POST /api/v1/pc-wallpapers/upload`。
 * 请勿再传 `deviceType`（已由路径区分 PC）。
 */
export async function uploadPcWallpaper(formData: FormData, signal?: AbortSignal): Promise<unknown> {
  const { data } = await http.post<unknown>('/pc-wallpapers/upload', formData, {
    signal,
  })
  return data
}

/**
 * 手机壁纸上传（需登录）。`POST /api/v1/mobile-wallpapers/upload`。
 */
export async function uploadMobileWallpaper(formData: FormData, signal?: AbortSignal): Promise<unknown> {
  const { data } = await http.post<unknown>('/mobile-wallpapers/upload', formData, {
    signal,
  })
  return data
}

/** 详情页下载/收藏上报：与列表 kind 一致 */
export type WallpaperDetailApiKind = 'pc' | 'mobile'

export type WallpaperStatsPatch = {
  downloadCount?: number
  favoriteCount?: number
  isFavorited?: boolean
}

function wallpaperDetailPathPrefix(kind: WallpaperDetailApiKind): string {
  return kind === 'mobile' ? '/mobile-wallpapers' : '/pc-wallpapers'
}

function unwrapStatsPayload(data: unknown): UnknownRecord {
  if (!data || typeof data !== 'object') return {}
  const r = data as UnknownRecord
  const nested = r.data
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) return nested as UnknownRecord
  return r
}

function parseWallpaperStatsPatch(data: unknown): WallpaperStatsPatch {
  const r = unwrapStatsPayload(data)
  return {
    downloadCount: toNum(r.downloadCount ?? r.downloads),
    favoriteCount: toNum(r.favoriteCount ?? r.favorites),
    isFavorited: pickIsFavorited(r),
  }
}

/** 大图经服务端代理拉取：超时与体积限制放宽（与默认 15s / 默认 maxContentLength 区分） */
const WALLPAPER_FILE_FETCH_TIMEOUT_MS = 120_000

/** 判断 blob 是否像 JSON 错误体（避免把 404 的 JSON 当图片保存） */
async function blobLooksLikeJsonError(blob: Blob): Promise<boolean> {
  if (blob.size > 4096) return false
  const head = (await blob.slice(0, 1).text()).trim()
  return head === '{' || head === '['
}

/**
 * 通过 **与列表相同的 API 基址** 拉取壁纸二进制（走 axios，带 Token，不受图片 CDN 跨域限制）。
 * 与 wallpaper-api 约定：`GET .../:id/file`、`GET .../:id/image`（行为一致，依次尝试直至成功）。
 * Node 端会校验 `maxContentLength` / `maxBodyLength`；此处放宽以免大图被拒。
 */
export async function fetchWallpaperFileBlob(
  id: string | number,
  kind: WallpaperDetailApiKind,
  signal?: AbortSignal,
): Promise<Blob> {
  const base = wallpaperDetailPathPrefix(kind)
  const enc = encodeURIComponent(String(id))
  const paths = [`${base}/${enc}/file`, `${base}/${enc}/image`]
  let lastErr: unknown
  const large = Number.POSITIVE_INFINITY
  for (const path of paths) {
    try {
      const { data, headers } = await http.get<Blob>(path, {
        responseType: 'blob',
        signal,
        timeout: WALLPAPER_FILE_FETCH_TIMEOUT_MS,
        maxContentLength: large,
        maxBodyLength: large,
      })
      if (!(data instanceof Blob) || data.size === 0) continue
      const ct = String(headers['content-type'] ?? '').toLowerCase()
      if (ct.includes('application/json') || (await blobLooksLikeJsonError(data))) {
        continue
      }
      if (ct.startsWith('image/') || ct.includes('octet-stream') || ct === '') {
        return data
      }
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('GET /file 与 /image 均未能拉取到图片')
}

/**
 * 下载成功后上报，更新服务端下载计数。
 * `POST /api/v1/pc-wallpapers/:id/download` 或 `.../mobile-wallpapers/:id/download`
 */
export async function reportWallpaperDownloaded(
  id: string | number,
  kind: WallpaperDetailApiKind,
  signal?: AbortSignal,
): Promise<WallpaperStatsPatch> {
  const base = wallpaperDetailPathPrefix(kind)
  const { data } = await http.post<unknown>(`${base}/${encodeURIComponent(String(id))}/download`, {}, { signal })
  return parseWallpaperStatsPatch(data)
}

/**
 * 收藏/取消收藏。`POST .../:id/favorite`；body 仅需 `favorited`。
 * 直接更新壁纸收藏数，不返回 favoriteCount。
 */
export async function reportWallpaperFavorite(
  id: string | number,
  favorited: boolean,
  kind: WallpaperDetailApiKind,
  signal?: AbortSignal,
): Promise<void> {
  const base = wallpaperDetailPathPrefix(kind)
  const path = `${base}/${encodeURIComponent(String(id))}/favorite`
  const body = {
    favorited,
  }
  await http.post<unknown>(path, body, { signal })
}

// ---- 用户收藏集合 API（POST /api/v1/auth/collections） ----

/** 后端 collections 接口单条收藏项 */
export type CollectionItem = {
  url: string
  wallpaperId?: string
  title?: string
  deviceType?: 'pc' | 'mobile'
  createdAt?: string
}

/** POST /api/v1/auth/collections 的响应 */
export type ToggleCollectionResult = {
  /** true=已收藏，false=已取消 */
  collected: boolean
  /** 最新收藏列表 */
  collections: CollectionItem[]
}

/**
 * 收藏 / 取消收藏壁纸（切换语义，后端自动判定）。
 */
export async function toggleWallpaperCollection(payload: {
  url: string
  wallpaperId?: string | number
  title?: string
  deviceType?: 'pc' | 'mobile'
}): Promise<ToggleCollectionResult> {
  const { data } = await http.post<unknown>('/auth/collections', {
    url: payload.url,
    wallpaperId: payload.wallpaperId != null ? String(payload.wallpaperId) : undefined,
    title: payload.title,
    deviceType: payload.deviceType,
  })

  const d = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  const inner = (d.data && typeof d.data === 'object' ? d.data : d) as Record<string, unknown>

  return {
    collected: inner.collected === true,
    collections: Array.isArray(inner.collections) ? (inner.collections as CollectionItem[]) : [],
  }
}


