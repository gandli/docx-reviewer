# Stack Research

**Domain:** 浏览器本地离线商务文档智能处理系统
**Researched:** 2026-03-22
**Confidence:** MEDIUM

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
| `voy-search` | 0.6.3 | 浏览器内向量索引与近邻检索 | 适合中小规模本地知识库和离线检索，但要对其不稳定 API 保持隔离 |
| `docx` | 9.6.1 | 生成规范 `.docx` 文件 | 最终导出 Word 时使用，适合自己控制结构输出 |
| `mammoth` | 1.12.0 | 将现有 `.docx` 转成结构化 HTML/文本以便审阅和分析 | 适合“读旧文档”，不适合作为最终保真导出方案 |
| `docxtemplater` | 3.68.3 | 基于既有 Word 模板做字段替换和块填充 | 当模板格式必须高度保留时使用，尤其适合固定版式模板 |
| `zod` | current | 约束任务输入、模板字段和结构化输出 | 需要把“文档类型配置”变成可校验数据时使用 |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `bun` | 前端依赖安装、脚本执行和本地开发 | 启动快，适合纯前端/TypeScript 项目 |
| `vite` | 本地开发与打包 | 对 Web Worker、现代浏览器和前端构建支持友好 |
| `vitest` | 单元测试 | 适合验证解析、规则命中、结构化输出等纯逻辑模块 |
| `playwright` | 浏览器端真实流程验证 | 用于验证导入、生成、审阅、导出主链路 |

## Installation

```bash
# Core
bun add @mlc-ai/web-llm @huggingface/transformers voy-search

# Supporting
bun add docx mammoth docxtemplater zod

# Dev dependencies
bun add -d vite vitest playwright typescript
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
- `npm view @mlc-ai/web-llm version` / `@huggingface/transformers version` / `voy-search version` / `docx version` / `mammoth version` / `docxtemplater version` — 2026-03-22 校验当前包版本

---
*Stack research for: 浏览器本地离线商务文档智能处理系统*
*Researched: 2026-03-22*
