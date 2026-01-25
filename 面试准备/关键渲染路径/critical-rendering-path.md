# 浏览器页面渲染原理 (Browser Rendering Principles)

浏览器将 HTML、CSS 和 JavaScript 转化为屏幕上可见像素的过程，被称为**关键渲染路径（Critical Rendering Path, CRP）**。

理解这个过程对于分析“白屏时间”、“布局抖动（Layout Thrashing）”以及“动画卡顿”至关重要。

---

## 1. 核心流程总览

浏览器的渲染引擎主要遵循以下 6 个步骤：

1.  **解析 HTML** $\rightarrow$ 构建 **DOM 树**。
2.  **解析 CSS** $\rightarrow$ 构建 **CSSOM 树**。
3.  **合并** DOM 和 CSSOM $\rightarrow$ 生成 **渲染树（Render Tree）**。
4.  **布局（Layout/Reflow）** $\rightarrow$ 计算每个节点的几何信息（位置、大小）。
5.  **绘制（Paint）** $\rightarrow$ 将节点转化为屏幕上的像素。
6.  **合成（Composite）** $\rightarrow$ 将不同的图层组合并在屏幕上显示（GPU 参与）。

---

## 2. 详细步骤解析

### 第一步：构建 DOM 树 (Constructing the DOM Tree)

- **输入**：HTML 字节流。
- **过程**：解码 $\rightarrow$ 令牌化 (Tokenization) $\rightarrow$ 生成节点 (Node) $\rightarrow$ 构建 DOM 树。
- **注意**：JavaScript 的加载和执行默认会**阻塞** DOM 的构建（除非使用 `async` 或 `defer`）。
  - `<script type="module">` 默认行为相当于 **`defer`**（异步下载，在 HTML 解析完成后、`DOMContentLoaded` 触发前按顺序执行）。
  - 若显式指定 `<script type="module" async>`，则行为相当于 **`async`**（下载完立即执行）。

### 第二步：构建 CSSOM 树 (Constructing the CSSOM Tree)

- **输入**：CSS 样式（外部样式表、内部 `<style>`、内联样式）。
- **特性**：
  - **级联继承**：子节点继承父节点样式。
  - **阻塞渲染**：浏览器必须等待 CSSOM 构建完毕才能进行下一步，以避免“无样式内容闪烁” (FOUC)。
  - **不阻塞 HTML 解析**：CSS 通常是并行下载的，**不会**停止浏览器对 HTML 的解析（但如前所述，它会阻塞由于执行 JS 引起的后续步骤）。
  - **特殊情况**：CSS 会阻塞其后紧跟的 **JavaScrit 执行**。因为 JS 可能会操作样式，浏览器必须保证在 JS 执行前 CSSOM 是完整的。这可能会间接延迟脚本后的 HTML 解析。

### 第三步：生成渲染树 (Render Tree Construction)

- **过程**：合并 DOM 和 CSSOM。
- **关键逻辑**：
  - 渲染树**只包含可见节点**。
  - `<head>`、`<script>` 被忽略。
  - `display: none` 的节点**不会**在渲染树中（不占空间）。
  - `visibility: hidden` 的节点**会**在渲染树中（占空间但不显示）。

### 第四步：布局 (Layout) / 回流 (Reflow)

- **任务**：计算渲染树中每个节点在视口（Viewport）内的确切坐标和大小（盒模型）。
- **性能**：计算密集型。
- **触发**：初次渲染、窗口大小改变、字体改变、DOM 增删、读取几何属性（如 `offsetWidth`）。

### 第五步：绘制 (Paint) / 重绘 (Repaint)

- **任务**：填充像素（颜色、文本、阴影、边框、图像）。
- **机制**：绘制并非在单一画布上，而是可能分层（Layers）进行。

### 第六步：合成 (Composite)

- **任务**：浏览器将各个图层按顺序在 GPU 中合成，最终显示。
- **优势**：`transform` 和 `opacity` 属性只会触发这一步，跳过布局和绘制，直接由 GPU 处理（硬件加速）。

---

## 3. 各种资源的阻塞特性总结

| 资源类型       | 阻塞 HTML 解析 (Parsing)?            | 阻塞渲染 (Rendering)? | 备注                                          |
| :------------- | :----------------------------------- | :-------------------- | :-------------------------------------------- |
| **JavaScript** | **是** (默认) / **否** (async/defer) | **是**                | `type="module"` 默认不阻塞解析。              |
| **CSS**        | **否**                               | **是**                | 会间接阻塞 JS 的执行，从而间接阻塞解析。      |
| **图片/视频**  | **否**                               | **否**                | 异步加载，加载完成后触发 `onload`。           |
| **Wasm**       | **否**                               | **否**                | 通常通过 API 异步加载，类似于 Data Fetching。 |
| **Web Fonts**  | **否**                               | **是**                | 可能导致 FOUT (闪烁) 或隐身文字 (FOIT)。      |

---

## 4. 性能优化视角：Reflow vs Repaint vs Composite

作为开发者，需要区分三种开销等级：

| 类型     | 英文      | 成本     | 触发原因示例                                 | 后果                                               |
| :------- | :-------- | :------- | :------------------------------------------- | :------------------------------------------------- |
| **回流** | Reflow    | **最高** | 修改几何属性 (`width`, `margin`, `position`) | 重新布局 $\rightarrow$ 重新绘制 $\rightarrow$ 合成 |
| **重绘** | Repaint   | **中等** | 修改外观属性 (`color`, `background`)         | 跳过布局 $\rightarrow$ 重新绘制 $\rightarrow$ 合成 |
| **合成** | Composite | **最低** | 修改合成属性 (`transform`, `opacity`)        | 跳过布局和绘制 $\rightarrow$ **仅 GPU 合成**       |

### 流程公式

$$HTML/CSS \rightarrow Parse \rightarrow Render Tree \rightarrow Layout \rightarrow Paint \rightarrow Composite$$
