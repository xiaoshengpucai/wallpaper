import { ref } from 'vue'

/** 最近一次「电脑壁纸详情 + 暗色」下用于全屏模糊底的图片 URL，供离开详情后的站点主页透出 */
export const lastWallpaperBackdropUrl = ref('')

export function rememberWallpaperBackdropUrl(url: string) {
  const u = url.trim()
  if (u) lastWallpaperBackdropUrl.value = u
}
