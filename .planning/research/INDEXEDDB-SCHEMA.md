# IndexedDB Schema

**Database:** `offline-doc-assistant`  
**Recommended Wrapper:** Dexie 4.3.0  
**Scope:** Phase 1 + Phase 2  
**Defined:** 2026-03-22

## 1. Versioning Rule

- 每次 schema 变动提升 Dexie version
- 所有核心记录包含 `schemaVersion`
- Blob 和结构数据分表存放

## 2. Tables

### `app_meta`

用途：
- 保存数据库级元信息

| Field | Type | Notes |
|------|------|-------|
| `key` | string | PK |
| `value` | unknown | metadata |
| `updatedAt` | string | ISO |

Key examples:
- `dbSchemaVersion`
- `lastMigrationAt`
- `appBuild`

### `settings`

用途：
- 保存本地设置

| Field | Type | Notes |
|------|------|-------|
| `key` | string | PK |
| `value` | unknown | json |
| `updatedAt` | string | ISO |

Key examples:
- `selectedModelId`
- `preferredLanguage`
- `storagePolicy`

### `assets`

用途：
- 文件级元数据

| Field | Type | Notes |
|------|------|-------|
| `id` | string | PK |
| `name` | string | filename |
| `ext` | string | normalized extension |
| `mimeType` | string | browser mime |
| `size` | number | bytes |
| `sha256` | string | dedupe key |
| `sourceFormat` | string | pdf/docx/xlsx... |
| `purpose` | string | template/reference/review-target/knowledge-base |
| `status` | string | uploaded/importing/parsed/indexed/failed |
| `schemaVersion` | number | schema marker |
| `createdAt` | string | ISO |
| `updatedAt` | string | ISO |

Indexes:
- `sha256`
- `[sourceFormat+purpose]`
- `status`
- `updatedAt`

### `asset_blobs`

用途：
- 存原始文件数据

| Field | Type | Notes |
|------|------|-------|
| `assetId` | string | PK, FK -> assets.id |
| `blob` | Blob | original file |
| `storedAt` | string | ISO |

### `import_jobs`

用途：
- 导入流程进度

| Field | Type | Notes |
|------|------|-------|
| `id` | string | PK |
| `assetId` | string | FK |
| `stage` | string | sniffing/preview/parsing/chunking/embedding/indexing/done/failed |
| `progress` | number | 0-100 |
| `message` | string | current message |
| `error` | string? | failure reason |
| `startedAt` | string | ISO |
| `updatedAt` | string | ISO |

Indexes:
- `assetId`
- `stage`

### `preview_models`

用途：
- 预览数据模型

| Field | Type | Notes |
|------|------|-------|
| `id` | string | PK |
| `assetId` | string | FK |
| `kind` | string | pdf/docx/spreadsheet/text/markdown |
| `anchorMap` | unknown | preview anchors |
| `pageCount` | number? | pdf/docx |
| `sheetNames` | string[]? | spreadsheet |
| `html` | string? | docx/text/md preview |
| `meta` | unknown | renderer metadata |
| `createdAt` | string | ISO |
| `updatedAt` | string | ISO |

Indexes:
- `assetId`
- `kind`

### `parsed_documents`

用途：
- 一份文件解析后的总入口记录

| Field | Type | Notes |
|------|------|-------|
| `id` | string | PK |
| `assetId` | string | FK |
| `rootNodeIds` | string[] | top level nodes |
| `title` | string | parsed title |
| `sourceFormat` | string | same as asset |
| `schemaVersion` | number | model version |
| `stats` | object | node/chunk count |
| `createdAt` | string | ISO |
| `updatedAt` | string | ISO |

Indexes:
- `assetId`
- `sourceFormat`

### `document_nodes`

用途：
- 通用节点树

| Field | Type | Notes |
|------|------|-------|
| `id` | string | PK |
| `documentId` | string | FK |
| `parentId` | string? | tree relation |
| `type` | string | section/paragraph/clause/table/field/spreadsheet |
| `order` | number | sibling order |
| `title` | string? | optional |
| `text` | string? | content |
| `numbering` | string? | clause numbering |
| `attrs` | object | node-specific attrs |
| `sourceRefs` | object[] | preview/source refs |
| `createdAt` | string | ISO |
| `updatedAt` | string | ISO |

Indexes:
- `documentId`
- `[documentId+parentId]`
- `[documentId+type]`

### `spreadsheet_sheets`

用途：
- 表格型结构化数据

| Field | Type | Notes |
|------|------|-------|
| `id` | string | PK |
| `documentId` | string | FK |
| `assetId` | string | FK |
| `sheetName` | string | |
| `headers` | string[] | normalized headers |
| `rows` | object[] | json rows |
| `range` | string | e.g. A1:M230 |
| `namedRanges` | object[] | optional |
| `createdAt` | string | ISO |
| `updatedAt` | string | ISO |

Indexes:
- `documentId`
- `assetId`
- `[assetId+sheetName]`

### `chunks`

用途：
- 检索切块

| Field | Type | Notes |
|------|------|-------|
| `id` | string | PK |
| `documentId` | string | FK |
| `assetId` | string | FK |
| `nodeId` | string | source node |
| `kind` | string | text/table/row/cell-summary |
| `text` | string | chunk text |
| `tokenEstimate` | number | approx |
| `sourceRefs` | object[] | location refs |
| `createdAt` | string | ISO |

Indexes:
- `documentId`
- `assetId`
- `nodeId`
- `kind`

### `vector_indexes`

用途：
- embeddings 与序列化索引

| Field | Type | Notes |
|------|------|-------|
| `id` | string | PK |
| `assetId` | string | FK |
| `documentId` | string | FK |
| `embeddingModel` | string | model id |
| `chunkIds` | string[] | members |
| `serializedIndex` | string | Voy index |
| `createdAt` | string | ISO |
| `updatedAt` | string | ISO |

Indexes:
- `assetId`
- `documentId`
- `embeddingModel`

## 3. Recommended Dexie Definition

```ts
db.version(1).stores({
  app_meta: "key, updatedAt",
  settings: "key, updatedAt",
  assets: "id, sha256, [sourceFormat+purpose], status, updatedAt",
  asset_blobs: "assetId, storedAt",
  import_jobs: "id, assetId, stage, updatedAt",
  preview_models: "id, assetId, kind, updatedAt",
  parsed_documents: "id, assetId, sourceFormat, updatedAt",
  document_nodes: "id, documentId, [documentId+parentId], [documentId+type], updatedAt",
  spreadsheet_sheets: "id, documentId, assetId, [assetId+sheetName], updatedAt",
  chunks: "id, documentId, assetId, nodeId, kind",
  vector_indexes: "id, assetId, documentId, embeddingModel, updatedAt",
});
```

## 4. Transaction Boundaries

### Import transaction
- write `assets`
- write `asset_blobs`
- create `import_jobs`

### Parse transaction
- write `parsed_documents`
- bulk write `document_nodes`
- write `spreadsheet_sheets`

### Index transaction
- write `chunks`
- write `vector_indexes`
- update `assets.status`

## 5. Retention Rules

- 原始文件默认保留
- 预览模型可重建，因此可作为可清理缓存
- 向量索引可按 embedding model version 重建

## 6. Cleanup Policy

提供三档：

1. 只清预览缓存
2. 清预览 + 索引
3. 清整份文件及全部衍生数据
