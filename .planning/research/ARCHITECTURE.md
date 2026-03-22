# Architecture Research

**Domain:** 浏览器本地离线商务文档智能处理系统
**Researched:** 2026-03-22
**Confidence:** MEDIUM

## Standard Architecture

### System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                      │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│  │ 导入工作台 │ │ 生成工作台 │ │ 审阅工作台 │ │ 导出面板 │ │
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └────┬─────┘ │
│        │              │              │              │       │
├────────┴──────────────┴──────────────┴──────────────┴───────┤
│                     Application Layer                       │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│  │ 文档解析器 │ │ 检索编排器 │ │ 任务编排器 │ │ 规则引擎 │ │
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └────┬─────┘ │
│        │              │              │              │       │
├────────┴──────────────┴──────────────┴──────────────┴───────┤
│                     Runtime / Storage                       │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│  │ WebGPU LLM │ │ Embeddings │ │ Voy Index  │ │IndexedDB │ │
│  └────────────┘ └────────────┘ └────────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| 文档解析器 | 把模板、背景资料和待审文档转成统一结构 | `.docx` 读取 + 结构化中间表示 |
| 检索编排器 | 切分、嵌入、索引、召回和来源追溯 | Transformers.js + Voy + IndexedDB |
| LLM 运行时 | 本地对话、生成、结构化输出和流式回复 | WebLLM + WebGPU |
| 任务编排器 | 组织“生成 / 填充 / 审阅 / 修订”任务输入输出 | 明确的任务类型和结构化 schema |
| 规则引擎 | 识别缺失项、风险项、一致性问题 | 规则 + LLM 混合判定 |
| 导出器 | 把结构化结果转回可交付的 Word | `docx` 或 `docxtemplater` |

## Recommended Project Structure

```text
src/
├── app/                # 页面与流程入口
│   ├── routes/         # 导入、生成、审阅、导出页面
│   └── state/          # 跨页面状态
├── domain/             # 核心业务模型
│   ├── documents/      # 文档结构、中间表示、字段 schema
│   ├── review/         # 风险、问题、修订建议模型
│   └── templates/      # 文档类型模板定义
├── services/           # 编排与对接层
│   ├── llm/            # 模型加载、提示、结构化输出
│   ├── retrieval/      # 切分、嵌入、检索
│   ├── parsing/        # 导入与解析
│   └── export/         # Word 导出
├── workers/            # Web Worker / 推理线程
├── persistence/        # IndexedDB 仓储
└── tests/              # 单测与流程测试
```

### Structure Rationale

- **domain/**: 先把“文档是什么、问题是什么、条款建议是什么”固定下来，避免一开始就被具体库绑死。
- **services/**: 把模型、检索、导出等外部能力封装起来，便于后面替换实现。
- **workers/**: 将重任务放到 Worker，避免 UI 卡死。
- **persistence/**: 用仓储层隔离 IndexedDB 和 Voy 的底层细节。

## Architectural Patterns

### Pattern 1: Structured Intermediate Representation

**What:** 先把文档统一抽象成章节、条款、表格、字段和引用来源，再进行生成或审阅。  
**When to use:** 任何需要“既读旧文档，又写新文档”的流程。  
**Trade-offs:** 前期建模成本更高，但能显著降低后续混乱。

**Example:**
```typescript
type SectionNode = {
  id: string;
  title: string;
  level: number;
  blocks: BlockNode[];
  sourceRefs: string[];
};
```

### Pattern 2: Retrieval-First Task Orchestration

**What:** 生成和审阅都先检索，再把有限上下文交给模型。  
**When to use:** 文档较长、背景资料较多、需要可追溯时。  
**Trade-offs:** 需要额外的索引和召回质量控制，但结果更稳。

**Example:**
```typescript
const evidence = await retrieval.search(task.query, { sectionId, topK: 8 });
const result = await llm.runTask({ task, evidence, schema });
```

### Pattern 3: Rule + LLM Hybrid Review

**What:** 明确规则先查硬错误，再由模型处理语义风险和修订建议。  
**When to use:** 合同金额、日期、主体名称等必须准确的场景。  
**Trade-offs:** 规则维护会增加，但能减少“模型一本正经胡说”的风险。

## Data Flow

### Request Flow

```text
[User uploads template / document]
    ↓
[Parser] → [Normalizer] → [Chunker] → [IndexedDB + Voy]
    ↓
[Task Orchestrator] → [Retriever] → [LLM / Rule Engine]
    ↓
[Structured Result] → [Editor / Exporter] → [.docx]
```

### State Management

```text
[App State]
    ↓
[Workbench UI] ←→ [Actions] → [Task State / Persistence] → [App State]
```

### Key Data Flows

1. **导入流:** 用户上传模板或文档后，系统解析结构、切分内容、生成向量并写入本地库。
2. **生成流:** 用户选择模板和资料后，系统按字段或章节检索背景信息，再调用本地模型生成内容。
3. **审阅流:** 系统对现有文档提取结构，运行规则检查和语义检查，再生成问题清单与修订建议。
4. **导出流:** 系统把用户确认后的结构化结果生成 `.docx`，同时写出审阅摘要。

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 单人本机 / 0-100 份文档 | IndexedDB + Voy 足够，单机工作流为主 |
| 100-5,000 份文档 | 需要更细的索引分桶、懒加载和缓存淘汰策略 |
| 5,000+ 份文档 | 需重新评估 Voy 和浏览器存储策略，可能要分库或切换索引实现 |

### Scaling Priorities

1. **First bottleneck:** 模型加载和首次索引时间过长 — 通过懒加载、分阶段建索引和缓存预热解决。
2. **Second bottleneck:** 浏览器内存占用过高 — 通过分块处理、Worker 隔离和索引压缩解决。

## Anti-Patterns

### Anti-Pattern 1: Chat-first UI, workflow-second

**What people do:** 一上来只做一个聊天框，让用户把文档问题全靠聊天解决。  
**Why it's wrong:** 对结构化商务文档来说，聊天框很难承载模板、条款定位、修订确认和导出。  
**Do this instead:** 从工作台流程出发，围绕导入、生成、审阅、修订、导出组织界面。

### Anti-Pattern 2: Parsing logic tied directly to export logic

**What people do:** 导入时拿到什么结构，导出时就直接原样回写。  
**Why it's wrong:** 一旦生成或修订流程改变结构，系统会快速变脆。  
**Do this instead:** 维护稳定的中间表示层，让解析和导出都围绕它工作。

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Hugging Face model files | 静态模型资源下载与缓存 | 需要离线缓存策略和首次加载提示 |
| 浏览器文件系统 / 下载 | 用户主动导入与导出 | 注意权限与失败恢复 |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| UI ↔ Worker | message channel | 避免主线程阻塞 |
| Parsing ↔ Domain | typed models | 不能泄漏底层库结构到业务层 |
| Retrieval ↔ Review/Generation | task API | 统一检索入口，避免重复实现 |
| Domain ↔ Export | intermediate representation | 保证导出不直接依赖原始解析结果 |

## Sources

- WebLLM 官方文档
- Transformers.js 官方文档
- Qwen2.5 官方模型页
- Voy 官方仓库说明
- Mammoth 官方仓库说明

---
*Architecture research for: 浏览器本地离线商务文档智能处理系统*
*Researched: 2026-03-22*
