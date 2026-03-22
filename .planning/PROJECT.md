# 离线本地文书工作台

## What This Is

这是一个完全运行在浏览器本地的离线文书工作台，面向合同、协议、制度、函件、行政文书、采购说明等固定结构文书场景。产品明确分成两条主线：一条是“文书生成”，负责基于模板和背景资料装配初稿；另一条是“文书审阅”，负责对已有文书做校阅、风险检查和修订建议。两条主线共用同一套本地导入、预览、检索、模型和导出底座，不依赖业务后端和云端推理。

## Core Value

在不上传敏感文件的前提下，让用户稳定完成正式文书的本地生成或本地审阅，并导出可直接交付的 Word 文件。

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 用户可在支持 WebGPU 的浏览器中离线加载本地模型并完成推理
- [ ] 用户可导入模板和背景资料，系统能提取结构并建立本地检索索引
- [ ] 用户可基于模板和背景资料自动生成或填充正式文书
- [ ] 系统可把结构化模板、固定句式和背景资料自动装配成初稿，并明确待确认项
- [ ] 用户可对已有文书执行审阅、风险检测和条款修订建议
- [ ] 用户可追溯生成或审阅结论对应的资料来源
- [ ] 用户可将最终结果导出为结构完整的 `.docx` 文件

### Out of Scope

- 托管式云端推理或资料同步服务 — 当前核心价值是“完全本地、离线、敏感数据不出端”
- 多人实时协作与审批流 — 会显著放大产品边界，且不属于 v1 验证重点
- 扫描件 OCR 与版面重建 — 技术复杂度高，且会稀释对结构化 Word 文档主链路的验证
- 法律结论自动背书 — 系统提供风险提示和修订建议，但不替代专业法务判断

## Context

- 产品由两条主线组成：`文书生成` 和 `文书审阅`；两者共享同一套本地底座和工作台。
- 目标场景是对正式文书进行“资料汇总 + 生成初稿”或“导入原文 + 审阅修订”的本地闭环处理。
- 用户已经明确希望采用基于 WebGPU 的浏览器本地推理方案，并优先参考 WebLLM 作为对话与生成引擎。
- 生成层采用 WebLLM 承载本地对话、结构化输出和流式生成；检索层采用 Transformers.js 生成嵌入，Voy 负责浏览器端向量索引，IndexedDB 负责离线持久化。
- “根据模板生成初稿”在产品上不是自由写作，而是模板驱动的结构化装配流程：模板定义字段、章节、固定句式和条件段落，系统从背景资料中抽取信息并自动填入，不确定项必须显式标注。
- 预期首发文档类型以 `.docx` 为主，重点是保留标题层级、编号、表格和字段结构，而不是追求任意版式的像素级复刻。
- 文件处理采用分层策略：`pdf` 主要用于原文预览与定位，`docx` 作为主工作格式，`doc` 先转换为 `docx`，`xls/xlsx` 作为结构化表格资料导入，`txt/md` 作为轻量资料直接纳入知识底座。
- 页面交互采用“双视图”思路：保留原文预览用于核对，同时维护一份结构化可编辑稿用于生成、审阅、修订和最终导出。
- 该项目本质上是一个“本地 AI 文档工作台”，不是通用聊天产品，也不是在线协作平台。

## Constraints

- **Tech stack**: 浏览器本地优先，核心能力运行在前端 — 因为项目要求完全离线且不依赖业务后端。
- **Privacy**: 文档内容、索引和生成结果默认只保存在本机 — 因为标书、合同等材料通常高度敏感。
- **Model**: v1 固定以 Qwen2.5-1.5B 量级模型为生成核心 — 因为需要在消费级设备上取得可接受的加载和响应速度。
- **Compatibility**: 首发聚焦支持 WebGPU 的现代桌面浏览器 — 因为 WebGPU 是本地推理体验的关键。
- **Document fidelity**: 输出必须是可直接交付的 `.docx` 文件 — 因为用户最终交付物不是网页，而是 Word 文档。
- **Editing model**: v1 以结构化条款编辑和建议接受/拒绝为主，不追求完整复刻 Word 的自由编辑体验 — 因为先把修订闭环做稳比做全自由编辑更重要。
- **Scope**: v1 优先支持结构化商务文档，不做扫描件和复杂版式恢复 — 因为先验证高频主链路更合理。

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 浏览器本地优先，不引入业务后端 | 满足离线和隐私要求，减少部署门槛 | — Pending |
| 生成链路优先采用 WebLLM + WebGPU，并加载 Qwen 系列本地模型 | 相比纯 WASM 推理更适合浏览器端高性能对话与生成 | — Pending |
| 检索链路采用 Transformers.js + Voy + IndexedDB | 能在浏览器内完成嵌入、索引和离线持久化闭环 | — Pending |
| 文档展示采用“原文预览 + 结构化编辑稿”双视图 | 同时满足核对原文样式和可控修订两种需求 | — Pending |
| 初稿生成按“模板引擎 + 字段映射 + 条件段落 + LLM 补写”实现 | 这比通用自由写作更可控，也更适合固定格式文书 | — Pending |
| `pdf` 仅做预览与定位，不做原位正文编辑 | PDF 更适合作为参考原件，而非主编辑格式 | — Pending |
| v1 文档输入输出聚焦 `.docx` | 更贴近标书和合同场景，也更容易验证“可交付 Word”目标 | — Pending |
| 产品明确拆分为“文书生成”和“文书审阅”两条主线 | 这样更容易定义需求边界、阶段目标和界面职责 | — Pending |
| 两条主线共用一个工作台，而不是拆成两套产品壳 | 保持实现成本可控，也避免体验割裂 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-22 after initialization*
