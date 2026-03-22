# Phase 1-2 Implementation Blueprint

**Project:** 离线商务文档智能处理系统  
**Scope:** Phase 1 + Phase 2  
**Defined:** 2026-03-22  
**Status:** Ready for planning

## 1. Objective

把当前路线图里的前两阶段拆成可以直接实施的工程方案，具体到：

- 前端目录结构
- 运行时与存储选型
- IndexedDB schema
- 文档中间表示类型
- 导入、预览、解析模块边界

## 2. Concrete Technical Choices

### Phase 1 Runtime Stack

| Area | Choice | Current Version Verified | Why |
|------|--------|--------------------------|-----|
| Frontend build | Vite + TypeScript | `vite@8.0.1` + `typescript@5.9.3` | 启动快、现代浏览器友好、适合纯前端项目 |
| UI runtime | React | `react@19.2.4` | 适合工作台式复杂状态界面 |
| Global app state | Zustand | `zustand@5.0.12` | 状态轻，适合流程型页面 |
| IndexedDB wrapper | Dexie | 4.3.0 | schema、版本迁移、查询和事务体验更稳 |
| Fallback IndexedDB helper | `idb` | 8.0.3 | 适合少量底层封装或兼容工具 |
| Local LLM runtime | `@mlc-ai/web-llm` | 0.2.82 | 浏览器本地生成主链路 |
| PDF preview | `react-pdf` | `react-pdf@10.4.1` | React 组件化接入更稳，适合作为 PDF 原文预览主层 |
| PDF rendering engine | `pdfjs-dist` | 5.5.207 | 作为 `react-pdf` 底层渲染能力与文本层基础 |
| DOCX preview | `docx-preview` | 0.3.7 | 接近 Word 样式的网页预览 |
| DOCX semantic parse | `mammoth` | 1.12.0 | 语义解析适合结构化处理 |
| Spreadsheet parse | `xlsx` (SheetJS) | 0.18.5 | 浏览器里最现实的 `xls/xlsx` 方案 |
| Structured editor | Tiptap | `@tiptap/core@3.20.4` | ProseMirror 之上，适合节点化编辑 |

约束原则：

- 这里列出的版本默认指 2026-03-22 当天核验到的最新稳定正式版
- Phase 1 和 Phase 2 实施时不引入 `beta`、`rc`、`canary` 版本
- 若某依赖后续升级，需要先验证和 WebGPU、IndexedDB、Worker 组合是否兼容

## 3. Frontend Project Structure

建议在真正实现时采用下面这套目录。它不是“好看”的目录，而是为了把 Phase 1 和 Phase 2 的边界切干净。

