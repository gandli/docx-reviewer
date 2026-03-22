# Stack Research

**Domain:** 浏览器本地离线文书工作台
**Researched:** 2026-03-22
**Confidence:** MEDIUM

## Version Policy

- 默认采用 2026-03-22 当天核验到的最新稳定正式版
- 不追 `beta`、`rc`、`canary`、`next` 等预发布版本
- 若未来某个库出现重大破坏性升级，先验证兼容性，再整体升级规划文档

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@mlc-ai/web-llm` | 0.2.82 | 浏览器内本地对话、生成、流式输出和 JSON 结构化输出 | 官方明确定位为高性能浏览器内 LLM 推理引擎，直接基于 WebGPU，适合对话与文档生成主链路 |
| Qwen 系列 WebLLM 可用模型 | current supported models on 2026-03-22 | 本地生成、改写、审阅说明输出 | WebLLM 官方列出支持 Qwen 家族，适合作为中文文档任务的生成模型来源 |
| `@huggingface/transformers` | 3.8.1 | 浏览器内嵌入模型与特征提取 | 更适合承担嵌入与检索增强，不必和生成引擎绑在一起 |
| WebGPU | 浏览器标准 | 本地 GPU 加速推理 | 是浏览器端获得可用响应速度的关键能力 |
| IndexedDB | 浏览器标准 | 离线持久化模型缓存、文档片段、索引元数据 | 浏览器原生、可离线、容量和事务能力足够 |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react` | 19.2.4 | 工作台界面、预览页面和编辑器外壳 | 作为前端 UI 运行时基座 |
| `vite` | 8.0.1 | 本地开发与生产打包 | 作为前端构建工具 |
| `typescript` | 5.9.3 | 类型约束、领域模型和服务边界 | 作为整个前端工程的语言基线 |
| `zustand` | 5.0.12 | 导入流程、运行时状态和工作台状态 | 作为全局状态容器 |
| `react-pdf` | 10.4.1 | PDF 原文预览、分页查看和页码跳转 | 作为首选 PDF 预览层 |
| `pdfjs-dist` | 5.5.207 | PDF 文本层、底层渲染能力 | 作为 `react-pdf` 的底层依赖能力认知 |
| `voy-search` | 0.6.3 | 浏览器内向量索引与近邻检索 | 适合中小规模本地知识库和离线检索，但要对其不稳定 API 保持隔离 |
| `dexie` | 4.3.0 | IndexedDB schema、迁移和事务封装 | 作为本地持久化主封装层 |
| `idb` | 8.0.3 | 少量底层 IndexedDB 封装和工具函数 | 作为补充工具层 |
| `docx` | 9.6.1 | 生成规范 `.docx` 文件 | 最终导出 Word 时使用，适合自己控制结构输出 |
| `mammoth` | 1.12.0 | 将现有 `.docx` 转成结构化 HTML/文本以便审阅和分析 | 适合“读旧文档”，不适合作为最终保真导出方案 |
| `docx-preview` | 0.3.7 | 将 `.docx` 近似渲染到网页 | 作为 DOCX 原文预览层 |
| `docxtemplater` | 3.68.3 | 基于既有 Word 模板做字段替换和块填充 | 当模板格式必须高度保留时使用，尤其适合固定版式模板 |
| `xlsx` | 0.18.5 | 解析 `xls/xlsx`，提取工作表、区域和单元格数据 | 作为电子表格导入主方案 |
| `@tiptap/core` | 3.20.4 | 结构化编辑稿和节点式编辑能力 | 作为编辑器内核 |
| `zod` | 4.3.6 | 约束任务输入、模板字段和结构化输出 | 需要把“文档类型配置”变成可校验数据时使用 |

### Development Tools

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| `bun` | 1.3.11 | 前端依赖安装、脚本执行和本地开发 | 启动快，适合纯前端/TypeScript 项目 |
| `vite` | 8.0.1 | 本地开发与打包 | 对 Web Worker、现代浏览器和前端构建支持友好 |
| `vitest` | 4.1.0 | 单元测试 | 适合验证解析、规则命中、结构化输出等纯逻辑模块 |
| `playwright` | 1.58.2 | 浏览器端真实流程验证 | 用于验证导入、生成、审阅、导出主链路 |

## Installation

