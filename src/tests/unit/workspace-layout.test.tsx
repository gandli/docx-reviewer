import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { App } from "@/app/App";
import { WorkspacePage } from "@/features/workspace-shell/routes/workspace-page";
import { themeTokens } from "@/shared/constants/theme";
import { mockWorkspaceSummary } from "@/shared/mocks/workspace-shell";

const { parsePdfDocumentMock } = vi.hoisted(() => ({
  parsePdfDocumentMock: vi.fn(),
}));
const { parseDocxDocumentMock, renderDocxPreviewMock } = vi.hoisted(() => ({
  parseDocxDocumentMock: vi.fn(),
  renderDocxPreviewMock: vi.fn((_: ArrayBuffer, container: HTMLElement) => {
    container.innerHTML =
      '<article data-testid="docx-preview-article"><p><span data-testid="docx-preview-text">第一条 付款应以验收通过为前提。</span></p></article>';
    return Promise.resolve();
  }),
}));
const {
  ensureLocalLLMMock,
  runLocalLLMTaskMock,
  isLocalLLMSupportedMock,
  getLocalLLMModelIdMock,
  getLoadedLocalLLMModelIdMock,
  getDefaultLocalLLMModelIdMock,
  getAvailableLocalLLMModelsMock,
  loadSelectedLocalLLMModelIdMock,
  saveSelectedLocalLLMModelIdMock,
} = vi.hoisted(() => ({
  ensureLocalLLMMock: vi.fn(() => Promise.resolve()),
  runLocalLLMTaskMock: vi.fn(async ({ action }: { action: string }) => {
    if (action === "review") {
      return "问题：付款条件不明确。 原因：没有写清触发条件。 建议：补充验收与发票条件。";
    }

    if (action === "revise") {
      return "付款应在验收通过且发票齐全后，按约定节点分阶段支付。";
    }

    if (action === "polish") {
      return "建议在验收通过并完成票据核验后，按约定节点安排付款。";
    }

    return "这是本地模型返回的真实回复。";
  }),
  isLocalLLMSupportedMock: vi.fn(() => true),
  getLocalLLMModelIdMock: vi.fn(() => "Qwen3-0.6B-q4f16_1-MLC"),
  getLoadedLocalLLMModelIdMock: vi.fn(() => undefined),
  getDefaultLocalLLMModelIdMock: vi.fn(() => "Qwen2.5-1.5B-Instruct-q4f16_1-MLC"),
  getAvailableLocalLLMModelsMock: vi.fn(() => [
    {
      id: "Qwen3-0.6B-q4f16_1-MLC",
      label: "Qwen3 0.6B",
      summary: "更轻，启动更快",
      tags: ["中文", "轻量"],
    },
    {
      id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
      label: "Qwen2.5 1.5B",
      summary: "中文审阅更稳",
      tags: ["中文", "审阅"],
    },
  ]),
  loadSelectedLocalLLMModelIdMock: vi.fn(() => "Qwen3-0.6B-q4f16_1-MLC"),
  saveSelectedLocalLLMModelIdMock: vi.fn(),
}));

vi.mock("@/services/import/pdf-document", () => ({
  parsePdfDocument: parsePdfDocumentMock,
}));

vi.mock("@/services/import/docx-document", () => ({
  parseDocxDocument: parseDocxDocumentMock,
}));

vi.mock("docx-preview", () => ({
  renderAsync: renderDocxPreviewMock,
}));

vi.mock("@/services/ai/local-llm", () => ({
  ensureLocalLLM: ensureLocalLLMMock,
  runLocalLLMTask: runLocalLLMTaskMock,
  isLocalLLMSupported: isLocalLLMSupportedMock,
  getLocalLLMModelId: getLocalLLMModelIdMock,
  getLoadedLocalLLMModelId: getLoadedLocalLLMModelIdMock,
  getDefaultLocalLLMModelId: getDefaultLocalLLMModelIdMock,
  getAvailableLocalLLMModels: getAvailableLocalLLMModelsMock,
  loadSelectedLocalLLMModelId: loadSelectedLocalLLMModelIdMock,
  saveSelectedLocalLLMModelId: saveSelectedLocalLLMModelIdMock,
}));

