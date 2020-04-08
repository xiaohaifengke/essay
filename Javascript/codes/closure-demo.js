// 防抖
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

// 节流
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

// 模拟bind函数
Function.prototype._bind = function () {
  var func = this
  var context = [].shift.call(arguments)
  var bindArgs = [].slice.call(arguments, 0)
  return function () {
    var args = [].slice.call(arguments, 0)
    return func.apply(context, bindArgs.concat(args))
  }
}
