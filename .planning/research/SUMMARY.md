# Project Research Summary

**Project:** 离线商务文档智能处理系统
**Domain:** 浏览器本地离线结构化商务文档处理
**Researched:** 2026-03-22
**Confidence:** MEDIUM

## Executive Summary

这是一个典型的“本地 AI 文档工作台”项目，核心不是做通用聊天，而是把结构化文档处理拆成可验证的几个环节：导入与解析、本地知识索引、按章节生成、审阅风险、修订建议和 Word 导出。研究结果表明，这类产品最关键的不是模型本身，而是结构化中间表示、统一检索底座和稳定的导出链路。

推荐路线是坚持浏览器本地优先：用 Qwen2.5-1.5B 做生成与解释，用 Transformers.js 负责浏览器内嵌入和 WebGPU 推理，用 Voy + IndexedDB 形成离线知识底座，再用 `docx` / `docxtemplater` 完成最终 `.docx` 交付。最大的风险不在“能不能跑模型”，而在“文档结构是否被正确保留”和“审阅结果是否可追溯、可落回 Word”。

## Key Findings

### Recommended Stack

浏览器端组合是可行的，但要明确边界。Transformers.js 官方已经给出 WebGPU 用法，Qwen2.5-1.5B 在结构化文本和中文场景上比较合适；Voy 适合本地中小规模检索，但因 1.0 前 API 仍不稳定，必须通过适配层隔离；Mammoth 适合读取旧文档，最终导出仍应由专门的 Word 生成层负责。

**Core technologies:**
- Qwen2.5-1.5B-Instruct: 本地生成与改写核心 — 中文和结构化文本能力更均衡
- Transformers.js: 浏览器模型与嵌入运行时 — 官方支持 WebGPU
- Voy + IndexedDB: 本地向量检索与持久化 — 适合离线证据链
- `docx` / `docxtemplater`: Word 导出与模板保真 — 保证最终交付物可用

### Expected Features

该领域的“最低可用产品”并不是简单聊天框，而是一条闭环文档流水线。最少要有导入、解析、索引、章节级生成/填充、审阅问题清单、修订建议、来源追溯和 Word 导出。真正的差异化在于完全离线、模板化配置和“审阅 + 修订”联动。

**Must have (table stakes):**
- 模板和背景资料导入 — 用户默认会有现成文档和资料
- 文档结构解析 — 否则无法做条款级处理
- 审阅问题清单与定位 — 否则已有文档场景无法成立
- `.docx` 导出 — 否则无法形成交付

**Should have (competitive):**
- 完全离线运行 — 满足敏感资料场景
- 文档类型模板化配置 — 让系统不只支持单一场景
- 风险提示与修订建议联动 — 把“看问题”升级为“解决问题”

**Defer (v2+):**
- OCR / PDF 解析 — 当前性价比不高
- 多人协作 — 不属于 v1 核心验证

### Architecture Approach

架构上应坚持“结构化中间表示 + 检索优先 + 规则与模型混合审阅”。前端工作台负责流程，Worker 承载重任务，服务层封装解析、检索、模型和导出能力，持久化层统一管理 IndexedDB 和向量索引。

**Major components:**
1. 文档解析器 — 负责把导入文件转成统一结构
2. 检索编排器 — 负责切分、嵌入、索引和证据召回
3. 任务编排器 — 负责生成、审阅、修订任务的输入输出
4. 导出器 — 负责恢复成可交付 `.docx`

### Critical Pitfalls

1. **忽略离线缓存工程** — 从 Phase 1 就要把模型和索引缓存做成正式能力
2. **把文档当纯文本处理** — 必须在 Phase 2 建立中间表示
3. **生成和审阅各走各的上下文** — Phase 3 要统一证据链
4. **风险检测完全靠模型主观判断** — Phase 5 必须引入规则层
5. **过早覆盖所有格式** — v1 聚焦 `.docx`

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Runtime Foundation
**Rationale:** 离线、本地、可运行是所有能力的前提。  
**Delivers:** 浏览器能力检测、模型缓存、IndexedDB 底座。  
**Addresses:** 离线运行和持久化基础。  
**Avoids:** “每次刷新重来一次”的灾难体验。