```text
src/
├── app/
│   ├── App.tsx
│   ├── routes/
│   │   ├── home/
│   │   ├── import/
│   │   └── workspace/
│   ├── providers/
│   └── router/
├── features/
│   ├── runtime/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/
│   │   └── services/
│   ├── import-workbench/
│   │   ├── components/
│   │   ├── stores/
│   │   └── view-models/
│   ├── preview/
│   │   ├── pdf/
│   │   ├── docx/
│   │   ├── spreadsheet/
│   │   └── shared/
│   └── editor-draft/
│       ├── components/
│       ├── tiptap/
│       └── stores/
├── domain/
│   ├── documents/
│   │   ├── models/
│   │   ├── factories/
│   │   ├── normalization/
│   │   └── validation/
│   ├── sources/
│   ├── revisions/
│   └── retrieval/
├── services/
│   ├── runtime/
│   │   ├── capability-service.ts
│   │   ├── cache-service.ts
│   │   └── model-service.ts
│   ├── persistence/
│   │   ├── db.ts
│   │   ├── migrations.ts
│   │   └── repositories/
│   ├── import/
│   │   ├── import-orchestrator.ts
│   │   ├── sniff-file.ts
│   │   └── adapters/
│   │       ├── pdf-adapter.ts
│   │       ├── docx-adapter.ts
│   │       ├── doc-adapter.ts
│   │       ├── markdown-adapter.ts
│   │       ├── text-adapter.ts
│   │       └── spreadsheet-adapter.ts
│   ├── preview/
│   │   ├── preview-registry.ts
│   │   ├── pdf-preview-service.ts
│   │   ├── docx-preview-service.ts
│   │   └── spreadsheet-preview-service.ts
│   ├── parsing/
│   │   ├── block-normalizer.ts
│   │   ├── node-builder.ts
│   │   └── chunker.ts
│   └── retrieval/
│       ├── embedding-service.ts
│       ├── vector-index-service.ts
│       └── chunk-indexer.ts
├── workers/
│   ├── llm.worker.ts
│   ├── parse.worker.ts
│   ├── embedding.worker.ts
│   └── preview.worker.ts
├── shared/
│   ├── types/
│   ├── utils/
│   ├── ids/
│   └── constants/
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

## 4. Module Boundaries

### 4.1 `features/runtime`

只负责：
- 环境检测
- 首次启动状态
- 模型准备状态
- 缓存状态展示

不负责：
- 文件解析
- 文档内容处理

### 4.2 `services/runtime`

只负责：
- WebGPU / IndexedDB / File API 探测
- WebLLM 初始化和模型切换
- 资源缓存策略

不负责：
- 业务页面状态

### 4.3 `services/import`

只负责：
- 文件类型识别
- 按格式路由到 adapter
- 返回统一 import result

不直接负责：
- UI 渲染
- 持久化写入细节

### 4.4 `services/preview`

只负责：
- 将已导入资源转成可显示预览模型
- 提供锚点跳转和高亮定位能力

不直接负责：
- 编辑
- 导出

### 4.5 `services/parsing`

只负责：
- 把各格式 adapter 输出转成统一中间表示
- 构造节点树
- 切块

### 4.6 `services/persistence`

只负责：
- Dexie schema
- migrations
- repositories
- 事务边界

### 4.7 `features/editor-draft`

只负责：
- 结构化编辑稿显示
- 节点编辑
- 用户修改

不直接依赖：
- 原文预览 DOM

## 5. IndexedDB Strategy

数据库建议使用 Dexie，数据库名建议：

`offline-doc-assistant`

版本化原则：
- 每次 schema 变更必须升级 Dexie version
- 每个持久化对象都带 `schemaVersion`
- 预览缓存与解析结果分开存

### 5.1 Tables

建议建这些表：

1. `app_meta`
2. `assets`
3. `asset_blobs`
4. `preview_models`
5. `parsed_documents`
6. `document_nodes`
7. `spreadsheet_sheets`
8. `chunks`
9. `vector_indexes`
10. `import_jobs`
11. `settings`

具体字段见：

- [INDEXEDDB-SCHEMA.md](/Users/user/Documents/New%20project/.planning/research/INDEXEDDB-SCHEMA.md)

## 6. TypeScript Document Model

统一文档中间表示不建议继续只放在 Markdown 示例里，建议在实现期直接以 TS 类型文件为准。

建议作为首版领域模型文件：

- [document-model.ts](/Users/user/Documents/New%20project/.planning/research/document-model.ts)

## 7. Import Orchestration

### Common Signature

```ts
type ImportFileCommand = {
  file: File;
  purpose: "template" | "reference" | "review-target" | "knowledge-base";
};

