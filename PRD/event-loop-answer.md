# PRD: Event Loop 面试题答案生成

## 1. 背景

用户通过 `/gen-answer` 指令，要求针对 `什么是 event-loop.md` 这一文件名生成面试题答案。

## 2. 目标

- 提供一份高质量、专家级的 JavaScript Event Loop 解释。
- 模拟面试场景，提供后续追问及深度解析。
- 确保内容符合前端面试的高频考点。

## 3. 需求细节

### 3.1 核心答案

- 定义：什么是 Event Loop。
- 组成部分：Call Stack, Web APIs, Task Queue, Microtask Queue。
- 循环流程：执行同步代码 -> 检查微任务 -> 更新渲染 -> 检查宏任务。

### 3.2 追问细节

- 宏任务 (Macrotask) vs 微任务 (Microtask) 的具体 API 归属。
- `async/await` 在事件循环中的执行顺序。
- Node.js 事件循环与浏览器端的差异。
- `requestAnimationFrame` 与 `requestIdleCallback` 的执行时机。

### 3.3 其他建议

- 提供一个复杂的代码输出题并解释执行顺序。

## 4. 执行步骤

1. [x] 创建 PRD 文档。
2. [x] 构造面试题答案草稿。
3. [x] 将草稿提交给用户确认。
4. [x] 用户确认后更新目标文件。
5. [x] 在浏览器中验证内容显示。

## 5. 验收结论

- 内容已成功写入 `/Volumes/E/essay/Javascript/什么是 event-loop.md`。
- 浏览器预览显示正常，Markdown 渲染符合预期。
- 涵盖了 Event Loop 的定义、流程、宏/微任务区别及常见追问。
