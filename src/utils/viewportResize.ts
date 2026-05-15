import { debounce } from './debounce'

/** 窗口 resize 防抖默认延迟（ms），减轻频繁改宽高时的布局计算 */
export const VIEWPORT_RESIZE_DEBOUNCE_MS = 120

/**
 * 窗口宽或高变化都会进入防抖队列（适合依赖视口高度的逻辑，如吸底、滚动度量）。
 */
export function createDebouncedWindowResize(handler: () => void, delayMs = VIEWPORT_RESIZE_DEBOUNCE_MS) {
  const run = debounce(handler, delayMs)
  return {
    onResize: () => run(),
    cancel: () => run.cancel(),
  }
}

/**
 * 仅当 `window.innerWidth` 与上次执行成功后的宽度不同才进入防抖（纯高度变化不触发）。
 * 适合断点/横向缩放类布局，避免纵向拖拽窗口时重复算宽度相关尺寸。
 */
export function createWidthOnlyDebouncedWindowResize(handler: () => void, delayMs = VIEWPORT_RESIZE_DEBOUNCE_MS) {
  let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0
  const run = debounce(() => {
    handler()
    lastWidth = window.innerWidth
  }, delayMs)

  const onResize = () => {
    if (typeof window === 'undefined') return
    const w = window.innerWidth
    if (w === lastWidth) return
    run()
  }

  return {
    onResize,
    cancel: () => run.cancel(),
    /** 挂载后调用，避免首帧与后续 resize 比较错位 */
    syncWidth: () => {
      lastWidth = window.innerWidth
    },
  }
}
