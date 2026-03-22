# 离线商务文档智能处理系统

## What This Is

这是一个完全运行在浏览器本地的离线商务文档工作台，面向标书、合同、协议、函件等结构化商务文档场景。系统用本地小模型、浏览器端向量检索和离线存储，把“导入资料、生成初稿、审阅风险、修订条款、导出 Word”串成一条闭环流程，不依赖业务后端和云端推理。

## Core Value

在不上传敏感文件的前提下，让用户稳定完成结构化商务文档的本地生成、审阅和修订，并导出可直接交付的 Word 文件。

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 用户可在支持 WebGPU 的浏览器中离线加载本地模型并完成推理
- [ ] 用户可导入模板和背景资料，系统能提取结构并建立本地检索索引
- [ ] 用户可基于模板和背景资料自动生成或填充商务文档
- [ ] 用户可对已有文档执行审阅、风险检测和条款修订建议
- [ ] 用户可追溯生成或审阅结论对应的资料来源
- [ ] 用户可将最终结果导出为结构完整的 `.docx` 文件

### Out of Scope

- 托管式云端推理或资料同步服务 — 当前核心价值是“完全本地、离线、敏感数据不出端”
- 多人实时协作与审批流 — 会显著放大产品边界，且不属于 v1 验证重点
- 扫描件 OCR 与版面重建 — 技术复杂度高，且会稀释对结构化 Word 文档主链路的验证
- 法律结论自动背书 — 系统提供风险提示和修订建议，但不替代专业法务判断

## Context

- 目标场景是对结构化商务文档进行“资料汇总 + 生成 + 审阅 + 修订 + 导出”的本地闭环处理。
- 用户已经明确希望采用 Qwen2.5-1.5B 作为浏览器本地 LLM，并用 WebGPU 加速。
- 检索层采用 Transformers.js 生成嵌入，Voy 负责浏览器端向量索引，IndexedDB 负责离线持久化。
- 预期首发文档类型以 `.docx` 为主，重点是保留标题层级、编号、表格和字段结构，而不是追求任意版式的像素级复刻。
- 该项目本质上是一个“本地 AI 文档工作台”，不是通用聊天产品，也不是在线协作平台。

## Constraints

- **Tech stack**: 浏览器本地优先，核心能力运行在前端 — 因为项目要求完全离线且不依赖业务后端。
- **Privacy**: 文档内容、索引和生成结果默认只保存在本机 — 因为标书、合同等材料通常高度敏感。
- **Model**: v1 固定以 Qwen2.5-1.5B 量级模型为生成核心 — 因为需要在消费级设备上取得可接受的加载和响应速度。
- **Compatibility**: 首发聚焦支持 WebGPU 的现代桌面浏览器 — 因为 WebGPU 是本地推理体验的关键。
- **Document fidelity**: 输出必须是可直接交付的 `.docx` 文件 — 因为用户最终交付物不是网页，而是 Word 文档。
- **Scope**: v1 优先支持结构化商务文档，不做扫描件和复杂版式恢复 — 因为先验证高频主链路更合理。

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 浏览器本地优先，不引入业务后端 | 满足离线和隐私要求，减少部署门槛 | — Pending |
| 生成模型采用 Qwen2.5-1.5B + WebGPU | 在本地可运行性、中文能力和结构化输出之间取平衡 | — Pending |
| 检索链路采用 Transformers.js + Voy + IndexedDB | 能在浏览器内完成嵌入、索引和离线持久化闭环 | — Pending |
| v1 文档输入输出聚焦 `.docx` | 更贴近标书和合同场景，也更容易验证“可交付 Word”目标 | — Pending |
| 产品主流程定义为“导入 → 检索 → 生成/审阅 → 修订 → 导出” | 让需求和路线图围绕单一可交付流程展开 | — Pending |

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