```bash
# Runtime
bun add react@19.2.4 zustand@5.0.12 react-pdf@10.4.1 @mlc-ai/web-llm@0.2.82 @huggingface/transformers@3.8.1 voy-search@0.6.3 dexie@4.3.0 idb@8.0.3 zod@4.3.6

# Documents
bun add docx@9.6.1 mammoth@1.12.0 docx-preview@0.3.7 docxtemplater@3.68.3 xlsx@0.18.5 @tiptap/core@3.20.4 pdfjs-dist@5.5.207

# Dev dependencies
bun add -d vite@8.0.1 vitest@4.1.0 playwright@1.58.2 typescript@5.9.3
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| WebLLM | Transformers.js 直接做生成 | 只有当某个特定任务必须依赖 Transformers.js 独占模型时才考虑 |
| Voy | 内存 brute-force / 自建索引 | 文档规模非常小，且要规避 Voy 仍未稳定的 API 时 |
| `docx` + `docxtemplater` | 纯 HTML 转 Word | 仅当输出对 Word 结构要求很低时才考虑，当前场景不建议 |
| IndexedDB | OPFS | 如果后续大文件缓存或模型分块管理成为瓶颈，可进一步评估 OPFS |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| 用纯 WASM 推理承担主生成链路 | 在文档对话和长文本生成场景下性能通常不如 WebGPU 路线 | 优先使用 WebLLM + WebGPU |
| 直接把所有文档内容拼进单次提示词 | 容易超出上下文、结果不稳定，也无法追溯来源 | 先切分、建索引，再按章节检索增强 |
| 只用 Mammoth 做“导入 + 导出”双向闭环 | Mammoth 强项是读取语义，不是高保真回写 Word | 读取用 Mammoth，输出用 `docx` 或 `docxtemplater` |
| 业务逻辑直接耦合 Voy 序列化格式 | Voy 官方仓库明确表示 1.0 前 API 仍可能变化 | 增加向量仓储适配层，隔离底层索引实现 |
| 以移动端浏览器为首发目标 | WebGPU、内存和文件处理体验都不稳定 | 首发聚焦桌面浏览器 |

## Stack Patterns by Variant

**If 文档以固定模板填空为主:**
- 优先使用 `docxtemplater`
- Because 它更适合保留现有 Word 模板中的样式、页眉页脚和占位符结构

**If 文档以“审阅后重新生成完整文档”为主:**
- 使用 `mammoth` 做解析，`docx` 做统一导出
- Because 这样更容易把文档抽象成结构化中间表示，再稳定生成新文件

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `react-pdf@10.4.1` | `pdfjs-dist@5.5.207` | 作为项目的 PDF 原文预览组合 |
| `@mlc-ai/web-llm@0.2.82` | WebGPU-capable browsers | 官方仓库明确说明其以 WebGPU 为浏览器内高性能推理基础 |
| `@huggingface/transformers@3.8.1` | WebGPU-capable Chromium-class browsers | 在本项目中更适合承担嵌入与特征提取 |
| `voy-search@0.6.3` | Transformers.js 生成的嵌入向量 | 仓库说明其可与 Transformers.js 等库配合，但 API 仍未稳定 |
| `docx@9.6.1` | 结构化中间表示 | 适合在应用内按章节、表格、条款重建 Word 内容 |

## Sources

- [mlc-ai/web-llm](https://github.com/mlc-ai/web-llm) — 验证了其浏览器内高性能推理、OpenAI 风格接口、Worker/Service Worker 支持和 Qwen 家族支持
- [Transformers.js WebGPU guide](https://huggingface.co/docs/transformers.js/guides/webgpu) — 验证了浏览器端 `device: "webgpu"` 的官方用法
- [Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct) — 验证了模型规模、结构化文本能力和上下文说明
- [tantaraio/voy](https://github.com/tantaraio/voy) — 验证了 Voy 的用途，以及 1.0 前 API 不稳定的事实
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js) — 验证了其定位是 `.docx` 到 HTML 的语义读取
- `npm view react version` / `vite version` / `typescript version` / `zustand version` / `react-pdf version` / `pdfjs-dist version` / `@mlc-ai/web-llm version` / `@huggingface/transformers version` / `voy-search version` / `dexie version` / `idb version` / `docx version` / `mammoth version` / `docx-preview version` / `docxtemplater version` / `xlsx version` / `@tiptap/core version` / `zod version` / `vitest version` / `playwright version` / `bun --version` — 2026-03-22 校验当前稳定版本

---
*Stack research for: 浏览器本地离线文书工作台*
*Researched: 2026-03-22*
