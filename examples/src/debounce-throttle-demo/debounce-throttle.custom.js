/**
 * Created by Jhail on 2019/10/28.
 */
export function debounce (func, wait) {
  let timer = null
  return function (...args) {
    const context = this
    if (timer) clearTimeout(timer)
    timer = setTimeout(function () {
      func.apply(context, args)
      timer = null
    }, wait)
  }
}

export function throttle (func, wait) {
  let timer = null
  let lastTime = 0
  return function (...args) {
    const context = this
    const now = Date.now()
    if (!timer || now - lastTime >= wait) {
      func.apply(context, args)
      lastTime = now
    }
    if (timer) clearTimeout(timer)
    timer = setTimeout(function () {
      func.apply(context, args)
      timer = null
    }, wait)
  }
}
