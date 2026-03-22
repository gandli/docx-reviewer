import { createWorkspaceContextStore } from "@/features/workspace-context/store/workspace-context-store";
import { createMemoryWorkspaceSummaryRepository } from "@/services/persistence/repositories/workspace-summary-repository";
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
    expect(store.getState().summary?.workspaceTitle).toBe("企业文档工作区");
  });

  it("applies suggestion and focuses current selection", () => {
    const store = createWorkspaceContextStore();
    store.getState().setSummary(mockWorkspaceSummary);

    store.getState().applySuggestion();

    expect(store.getState().summary?.activeClauseText).toContain("分阶段支付");
    expect(store.getState().summary?.isSelectionFocused).toBe(true);
  });
});
