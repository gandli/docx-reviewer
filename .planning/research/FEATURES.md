# Feature Research

**Domain:** 浏览器本地离线商务文档智能处理系统
**Researched:** 2026-03-22
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| 模板与背景资料导入 | 不导入现有模板和资料，就无法进入真实商务文档流程 | MEDIUM | 至少支持 `.docx`、文本和结构化字段资料 |
| 文档结构解析 | 标书和合同不是纯文本，必须识别标题、条款、表格、编号 | HIGH | 需要结构化中间表示，而不是只取全文字符串 |
| 章节级生成/填充 | 用户常常只想补某一章或某几个字段 | MEDIUM | 比“整篇一键生成”更接近真实使用 |
| 审阅问题清单 | 仅生成不够，已有文档也要能查问题 | HIGH | 需把风险识别、缺失项、不一致项结构化输出 |
| 可追溯引用来源 | 商务场景需要知道“这句话依据哪份资料来的” | MEDIUM | 否则用户不敢用 |
| 导出 `.docx` | 最终交付通常是 Word，不是网页 | HIGH | 必须尽量保留章节结构、表格和编号 |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 完全离线运行 | 强隐私场景下更有吸引力 | HIGH | 需要把模型、索引、缓存和导出链路都放在浏览器内 |
| 文档类型模板化配置 | 一套底座适配标书、合同、协议等不同文档类型 | MEDIUM | 能把产品从单一 demo 拉到可扩展平台 |
| 条款风险检测 + 修订建议联动 | 不只是指出问题，还给出改写方向 | HIGH | 是“审阅”到“修订”的关键闭环 |
| 生成与审阅共用知识底座 | 一份背景资料既能生成，也能审阅时追溯 | MEDIUM | 降低重复维护成本 |
| 审阅报告与正文联动 | 问题清单可直接跳到原文并生成替代条款 | MEDIUM | 体验比普通聊天框更强 |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| 首发支持任意 PDF/扫描件 | 看起来“覆盖所有文档” | OCR、版面恢复和条款结构提取会严重分散 v1 资源 | 首发聚焦结构化 `.docx`，后续再扩展 |
| 全文一次性重写整份合同 | 看起来省事 | 难控制风险，且很难追踪每条修改依据 | 按章节、条款和字段局部处理 |
| 生成结果不经确认直接覆盖原文 | 追求“一键完成” | 商务文档风险高，用户需要确认和保留痕迹 | 采用建议-接受-导出流程 |
| 过早支持多人在线协作 | 看起来更像企业产品 | 会引入同步、权限、冲突解决等重任务 | 先做好单人本地工作台 |

## Feature Dependencies

```text
文档导入
    └──requires──> 结构解析
                         └──requires──> 向量索引与离线存储
                                              └──requires──> 检索增强

条款修订建议 ──requires──> 风险检测
风险检测 ──requires──> 结构解析

Word 导出 ──requires──> 结构化中间表示
章节级填充 ──enhances──> 模板生成
```

### Dependency Notes

- **文档导入 requires 结构解析:** 资料必须先变成可定位、可引用的结构，后续生成和审阅才可靠。
- **结构解析 requires 向量索引与离线存储:** 不持久化就无法实现重复使用和离线复用。
- **条款修订建议 requires 风险检测:** 没有问题识别，就无法生成针对性的修订文本。
- **Word 导出 requires 结构化中间表示:** 直接从聊天结果拼 Word 很难保证结构稳定。

## MVP Definition

### Launch With (v1)

- [ ] 支持导入 `.docx` 模板和背景资料，并建立本地索引 — 没有本地知识底座就无法验证主链路
- [ ] 支持按字段/章节生成与填充 — 是真实文档生产的核心动作
- [ ] 支持对已有 `.docx` 做审阅并输出问题清单 — 覆盖“已有文档优化”场景
- [ ] 支持风险条款定位、修订建议与来源追溯 — 这是商务文档场景的关键价值
- [ ] 支持导出规范 `.docx` — 否则无法交付

### Add After Validation (v1.x)

- [ ] 支持更多模板类型和规则包 — 当核心闭环稳定后扩展文档类型
- [ ] 支持更细的风险规则库和行业词典 — 当用户反馈出现明显行业差异时
- [ ] 支持审阅报告单独导出 — 当用户需要与正文分开发送时

### Future Consideration (v2+)

- [ ] 扫描件 OCR 与 PDF 解析 — 当前不属于首轮验证重点
- [ ] 多人协作、审批和版本同步 — 需要更明确的企业协作需求
- [ ] 多模型切换和本地微调 — 待核心体验稳定后再扩展

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| 导入与结构解析 | HIGH | HIGH | P1 |
| 本地向量检索 | HIGH | MEDIUM | P1 |
| 模板生成与字段填充 | HIGH | HIGH | P1 |
| 审阅与风险检测 | HIGH | HIGH | P1 |
| 修订建议 | HIGH | MEDIUM | P1 |
| Word 导出 | HIGH | HIGH | P1 |
| 审阅报告独立导出 | MEDIUM | LOW | P2 |
| 更多文档类型规则包 | MEDIUM | MEDIUM | P2 |
| OCR / PDF | MEDIUM | HIGH | P3 |
| 多人协作 | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| 文档生成 | 常见在线 AI 助手偏向自由问答 | 传统模板工具偏向纯字段替换 | 结合模板、资料检索和结构化章节生成 |
| 文档审阅 | 法务类工具偏向云端审阅 | 通用聊天工具缺少条款定位 | 本地离线审阅，输出问题、依据和建议 |
| 交付格式 | 很多产品停留在网页结果 | 很多工具只能导出文本或 PDF | 从一开始就把 `.docx` 作为最终交付目标 |

## Sources

- 官方模型与框架文档（WebLLM、Qwen、Transformers.js、Mammoth、Voy）
- 当前 npm 包版本查询结果
- 对结构化商务文档工作流的产品模式归纳

---
*Feature research for: 浏览器本地离线商务文档智能处理系统*
*Researched: 2026-03-22*
