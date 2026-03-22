import { createWorkspaceContextStore } from "@/features/workspace-context/store/workspace-context-store";
import {
  createBrowserWorkspaceSummaryRepository,
  createMemoryWorkspaceSummaryRepository,
} from "@/services/persistence/repositories/workspace-summary-repository";
import { parsePlainTextDocument } from "@/services/import/plain-text-document";
import { mockWorkspaceSummary } from "@/shared/mocks/workspace-shell";

describe("workspace context store", () => {
  it("stores active document, node, and next action", () => {
    const store = createWorkspaceContextStore();
    store.getState().setSummary(mockWorkspaceSummary);

    expect(store.getState().summary?.activeDocumentId).toBe("doc-procurement-policy");
    expect(store.getState().summary?.nextAction).toBe("继续处理付款条款");
  });

  it("hydrates summary from repository", async () => {
    const repository = createMemoryWorkspaceSummaryRepository(mockWorkspaceSummary);
    const store = createWorkspaceContextStore(repository);

    await store.getState().hydrate("ws-enterprise");

    expect(store.getState().summary?.currentTask).toBe("revise");
    expect(store.getState().summary?.workspaceTitle).toBe("文档工作台");
  });

  it("applies suggestion and focuses current selection", () => {
    const store = createWorkspaceContextStore();
    store.getState().setSummary(mockWorkspaceSummary);

    store.getState().applySuggestion();

    expect(store.getState().summary?.activeClauseText).toContain("分阶段支付");
    expect(store.getState().summary?.isSelectionFocused).toBe(true);
  });

  it("appends user and assistant messages when sending a new prompt", () => {
    const store = createWorkspaceContextStore();
    store.getState().setSummary(mockWorkspaceSummary);

    store.getState().sendMessage("请改得更正式一些");

    expect(store.getState().summary?.assistantMessages.at(-2)?.content).toBe("请改得更正式一些");
    expect(store.getState().summary?.assistantMessages.at(-1)?.role).toBe("assistant");
    expect(store.getState().summary?.latestConclusion).toContain("已记录你的要求");
  });

  it("imports a plain text document and replaces the document body", () => {
    const store = createWorkspaceContextStore();
    store.getState().setSummary(mockWorkspaceSummary);

    const importedDocument = parsePlainTextDocument(
      "付款规范.md",
      "# 付款规范\n\n第一条 所有付款应以验收通过为前提。\n\n## 付款触发\n\n验收通过且发票齐全后，方可申请付款。",
    );

    store.getState().importDocument(importedDocument, "付款规范.md");

    expect(store.getState().summary?.activeDocumentTitle).toBe("付款规范");
    expect(store.getState().summary?.documentBlocks[0]?.text).toBe("付款规范");
    expect(store.getState().summary?.recentEvidenceRefs[0]).toBe("导入文件 · 付款规范.md");
    expect(store.getState().summary?.latestConclusion).toContain("已导入文档");
  });

  it("normalizes restored browser summaries to the current workspace title", async () => {
    window.localStorage.setItem(
      `workspace-summary:${mockWorkspaceSummary.workspaceId}`,
      JSON.stringify({
        ...mockWorkspaceSummary,
        workspaceTitle: "企业文档工作区",
      }),
    );

    const repository = createBrowserWorkspaceSummaryRepository(mockWorkspaceSummary);
    const store = createWorkspaceContextStore(repository);

    await store.getState().hydrate(mockWorkspaceSummary.workspaceId);

    expect(store.getState().summary?.workspaceTitle).toBe("文档工作台");
  });
});
