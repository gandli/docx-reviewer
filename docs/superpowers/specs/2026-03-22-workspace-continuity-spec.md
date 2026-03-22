# 工作区接续与跨 Agent 连续性规范

**项目：** 浏览器本地离线商务文档智能处理系统  
**日期：** 2026-03-22  
**状态：** 已确认，可指导实现

## 1. 目标

确保用户在以下情况下仍能继续之前的工作：

- 主动暂停当前对话
- 浏览器或页面意外中断
- 关闭后再次打开
- 切换到其他 coding agent，例如 Claude Code

系统要恢复的是工作进度，而不是单纯恢复一串聊天记录。

## 2. 核心原则

### 2.1 接续单位是工作区

系统的连续性绑定到工作区。

工作区中应包含：

- 当前主文档
- 已导入资料
- 当前任务状态
- 最近修订记录
- 待处理建议
- 最近证据引用
- 结构化工作摘要

### 2.2 接续依赖结构化工作摘要

默认恢复对象不是完整消息历史，而是结构化摘要。

这样做的原因：

- 更稳
- 更容易跨 agent 传递
- 不受某个聊天线程生命周期限制
- 更适合后续自动恢复

### 2.3 Agent 可以替换

系统不要求接续者与前一个 agent 相同。

只要工作区摘要和当前状态完整，新的 agent 就应能继续工作。

## 3. 需要持久化的最小信息

### 3.1 工作区级

- `workspaceId`
- `workspaceTitle`
- `lastActiveAt`
- `lastActiveAgent`
- `currentTaskType`
- `currentTaskStatus`

### 3.2 文档级

- `activeDocumentId`
- `activeNodeId`
- `activePreviewAnchor`
- `selectedIssueId`
- `pendingRevisionIds`

### 3.3 摘要级

- `sessionSummary`
- `latestUserIntent`
- `latestAgentConclusion`
- `nextRecommendedAction`
- `openQuestions`

### 3.4 证据级

- `recentEvidenceRefs`
- `recentSourceFiles`

## 4. 工作区摘要结构

建议维护一份结构化摘要对象：

```ts
type WorkspaceContinuationSummary = {
  workspaceId: string;
  activeDocumentId: string;
  activeNodeId?: string;
  currentTask: "generate" | "review" | "revise" | "optimize";
  lastUserIntent: string;
  latestConclusion: string;
  nextAction: string;
  openQuestions: string[];
  pendingSuggestionIds: string[];
  recentEvidenceRefs: string[];
  updatedAt: string;
  lastAgent: string;
};
```

## 5. UI 表现

### 5.1 左栏恢复入口

左栏应提供：

- “继续上次工作”卡片
- 上次任务名称
- 最近更新时间
- 最近处理的节点或条款

目标是让用户一进来就知道接着做什么。

### 5.2 右栏上下文说明

右栏顶部应显示：

- 当前上下文
- 当前任务
- 已继承工作区摘要

这会让用户知道当前 agent 不是从零开始。

### 5.3 中栏恢复位置

恢复后中栏应尽量回到：

- 上次查看的文档
- 上次选中的条款
- 上次对应的高亮或问题位置

## 6. 恢复流程

```text
打开工作区
-> 读取工作区摘要
-> 恢复主文档与当前节点
-> 恢复待处理建议
-> 在左栏显示“继续上次工作”
-> 在右栏提示已恢复的上下文
-> 用户继续处理
```

## 7. 与消息历史的关系

完整消息历史不是主恢复对象，但可以作为补充资料。

推荐策略：

- 主恢复对象：结构化工作摘要
- 次级参考：近期关键消息摘录
- 不要求恢复所有长对话内容

## 8. 首版范围

首版必须支持：

- 同一工作区内恢复当前文档和当前任务
- 恢复最近一次结构化工作摘要
- 恢复待处理建议和当前选中位置
- 支持不同 agent 基于摘要继续工作

首版可以暂不追求：

- 完整消息逐条重建
- 多个并行对话线程管理
- 复杂的 agent 协作图

## 9. 验收标准

- 页面中断后重新进入，能看到“继续上次工作”
- 恢复后中栏回到上次文档位置
- 右栏显示当前上下文和下一步建议
- 换一个 agent 后，仍能继续原工作区任务
- 恢复效果依赖结构化摘要而不是完整消息历史
