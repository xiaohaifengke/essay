# Vue源码学习概述
----------------

## nextTick的原理(vue 2.6)
> **先来看下官网的介绍：**异步更新队列 [传送门](https://cn.vuejs.org/v2/guide/reactivity.html#%E5%BC%82%E6%AD%A5%E6%9B%B4%E6%96%B0%E9%98%9F%E5%88%97)  
> 可能你还没有注意到，Vue 在更新 DOM 时是异步执行的。只要侦听到数据变化，Vue 将开启一个队列，并缓冲在同一事件循环中发生的所有数据变更。如果同一个 watcher 被多次触发，只会被推入到队列中一次。这种在缓冲时去除重复数据对于避免不必要的计算和 DOM 操作是非常重要的。然后，**在下一个的事件循环“tick”中**，Vue 刷新队列并执行实际 (已去重的) 工作。Vue 在内部对异步队列尝试使用原生的 Promise.then、MutationObserver 和 setImmediate，如果执行环境不支持，则会采用 setTimeout(fn, 0) 代替。

  - #### 有必要先来理解下*在下一个的事件循环“tick”中*？
    上面官网介绍中我加粗了一小句话，也就是 **在下一个的事件循环“tick”中**，原因是这里涉及到了js的event loop机制及microtask and macrotask的概念。
    可以先看[这里(简述js的event loop机制及microtask and macrotask)](javascript/event-loop)了解下相关机制。

  - #### 分析nextTick的源码
    先理一下源码中更新watcher的思路。
    1. 由Vue对数据进行劫持部分的代码可知，当数据变化时会调用 `dep.notify()` 通知该数据的订阅器中的watcher进行更新；

      ```javascript
      // src/core/observer/scheduler.js
      
      export function defineReactive (
        obj: Object,
        key: string,
        val: any,
        customSetter?: ?Function,
        shallow?: boolean
      ) {
      ...
      Object.defineProperty(obj, key, {
          enumerable: true,
          configurable: true,
          get: function reactiveGetter () {
            ...
          },
          set: function reactiveSetter (newVal) {
            const value = getter ? getter.call(obj) : val
            /* eslint-disable no-self-compare */
            if (newVal === value || (newVal !== newVal && value !== value)) {
              return
            }
            /* eslint-enable no-self-compare */
            if (process.env.NODE_ENV !== 'production' && customSetter) {
              customSetter()
            }
            // #7981: for accessor properties without setter
            if (getter && !setter) return
            if (setter) {
              setter.call(obj, newVal)
            } else {
              val = newVal
            }
            childOb = !shallow && observe(newVal)
            dep.notify()
          }
        })
      }
      ```
  
    2. watcher更新的时候会调用自身的update方法，通常的watcher(非computed watcher和未被sync修饰符修饰的watcher)会进入到 `queueWatcher(this)`；

      ```javascript
      // src/core/ovserver/watcher.js
      
      export default class Watcher {
      ···
      
      /**
         * Subscriber interface.
         * Will be called when a dependency changes.
         */
        update () {
          /* istanbul ignore else */
          if (this.lazy) {
            this.dirty = true
          } else if (this.sync) {
            this.run()
          } else {
            queueWatcher(this)
          }
        }
        
      ···
      }
      ```

    3. 由queueWatcher方法可知watcher不会立即被更新，而是会经过一些去重等判断后被放入一个队列中，然后在每次集中更新完这个队列的watcher之后的第一次调用 `nextTick(flushSchedulerQueue)`，
    把更新队列的函数`flushSchedulerQueue`放入下一个事件循环的‘tick’中。`nextTick`由字面意思也可知道是下一个事件循环的‘tick’，现在看一下Vue中nextTick具体的实现方式。[源码传送门](https://github.com/vuejs/vue/blob/dev/src/core/util/next-tick.js#L87)

      ```javascript
      // src/core/util/next-tick.js
      
      /* @flow */
      /* globals MutationObserver */
      
      import { noop } from 'shared/util'
      import { handleError } from './error'
      import { isIE, isIOS, isNative } from './env'
      
      export let isUsingMicroTask = false
      
      const callbacks = []
      let pending = false
      
      function flushCallbacks () {
        pending = false
        const copies = callbacks.slice(0)
        callbacks.length = 0
        for (let i = 0; i < copies.length; i++) {
          copies[i]()
        }
      }
      
      // Here we have async deferring wrappers using microtasks.
      // In 2.5 we used (macro) tasks (in combination with microtasks).
      // However, it has subtle problems when state is changed right before repaint
      // (e.g. #6813, out-in transitions).
      // Also, using (macro) tasks in event handler would cause some weird behaviors
      // that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
      // So we now use microtasks everywhere, again.
      // A major drawback of this tradeoff is that there are some scenarios
      // where microtasks have too high a priority and fire in between supposedly
      // sequential events (e.g. #4521, #6690, which have workarounds)
      // or even between bubbling of the same event (#6566).
      let timerFunc // 4. 注释的意思大概是：
      // 这里我们使用 microtasks 异步延时包装器的特性。
      // 在2.5版本中，我们用 macrotasks 与 microtasks 结合的方式。
      // 然而，当状态在重绘之前发生变化时，它就存在一些微妙的问题，
      // 此外，在事件处理程序中使用（宏）任务会导致一些无法规避的奇怪行为
      // 所以我们现在又到处使用微任务。
      // 这种权衡的一个主要缺点是，在一些情况下，微任务的优先级太高从而在通常的事件顺序之间发生冲突，
      // 甚至会在同一个事件的冒泡过程中发生冲突
      
      // 5. timerFunc的实现思路是：
      // 首先判断浏览器是否兼容 Promise，如果兼容则在Promise.resolve().then中执行callbacks
      // 如果不兼容 Promise，再判断浏览器是否兼容MutationObserver, 如果兼容则用MutationObserver的实例监听文本变化来执行callbacks，
      // 如果不兼容MutationObserver，则依次判断是否兼容setImmediate和setTimeout作为降级方案。
      // 其中，只有Promise和MutationObserver的回调是 microtasks，setImmediate和setTimeout的回调是macrotasks。
      
      // 另外，可以产生macrotasks和microtasks的情况如下所示：
      // macrotasks: setTimeout, setInterval, setImmediate, requestAnimationFrame, I/O, UI rendering
      // microtasks: process.nextTick, Promises, Object.observe, MutationObserver
      
      // The nextTick behavior leverages the microtask queue, which can be accessed
      // via either native Promise.then or MutationObserver.
      // MutationObserver has wider support, however it is seriously bugged in
      // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
      // completely stops working after triggering a few times... so, if native
      // Promise is available, we will use it:
      /* istanbul ignore next, $flow-disable-line */
      if (typeof Promise !== 'undefined' && isNative(Promise)) {
        const p = Promise.resolve()
        timerFunc = () => {
          p.then(flushCallbacks)
          // In problematic UIWebViews, Promise.then doesn't completely break, but
          // it can get stuck in a weird state where callbacks are pushed into the
          // microtask queue but the queue isn't being flushed, until the browser
          // needs to do some other work, e.g. handle a timer. Therefore we can
          // "force" the microtask queue to be flushed by adding an empty timer.
          if (isIOS) setTimeout(noop)
        }
        isUsingMicroTask = true
      } else if (!isIE && typeof MutationObserver !== 'undefined' && (
        isNative(MutationObserver) ||
        // PhantomJS and iOS 7.x
        MutationObserver.toString() === '[object MutationObserverConstructor]'
      )) {
        // Use MutationObserver where native Promise is not available,
        // e.g. PhantomJS, iOS7, Android 4.4
        // (#6466 MutationObserver is unreliable in IE11)
        let counter = 1
        const observer = new MutationObserver(flushCallbacks)
        const textNode = document.createTextNode(String(counter))
        observer.observe(textNode, {
          characterData: true
        })
        timerFunc = () => {
          counter = (counter + 1) % 2
          textNode.data = String(counter)
        }
        isUsingMicroTask = true
      } else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
        // Fallback to setImmediate.
        // Technically it leverages the (macro) task queue,
        // but it is still a better choice than setTimeout.
        timerFunc = () => {
          setImmediate(flushCallbacks)
        }
      } else {
        // Fallback to setTimeout.
        timerFunc = () => {
          setTimeout(flushCallbacks, 0)
        }
      }
      
      export function nextTick (cb?: Function, ctx?: Object) {
        let _resolve
        // 1. 当调用nextTick时，会先往callbacks添加一个函数，其实callbacks就是下一个事件循环的'tick'中要执行的函数的队列
        callbacks.push(() => {
          if (cb) {
            try {
              cb.call(ctx)
            } catch (e) {
              handleError(e, ctx, 'nextTick')
            }
          } else if (_resolve) {
            _resolve(ctx)
          }
        })
        if (!pending) {
          pending = true
          timerFunc() // 2. 当pending为false时，执行timerFunc这个函数，timerFunc的内部实现是实现在下一个事件循环的'tick'中执行callbacks中cb的关键
        }
        // $flow-disable-line
        if (!cb && typeof Promise !== 'undefined') {
          // 3. 当cb不存在时，会返回一个未resolved的Promise,在cb在下一个事件循环的'tick'中被执行时，
          // 该promise会被resolved，并把then中的回调函数放在cb被执行时的'tick'的下一个'tick'中被执行。
          // 4. 然后看下timerFunc的实现
          return new Promise(resolve => {
            _resolve = resolve
          })
        }
      }
    
      ```
  可以先看下`nextTick`的内部实现，然后再看next-tick.js这个模块的整体实现。
  为了描述方便，把个人理解以汉字注释的方式嵌入到上面代码引用中。有时间再重新排版。

  - #### 关于vm.$nextTick( [callback] )
    先上源码：
    ```javascript
      // src/core/instance/render.js
      
      import {
        warn,
        nextTick,
        emptyObject,
        handleError,
        defineReactive
      } from '../util/index'
      
      Vue.prototype.$nextTick = function (fn: Function) {
        return nextTick(fn, this)
      }
      ```
    Vue原型中的$nextTick仅仅是调用了nextTick方法，同理，仅仅是把callback放入下一个事件循环的‘tick’中，由于callback的添加顺序在DOM更新相关函数之后，故在该callback被执行时DOM已经更新了。