vi.mock("react-pdf", async () => {
  const React = await import("react");

  return {
    pdfjs: {
      GlobalWorkerOptions: {},
    },
    Document: ({
      children,
      onLoadSuccess,
      loading,
      file,
    }: {
      children?: React.ReactNode;
      onLoadSuccess?: ({ numPages }: { numPages: number }) => void;
      loading?: React.ReactNode;
      file?: string;
    }) => {
      React.useEffect(() => {
        if (file) {
          onLoadSuccess?.({ numPages: 2 });
        }
      }, [file, onLoadSuccess]);

      if (!file) {
        return <>{loading}</>;
      }

      return <div data-testid="pdf-document">{children}</div>;
    },
    Page: ({ pageNumber }: { pageNumber: number }) => (
      <div data-testid={`pdf-page-${pageNumber}`}>
        <span data-testid={`pdf-page-text-${pageNumber}`}>PDF Page {pageNumber} 正文</span>
      </div>
    ),
  };
});

describe("workspace shell", () => {
  const scrollIntoViewMock = vi.fn();
  const getActiveClauseHeading = () =>
    screen
      .getAllByText("付款方式")
      .find((element) => element.getAttribute("data-active") === "true");

  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    parsePdfDocumentMock.mockReset();
    parseDocxDocumentMock.mockReset();
    renderDocxPreviewMock.mockClear();
    ensureLocalLLMMock.mockClear();
    runLocalLLMTaskMock.mockClear();
    isLocalLLMSupportedMock.mockClear();
    isLocalLLMSupportedMock.mockReturnValue(true);
    getLocalLLMModelIdMock.mockClear();
    getLocalLLMModelIdMock.mockReturnValue("Qwen3-0.6B-q4f16_1-MLC");
    getLoadedLocalLLMModelIdMock.mockClear();
    getLoadedLocalLLMModelIdMock.mockReturnValue(undefined);
    getDefaultLocalLLMModelIdMock.mockClear();
    getDefaultLocalLLMModelIdMock.mockReturnValue("Qwen2.5-1.5B-Instruct-q4f16_1-MLC");
    getAvailableLocalLLMModelsMock.mockClear();
    loadSelectedLocalLLMModelIdMock.mockClear();
    loadSelectedLocalLLMModelIdMock.mockReturnValue("Qwen3-0.6B-q4f16_1-MLC");
    saveSelectedLocalLLMModelIdMock.mockClear();
    scrollIntoViewMock.mockReset();
    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoViewMock,
    });
    Object.defineProperty(globalThis, "ResizeObserver", {
      configurable: true,
      writable: true,
      value: class {
        observe() {}
        disconnect() {}
      },
    });
  });

  it("defines warm neutral workspace palette", () => {
    expect(themeTokens.surface.paper).toBeTruthy();
    expect(themeTokens.surface.sidebar).toBeTruthy();
    expect(themeTokens.text.primary).toBeTruthy();
  });

  it("renders workspace route shell from app", () => {
    window.history.pushState({}, "", "/workspace/ws-enterprise");
    render(<App />);
    expect(screen.getAllByText("文档工作台").length).toBeGreaterThan(0);
  });

  it("renders sidebar, document area, and assistant panel", () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("workspace-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("document-canvas")).toBeInTheDocument();
    expect(screen.getByTestId("assistant-panel")).toBeInTheDocument();
  });

  it("shows asset groups, recent evidence, and resume state", () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );
    expect(screen.getByText("主文档")).toBeInTheDocument();
    expect(screen.getByText("参考资料")).toBeInTheDocument();
    expect(screen.getByText("最近引用")).toBeInTheDocument();
    expect(screen.getAllByText("采购与付款管理制度").length).toBeGreaterThan(0);
    expect(screen.getByText("文档")).toBeInTheDocument();
    expect(screen.getByText("2 分钟前")).toBeInTheDocument();
    expect(screen.getByText("当前上下文")).toBeInTheDocument();
    expect(screen.getAllByText("付款方式").length).toBeGreaterThan(0);
  });

  it("collapses and expands asset groups", () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    expect(screen.queryByText("付款节点说明")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /参考资料/ }));
    expect(screen.getByText("付款节点说明")).toBeInTheDocument();
    expect(screen.getAllByText("资料").length).toBeGreaterThan(0);
    expect(screen.getByText("今天 09:15")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /参考资料/ }));
    expect(screen.queryByText("付款节点说明")).not.toBeInTheDocument();
  });

  it("collapses and expands both side panels", () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "收起左栏" }));
    expect(screen.queryByText("Workspace")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "展开左栏" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "收起右栏" }));
    expect(screen.queryByText("Assistant")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "展开右栏" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "展开左栏" }));
    fireEvent.click(screen.getByRole("button", { name: "展开右栏" }));

    expect(screen.getByText("Workspace")).toBeInTheDocument();
    expect(screen.getByText("Assistant")).toBeInTheDocument();
  });

  it("renders document header, highlighted active clause, and local model controls", () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );
    expect(screen.getAllByText("采购与付款管理制度").length).toBeGreaterThan(0);
    expect(screen.getByText("阅读视图")).toBeInTheDocument();
    expect(screen.getByText("可编辑")).toBeInTheDocument();
    expect(screen.getByText(/尚未加载/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "模型设置" })).toBeInTheDocument();
    expect(getActiveClauseHeading()).toHaveAttribute("data-active", "true");
  });

  it("opens model settings, filters models, and persists selected model", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "模型设置" }));

    expect(screen.getByText("本地模型设置")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("搜索模型"), {
      target: { value: "1.5B" },
    });

    expect(screen.queryByText("Qwen3 0.6B")).not.toBeInTheDocument();
    expect(screen.getByText("Qwen2.5 1.5B")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Qwen2.5 1.5B"));
    fireEvent.click(screen.getByRole("button", { name: "保存并启用" }));

    await waitFor(() => {
      expect(saveSelectedLocalLLMModelIdMock).toHaveBeenCalledWith(
        "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
      );
      expect(ensureLocalLLMMock).toHaveBeenCalled();
    });
  });

  it("restores a saved workspace summary from local storage", async () => {
    const restoredSummary = {
      ...mockWorkspaceSummary,
      activeClauseText: "付款分三期执行，验收通过后支付尾款。",
      latestConclusion: "已从本地恢复付款条款修订结果。",
      documentBlocks: mockWorkspaceSummary.documentBlocks.map((block) =>
        block.text === mockWorkspaceSummary.activeClauseText
          ? {
              ...block,
              text: "付款分三期执行，验收通过后支付尾款。",
            }
          : block,
      ),
    };
    window.localStorage.setItem(
      `workspace-summary:${mockWorkspaceSummary.workspaceId}`,
      JSON.stringify(restoredSummary),
    );

    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("付款分三期执行，验收通过后支付尾款。")).toBeInTheDocument();
    expect(await screen.findByText(/已从本地恢复付款条款修订结果/)).toBeInTheDocument();
  });

  it("sends a chat message and appends it to the assistant thread", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("继续输入你的要求，或让助手基于当前条款继续处理"), {
      target: { value: "请把语气改得更正式" },
    });
    fireEvent.click(screen.getByRole("button", { name: "发送" }));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("继续输入你的要求，或让助手基于当前条款继续处理"),
      ).toHaveValue("");
      expect(screen.getByText("请把语气改得更正式")).toBeInTheDocument();
      expect(screen.getAllByText("这是本地模型返回的真实回复。").length).toBeGreaterThan(0);
      expect(ensureLocalLLMMock).toHaveBeenCalled();
      expect(runLocalLLMTaskMock).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "chat",
          userMessage: "请把语气改得更正式",
        }),
      );
    });
  });

  it("scrolls to the latest assistant message after sending", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    scrollIntoViewMock.mockClear();

    fireEvent.change(screen.getByPlaceholderText("继续输入你的要求，或让助手基于当前条款继续处理"), {
      target: { value: "继续补充付款触发条件" },
    });
    fireEvent.click(screen.getByRole("button", { name: "发送" }));

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalled();
    });
  });

  it("imports a markdown file and switches the center panel to plain preview mode", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    const file = new File(
      ["# 差旅报销制度\n\n所有报销申请应附完整票据。\n\n## 报销时限\n\n出差结束后 10 个工作日内提交。"],
      "差旅报销制度.md",
      { type: "text/markdown" },
    );

    fireEvent.change(screen.getByTestId("workspace-import-input"), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getAllByText("差旅报销制度").length).toBeGreaterThan(0);
      expect(screen.getAllByText("原样预览").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Markdown 原样预览").length).toBeGreaterThan(0);
      expect(screen.queryByText("阅读视图")).not.toBeInTheDocument();
      expect(screen.queryByText("可编辑")).not.toBeInTheDocument();
      expect(screen.getAllByText("所有报销申请应附完整票据。").length).toBeGreaterThan(0);
      expect(screen.getByText("导入文件 · 差旅报销制度.md")).toBeInTheDocument();
      expect(screen.getByText("可以直接选中内容开始处理，或在右侧输入你的要求。")).toBeInTheDocument();
      expect(screen.getByTestId("document-canvas")).toHaveClass("bg-white");
    });

    expect(screen.queryByText("继续优化付款条款，降低履约争议。")).not.toBeInTheDocument();
  });

  it("imports a txt file and shows text preview mode", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    const file = new File(
      ["办公用品领用规则\n\n员工领用办公用品时，应按月登记并说明用途。"],
      "办公用品领用规则.txt",
      { type: "text/plain" },
    );

    fireEvent.change(screen.getByTestId("workspace-import-input"), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getAllByText("办公用品领用规则").length).toBeGreaterThan(0);
      expect(screen.getAllByText("原样预览").length).toBeGreaterThan(0);
      expect(screen.getAllByText("文本原样预览").length).toBeGreaterThan(0);
      expect(screen.getAllByText("员工领用办公用品时，应按月登记并说明用途。").length).toBeGreaterThan(0);
    });
  });

  it("imports a docx file and renders the original-style preview", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    parseDocxDocumentMock.mockResolvedValue({
      mode: "docx",
      title: "制度范本",
      blocks: [
        { id: "heading-1", kind: "heading", level: 1, text: "制度范本" },
        { id: "paragraph-1", kind: "paragraph", text: "第一条 付款应以验收通过为前提。" },
      ],
      activeClauseTitle: "制度范本",
      activeClauseText: "第一条 付款应以验收通过为前提。",
      docxSource: new ArrayBuffer(16),
    });

    fireEvent.change(screen.getByTestId("workspace-import-input"), {
      target: {
        files: [
          new File(["fake"], "制度范本.docx", {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          }),
        ],
      },
    });

    await waitFor(() => {
      expect(parseDocxDocumentMock).toHaveBeenCalled();
      expect(screen.getByText("原样预览")).toBeInTheDocument();
      expect(screen.getByTestId("docx-document-viewer")).toBeInTheDocument();
      expect(renderDocxPreviewMock).toHaveBeenCalled();
      expect(screen.getByTestId("docx-preview-text")).toBeInTheDocument();
      expect(screen.getByText(/已载入《制度范本》的原样排版预览/)).toBeInTheDocument();
    });
  });

  it("restores the docx original preview after a page refresh", async () => {
    const restoredBuffer = new Uint8Array([1, 2, 3, 4]).buffer;
    window.localStorage.setItem(
      `workspace-state:${mockWorkspaceSummary.workspaceId}`,
      JSON.stringify({
        summary: {
          ...mockWorkspaceSummary,
          activeDocumentMode: "docx",
          activeDocumentTitle: "制度范本",
        },
        previewDocument: {
          mode: "docx",
          source: "AQIDBA==",
        },
      }),
    );

    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("docx-document-viewer")).toBeInTheDocument();
      expect(screen.queryByText("Word 预览需要重新导入原文件")).not.toBeInTheDocument();
      expect(renderDocxPreviewMock).toHaveBeenCalledWith(
        restoredBuffer,
        expect.any(HTMLElement),
        undefined,
        expect.any(Object),
      );
    });
  });

  it("shows an action popover after selecting text inside the docx preview", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    parseDocxDocumentMock.mockResolvedValue({
      mode: "docx",
      title: "制度范本",
      blocks: [
        { id: "heading-1", kind: "heading", level: 1, text: "制度范本" },
        { id: "paragraph-1", kind: "paragraph", text: "第一条 付款应以验收通过为前提。" },
      ],
      activeClauseTitle: "制度范本",
      activeClauseText: "第一条 付款应以验收通过为前提。",
      docxSource: new ArrayBuffer(16),
    });

    fireEvent.change(screen.getByTestId("workspace-import-input"), {
      target: {
        files: [
          new File(["fake"], "制度范本.docx", {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          }),
        ],
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId("docx-preview-text")).toBeInTheDocument();
    });

    const previewText = screen.getByTestId("docx-preview-text");
    const textNode = previewText.firstChild;
    const selectionMock = {
      toString: () => "付款应以验收通过为前提",
      rangeCount: 1,
      getRangeAt: () =>
        ({
          commonAncestorContainer: textNode,
          getBoundingClientRect: () => ({
            top: 180,
            left: 340,
            width: 120,
            height: 18,
            right: 460,
            bottom: 198,
            x: 340,
            y: 180,
            toJSON: () => ({}),
          }),
        }) as Range,
      removeAllRanges: vi.fn(),
    };

    vi.spyOn(window, "getSelection").mockReturnValue(selectionMock as unknown as Selection);

    fireEvent.mouseUp(screen.getByTestId("docx-document-viewer"));

    await waitFor(() => {
      expect(screen.getByTestId("docx-selection-popover")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "直接改写" }));

    await waitFor(() => {
      expect(within(screen.getByTestId("assistant-panel")).getByText("已选文本")).toBeInTheDocument();
      expect(screen.getByText("已定位到你选中的内容，接下来我会直接帮你改写。")).toBeInTheDocument();
      expect(screen.queryByTestId("docx-selection-popover")).not.toBeInTheDocument();
    });
  });

  it("imports a pdf file and switches the center panel to preview mode", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    parsePdfDocumentMock.mockResolvedValue({
      mode: "pdf",
      title: "制度附件",
      blocks: [
        { id: "pdf-heading-1", kind: "heading", level: 2, pageNumber: 1, text: "第 1 页" },
        {
          id: "pdf-paragraph-1",
          kind: "paragraph",
          pageNumber: 1,
          text: "付款安排应以验收和发票齐备为支付前提。",
        },
        { id: "pdf-heading-2", kind: "heading", level: 2, pageNumber: 2, text: "第 2 页" },
        {
          id: "pdf-paragraph-2",
          kind: "paragraph",
          pageNumber: 2,
          text: "违约责任应与付款节点保持一致。",
        },
      ],
      activeClauseTitle: "第 1 页",
      activeClauseText: "付款安排应以验收和发票齐备为支付前提。",
      pdfSource: "data:application/pdf;base64,ZmFrZQ==",
    });

    const file = new File(["%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"], "制度附件.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(screen.getByTestId("workspace-import-input"), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getAllByText("制度附件").length).toBeGreaterThan(0);
      expect(screen.getByText("原样预览")).toBeInTheDocument();
      expect(screen.getByText("PDF 原样预览 · 共 2 页")).toBeInTheDocument();
      expect(screen.getByTestId("pdf-page-1")).toBeInTheDocument();
      expect(within(screen.getByTestId("assistant-panel")).getByText("第 1 页")).toBeInTheDocument();
      expect(screen.getByText("导入文件 · 制度附件.pdf")).toBeInTheDocument();
    });

    expect(screen.queryByText("继续优化付款条款，降低履约争议。")).not.toBeInTheDocument();
  });

  it("restores the pdf original preview after a page refresh", async () => {
    window.localStorage.setItem(
      `workspace-state:${mockWorkspaceSummary.workspaceId}`,
      JSON.stringify({
        summary: {
          ...mockWorkspaceSummary,
          activeDocumentMode: "pdf",
          activeDocumentTitle: "制度附件",
        },
        previewDocument: {
          mode: "pdf",
          source: "data:application/pdf;base64,ZmFrZQ==",
        },
      }),
    );

    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("PDF 原样预览 · 共 2 页")).toBeInTheDocument();
      expect(screen.getByTestId("pdf-page-1")).toBeInTheDocument();
      expect(screen.queryByText("PDF 预览需要重新导入原文件")).not.toBeInTheDocument();
    });
  });

  it("switches the assistant context after selecting a pdf page", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    parsePdfDocumentMock.mockResolvedValue({
      mode: "pdf",
      title: "制度附件",
      blocks: [
        { id: "pdf-heading-1", kind: "heading", level: 2, pageNumber: 1, text: "第 1 页" },
        { id: "pdf-paragraph-1", kind: "paragraph", pageNumber: 1, text: "第一页正文。" },
        { id: "pdf-heading-2", kind: "heading", level: 2, pageNumber: 2, text: "第 2 页" },
        { id: "pdf-paragraph-2", kind: "paragraph", pageNumber: 2, text: "第二页正文。" },
      ],
      activeClauseTitle: "第 1 页",
      activeClauseText: "第一页正文。",
      pdfSource: "data:application/pdf;base64,ZmFrZQ==",
    });

    fireEvent.change(screen.getByTestId("workspace-import-input"), {
      target: { files: [new File(["fake"], "制度附件.pdf", { type: "application/pdf" })] },
    });

    await waitFor(() => {
      expect(screen.getByTestId("pdf-page-card-2")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("pdf-page-card-2"));

    await waitFor(() => {
      expect(within(screen.getByTestId("assistant-panel")).getByText("第 2 页")).toBeInTheDocument();
      expect(screen.getByText("已切换到你刚刚选中的内容，可以继续围绕这段文字处理。")).toBeInTheDocument();
    });
  });

  it("shows an action popover after selecting text inside the pdf page", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    parsePdfDocumentMock.mockResolvedValue({
      mode: "pdf",
      title: "制度附件",
      blocks: [
        { id: "pdf-heading-1", kind: "heading", level: 2, pageNumber: 1, text: "第 1 页" },
        { id: "pdf-paragraph-1", kind: "paragraph", pageNumber: 1, text: "第一页付款正文。" },
      ],
      activeClauseTitle: "第 1 页",
      activeClauseText: "第一页付款正文。",
      pdfSource: "data:application/pdf;base64,ZmFrZQ==",
    });

    fireEvent.change(screen.getByTestId("workspace-import-input"), {
      target: { files: [new File(["fake"], "制度附件.pdf", { type: "application/pdf" })] },
    });

    await waitFor(() => {
      expect(screen.getByTestId("pdf-page-card-1")).toBeInTheDocument();
    });

    const pageText = screen.getByTestId("pdf-page-text-1");
    const pageCard = screen.getByTestId("pdf-page-card-1");
    const textNode = pageText.firstChild;
    const selectionMock = {
      toString: () => "付款正文",
      rangeCount: 1,
      getRangeAt: () =>
        ({
          commonAncestorContainer: textNode,
          getBoundingClientRect: () => ({
            top: 160,
            left: 320,
            width: 80,
            height: 18,
            right: 400,
            bottom: 178,
            x: 320,
            y: 160,
            toJSON: () => ({}),
          }),
        }) as Range,
      removeAllRanges: vi.fn(),
    };

    vi.spyOn(window, "getSelection").mockReturnValue(selectionMock as unknown as Selection);

    fireEvent.mouseUp(pageCard);

    await waitFor(() => {
      expect(screen.getByTestId("pdf-selection-popover")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "找问题" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "直接改写" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "润色表达" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "找问题" }));

    await waitFor(() => {
      expect(within(screen.getByTestId("assistant-panel")).getByText("第 1 页")).toBeInTheDocument();
      expect(screen.getAllByText(/问题：付款条件不明确/).length).toBeGreaterThan(0);
      expect(screen.queryByTestId("pdf-selection-popover")).not.toBeInTheDocument();
      expect(runLocalLLMTaskMock).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "review",
          clauseTitle: "第 1 页",
          clauseText: "付款正文",
        }),
      );
    });
  });

  it("shows an action popover after selecting text in the markdown or text document", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    const paragraphNode = screen.getAllByText("合同签订后一次性支付全部款项。")[0].firstChild;
    const removeAllRangesMock = vi.fn();
    const selectionMock = {
      toString: () => "合同签订后一次性支付全部款项。",
      rangeCount: 1,
      getRangeAt: () =>
        ({
          commonAncestorContainer: paragraphNode,
          getBoundingClientRect: () => ({
            top: 180,
            left: 360,
            width: 120,
            height: 20,
            right: 480,
            bottom: 200,
            x: 360,
            y: 180,
            toJSON: () => ({}),
          }),
        }) as Range,
      removeAllRanges: removeAllRangesMock,
    };

    vi.spyOn(window, "getSelection").mockReturnValue(selectionMock as unknown as Selection);

    fireEvent.mouseUp(screen.getAllByText("合同签订后一次性支付全部款项。")[0]);

    await waitFor(() => {
      expect(screen.getByTestId("document-selection-popover")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "找问题" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "直接改写" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "润色表达" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "润色表达" }));

    await waitFor(() => {
      expect(within(screen.getByTestId("assistant-panel")).getByText("付款方式")).toBeInTheDocument();
      expect(screen.getAllByText("建议在验收通过并完成票据核验后，按约定节点安排付款。").length).toBeGreaterThan(0);
      expect(screen.queryByTestId("document-selection-popover")).not.toBeInTheDocument();
      expect(removeAllRangesMock).toHaveBeenCalled();
      expect(runLocalLLMTaskMock).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "polish",
          clauseTitle: "付款方式",
          clauseText: "合同签订后一次性支付全部款项。",
        }),
      );
    });
  });
});
