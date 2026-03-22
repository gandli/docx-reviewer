# Workspace Shell Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建企业文档工作台首版主界面，落地左栏资料区、中栏纸张文档区、右栏连续对话区，以及“工作区接续”能力。

**Architecture:** 采用固定三栏壳层 `workspace-shell` 承载页面结构，用 `editor-draft` 渲染主文档纸张画布，用 `workspace-context` 保存工作区级连续状态。UI 不直接依赖原聊天线程，而是通过结构化工作摘要恢复当前主文档、当前节点和待处理建议。

**Tech Stack:** React 19.2.4, Vite 8.0.1, TypeScript 5.9.3, Zustand 5.0.12, Dexie 4.3.0, Vitest 4.1.0, Playwright 1.58.2

---

## 文件结构

### 新建文件

- `src/app/App.tsx`：应用入口，挂载路由和全局 provider
- `src/app/main.tsx`：前端启动入口
- `src/app/router/index.tsx`：定义 `/workspace/:id` 路由
- `src/app/providers/theme-provider.tsx`：全局主题和暖中性色变量
- `src/app/providers/runtime-provider.tsx`：运行时上下文容器
- `src/features/workspace-shell/routes/workspace-page.tsx`：工作区页面入口
- `src/features/workspace-shell/components/workspace-layout.tsx`：三栏布局容器
- `src/features/workspace-shell/components/workspace-sidebar.tsx`：左栏资料区
- `src/features/workspace-shell/components/workspace-resume-card.tsx`：继续上次工作卡片
- `src/features/workspace-shell/components/workspace-asset-groups.tsx`：主文档 / 模板 / 参考资料 / 表格资料列表
- `src/features/workspace-shell/components/workspace-evidence-list.tsx`：最近证据列表
- `src/features/editor-draft/components/document-header.tsx`：中栏标题和状态
- `src/features/editor-draft/components/document-canvas.tsx`：纸张化文档画布
- `src/features/editor-draft/components/inline-selection-block.tsx`：选中条款高亮块
- `src/features/editor-draft/components/risk-marker.tsx`：风险标记组件
- `src/features/assistant-panel/components/assistant-panel.tsx`：右栏容器
- `src/features/assistant-panel/components/assistant-context-header.tsx`：上下文头部
- `src/features/assistant-panel/components/suggested-actions.tsx`：建议动作胶囊
- `src/features/assistant-panel/components/assistant-message-list.tsx`：连续对话消息区
- `src/features/assistant-panel/components/action-panel.tsx`：建议操作区
- `src/features/workspace-context/store/workspace-context-store.ts`：工作区连续状态 store
- `src/features/workspace-context/types/workspace-summary.ts`：结构化工作摘要类型
- `src/services/persistence/repositories/workspace-summary-repository.ts`：工作区摘要持久化接口
- `src/shared/constants/theme.ts`：暖中性色和纸张感变量
- `src/shared/mocks/workspace-shell.ts`：首版静态工作区样例数据
- `src/tests/unit/workspace-context-store.test.ts`：工作区接续状态测试
- `src/tests/unit/workspace-layout.test.tsx`：三栏和关键组件渲染测试
- `src/tests/e2e/workspace-shell.spec.ts`：工作状态和恢复状态 E2E

### 可能修改的文件

- `package.json`：补齐运行和测试脚本
- `bun.lock`：依赖锁文件
- `.planning/research/FRONTEND-STRUCTURE.md`：如实现路径与现设计完全一致，可不改；若实际路径微调，再回写

---

## Chunk 1: 项目骨架与主题底座

### Task 1: 初始化前端入口和基础依赖

**Files:**
- Create: `src/app/App.tsx`
- Create: `src/app/main.tsx`
- Create: `src/app/router/index.tsx`
- Modify: `package.json`

- [ ] **Step 1: 写最小渲染测试**

