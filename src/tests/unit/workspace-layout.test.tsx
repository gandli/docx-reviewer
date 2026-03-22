import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { App } from "@/app/App";
import { WorkspacePage } from "@/features/workspace-shell/routes/workspace-page";
import { themeTokens } from "@/shared/constants/theme";
import { mockWorkspaceSummary } from "@/shared/mocks/workspace-shell";

const { parsePdfDocumentMock } = vi.hoisted(() => ({
  parsePdfDocumentMock: vi.fn(),
}));

vi.mock("@/services/import/pdf-document", () => ({
  parsePdfDocument: parsePdfDocumentMock,
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
      <div data-testid={`pdf-page-${pageNumber}`}>PDF Page {pageNumber}</div>
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

  it("renders document header, highlighted active clause, and assistant actions", () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );
    expect(screen.getAllByText("采购与付款管理制度").length).toBeGreaterThan(0);
    expect(screen.getByText("阅读视图")).toBeInTheDocument();
    expect(screen.getByText("可编辑")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "更多操作" })).toBeInTheDocument();
    expect(getActiveClauseHeading()).toHaveAttribute("data-active", "true");
  });

  it("applies the suggestion and updates the clause text", () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "更多操作" }));
    fireEvent.click(screen.getByRole("button", { name: "接受建议" }));

    expect(screen.getAllByText(mockWorkspaceSummary.suggestedRevisionText).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText(`已应用建议：${mockWorkspaceSummary.suggestedRevisionText}`)).toBeInTheDocument();
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

  it("jumps back to the current clause when asked", () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "更多操作" }));
    fireEvent.click(screen.getByRole("button", { name: "跳到原文位置" }));

    expect(screen.getByText("已定位到当前条款")).toBeInTheDocument();
    expect(getActiveClauseHeading()).toHaveAttribute("data-active", "true");
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
      expect(screen.getAllByText(/已记录你的要求：请把语气改得更正式/)).toHaveLength(2);
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

  it("imports a txt or md file and renders the real document content", async () => {
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
      expect(screen.getAllByText("所有报销申请应附完整票据。").length).toBeGreaterThan(0);
      expect(screen.getByText("导入文件 · 差旅报销制度.md")).toBeInTheDocument();
      expect(screen.getAllByText(/已导入文档《差旅报销制度》/).length).toBeGreaterThan(0);
    });

    expect(screen.queryByText("继续优化付款条款，降低履约争议。")).not.toBeInTheDocument();
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
      expect(screen.getByText("付款安排应以验收和发票齐备为支付前提。")).toBeInTheDocument();
      expect(screen.getByText("导入文件 · 制度附件.pdf")).toBeInTheDocument();
    });

    expect(screen.queryByText("继续优化付款条款，降低履约争议。")).not.toBeInTheDocument();
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
      expect(screen.getByText("第二页正文。")).toBeInTheDocument();
      expect(screen.getByText("已切换到你刚刚选中的内容，可以继续围绕这段文字处理。")).toBeInTheDocument();
    });
  });

  it("updates the assistant context after selecting text in the document", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    const paragraphNode = screen.getAllByText("合同签订后一次性支付全部款项。")[0].firstChild;
    const selectionMock = {
      toString: () => "合同签订后一次性支付全部款项。",
      rangeCount: 1,
      getRangeAt: () =>
        ({
          commonAncestorContainer: paragraphNode,
        }) as Range,
    };

    vi.spyOn(window, "getSelection").mockReturnValue(selectionMock as unknown as Selection);

    fireEvent.mouseUp(screen.getAllByText("合同签订后一次性支付全部款项。")[0]);

    await waitFor(() => {
      expect(screen.getByText("已选文本")).toBeInTheDocument();
      expect(screen.getAllByText("合同签订后一次性支付全部款项。").length).toBeGreaterThan(0);
      expect(screen.getByText("已切换到你刚刚选中的内容，可以继续围绕这段文字处理。")).toBeInTheDocument();
    });
  });
});
