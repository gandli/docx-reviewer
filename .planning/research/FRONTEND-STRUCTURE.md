# Frontend Structure

**Project:** 离线商务文档智能处理系统  
**Scope:** Phase 1 + Phase 2 frontend layout  
**Defined:** 2026-03-22

## 1. Structure Rules

- `app/` 只放入口、路由和 provider
- `features/` 只放用户可见流程能力
- `domain/` 只放纯业务模型和规则
- `services/` 只放技术对接与编排
- `workers/` 只放重任务线程
- `shared/` 只放跨模块通用代码

## 2. Recommended Tree

```text
src/
├── app/
│   ├── App.tsx
│   ├── main.tsx
│   ├── router/
│   │   └── index.tsx
│   └── providers/
│       ├── theme-provider.tsx
│       ├── query-provider.tsx
│       └── runtime-provider.tsx
├── features/
│   ├── runtime/
│   ├── import-workbench/
│   ├── preview/
│   ├── editor-draft/
│   └── workspace-shell/
├── domain/
│   ├── documents/
│   ├── retrieval/
│   ├── revisions/
│   └── validation/
├── services/
│   ├── runtime/
│   ├── persistence/
│   ├── import/
│   ├── preview/
│   ├── parsing/
│   └── retrieval/
├── workers/
├── shared/
│   ├── constants/
│   ├── ids/
│   ├── types/
│   └── utils/
└── tests/
```

## 3. Route Layout

```text
/
├── /                -> Home / runtime readiness
├── /import          -> Import workbench
├── /workspace/:id   -> Main document workspace
└── /settings        -> Local model / storage settings
```

## 4. Feature Ownership

### `features/runtime`
- 启动检测
- 模型状态
- 缓存状态
- 本地环境提示

### `features/import-workbench`
- 文件拖拽上传
- 导入任务进度
- 文件类型提示
- 导入结果列表

### `features/preview`
- PDF 预览
- DOCX 预览
- Spreadsheet 预览
- 预览定位与高亮

### `features/editor-draft`
- 结构化章节树
- 条款编辑
- 表格单元编辑
- 字段编辑

### `features/workspace-shell`
- 页面布局
- 左中右三栏切换
- 当前文档上下文

## 5. Service Ownership

### `services/runtime`
- capability-service
- model-service
- cache-service

### `services/persistence`
- db
- migrations
- repositories

### `services/import`
- sniff-file
- import-orchestrator
- format adapters

### `services/preview`
- preview model builders
- anchor mapping
- preview registry

### `services/parsing`
- normalization
- node builder
- chunker

### `services/retrieval`
- embeddings
- chunk indexing
- vector index persistence

## 6. Worker Split

```text
workers/
├── llm.worker.ts
├── parse.worker.ts
├── embedding.worker.ts
└── preview.worker.ts
```

- `llm.worker.ts`: WebLLM
- `parse.worker.ts`: 大文件解析和 block normalize
- `embedding.worker.ts`: embeddings + indexing
- `preview.worker.ts`: 需要时做预览预处理

## 7. State Split

### Global persistent state
- 用户设置
- 当前模型
- 最近工作区

### Route state
- 当前导入任务
- 当前活动文档
- 当前预览锚点

### Editor state
- 当前节点
- 当前修订建议
- 当前选中问题

## 8. Anti-Coupling Rules

- `features/preview` 不能直接写数据库
- `features/editor-draft` 不能直接读取预览 DOM
- `services/import/adapters/*` 不能依赖 React
- `domain/*` 不能依赖具体第三方 UI 库
