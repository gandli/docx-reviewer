# Requirements: 离线商务文档智能处理系统

**Defined:** 2026-03-22
**Core Value:** 在不上传敏感文件的前提下，让用户稳定完成结构化商务文档的本地生成、审阅和修订，并导出可直接交付的 Word 文件。

## v1 Requirements

### Platform

- [ ] **PLAT-01**: 用户可在支持 WebGPU 的现代桌面浏览器中本地加载推理能力，无需连接业务后端
- [ ] **PLAT-02**: 系统可检测浏览器是否具备 WebGPU、离线缓存和文件处理能力，并给出明确提示
- [ ] **PLAT-03**: 模型资源、文档索引和工作配置可在本地缓存并在离线状态下复用

### Documents

- [ ] **DOC-00**: 系统可识别导入文件类型，并按 `pdf / doc / docx / xls / xlsx / txt / md` 走对应处理流程
- [ ] **DOC-01**: 用户可导入 `.docx` 模板和背景资料文件
- [ ] **DOC-01A**: 用户可导入 `pdf` 作为原文参考，并在页面中保留原始分页预览
- [ ] **DOC-01B**: 用户导入 `.doc` 时，系统可先转换或提示转换为 `.docx` 后再处理
- [ ] **DOC-01D**: 用户可导入 `xls` 和 `xlsx` 作为结构化背景资料
- [ ] **DOC-01C**: 用户可导入 `txt` 和 `md` 资料并直接纳入本地知识库
- [ ] **DOC-02**: 系统可提取标题、段落、条款、表格和编号等文档结构
- [ ] **DOC-02A**: 系统可提取工作表、表头、单元格区域和行列结构等表格语义
- [ ] **DOC-03**: 系统可将文档片段切分、向量化并建立本地检索索引
- [ ] **DOC-04**: 用户可查看导入结果、解析状态和索引状态

### Preview

- [ ] **PREV-01**: 用户可在网页中查看接近原文样式的 `docx` 预览
- [ ] **PREV-02**: 用户可在网页中查看 `pdf` 的分页预览并定位原文内容
- [ ] **PREV-02A**: 用户可在网页中查看 `xls/xlsx` 的工作表和单元格预览
- [ ] **PREV-03**: 用户可在同一任务中同时查看原文预览和结构化编辑稿

### Grounding

- [ ] **RAG-01**: 生成、审阅和修订任务都可按章节、字段或语义检索相关背景资料
- [ ] **RAG-02**: 每条生成内容或审阅结论都可展示对应的来源片段
- [ ] **RAG-03**: 用户可配置文档类型模板、字段映射和审阅规则包

### Generation

- [ ] **GEN-01**: 用户可基于模板和背景资料生成结构化商务文档初稿
- [ ] **GEN-02**: 用户可只填充指定字段、章节或表格，而不必重写整份文档
- [ ] **GEN-03**: 生成结果可保留原模板的章节层级和编号逻辑
- [ ] **GEN-04**: 系统可输出生成说明或引用依据摘要，帮助用户快速核查

### Review

- [ ] **REV-01**: 用户可对已有 `.docx` 文档发起审阅并获得问题清单
- [ ] **REV-02**: 系统可识别缺失条款、风险条款、冲突表述，以及金额、日期、主体等关键不一致
- [ ] **REV-03**: 每条问题都可定位到原文位置并说明原因

### Output

- [ ] **OUT-01**: 用户可针对问题条款生成修订建议文本
- [ ] **OUT-02**: 用户可接受、拒绝或手动调整修订建议，并保留变更记录
- [ ] **OUT-03**: 用户可导出结构完整、可在 Word 中正常打开的 `.docx` 文件
- [ ] **OUT-04**: 用户可导出审阅摘要或问题清单

### Editing

- [ ] **EDIT-01**: 系统可将导入文档转换为结构化可编辑稿，而不是直接编辑原始预览 DOM
- [ ] **EDIT-02**: 用户可按章节、条款、字段和表格单元进行定向编辑
- [ ] **EDIT-03**: AI 修订建议可按条款逐条接受、拒绝或再次生成
- [ ] **EDIT-04**: 系统可记录每条修订对应的问题、建议和最终处理结果

## v2 Requirements

### Extended Input

- **EXT-01**: 用户可导入 PDF 或扫描件并执行 OCR 解析
- **EXT-02**: 用户可处理图片型附件并关联到审阅结果

### Collaboration

- **COLL-01**: 多名用户可共享模板、规则包和文档版本
- **COLL-02**: 用户可发起审批、批注和比对流程

### Advanced AI

- **AIA-01**: 用户可切换多个本地模型执行不同任务
- **AIA-02**: 用户可针对本地样本文档微调规则或提示模板

## Out of Scope

| Feature | Reason |
|---------|--------|
| 云端推理与在线同步 | 与“完全本地、离线、敏感数据不出端”的核心价值冲突 |
| 扫描件 OCR 首发支持 | 技术复杂度高，会稀释对结构化 `.docx` 主链路的验证 |
| 多人实时协作 | 会引入权限、同步与审批复杂度，不属于 v1 重点 |
| 自动给出法律结论背书 | 产品只提供建议与提示，不替代专业法务 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PLAT-01 | Phase 1 | Pending |
| PLAT-02 | Phase 1 | Pending |
| PLAT-03 | Phase 1 | Pending |
| DOC-00 | Phase 2 | Pending |
| DOC-01 | Phase 2 | Pending |
| DOC-01A | Phase 2 | Pending |
| DOC-01B | Phase 2 | Pending |
| DOC-01C | Phase 2 | Pending |
| DOC-01D | Phase 2 | Pending |
| DOC-02 | Phase 2 | Pending |
| DOC-02A | Phase 2 | Pending |
| DOC-03 | Phase 2 | Pending |
| DOC-04 | Phase 2 | Pending |
| PREV-01 | Phase 2 | Pending |
| PREV-02 | Phase 2 | Pending |
| PREV-02A | Phase 2 | Pending |
| PREV-03 | Phase 2 | Pending |
| RAG-01 | Phase 3 | Pending |
| RAG-02 | Phase 3 | Pending |
| RAG-03 | Phase 3 | Pending |
| GEN-01 | Phase 4 | Pending |
| GEN-02 | Phase 4 | Pending |
| GEN-03 | Phase 4 | Pending |
| GEN-04 | Phase 4 | Pending |
| REV-01 | Phase 5 | Pending |
| REV-02 | Phase 5 | Pending |
| REV-03 | Phase 5 | Pending |
| OUT-01 | Phase 5 | Pending |
| EDIT-01 | Phase 4 | Pending |
| EDIT-02 | Phase 4 | Pending |
| EDIT-03 | Phase 5 | Pending |
| EDIT-04 | Phase 6 | Pending |
| OUT-02 | Phase 6 | Pending |
| OUT-03 | Phase 6 | Pending |
| OUT-04 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 34 total
- Mapped to phases: 34
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-22*
*Last updated: 2026-03-22 after initial definition*
