# JavaScript 加载与执行机制详解 (PRD)

## 目标

在 `critical-rendering-path.md` 中补充关于 `<script type="module">` 的加载与执行特性的说明，明确其与 `async` 和 `defer` 的关系。

## 需求描述

用户询问 `type="module"` 相当于 `async` 还是 `defer`。
目前的文档在第 28 行提到了 `async` 和 `defer` 可以防止阻塞，但未提及 ES Modules (`type="module"`) 的默认行为。

## 详细设计

1. **默认行为**：
   - `type="module"` 脚本默认具有类似 `defer` 的行为：异步下载，在 HTML 解析完成后、`DOMContentLoaded` 事件触发前执行。
2. **配合 async**：
   - 如果给 `type="module"` 加上 `async` 属性，它会像普通的 `async` 脚本一样：下载完立即执行，可能会阻塞 HTML 解析。
3. **依赖关系**：
   - 模块内部的 `import` 也会以递归方式异步加载。

## 验收标准

1. 文档中明确标注 `type="module"` 默认等同于 `defer`。
2. 文档中说明 `type="module" async` 的特殊行为。
3. 回答用户问题的逻辑清晰准确。
