# Pitfalls Research

**Domain:** 浏览器本地离线商务文档智能处理系统
**Researched:** 2026-03-22
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: 把“离线”理解成“不做工程化缓存”

**What goes wrong:**
每次打开页面都重新下载模型、重新建索引，导致首次体验和重复体验都不可用。

**Why it happens:**
团队只关注“能跑通”，没有把离线缓存、恢复和版本管理视为产品能力。

**How to avoid:**
从一开始就定义模型缓存、索引版本、资料仓储和恢复机制。

**Warning signs:**
刷新页面后要重新导入资料；同一任务第二次仍然和第一次一样慢。

**Phase to address:**
Phase 1

---

### Pitfall 2: 只把文档当纯文本，不保留结构

**What goes wrong:**
条款定位、表格处理、编号保留和 Word 导出都会变得不稳定。

**Why it happens:**
纯文本实现最快，看起来最容易做 demo。

**How to avoid:**
先建立统一的结构化中间表示，把标题、段落、表格、编号和字段都纳入模型。

**Warning signs:**
生成结果无法准确回填到对应章节；导出后编号错乱；审阅定位不到原文。

**Phase to address:**
Phase 2

---

### Pitfall 3: 生成和审阅不共享同一知识底座

**What goes wrong:**
生成时引用一套资料，审阅时又临时拼另一套上下文，导致前后结论不一致。

**Why it happens:**
功能是分开做的，没有统一索引和证据追溯层。

**How to avoid:**
把检索增强设计成平台能力，让生成、审阅、修订都走同一套证据链。

**Warning signs:**
同一条款在“生成说明”和“审阅意见”里依据不一致。

**Phase to address:**
Phase 3

---

### Pitfall 4: 风险检测完全依赖模型主观判断

**What goes wrong:**
金额、日期、主体名称等硬性错误容易漏判或误判。

**Why it happens:**
模型看起来“很聪明”，团队忽略了规则校验更适合硬约束问题。

**How to avoid:**
把一致性检查、缺失项检查和规则命中作为第一层，再让模型补充语义解释和修订建议。

**Warning signs:**
同一份文档多次审阅结果差异很大；明显错误未被检出。

**Phase to address:**
Phase 5

---

### Pitfall 5: 过早追求“所有格式都支持”

**What goes wrong:**
首版同时碰 `.docx`、PDF、扫描件、网页粘贴，最终每条链路都不稳定。

**Why it happens:**
想让产品看起来很全能。

**How to avoid:**
v1 固定支持结构化 `.docx` 为主，其他格式进入后续里程碑。

**Warning signs:**
解析器出现大量分支判断；导出一致性迟迟做不稳。

**Phase to address:**
Phase 1

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| 用一段 prompt 同时做解析、生成、审阅 | 写起来快 | 无法测试、难定位错误、行为不稳定 | never |
| 先不做结构化 schema 校验 | 迭代快 | 每个环节输入输出都容易漂移 | 只允许极早期原型，不能进入 v1 |
| 直接把 Voy 暴露给业务层 | 集成快 | 后续替换索引实现代价高 | never |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Transformers.js + WebGPU | 不做能力检测，直接加载模型 | 先探测浏览器能力，再分支提示或阻断 |
| Voy + IndexedDB | 只存向量索引，不存索引版本和来源映射 | 连同 schema 版本、文档 ID、片段来源一起保存 |
| Mammoth + Word 导出 | 把 Mammoth 的 HTML 当最终导出结构 | Mammoth 只负责读取，导出走独立结构层 |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| 全量重建索引 | 每次导入都卡很久 | 做增量导入和索引分桶 | 文档数超过几十份时明显变慢 |
| 主线程执行重任务 | 页面卡顿、浏览器无响应 | 用 Worker 承载解析、嵌入和推理 | 单份文档较长时就会出现 |
| 一次性加载所有资料和章节 | 内存飙升、标签页崩溃 | 分段加载、分页查看和按需检索 | 资料库达到中等规模时 |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| 调试日志打印原文和条款内容 | 敏感信息泄露到浏览器日志或错误上报 | 默认脱敏，禁用外发日志 |
| 不区分“建议”与“结论” | 用户误把模型输出当法律结论 | 界面明确标注建议性质，并保留人工确认环节 |
| 将缓存清理做成隐蔽功能 | 敏感文件长期滞留本地 | 提供显式清理、版本淘汰和存储可视化 |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| 只给出“有风险”不解释为什么 | 用户无法信任结果 | 每条问题都展示位置、原因和建议 |
| 审阅结果不能回跳原文 | 用户核对成本很高 | 问题与原文建立双向定位 |
| 导出前看不到最终结构 | 导出后才发现格式问题 | 在导出前提供结构预览和变更摘要 |

## "Looks Done But Isn't" Checklist

- [ ] **模型加载:** 不仅首次能跑，还要验证刷新后离线可复用
- [ ] **文档解析:** 不仅能读正文，还要验证标题、编号和表格是否保留
- [ ] **风险检测:** 不仅能出清单，还要验证是否能定位到原文位置
- [ ] **Word 导出:** 不仅能下载文件，还要验证在 Word 中打开后的结构是否正常

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| 缓存策略缺失 | MEDIUM | 引入版本化缓存、补做迁移与清理策略 |
| 结构模型设计过浅 | HIGH | 先冻结现有功能，补建中间表示，再逐模块迁移 |
| 审阅误报过多 | MEDIUM | 将规则和模型判断拆开，加入问题置信度和人工确认 |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 离线缓存缺失 | Phase 1 | 刷新页面后仍能离线加载模型和资料 |
| 文档结构丢失 | Phase 2 | 导入后可查看章节、表格和编号结构 |
| 知识底座不统一 | Phase 3 | 生成与审阅都能显示同一来源引用 |
| 风险检测过度依赖模型 | Phase 5 | 金额/日期/主体一致性可被规则稳定检出 |
| 格式范围失控 | Phase 1 | v1 范围文档只围绕 `.docx` 定义和测试 |

## Sources

- 官方框架与库文档中的能力边界说明
- 针对浏览器端 AI、文档处理和 Word 导出链路的工程经验归纳

---
*Pitfalls research for: 浏览器本地离线商务文档智能处理系统*
*Researched: 2026-03-22*