type ImportFileResult = {
  assetId: string;
  sourceFormat: SourceFormat;
  previewModelId?: string;
  parsedDocumentId?: string;
  warnings: string[];
};
```

### Orchestrator Steps

```text
sniff file
-> create asset record
-> store original blob
-> run adapter
-> create preview model
-> normalize into document model
-> persist parsed document + nodes
-> create chunks
-> enqueue embeddings/indexing
-> return import result
```

## 8. Preview Layer Boundaries

### PDF Preview

输入：
- `assetId`

输出：
- `PdfPreviewModel`

职责：
- 分页渲染
- 文本层
- 问题定位高亮

### DOCX Preview

输入：
- `assetId`

输出：
- `DocxPreviewModel`

职责：
- 接近 Word 的原文样式预览
- DOM anchor 映射

### Spreadsheet Preview

输入：
- `assetId`

输出：
- `SpreadsheetPreviewModel`

职责：
- sheet tabs
- grid preview
- row/column anchor
- cell range highlighting

## 9. Phase 1 Breakdown

### 01-01 初始化前端工程、运行时能力探测和基础状态管理

**Deliverables**
- Vite + React + TypeScript 项目骨架
- `features/runtime` 与 `services/runtime`
- capability store
- 启动页能力检测面板

**Files to create first**
- `src/app/App.tsx`
- `src/features/runtime/stores/runtime-store.ts`
- `src/services/runtime/capability-service.ts`
- `src/shared/types/runtime.ts`

**Acceptance**
- 页面能显示 WebGPU / IndexedDB / File API / Worker 能力状态

### 01-02 建立本地缓存、IndexedDB 仓储和资源版本策略

**Deliverables**
- Dexie database
- migrations
- repositories
- app meta / settings / asset persistence

**Files to create first**
- `src/services/persistence/db.ts`
- `src/services/persistence/migrations.ts`
- `src/services/persistence/repositories/assets-repo.ts`
- `src/services/persistence/repositories/settings-repo.ts`

**Acceptance**
- 能写入并读回 app settings、asset metadata、blob
- 版本号变更可触发迁移

### 01-03 接入本地模型加载流程并验证离线重启恢复

**Deliverables**
- WebLLM model service
- worker 化模型加载
- 模型状态面板
- 首次加载和重启恢复流程

**Files to create first**
- `src/services/runtime/model-service.ts`
- `src/workers/llm.worker.ts`
- `src/features/runtime/components/model-status-card.tsx`

**Acceptance**
- 首次加载后可在刷新页面后恢复模型配置与缓存状态

## 10. Phase 2 Breakdown

### 02-01 搭建导入工作台与多格式文件分流管线

**Deliverables**
- import workbench 页面
- 文件拖拽上传
- `sniff-file.ts`
- `import-orchestrator.ts`

**Acceptance**
- 不同文件类型走到正确 adapter
- `.doc` 和不支持格式会给出清晰提示

### 02-02 集成 `pdf` 与 `docx` 原文预览能力

**Deliverables**
- PDF preview pane
- DOCX preview pane
- 统一 preview registry

**Acceptance**
- 用户可切换查看 `pdf` 和 `docx` 原文预览
- 预览层可输出锚点信息

### 02-03 集成 `xls/xlsx` 工作表预览与表格解析能力

**Deliverables**
- spreadsheet adapter
- sheet tabs
- grid preview
- cell/range anchor

**Acceptance**
- 用户可切换 sheet
- 系统可读取 headers / rows / regions

### 02-04 定义文档中间表示并实现结构提取与标准化

**Deliverables**
- document model types
- node builder
- block normalizer
- parsed document persistence

**Acceptance**
- `pdf/docx/txt/md/xlsx` 都可进入统一节点树

### 02-05 完成片段切分、向量化和索引入库可视化

**Deliverables**
- chunker
- embedding queue
- index persistence
- import status visualization

**Acceptance**
- 用户可看到某份资料是否已完成“解析 -> 切块 -> 嵌入 -> 索引”

## 11. Recommended First Files to Actually Implement

如果开始编码，建议第一批文件按这个顺序建立：

1. `src/services/persistence/db.ts`
2. `src/shared/types/document.ts` 或直接从 `document-model.ts` 落地
3. `src/services/import/sniff-file.ts`
4. `src/services/import/import-orchestrator.ts`
5. `src/services/import/adapters/docx-adapter.ts`
6. `src/services/preview/pdf-preview-service.ts`
7. `src/services/preview/docx-preview-service.ts`
8. `src/services/import/adapters/spreadsheet-adapter.ts`

## 12. Planning Output References

- [FRONTEND-STRUCTURE.md](/Users/user/Documents/New%20project/.planning/research/FRONTEND-STRUCTURE.md)
- [INDEXEDDB-SCHEMA.md](/Users/user/Documents/New%20project/.planning/research/INDEXEDDB-SCHEMA.md)
- [document-model.ts](/Users/user/Documents/New%20project/.planning/research/document-model.ts)
