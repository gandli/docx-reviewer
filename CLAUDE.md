<!-- GSD:project-start source:PROJECT.md -->
## Project

**离线商务文档智能处理系统**

这是一个完全运行在浏览器本地的离线商务文档工作台，面向标书、合同、协议、函件等结构化商务文档场景。系统用本地小模型、浏览器端向量检索和离线存储，把“导入资料、生成初稿、审阅风险、修订条款、导出 Word”串成一条闭环流程，不依赖业务后端和云端推理。

**Core Value:** 在不上传敏感文件的前提下，让用户稳定完成结构化商务文档的本地生成、审阅和修订，并导出可直接交付的 Word 文件。

### Constraints

- **Tech stack**: 浏览器本地优先，核心能力运行在前端 — 因为项目要求完全离线且不依赖业务后端。
- **Privacy**: 文档内容、索引和生成结果默认只保存在本机 — 因为标书、合同等材料通常高度敏感。
- **Model**: v1 固定以 Qwen2.5-1.5B 量级模型为生成核心 — 因为需要在消费级设备上取得可接受的加载和响应速度。
- **Compatibility**: 首发聚焦支持 WebGPU 的现代桌面浏览器 — 因为 WebGPU 是本地推理体验的关键。
- **Document fidelity**: 输出必须是可直接交付的 `.docx` 文件 — 因为用户最终交付物不是网页，而是 Word 文档。
- **Scope**: v1 优先支持结构化商务文档，不做扫描件和复杂版式恢复 — 因为先验证高频主链路更合理。
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Qwen/Qwen2.5-1.5B-Instruct | model card current on 2026-03-22 | 本地生成、改写、审阅说明输出 | 中文能力强，能处理结构化文本和较长上下文，1.5B 量级更适合浏览器端部署 |
| `@huggingface/transformers` | 3.8.1 | 浏览器内加载模型、嵌入和 WebGPU 推理 | 官方已提供 WebGPU 用法，生态成熟，前端集成成本低 |
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
# Core
# Supporting
# Dev dependencies
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Transformers.js | WebLLM | 如果后续更看重浏览器端生成模型生态而不是统一的嵌入/模型调用接口，可以评估 |
| Voy | 内存 brute-force / 自建索引 | 文档规模非常小，且要规避 Voy 仍未稳定的 API 时 |
| `docx` + `docxtemplater` | 纯 HTML 转 Word | 仅当输出对 Word 结构要求很低时才考虑，当前场景不建议 |
| IndexedDB | OPFS | 如果后续大文件缓存或模型分块管理成为瓶颈，可进一步评估 OPFS |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| 直接把所有文档内容拼进单次提示词 | 容易超出上下文、结果不稳定，也无法追溯来源 | 先切分、建索引，再按章节检索增强 |
| 只用 Mammoth 做“导入 + 导出”双向闭环 | Mammoth 强项是读取语义，不是高保真回写 Word | 读取用 Mammoth，输出用 `docx` 或 `docxtemplater` |
| 业务逻辑直接耦合 Voy 序列化格式 | Voy 官方仓库明确表示 1.0 前 API 仍可能变化 | 增加向量仓储适配层，隔离底层索引实现 |
| 以移动端浏览器为首发目标 | WebGPU、内存和文件处理体验都不稳定 | 首发聚焦桌面浏览器 |
## Stack Patterns by Variant
- 优先使用 `docxtemplater`
- Because 它更适合保留现有 Word 模板中的样式、页眉页脚和占位符结构
- 使用 `mammoth` 做解析，`docx` 做统一导出
- Because 这样更容易把文档抽象成结构化中间表示，再稳定生成新文件
## Version Compatibility
| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `@huggingface/transformers@3.8.1` | WebGPU-capable Chromium-class browsers | 官方文档展示了 `device: "webgpu"` 的标准用法 |
| `voy-search@0.6.3` | Transformers.js 生成的嵌入向量 | 仓库说明其可与 Transformers.js 等库配合，但 API 仍未稳定 |
| `docx@9.6.1` | 结构化中间表示 | 适合在应用内按章节、表格、条款重建 Word 内容 |
## Sources
- [Transformers.js WebGPU guide](https://huggingface.co/docs/transformers.js/guides/webgpu) — 验证了浏览器端 `device: "webgpu"` 的官方用法
- [Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct) — 验证了模型规模、结构化文本能力和上下文说明
- [tantaraio/voy](https://github.com/tantaraio/voy) — 验证了 Voy 的用途，以及 1.0 前 API 不稳定的事实
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js) — 验证了其定位是 `.docx` 到 HTML 的语义读取
- `npm view @huggingface/transformers version` / `voy-search version` / `docx version` / `mammoth version` / `docxtemplater version` — 2026-03-22 校验当前包版本
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
