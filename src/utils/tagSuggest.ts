/**
 * 搜索联想：归一化查询 + 分级打分（前缀 / 词首 / 包含 / 子序列模糊），去重截断。
 */

/** 去首尾空白、全角空格、连续空白，NFKC 统一全角字母数字 */
export function normalizeSuggestQuery(raw: string): string {
  return raw
    .trim()
    .replace(/\u3000/g, ' ')
    .replace(/\s+/g, ' ')
    .normalize('NFKC')
}

/** 子序列匹配（模糊）：query 中每个字符按顺序出现在 text 中即可，如「美c」→「美女cos」 */
export function isSubsequenceIgnoreCase(query: string, text: string): boolean {
  const q = query.trim().toLowerCase()
  const hay = text.toLowerCase()
  if (!q) return true
  let qi = 0
  for (let j = 0; j < hay.length && qi < q.length; j++) {
    if (hay[j] === q[qi]) qi++
  }
  return qi === q.length
}

/** 在 `|`、`/`、空白 后的片段是否以 needle 开头 */
function startsAfterDelimiter(hayLower: string, needleLower: string): boolean {
  if (!needleLower) return false
  const parts = hayLower.split(/[/|｜\s]+/).map((p) => p.trim()).filter(Boolean)
  return parts.some((p) => p.startsWith(needleLower))
}

export type TagSuggestScore = {
  tag: string
  score: number
}

/**
 * 对词库条目打分并排序，返回建议列表（最多 max 条）。
 * 分数越高越靠前；同分更短标签略优先。
 */
export function scoreAndRankTagSuggestions(
  pool: readonly string[],
  rawQuery: string,
  max = 40,
): string[] {
  const q = normalizeSuggestQuery(rawQuery)
  if (!q) return []

  const qLower = q.toLowerCase()
  const unique = [...new Set(pool.map((t) => t.trim()).filter(Boolean))]
  const scored: TagSuggestScore[] = []

  for (const t of unique) {
    const lower = t.toLowerCase()
    let score = 0

    // 1) 前缀（中英不区分大小写）
    if (lower.startsWith(qLower)) {
      score = 1200 - Math.min(t.length, 80)
    }
    // 2) 分隔后的词段前缀（如「动漫 | 二次元」输入「二次」）
    else if (startsAfterDelimiter(lower, qLower)) {
      score = 950 - Math.min(t.length, 80)
    }
    // 3) 任意位置连续子串
    else {
      const idx = lower.indexOf(qLower)
      if (idx !== -1) {
        score = 700 - idx * 3 - Math.min(t.length, 60)
      }
    }

    // 4) 子序列模糊（仅在前三步未命中时参与，避免压过精确匹配）
    if (score === 0 && isSubsequenceIgnoreCase(q, t)) {
      score = 400 - Math.min(t.length, 100)
    }

    if (score > 0) scored.push({ tag: t, score })
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.tag.length - b.tag.length
  })

  const out: string[] = []
  const outSeen = new Set<string>()
  for (const { tag } of scored) {
    if (outSeen.has(tag)) continue
    outSeen.add(tag)
    out.push(tag)
    if (out.length >= max) break
  }
  return out
}

/**
 * 后端联想优先（保持服务端相关度顺序），不足条数用本地词库补全；按小写去重。
 */
export function mergeRemoteAndLocalSuggestions(
  remote: readonly string[],
  localPool: readonly string[],
  rawQuery: string,
  max = 40,
): string[] {
  const out: string[] = []
  const lowerSeen = new Set<string>()
  const push = (s: string) => {
    const t = s.trim()
    if (!t) return
    const k = t.toLowerCase()
    if (lowerSeen.has(k)) return
    lowerSeen.add(k)
    out.push(t)
  }

  for (const s of remote) {
    push(s)
    if (out.length >= max) return out
  }

  const need = max - out.length
  if (need <= 0) return out

  const localRanked = scoreAndRankTagSuggestions(localPool, rawQuery, max)
  for (const s of localRanked) {
    if (out.length >= max) break
    push(s)
  }
  return out
}

/** 从筛选定义里抽出可联想片段（| 两侧、整段） */
export function expandPoolFromFilterLabels(filterOptions: readonly string[]): string[] {
  const extra: string[] = []
  for (const line of filterOptions) {
    const s = line.trim()
    if (!s) continue
    extra.push(s)
    for (const part of s.split(/[/|｜]/)) {
      const p = part.trim()
      if (p && p !== s) extra.push(p)
    }
  }
  return extra
}
