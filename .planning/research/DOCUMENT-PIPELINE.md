# Document Pipeline Design

**Project:** 离线商务文档智能处理系统  
**Scope:** Phase 2 to Phase 6 implementation guidance  
**Defined:** 2026-03-22  
**Status:** Proposed

## 1. Design Goal

为 `pdf / doc / docx / txt / md` 提供一条统一、可控、可导出的本地处理链路，同时满足三件事：

1. 用户能看到接近原文件的原文预览，用来核对位置和样式  
2. 系统能把文件转成统一的结构化中间表示，用于检索、生成、审阅和导出  
3. 修订发生在结构化编辑稿上，而不是直接发生在原文预览层

一句话原则：

**预览负责“像原文”，编辑负责“可控修改”，导出负责“重新交付”。**

## 2. Format Strategy

| Format | 读取策略 | 预览策略 | 编辑策略 | v1 结论 |
|--------|----------|----------|----------|---------|
| `pdf` | 用 PDF.js 读取页面、文本层和位置信息 | PDF.js 分页预览 | 不直接编辑 PDF；只做定位、批注、生成修订稿 | 支持 |
| `docx` | 用 Mammoth.js 做语义解析；必要时补 XML 层读取 | 用 `docx-preview` 近似还原 Word 样式 | 编辑结构化稿，不直接改预览 HTML | 主格式 |
| `doc` | 浏览器内不做可靠原生解析 | 无独立预览；提示先转成 `docx` | 不直接编辑 | 受限支持 |
| `txt` | 直接读取 UTF-8/编码探测后的文本 | 简单文本预览 | 直接转结构化稿 | 支持 |
| `md` | 直接读取文本并解析 Markdown | Markdown 渲染预览 | 进入结构化稿或 Markdown 编辑器 | 支持 |

## 3. Library Choices

### 3.1 PDF

- 预览与文本层：`pdf.js`
- 原因：
  - Mozilla 官方维护
  - 浏览器内分页渲染成熟
  - 支持文本层，便于定位原文和高亮问题位置

**Use for this project:**
- 左侧原文分页预览
- 审阅问题跳转到对应页和对应文本区域
- 抽取文本与位置信息进入结构化模型

### 3.2 DOCX

- 预览：`docx-preview`
- 解析：`mammoth`
- 原因：
  - `docx-preview` 适合在网页里展示接近 Word 的视觉结构
  - `mammoth` 更适合把 `.docx` 转成语义化内容，便于理解标题、列表、表格和段落

**Use for this project:**
- `docx-preview` 负责“像原文”
- `mammoth` 负责“可处理”
- 两者都不直接作为最终编辑数据源，最终以统一中间表示为准

### 3.3 TXT / MD

- 文本读取：浏览器原生 File API
- Markdown 渲染/编辑：可优先用 Tiptap Markdown 能力

**Use for this project:**
- 背景资料
- 规则说明
- 轻量模板草稿

### 3.4 Structured Editing

- 编辑器底座：Tiptap / ProseMirror
- 修订能力：
  - v1: 自定义条款级修订记录
  - 后续增强: ProseMirror track / changeset 或更完整的 tracked changes

**Why this route:**
- 可把章节、条款、表格作为结构化节点
- 便于 AI 按节点写入结果
- 便于记录“建议 -> 接受/拒绝 -> 最终文本”

## 4. V1 Editing Model

v1 不追求“像 Word 一样任意拖拽、任意所见即所得编辑”，而采用更稳的修订模式。

### 4.1 Core UI

推荐页面分三栏：

1. **原文预览区**
   - `pdf` 分页预览
   - `docx` 近似样式预览
   - 支持高亮定位

2. **结构化编辑稿**
   - 章节树
   - 条款内容
   - 表格单元
   - 字段区

3. **审阅/建议面板**
   - 问题列表
   - 风险原因
   - 来源证据
   - 修订建议

### 4.2 Editing Rules

- 所有 AI 生成、填充、修订都写入“结构化编辑稿”
- 原文预览不直接可写
- 每个问题项都绑定：
  - 原文位置
  - 结构化节点 ID
  - 建议文本
  - 用户决策

### 4.3 Revision States

每条建议维护以下状态：

- `proposed`：AI 已生成建议
- `accepted`：用户接受建议
- `rejected`：用户拒绝建议
- `edited`：用户手动改写
- `superseded`：被新建议覆盖

## 5. Unified Intermediate Representation

所有格式最终都进入同一套中间表示。

```ts
type SourceFormat = "pdf" | "docx" | "doc" | "txt" | "md";

type DocumentNode =
  | SectionNode
  | ParagraphNode
  | ClauseNode
  | TableNode
  | FieldNode;

type SourceRef = {
  fileId: string;
  format: SourceFormat;
  page?: number;
  blockId?: string;
  previewAnchor?: string;
  quote?: string;
};

type RevisionRecord = {
  id: string;
  nodeId: string;
  issueId?: string;
  action: "proposed" | "accepted" | "rejected" | "edited" | "superseded";
  before?: string;
  after?: string;
  reason?: string;
  createdAt: string;
};

type ClauseNode = {
  id: string;
  type: "clause";
  title?: string;
  text: string;
  numbering?: string;
  sourceRefs: SourceRef[];
  revisions: RevisionRecord[];
};
```

