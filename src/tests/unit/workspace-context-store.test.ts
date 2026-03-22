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

  it("hydrates preview documents from repository", async () => {
    const repository = createMemoryWorkspaceSummaryRepository(mockWorkspaceSummary, {
      mode: "docx",
      source: new ArrayBuffer(8),
    });
    const store = createWorkspaceContextStore(repository);

    await store.getState().hydrate("ws-enterprise");

    expect(store.getState().previewDocument?.mode).toBe("docx");
    expect(store.getState().previewDocument?.source.byteLength).toBe(8);
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
    expect(store.getState().summary?.latestConclusion).toBe("可以直接选中内容开始处理，或在右侧输入你的要求。");
    expect(store.getState().summary?.assistantMessages).toHaveLength(0);
  });

  it("imports a pdf document into preview mode and resets the assistant thread", () => {
    const store = createWorkspaceContextStore();
    store.getState().setSummary(mockWorkspaceSummary);

    store.getState().importDocument(
      {
        mode: "pdf",
        title: "付款附件",
        blocks: [
          { id: "pdf-heading-1", kind: "heading", level: 2, pageNumber: 1, text: "第 1 页" },
          { id: "pdf-paragraph-1", kind: "paragraph", pageNumber: 1, text: "付款安排正文。" },
        ],
        activeClauseTitle: "第 1 页",
        activeClauseText: "付款安排正文。",
        pdfSource: "data:application/pdf;base64,ZmFrZQ==",
      },
      "付款附件.pdf",
    );

    expect(store.getState().summary?.activeDocumentMode).toBe("pdf");
    expect(store.getState().summary?.activeDocumentTitle).toBe("付款附件");
    expect(store.getState().summary?.activeSelectionBlockId).toBe("pdf-paragraph-1");
    expect(store.getState().summary?.assistantMessages).toHaveLength(0);
    expect(store.getState().previewDocument?.mode).toBe("pdf");
  });

  it("imports a docx document into preview mode", () => {
    const store = createWorkspaceContextStore();
    store.getState().setSummary(mockWorkspaceSummary);

    store.getState().importDocument(
      {
        mode: "docx",
        title: "制度范本",
        blocks: [
          { id: "heading-1", kind: "heading", level: 1, text: "制度范本" },
          { id: "paragraph-1", kind: "paragraph", text: "第一条 付款应以验收通过为前提。" },
        ],
        activeClauseTitle: "制度范本",
        activeClauseText: "第一条 付款应以验收通过为前提。",
        docxSource: new ArrayBuffer(12),
      },
      "制度范本.docx",
    );

    expect(store.getState().summary?.activeDocumentMode).toBe("docx");
    expect(store.getState().summary?.activeDocumentTitle).toBe("制度范本");
    expect(store.getState().previewDocument?.mode).toBe("docx");
  });

  it("switches the current context to selected text", () => {
    const store = createWorkspaceContextStore();
    store.getState().setSummary(mockWorkspaceSummary);

    store.getState().selectText({
      text: "验收通过后方可申请付款。",
      blockId: "paragraph-2",
    });

    expect(store.getState().summary?.activeClauseTitle).toBe("已选文本");
    expect(store.getState().summary?.activeClauseText).toBe("验收通过后方可申请付款。");
    expect(store.getState().summary?.activeSelectionBlockId).toBe("paragraph-2");
    expect(store.getState().summary?.latestConclusion).toContain("已切换到你刚刚选中的内容");
  });

  it("switches to review mode when selecting text with the review action", () => {
    const store = createWorkspaceContextStore();
    store.getState().setSummary(mockWorkspaceSummary);

    store.getState().selectText({
      text: "验收通过后方可申请付款。",
      blockId: "paragraph-2",
      intent: "review",
    });

    expect(store.getState().summary?.currentTask).toBe("review");
    expect(store.getState().summary?.latestConclusion).toBe("已定位到你选中的内容，接下来我会先帮你找问题。");
    expect(store.getState().summary?.nextAction).toBe("开始找问题");
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

  it("restores persisted pdf preview sources from browser storage", async () => {
    window.localStorage.setItem(
      `workspace-state:${mockWorkspaceSummary.workspaceId}`,
      JSON.stringify({
        summary: mockWorkspaceSummary,
        previewDocument: {
          mode: "pdf",
          source: "data:application/pdf;base64,ZmFrZQ==",
        },
      }),
    );

    const repository = createBrowserWorkspaceSummaryRepository(mockWorkspaceSummary);
    const store = createWorkspaceContextStore(repository);

    await store.getState().hydrate(mockWorkspaceSummary.workspaceId);

    expect(store.getState().previewDocument).toEqual({
      mode: "pdf",
      source: "data:application/pdf;base64,ZmFrZQ==",
    });
  });

  it("restores persisted docx preview sources from browser storage", async () => {
    window.localStorage.setItem(
      `workspace-state:${mockWorkspaceSummary.workspaceId}`,
      JSON.stringify({
        summary: mockWorkspaceSummary,
        previewDocument: {
          mode: "docx",
          source: "AQIDBA==",
        },
      }),
    );

    const repository = createBrowserWorkspaceSummaryRepository(mockWorkspaceSummary);
    const store = createWorkspaceContextStore(repository);

    await store.getState().hydrate(mockWorkspaceSummary.workspaceId);

    expect(store.getState().previewDocument?.mode).toBe("docx");
    expect(Array.from(new Uint8Array(store.getState().previewDocument?.source ?? new ArrayBuffer(0)))).toEqual([
      1, 2, 3, 4,
    ]);
  });
});
