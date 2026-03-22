# 开发会话交接规范（内部）

**项目：** 浏览器本地离线商务文档智能处理系统  
**日期：** 2026-03-22  
**状态：** 内部开发约定

## 1. 目标

确保当前这次对话和开发进度在以下情况下仍能被其他 coding agent 接上：

- 主动暂停当前对话
- 当前会话意外中断
- 后续改由其他 coding agent 继续开发，例如 Claude Code

这里讨论的是开发交接，不是产品里给最终用户看的“工作区恢复”功能。

## 2. 核心原则

### 2.1 接续单位是当前开发任务

开发连续性绑定到当前开发任务和当前实现进度。

交接内容中应包含：

- 当前目标
- 已完成实现
- 正在处理的问题
- 下一步建议
- 关键文件
- 验证结果

### 2.2 接续依赖结构化开发摘要

默认交接对象不是完整消息历史，而是结构化开发摘要。

这样做的原因：

- 更稳
- 更容易在不同 coding agent 之间传递
- 不受某个聊天线程生命周期限制
- 更适合后续自动恢复

### 2.3 Agent 可以替换

不要求接续者与前一个 agent 相同。

只要开发摘要和当前状态完整，新的 agent 就应能继续工作。

## 3. 需要交接的最小信息

### 3.1 任务级

- `taskGoal`
- `currentPhase`
- `currentStatus`
- `lastUpdatedAt`
- `lastAgent`

### 3.2 实现级

- `filesTouched`
- `currentBehavior`
- `pendingIssues`
- `nextSuggestedStep`

### 3.3 验证级

- `testsRun`
- `buildStatus`
- `manualChecks`

## 4. 开发摘要结构

建议维护一份结构化摘要对象：

```ts
type AgentHandoffSummary = {
  taskGoal: string;
  currentStatus: string;
  filesTouched: string[];
  latestConclusion: string;
  nextAction: string;
  pendingIssues: string[];
  testsRun: string[];
  updatedAt: string;
  lastAgent: string;
};
```

## 5. 交接载体

推荐载体：

- `.planning/STATE.md`
- 设计稿和实现计划
- git 提交记录
- 当前工作区干净状态
- 当前 agent 的结构化 handoff

## 6. 交接流程

```text
读取当前 handoff
-> 查看最近提交和未提交状态
-> 阅读 STATE / 计划 / 关键设计稿
-> 确认已完成实现
-> 继续下一步开发
```

## 7. 与消息历史的关系

完整消息历史不是主交接对象，但可以作为补充参考。

推荐策略：

- 主交接对象：结构化开发摘要
- 次级参考：近期关键消息摘录
- 不要求恢复所有长对话内容

## 8. 验收标准

- 切换到其他 coding agent 后，能快速知道当前做到哪里
- 新 agent 不需要通读完整历史消息也能继续
- 交接信息能清楚说明：目标、现状、验证、下一步
- 这套交接机制不暴露为产品 UI 功能
