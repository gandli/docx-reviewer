# Roadmap: 离线商务文档智能处理系统

## Overview

这条路线从“浏览器本地可稳定运行”起步，先打通模型缓存与离线存储，再建立文档结构层和统一检索底座，随后分别落下生成、审阅和导出三条关键能力，最终形成一套对结构化商务文档可直接交付的本地闭环工作台。

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Runtime Foundation** - 建立浏览器本地运行、缓存和离线能力底座
- [ ] **Phase 2: Document Ingestion** - 实现 `.docx` 导入、结构解析和索引入库
- [ ] **Phase 3: Grounded Knowledge Layer** - 建立统一检索、来源追溯和文档类型配置
- [ ] **Phase 4: Draft Generation** - 打通模板生成、字段填充和章节级生成
- [ ] **Phase 5: Review and Risk Engine** - 实现审阅、风险识别和条款修订建议
- [ ] **Phase 6: Export and Finalization** - 完成确认流、变更记录和 Word 导出闭环

## Phase Details

### Phase 1: Runtime Foundation
**Goal**: 用户首次进入系统时即可完成浏览器能力检测、本地模型准备和离线缓存初始化，为后续所有文档任务提供稳定运行底座
**Depends on**: Nothing (first phase)
**Requirements**: [PLAT-01, PLAT-02, PLAT-03]
**Success Criteria** (what must be TRUE):
  1. 用户可看到当前浏览器是否支持 WebGPU、离线缓存和文件导入能力
  2. 系统可在本地初始化模型缓存、配置存储和数据目录
  3. 刷新页面后，已缓存资源仍可被离线复用
**Plans**: 3 plans

Plans:
- [ ] 01-01: 初始化前端工程、运行时能力探测和基础状态管理
- [ ] 01-02: 建立本地缓存、IndexedDB 仓储和资源版本策略
- [ ] 01-03: 接入本地模型加载流程并验证离线重启恢复

### Phase 2: Document Ingestion
**Goal**: 用户可导入 `.docx` 模板与背景资料，系统能稳定提取结构并建立可复用的文档中间表示
**Depends on**: Phase 1
**Requirements**: [DOC-01, DOC-02, DOC-03, DOC-04]
**Success Criteria** (what must be TRUE):
  1. 用户可导入 `.docx` 模板和背景资料并看到处理进度
  2. 系统可提取标题、条款、表格和编号结构，并以统一模型保存
  3. 导入后的文档片段可完成切分、嵌入和本地索引入库
  4. 用户可查看每份资料的解析和索引状态
**Plans**: 3 plans

Plans:
- [ ] 02-01: 搭建导入工作台与文件解析管线
- [ ] 02-02: 定义文档中间表示并实现结构提取与标准化
- [ ] 02-03: 完成片段切分、向量化和索引入库可视化

### Phase 3: Grounded Knowledge Layer
**Goal**: 生成、审阅和修订共用一套本地知识底座，并能为每次结论提供可追溯证据
**Depends on**: Phase 2
**Requirements**: [RAG-01, RAG-02, RAG-03]
**Success Criteria** (what must be TRUE):
  1. 任一任务都可按章节、字段或语义检索本地资料
  2. 系统可为生成内容和审阅结论返回对应来源片段
  3. 用户可配置文档类型模板、字段映射和审阅规则包
**Plans**: 3 plans

Plans:
- [ ] 03-01: 封装检索服务、来源引用和任务上下文拼装
- [ ] 03-02: 建立文档类型配置、字段映射和规则包模型
- [ ] 03-03: 完成生成/审阅共用知识底座的端到端验证

### Phase 4: Draft Generation
**Goal**: 用户可基于模板和背景资料生成完整初稿，或只填充指定字段、章节和表格
**Depends on**: Phase 3
**Requirements**: [GEN-01, GEN-02, GEN-03, GEN-04]
**Success Criteria** (what must be TRUE):
  1. 用户可选择模板与背景资料生成结构化初稿
  2. 用户可仅更新指定字段、章节或表格
  3. 生成结果保留章节层级和编号逻辑
  4. 每次生成都附带可核查的依据摘要
**Plans**: 3 plans

Plans:
- [ ] 04-01: 构建生成任务 schema、提示编排和结果校验
- [ ] 04-02: 实现模板生成、字段填充和章节级更新流程
- [ ] 04-03: 加入依据摘要、结果预览和失败恢复机制

### Phase 5: Review and Risk Engine
**Goal**: 用户可对已有文档进行审阅，查看问题清单、定位风险条款，并生成针对性的修订建议
**Depends on**: Phase 4
**Requirements**: [REV-01, REV-02, REV-03, OUT-01]
**Success Criteria** (what must be TRUE):
  1. 用户可对现有文档发起审阅并得到结构化问题清单
  2. 系统可识别缺失条款、风险条款和关键字段不一致
  3. 每个问题都能跳转到原文位置，并说明触发原因
  4. 用户可对问题条款生成替代文本或修订建议
**Plans**: 4 plans

Plans:
- [ ] 05-01: 实现规则引擎与硬性一致性检查
- [ ] 05-02: 实现语义审阅、问题归类和置信度输出
- [ ] 05-03: 建立问题定位、原因说明和证据展示
- [ ] 05-04: 生成修订建议并与问题清单联动

### Phase 6: Export and Finalization
**Goal**: 用户可确认修订结果、保留变更记录，并导出可直接交付的 `.docx` 和审阅摘要
**Depends on**: Phase 5
**Requirements**: [OUT-02, OUT-03, OUT-04]
**Success Criteria** (what must be TRUE):
  1. 用户可接受、拒绝或手动调整修订建议
  2. 系统可保留最终变更记录和导出前摘要
  3. 导出的 `.docx` 能在 Word 中正常打开，且章节、表格、编号结构可用
  4. 用户可单独导出审阅摘要或问题清单
**Plans**: 3 plans

Plans:
- [ ] 06-01: 实现修订确认流、变更记录和最终预览
- [ ] 06-02: 实现 `.docx` 导出管线并验证结构完整性
- [ ] 06-03: 实现审阅摘要导出与全链路收尾验证

## Progress

**Execution Order:**
Phases execute in numeric order: 2 → 2.1 → 2.2 → 3 → 3.1 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Runtime Foundation | 0/3 | Not started | - |
| 2. Document Ingestion | 0/3 | Not started | - |
| 3. Grounded Knowledge Layer | 0/3 | Not started | - |
| 4. Draft Generation | 0/3 | Not started | - |
| 5. Review and Risk Engine | 0/4 | Not started | - |
| 6. Export and Finalization | 0/3 | Not started | - |
