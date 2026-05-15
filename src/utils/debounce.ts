export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delayMs: number,
) {
  let timer: number | undefined

  const debounced = (...args: TArgs) => {
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), delayMs)
  }

  debounced.cancel = () => {
    if (timer) window.clearTimeout(timer)
    timer = undefined
  }

  return debounced
}

