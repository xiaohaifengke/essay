# 什么是 Event Loop？

**Event Loop（事件循环）** 是 JavaScript 运行时环境（如浏览器或 Node.js）用来协调同步任务和异步任务执行的一种机制。由于 JavaScript 是单线程的，Event Loop 允许它在不阻塞主线程的情况下处理 I/O 操作、定时器和其他异步事件。

## 核心组件

1.  **Call Stack (调用栈)**：存储当前正在执行的函数。遵循 LIFO（后进先出）。
2.  **Web APIs / Node APIs**：环境提供的 API，处理异步操作（如 `setTimeout`, `fetch`, `DOM 事件`）。
3.  **Task Queue (宏任务队列)**：存放等待执行的异步任务回调。
4.  **Microtask Queue (微任务队列)**：存放需要立即异步执行的任务（优先级高于宏任务）。

## 执行流程

1.  **执行同步代码**：所有同步任务都在调用栈中按顺序执行。
2.  **清空微任务队列**：当前调用栈为空后，立即执行并清空微任务队列中的**所有**任务。
3.  **更新渲染**（浏览器环境下）：如果有必要，执行页面重绘（Repaint/Reflow）。
4.  **取出下一个宏任务**：从宏任务队列中取出一个任务放入调用栈执行，然后回到第 2 步循环。

---

## 面试官追问

### 1. 宏任务 (Macrotask) vs 微任务 (Microtask) 都有哪些？

- **宏任务**: `script` (整体代码), `setTimeout`, `setInterval`, `setImmediate` (Node 独有), `I/O`, `UI rendering`。
- **微任务**: `Promise.then/catch/finally`, `process.nextTick` (Node 独有), `MutationObserver`, `queueMicrotask`。

### 2. `async/await` 在事件循环中怎么处理？

`await` 右边的表达式会立即执行（视为同步代码）。`await` 下方的代码会被包装进一个微任务（类似于 `Promise.then`）中，等当前异步操作结束后再排入微任务队列执行。

### 3. Node.js 的 Event Loop 和浏览器有什么区别？

浏览器端的 Event Loop 遵循 HTML5 规范。Node.js 的 Event Loop 基于 `libuv` 库，分为 6 个阶段（timers, pending callbacks, idle/prepare, poll, check, close callbacks）。

- **关键点**：在 Node 11 之后，微任务的执行时机已调整为与浏览器基本一致（即每执行完一个宏任务就清空一次微任务队列）。

### 4. `requestAnimationFrame` (rAF) 在哪个阶段执行？

rAF 发生在**渲染（Rendering）**之前的阶段。在一个 Event Loop 周期中，如果浏览器决定进行更新，顺序通常是：`宏任务 -> 微任务 -> rAF -> Layout -> Paint`。

---

## ⚡ 模拟实战：代码输出顺序

```javascript
console.log("1");

setTimeout(() => {
  console.log("2");
  Promise.resolve().then(() => {
    console.log("3");
  });
}, 0);

new Promise((resolve) => {
  console.log("4");
  resolve();
}).then(() => {
  console.log("5");
});

console.log("6");
```

**答案及解析：**

1. **同步执行**：输出 `1`, `4`, `6`。
2. **微任务检查**：执行 `5`（来自 `Promise.then`）。
3. **宏任务执行**：执行 `2`（来自 `setTimeout`）。
4. **宏任务内微任务**：执行 `2` 后发现产生微任务 `3`，立即执行。
   **最终结果**：`1, 4, 6, 5, 2, 3`
