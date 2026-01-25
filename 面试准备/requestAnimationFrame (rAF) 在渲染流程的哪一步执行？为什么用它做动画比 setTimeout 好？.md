# requestAnimationFrame (rAF) 在渲染流程的哪一步执行？为什么用它做动画比 setTimeout 好？

## 核心答案

### rAF 在渲染流程的哪一步执行？

`requestAnimationFrame` 的回调在**浏览器下一次重绘 (Repaint) 之前**执行。

具体来说，它位于事件循环的**渲染阶段 (Rendering Phase)** 中，执行顺序如下：

1. 执行宏任务 (Macro Task)
2. 清空微任务队列 (Microtask Queue)
3. **执行 `requestAnimationFrame` 回调** ← 这里
4. 执行 Style（样式计算）
5. 执行 Layout（布局/回流）
6. 执行 Paint（绘制）
7. 执行 Composite（合成）

> **注意**：rAF 回调的执行频率通常与显示器刷新率同步（通常为 60Hz，即约 16.67ms 一次）。

---

### 为什么用它做动画比 setTimeout 好？

| 对比维度 | `setTimeout` / `setInterval` | `requestAnimationFrame` |
| :--- | :--- | :--- |
| **执行时机** | 由定时器触发，与渲染无关 | 与浏览器渲染周期严格同步 |
| **帧率控制** | 需手动计算（如 `1000/60`） | 自动适配屏幕刷新率 |
| **掉帧/跳帧** | 容易出现（回调可能与渲染错开） | 极少出现（保证每帧只执行一次） |
| **后台标签页** | 继续执行（浪费资源） | 自动暂停（节省 CPU/电量） |
| **性能** | 可能触发多次无效重排 | 合并到渲染前的单次批处理中 |

**核心原因**：`setTimeout` 是一个通用的定时器，它的回调被放入**宏任务队列**，执行时机受到任务队列排队的影响，无法保证与渲染周期对齐。而 `rAF` 天生与浏览器的渲染节拍 (VSync) 绑定，能保证**每帧只执行一次**，且在布局和绘制**之前**执行，避免了无效的中间状态计算。

---

## 面试官可能追问的细节

---

### 追问 1：rAF 和微任务 (Promise.then) 的执行顺序是什么？

**答**：微任务**先于** rAF 执行。

顺序：
```
宏任务 → 微任务（Promise.then, queueMicrotask）→ rAF → 渲染
```

这是因为微任务队列会在**每个宏任务结束后立即清空**，而 rAF 属于渲染阶段，是在清空微任务之后才执行的。

---

### 追问 2：如果我在 rAF 回调里又调用了 rAF，会发生什么？

**答**：新注册的 rAF 回调会被**推迟到下一帧**执行，而不是在本帧的 rAF 阶段立即执行。

这意味着 rAF 不会像递归调用那样无限阻塞当前帧。这是实现动画循环的标准模式：

```javascript
function animate() {
  // 更新动画状态
  requestAnimationFrame(animate); // 安排下一帧
}
requestAnimationFrame(animate); // 启动动画
```

---

### 追问 3：为什么说 setTimeout(fn, 0) 也无法保证立即执行？

**答**：`setTimeout(fn, 0)` 表示"至少在 0 毫秒后执行"，但实际上：
1.  回调被放入宏任务队列，需要等待当前执行栈清空 + 微任务清空后才会执行。
2.  浏览器对嵌套的 `setTimeout` 有最小延迟限制（通常为 4ms）。
3.  如果主线程繁忙，这个延迟可能远大于 0ms。

因此，**它无法精确对齐渲染时机**，用于动画时容易造成卡顿或跳帧。

---

### 追问 4：rAF 如何实现暂停/恢复动画？

**答**：通过 `cancelAnimationFrame` 来取消已注册的回调：

```javascript
let rafId = null;

function startAnimation() {
  function animate() {
    // ... 动画逻辑
    rafId = requestAnimationFrame(animate);
  }
  rafId = requestAnimationFrame(animate);
}

function stopAnimation() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}
```

---

### 追问 5：rAF 的回调如果执行时间过长会怎样？

**答**：如果 rAF 回调执行超过一帧的时间（约 16.67ms @60Hz），浏览器会**跳过**本次渲染，导致掉帧 (Frame Drop)。这与 `setTimeout` 类似，都是因为主线程被阻塞。

**最佳实践**：
-   将耗时操作拆分到多帧执行。
-   使用 Web Worker 处理计算密集型任务。
-   对于不影响布局的变化，仅修改 `transform` 和 `opacity` 以利用 GPU 加速。
