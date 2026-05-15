import { readonly, ref } from 'vue'

const width = ref(0)
const visible = ref(false)

let timer: number | undefined

function clearTimer() {
  if (timer) window.clearInterval(timer)
  timer = undefined
}

export const progress = {
  state: {
    width: readonly(width),
    visible: readonly(visible),
  },
  start() {
    clearTimer()
    visible.value = true
    width.value = Math.max(width.value, 8)
    timer = window.setInterval(() => {
      // 渐进到 90%，等待 done() 收尾
      width.value = Math.min(90, width.value + Math.max(1, (90 - width.value) * 0.08))
    }, 120)
  },
  done() {
    clearTimer()
    width.value = 100
    window.setTimeout(() => {
      visible.value = false
      width.value = 0
    }, 180)
  },
}