### Phase 2: Document Ingestion
**Rationale:** 没有稳定的结构解析，后面的生成、审阅和导出都不可靠。  
**Delivers:** `.docx` 导入、结构化中间表示、索引入库。  
**Uses:** Mammoth、schema 建模。  
**Implements:** 文档解析器。

### Phase 3: Grounded Knowledge Layer
**Rationale:** 先统一知识底座，后面生成和审阅才会前后一致。  
**Delivers:** 片段检索、来源追溯、文档类型模板配置。  
**Uses:** Transformers.js、Voy、IndexedDB。  
**Implements:** 检索编排器。

### Phase 4: Draft Generation
**Rationale:** 先做“可生成、可填充、可解释”的主生产链路。  
**Delivers:** 模板生成、字段填充、章节级生成。  
**Uses:** 本地 LLM 编排。  
**Implements:** 任务编排器。

### Phase 5: Review and Risk Engine
**Rationale:** 在生成能力稳定后，引入规则 + 模型混合审阅更容易验证。  
**Delivers:** 风险识别、问题定位、修订建议。  
**Uses:** 规则引擎 + LLM。  
**Implements:** 审阅工作台和规则引擎。

### Phase 6: Export and Finalization
**Rationale:** 只有导出和变更确认稳定，整条业务链路才算闭环。  
**Delivers:** 审阅确认、变更记录、`.docx` 导出、审阅摘要。  
**Uses:** `docx` / `docxtemplater`。  
**Implements:** 导出器。

### Phase Ordering Rationale

- 先打本地运行底座，再做文档结构层，避免后面返工。
- 先统一知识底座，再做生成和审阅，保证上下文一致。
- 审阅放在生成之后，是因为它依赖更稳定的结构模型和证据链。
- 导出最后落，是因为它必须建立在“结构稳定、用户可确认”的前提上。

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** `.docx` 结构提取与中间表示边界需要更细化
- **Phase 5:** 风险规则库设计、误报控制和建议格式需要深入设计
- **Phase 6:** Word 模板保真与重新生成策略需要通过样例验证

Phases with standard patterns (skip research-phase):
- **Phase 1:** 浏览器能力检测、缓存和 IndexedDB 模式较成熟
- **Phase 3:** 检索底座架构相对清晰，关键是落地细节

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | 核心栈有官方来源，但 Voy 稳定性不足 |
| Features | HIGH | 闭环需求清晰，场景边界明确 |
| Architecture | MEDIUM | 主结构明确，文档中间表示细节仍需落样例验证 |
| Pitfalls | MEDIUM | 风险判断可靠，但需要样本文档验证优先级 |

**Overall confidence:** MEDIUM

### Gaps to Address

- `.docx` 模板填充和“整文重建导出”的组合边界，需要在规划 Phase 6 时明确。
- 风险检测规则库首版范围需要结合样本文档缩小，不宜一开始铺太宽。

## Sources

### Primary (HIGH confidence)
- [Transformers.js WebGPU guide](https://huggingface.co/docs/transformers.js/guides/webgpu) — 浏览器端 WebGPU 推理方式
- [Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct) — 模型能力与规模说明
- [tantaraio/voy](https://github.com/tantaraio/voy) — 向量检索能力与稳定性提示
- [mwilliamson/mammoth.js](https://github.com/mwilliamson/mammoth.js) — `.docx` 读取定位说明

### Secondary (MEDIUM confidence)
- npm 包版本查询 — 当前版本可用性和选型参考

### Tertiary (LOW confidence)
- 对同类工作台产品模式的归纳 — 需要在实现阶段用样例进一步验证

---
*Research completed: 2026-03-22*
*Ready for roadmap: yes*