## 6. Import Pipeline

### 6.1 Common Flow

```text
File Upload
  -> format sniff
  -> format adapter
  -> normalized blocks
  -> structured document model
  -> chunking
  -> embeddings
  -> local index
  -> preview + editable draft
```

### 6.2 Per-format Adapters

#### PDF Adapter

输入：
- `File`

输出：
- 页面列表
- 文本块
- 坐标信息
- `SourceRef(page, previewAnchor)`

策略：
- 用 PDF.js 提取页面文本和位置信息
- 把长页拆成段落块
- 保留页码和块定位，供跳转和高亮

#### DOCX Adapter

输入：
- `File`

输出：
- 标题层级
- 段落
- 列表与编号
- 表格
- 粗体等基础语义

策略：
- `docx-preview` 负责预览
- `mammoth` 负责语义解析
- 如后续需要更高保真字段提取，再读取 OOXML 原始结构做增强

#### DOC Adapter

输入：
- `File`

v1 策略：
- 浏览器中仅识别并提示：“请先另存为 `.docx` 后导入”
- 不承诺在纯浏览器内稳定转换

说明：
- 这不是技术上永远不行，而是和当前“纯浏览器、完全离线、稳定可交付”的优先级冲突

#### TXT Adapter

策略：
- 直接读取文本
- 基于空行、标题规则和长度切分成块

#### MD Adapter

策略：
- 解析标题、列表、引用、表格
- 同时保留原 Markdown 文本和结构树

## 7. Preview Model

### 7.1 Preview is Read-oriented

原文预览层只负责：

- 样式参考
- 页码参考
- 问题定位
- 对比核对

原文预览层不负责：

- 真正的正文编辑
- 修订状态持久化
- 最终导出内容的直接来源

### 7.2 Preview Linking

每个问题或结构化节点都可以关联到预览锚点：

```ts
type PreviewAnchor = {
  fileId: string;
  page?: number;
  domSelector?: string;
  textRange?: { start: number; end: number };
};
```

这样就能实现：

- 点问题 -> 跳原文
- 点原文 -> 定位到结构化稿节点

## 8. Revision and Review Flow

```text
Structured draft node
  -> rule check
  -> retrieval evidence
  -> WebLLM generates issue + suggestion
  -> user accept/reject/edit
  -> revision record stored
  -> exportable final node updated
```

### 8.1 Why clause-level revision first

条款级修订比全文自由编辑更适合商务文档，因为它：

- 更容易追踪依据
- 更容易控制风险
- 更容易生成审阅报告
- 更容易重新导出成稳定的 `.docx`

## 9. Export Model

最终导出只从“结构化编辑稿 + 修订记录”生成，不从预览层导出。

### Export Inputs

- 当前结构化节点树
- 已接受的修订结果
- 最终字段值
- 表格数据
- 文档级元信息

### Export Outputs

- `.docx` 主文档
- 审阅摘要（可选）
- 问题清单（可选）

## 10. Phase Mapping

### Phase 2

- 多格式识别
- PDF.js 预览
- docx-preview 预览
- Mammoth 解析
- TXT/MD 解析
- 统一中间表示第一版

### Phase 3

- 结构块切分
- 嵌入与索引
- 来源锚点与预览联动

### Phase 4

- 结构化编辑稿
- 节点级生成和填充

### Phase 5

- 问题列表
- 建议生成
- 条款级接受/拒绝

### Phase 6

- 修订记录落盘
- 最终 `.docx` 导出
- 审阅摘要导出

## 11. V1 Decisions

- `pdf` 仅做预览与定位，不做原位正文编辑
- `docx` 是主工作格式
- `.doc` 不做纯浏览器内稳定转换承诺
- 编辑永远落在结构化稿上
- 修订以条款级建议闭环为主

## 12. Open Questions for Planning

- `docx` 导出时，优先“重建整份文档”还是“套回模板后填充”
- 表格节点在编辑器中是否第一版就支持复杂合并单元格
- `md` 资料是仅做知识库，还是也允许作为可导出模板来源
- 是否在 Phase 2 就为预览层加入文本高亮锚点缓存

## Sources

- [PDF.js](https://github.com/mozilla/pdf.js)
- [docx-preview / docxjs](https://github.com/VolodymyrBaydalka/docxjs)
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js)
- [Tiptap Markdown](https://tiptap.dev/docs/editor/markdown)
- [ProseMirror track example](https://prosemirror.net/examples/track/)
- [prosemirror-changeset](https://github.com/ProseMirror/prosemirror-changeset)