```tsx
import { render, screen } from "@testing-library/react";
import { App } from "@/app/App";

it("renders workspace route shell", () => {
  render(<App />);
  expect(screen.getByText("企业文档工作区")).toBeInTheDocument();
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `bun test src/tests/unit/workspace-layout.test.tsx`
Expected: FAIL，提示 `App` 或路由组件不存在

- [ ] **Step 3: 写最小应用入口**

```tsx
export function App() {
  return <div>企业文档工作区</div>;
}
```

- [ ] **Step 4: 再跑测试确认通过**

Run: `bun test src/tests/unit/workspace-layout.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add package.json src/app src/tests/unit/workspace-layout.test.tsx
git commit -m "feat: add app entry for workspace shell"
```

### Task 2: 落地暖中性色主题变量

**Files:**
- Create: `src/app/providers/theme-provider.tsx`
- Create: `src/shared/constants/theme.ts`
- Modify: `src/app/App.tsx`

- [ ] **Step 1: 写主题变量测试**

```ts
import { themeTokens } from "@/shared/constants/theme";

it("defines warm neutral workspace palette", () => {
  expect(themeTokens.surface.paper).toBeTruthy();
  expect(themeTokens.surface.sidebar).toBeTruthy();
  expect(themeTokens.text.primary).toBeTruthy();
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `bun test src/tests/unit/workspace-layout.test.tsx`
Expected: FAIL，提示找不到 `themeTokens`

- [ ] **Step 3: 写最小主题常量和 provider**

```ts
export const themeTokens = {
  surface: { paper: "#FBF8F2", sidebar: "#EFE7DA" },
  text: { primary: "#1F1A14", muted: "#6D6457" },
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `bun test src/tests/unit/workspace-layout.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/app/providers/theme-provider.tsx src/shared/constants/theme.ts src/app/App.tsx
git commit -m "feat: add workspace theme tokens"
```

---

## Chunk 2: 三栏壳层与工作状态

### Task 3: 搭建三栏布局骨架

**Files:**
- Create: `src/features/workspace-shell/routes/workspace-page.tsx`
- Create: `src/features/workspace-shell/components/workspace-layout.tsx`
- Create: `src/shared/mocks/workspace-shell.ts`
- Test: `src/tests/unit/workspace-layout.test.tsx`

- [ ] **Step 1: 写三栏渲染测试**

```tsx
it("renders sidebar, document area, and assistant panel", () => {
  render(<WorkspacePage />);
  expect(screen.getByTestId("workspace-sidebar")).toBeInTheDocument();
  expect(screen.getByTestId("document-canvas")).toBeInTheDocument();
  expect(screen.getByTestId("assistant-panel")).toBeInTheDocument();
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `bun test src/tests/unit/workspace-layout.test.tsx`
Expected: FAIL，提示 `WorkspacePage` 不存在

- [ ] **Step 3: 写最小三栏布局**

```tsx
export function WorkspaceLayout() {
  return (
    <div className="workspace-layout">
      <aside data-testid="workspace-sidebar" />
      <main data-testid="document-canvas" />
      <section data-testid="assistant-panel" />
    </div>
  );
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `bun test src/tests/unit/workspace-layout.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/features/workspace-shell src/shared/mocks/workspace-shell.ts src/tests/unit/workspace-layout.test.tsx
git commit -m "feat: add workspace three-column layout"
```

### Task 4: 完成左栏“安静资料柜”

**Files:**
- Create: `src/features/workspace-shell/components/workspace-sidebar.tsx`
- Create: `src/features/workspace-shell/components/workspace-asset-groups.tsx`
- Create: `src/features/workspace-shell/components/workspace-evidence-list.tsx`
- Modify: `src/features/workspace-shell/components/workspace-layout.tsx`

- [ ] **Step 1: 写左栏内容测试**

```tsx
it("shows asset groups and recent evidence", () => {
  render(<WorkspaceSidebar />);
  expect(screen.getByText("主文档")).toBeInTheDocument();
  expect(screen.getByText("参考资料")).toBeInTheDocument();
  expect(screen.getByText("最近引用")).toBeInTheDocument();
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `bun test src/tests/unit/workspace-layout.test.tsx`
Expected: FAIL

- [ ] **Step 3: 写最小左栏组件**

```tsx
export function WorkspaceSidebar() {
  return (
    <aside data-testid="workspace-sidebar">
      <h2>企业文档工作区</h2>
      <div>主文档</div>
      <div>模板</div>
      <div>参考资料</div>
      <div>表格资料</div>
      <div>最近引用</div>
    </aside>
  );
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `bun test src/tests/unit/workspace-layout.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/features/workspace-shell/components src/tests/unit/workspace-layout.test.tsx
git commit -m "feat: add quiet workspace sidebar"
```

### Task 5: 完成中栏纸张文档区

**Files:**
- Create: `src/features/editor-draft/components/document-header.tsx`
- Create: `src/features/editor-draft/components/document-canvas.tsx`
- Create: `src/features/editor-draft/components/inline-selection-block.tsx`
- Create: `src/features/editor-draft/components/risk-marker.tsx`
- Modify: `src/features/workspace-shell/components/workspace-layout.tsx`

- [ ] **Step 1: 写文档区测试**

```tsx
it("renders document header and selected clause block", () => {
  render(<DocumentCanvas />);
  expect(screen.getByText("采购与付款管理制度")).toBeInTheDocument();
  expect(screen.getByText("当前选中条款")).toBeInTheDocument();
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `bun test src/tests/unit/workspace-layout.test.tsx`
Expected: FAIL

- [ ] **Step 3: 写最小纸张文档组件**

```tsx
export function DocumentCanvas() {
  return (
    <section data-testid="document-canvas">
      <h1>采购与付款管理制度</h1>
      <div>当前选中条款</div>
    </section>
  );
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `bun test src/tests/unit/workspace-layout.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/features/editor-draft src/tests/unit/workspace-layout.test.tsx
git commit -m "feat: add document canvas and selection state"
```

### Task 6: 完成右栏连续对话区

**Files:**
- Create: `src/features/assistant-panel/components/assistant-panel.tsx`
- Create: `src/features/assistant-panel/components/assistant-context-header.tsx`
- Create: `src/features/assistant-panel/components/suggested-actions.tsx`
- Create: `src/features/assistant-panel/components/assistant-message-list.tsx`
- Create: `src/features/assistant-panel/components/action-panel.tsx`
- Modify: `src/features/workspace-shell/components/workspace-layout.tsx`

- [ ] **Step 1: 写右栏测试**

```tsx
it("renders continuous assistant with suggested actions", () => {
  render(<AssistantPanel />);
  expect(screen.getByText("修订")).toBeInTheDocument();
  expect(screen.getByText("接受建议")).toBeInTheDocument();
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `bun test src/tests/unit/workspace-layout.test.tsx`
Expected: FAIL

- [ ] **Step 3: 写最小右栏组件**

```tsx
export function AssistantPanel() {
  return (
    <section data-testid="assistant-panel">
      <div>生成</div>
      <div>审阅</div>
      <div>修订</div>
      <div>优化</div>
      <button>接受建议</button>
    </section>
  );
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `bun test src/tests/unit/workspace-layout.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/features/assistant-panel src/tests/unit/workspace-layout.test.tsx
git commit -m "feat: add continuous assistant panel"
```

---

## Chunk 3: 工作区接续与跨 Agent 恢复

### Task 7: 建立工作区摘要类型和 store

**Files:**
- Create: `src/features/workspace-context/types/workspace-summary.ts`
- Create: `src/features/workspace-context/store/workspace-context-store.ts`
- Test: `src/tests/unit/workspace-context-store.test.ts`

- [ ] **Step 1: 写 store 测试**

```ts
it("stores active document, node, and next action", () => {
  const store = createWorkspaceContextStore();
  store.setSummary({
    workspaceId: "ws-1",
    activeDocumentId: "doc-1",
    currentTask: "revise",
    nextAction: "继续处理付款条款",
  });
  expect(store.getState().summary?.activeDocumentId).toBe("doc-1");
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `bun test src/tests/unit/workspace-context-store.test.ts`
Expected: FAIL

- [ ] **Step 3: 写最小摘要类型和 store**

```ts
export type WorkspaceSummary = {
  workspaceId: string;
  activeDocumentId: string;
  currentTask: "generate" | "review" | "revise" | "optimize";
  nextAction: string;
};
```

- [ ] **Step 4: 跑测试确认通过**

Run: `bun test src/tests/unit/workspace-context-store.test.ts`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/features/workspace-context src/tests/unit/workspace-context-store.test.ts
git commit -m "feat: add workspace continuity store"
```

### Task 8: 建立工作区摘要仓储

**Files:**
- Create: `src/services/persistence/repositories/workspace-summary-repository.ts`
- Modify: `src/features/workspace-context/store/workspace-context-store.ts`
- Test: `src/tests/unit/workspace-context-store.test.ts`

- [ ] **Step 1: 写持久化测试**

```ts
it("hydrates summary from repository", async () => {
  const repo = createMemoryWorkspaceSummaryRepository();
  await repo.save({ workspaceId: "ws-1", activeDocumentId: "doc-1", currentTask: "review", nextAction: "继续审阅" });
  const summary = await repo.load("ws-1");
  expect(summary?.currentTask).toBe("review");
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `bun test src/tests/unit/workspace-context-store.test.ts`
Expected: FAIL

- [ ] **Step 3: 写最小仓储接口和内存实现**

```ts
export interface WorkspaceSummaryRepository {
  load(workspaceId: string): Promise<WorkspaceSummary | undefined>;
  save(summary: WorkspaceSummary): Promise<void>;
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `bun test src/tests/unit/workspace-context-store.test.ts`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/services/persistence/repositories/workspace-summary-repository.ts src/features/workspace-context/store/workspace-context-store.ts src/tests/unit/workspace-context-store.test.ts
git commit -m "feat: add workspace summary repository"
```

### Task 9: 把“继续上次工作”接入左栏

**Files:**
- Create: `src/features/workspace-shell/components/workspace-resume-card.tsx`
- Modify: `src/features/workspace-shell/components/workspace-sidebar.tsx`
- Modify: `src/features/assistant-panel/components/assistant-context-header.tsx`
- Test: `src/tests/unit/workspace-layout.test.tsx`

- [ ] **Step 1: 写恢复 UI 测试**

```tsx
it("shows resume card and inherited summary state", () => {
  render(<WorkspacePage />);
  expect(screen.getByText("继续上次工作")).toBeInTheDocument();
  expect(screen.getByText("已继承工作区摘要")).toBeInTheDocument();
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `bun test src/tests/unit/workspace-layout.test.tsx`
Expected: FAIL

- [ ] **Step 3: 写最小恢复 UI**

```tsx
export function WorkspaceResumeCard() {
  return <div>继续上次工作</div>;
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `bun test src/tests/unit/workspace-layout.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/features/workspace-shell/components/workspace-resume-card.tsx src/features/workspace-shell/components/workspace-sidebar.tsx src/features/assistant-panel/components/assistant-context-header.tsx src/tests/unit/workspace-layout.test.tsx
git commit -m "feat: surface workspace resume state in UI"
```

---

## Chunk 4: 验证与收尾

### Task 10: 补完整体渲染和恢复流程 E2E

**Files:**
- Create: `src/tests/e2e/workspace-shell.spec.ts`

- [ ] **Step 1: 写 E2E 用例**

```ts
test("restores workspace summary and keeps document-centered layout", async ({ page }) => {
  await page.goto("/workspace/ws-1");
  await expect(page.getByText("继续上次工作")).toBeVisible();
  await expect(page.getByText("采购与付款管理制度")).toBeVisible();
  await expect(page.getByText("接受建议")).toBeVisible();
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `bunx playwright test src/tests/e2e/workspace-shell.spec.ts`
Expected: FAIL

- [ ] **Step 3: 补最小实现缺口直到通过**

```text
只补足测试真正缺的结构和数据，不追加未验证的新功能。
```

- [ ] **Step 4: 跑测试确认通过**

Run: `bunx playwright test src/tests/e2e/workspace-shell.spec.ts`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/tests/e2e/workspace-shell.spec.ts src
git commit -m "test: verify workspace shell continuity flow"
```

### Task 11: 验证全量测试并回写文档

**Files:**
- Modify: `docs/superpowers/specs/2026-03-22-main-workspace-ui-design.md`（如实际路径或命名微调）
- Modify: `docs/superpowers/specs/2026-03-22-workspace-component-spec.md`（如实现与规范有差异）

- [ ] **Step 1: 跑全部单测**

Run: `bun test`
Expected: PASS

- [ ] **Step 2: 跑工作区 E2E**

Run: `bunx playwright test`
Expected: PASS

- [ ] **Step 3: 检查视觉和交互**

Run: `bun run dev`
Expected: 能看到左安静、中纸张、右连续对话的主工作区，并能显示“继续上次工作”

- [ ] **Step 4: 如实现与规范有差异，更新文档**

```text
只回写真实变化，不重写整份设计稿。
```

- [ ] **Step 5: 提交**

```bash
git add docs src
git commit -m "docs: align workspace implementation with specs"
```

---

Plan complete and saved to `docs/superpowers/plans/2026-03-22-workspace-shell-implementation.md`. Ready to execute?
