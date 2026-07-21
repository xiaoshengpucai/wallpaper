import { ref, watch, onUnmounted, type Ref, readonly } from 'vue'

/**
 * 渐进式图片加载：先展示缩略图，后台预加载原图，就绪后无缝替换。
 *
 * @param originalUrl  原图 URL（响应式）
 * @param thumbUrl     缩略图 URL（响应式）— 接口已返回的中等尺寸图
 */
export function useProgressiveImage(
  originalUrl: Ref<string>,
  thumbUrl: Ref<string>,
) {
  /** 当前应显示的 URL（缩略图 → 原图） */
  const displayUrl = ref('')
  /** 原图是否已加载完成 */
  const isFullLoaded = ref(false)
  /** 是否正在加载原图 */
  const isFullLoading = ref(false)

  let preloader: HTMLImageElement | null = null

  function cleanup() {
    if (preloader) {
      preloader.onload = null
      preloader.onerror = null
      preloader.src = ''
      preloader = null
    }
  }

  function load(original: string, thumb: string) {
    cleanup()
    isFullLoaded.value = false
    isFullLoading.value = false

    // 没有任何可用图片
    if (!original && !thumb) {
      displayUrl.value = ''
      return
    }

    // 没有缩略图，直接用原图
    if (!thumb) {
      displayUrl.value = original
      isFullLoaded.value = true
      return
    }

    // 缩略图和原图相同，无需渐进加载
    if (thumb === original || !original) {
      displayUrl.value = thumb || original
      isFullLoaded.value = true
      return
    }

    // 先展示缩略图
    displayUrl.value = thumb
    isFullLoading.value = true

    // 后台静默预加载原图
    preloader = new Image()
    preloader.onload = () => {
      displayUrl.value = original
      isFullLoaded.value = true
      isFullLoading.value = false
    }
    preloader.onerror = () => {
      // 原图加载失败，保持缩略图
      isFullLoading.value = false
    }
    preloader.src = original
  }

  watch(
    [originalUrl, thumbUrl],
    ([o, t]) => load(o?.trim() ?? '', t?.trim() ?? ''),
    { immediate: true },
  )

  onUnmounted(cleanup)

  return {
    /** 当前应显示的图片 URL（缩略图或已就绪的原图） */
    displayUrl: readonly(displayUrl),
    /** 原图是否已完成加载 */
    isFullLoaded: readonly(isFullLoaded),
    /** 原图是否正在后台加载中 */
    isFullLoading: readonly(isFullLoading),
  }
}
