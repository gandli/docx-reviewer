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
  ensureLLMProviderReadyMock,
  runLLMTaskMock,
  validateLLMProviderConnectionMock,
  isLocalLLMSupportedMock,
  getProviderModelLabelMock,
  getProviderStatusSummaryMock,
  getProviderMissingConfigMessageMock,
  getAvailableLLMProvidersMock,
  getLoadedLocalLLMModelIdMock,
  getAvailableLocalLLMModelsMock,
} = vi.hoisted(() => ({
  ensureLLMProviderReadyMock: vi.fn(() => Promise.resolve()),
  runLLMTaskMock: vi.fn(async ({ action }: { action: string }) => {
    if (action === "review") {
      return [
        "原文：合同签订后一次性支付全部款项。",
        "问题类型：条款风险",
        "问题归类：条款风险类",
        "问题说明：付款触发条件和验收前提没有写清，容易产生执行争议。",
        "修改建议：补充验收通过、发票齐备和审批完成后的付款条件。",
      ].join("\n");
    }

    if (action === "revise") {
      return "付款应在验收通过且发票齐全后，按约定节点分阶段支付。";
    }

    if (action === "polish") {
      return "建议在验收通过并完成票据核验后，按约定节点安排付款。";
    }

    return "这是本地模型返回的真实回复。";
  }),
  validateLLMProviderConnectionMock: vi.fn(async (settings: { llmProvider: string; openAIModel?: string; ollamaModel?: string; webllmModelId?: string }) => {
    if (settings.llmProvider === "openai") {
      return { ok: true, message: `接口可用，可继续使用 ${settings.openAIModel || "gpt-4.1-mini"}。` };
    }
    if (settings.llmProvider === "ollama") {
      return { ok: true, message: `Ollama 可用，可继续使用 ${settings.ollamaModel || "qwen2.5:3b"}。` };
    }
    return { ok: true, message: `当前设备可用，可加载 ${settings.webllmModelId === "Qwen2.5-1.5B-Instruct-q4f16_1-MLC" ? "Qwen2.5 1.5B" : "Qwen3 0.6B"}。` };
  }),
  isLocalLLMSupportedMock: vi.fn(() => true),
  getProviderModelLabelMock: vi.fn((settings: { llmProvider: string; webllmModelId?: string; openAIModel?: string; ollamaModel?: string }) => {
    if (settings.llmProvider === "openai") {
      return settings.openAIModel || "gpt-4.1-mini";
    }
    if (settings.llmProvider === "ollama") {
      return settings.ollamaModel || "qwen2.5:3b";
    }
    return settings.webllmModelId === "Qwen2.5-1.5B-Instruct-q4f16_1-MLC" ? "Qwen2.5 1.5B" : "Qwen3 0.6B";
  }),
  getProviderStatusSummaryMock: vi.fn((settings: { llmProvider: string; openAIModel?: string; ollamaModel?: string }) => {
    if (settings.llmProvider === "openai") {
      return `API：${settings.openAIModel || "gpt-4.1-mini"}`;
    }
    if (settings.llmProvider === "ollama") {
      return `Ollama：${settings.ollamaModel || "qwen2.5:3b"}`;
    }
    return "模型：Qwen3 0.6B · 按需启动";
  }),
  getProviderMissingConfigMessageMock: vi.fn(() => ""),
  getAvailableLLMProvidersMock: vi.fn(() => [
    {
      id: "webllm",
      label: "WebLLM 本地模型",
      summary: "直接在浏览器里运行，适合离线使用。",
    },
    {
      id: "openai",
      label: "OpenAI 风格 API",
      summary: "兼容 chat/completions 接口的服务都可接入。",
    },
    {
      id: "ollama",
      label: "Ollama",
      summary: "连接本机或局域网里的 Ollama 服务。",
    },
  ]),
  getLoadedLocalLLMModelIdMock: vi.fn(() => undefined),
  getAvailableLocalLLMModelsMock: vi.fn(() => [
    {
      id: "Qwen3-0.6B-q4f16_1-MLC",
      label: "Qwen3 0.6B",
      summary: "更轻，启动更快",
      tags: ["中文", "轻量"],
      deviceTier: "入门设备",
      vramHint: "建议显存 2GB 以上",
    },
    {
      id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
      label: "Qwen2.5 1.5B",
      summary: "中文审阅更稳",
      tags: ["中文", "审阅"],
      deviceTier: "主流设备",
      vramHint: "建议显存 4GB 以上",
    },
  ]),
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
  ensureLLMProviderReady: ensureLLMProviderReadyMock,
  runLLMTask: runLLMTaskMock,
  validateLLMProviderConnection: validateLLMProviderConnectionMock,
  isLocalLLMSupported: isLocalLLMSupportedMock,
  getProviderModelLabel: getProviderModelLabelMock,
  getProviderStatusSummary: getProviderStatusSummaryMock,
  getProviderMissingConfigMessage: getProviderMissingConfigMessageMock,
  getAvailableLLMProviders: getAvailableLLMProvidersMock,
  getLoadedLocalLLMModelId: getLoadedLocalLLMModelIdMock,
  getAvailableLocalLLMModels: getAvailableLocalLLMModelsMock,
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
  const createObjectURLMock = vi.fn(() => "blob:workspace-export");
  const revokeObjectURLMock = vi.fn();
  const anchorClickMock = vi.fn();
  const getActiveClauseHeading = () =>
    screen
      .getAllByText("付款方式")
      .find((element) => element.getAttribute("data-active") === "true");

  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1440,
    });
    vi.restoreAllMocks();
    parsePdfDocumentMock.mockReset();
    parseDocxDocumentMock.mockReset();
    renderDocxPreviewMock.mockClear();
    ensureLLMProviderReadyMock.mockClear();
    runLLMTaskMock.mockClear();
    validateLLMProviderConnectionMock.mockClear();
    isLocalLLMSupportedMock.mockClear();
    isLocalLLMSupportedMock.mockReturnValue(true);
    getProviderModelLabelMock.mockClear();
    getProviderStatusSummaryMock.mockClear();
    getProviderMissingConfigMessageMock.mockClear();
    getAvailableLLMProvidersMock.mockClear();
    getLoadedLocalLLMModelIdMock.mockClear();
    getLoadedLocalLLMModelIdMock.mockReturnValue(undefined);
    getAvailableLocalLLMModelsMock.mockClear();
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
    Object.defineProperty(globalThis.URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: createObjectURLMock,
    });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: revokeObjectURLMock,
    });
    Object.defineProperty(HTMLAnchorElement.prototype, "click", {
      configurable: true,
      writable: true,
      value: anchorClickMock,
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
    expect(screen.getByText("上下文")).toBeInTheDocument();
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

    expect(screen.getByRole("button", { name: "收起左栏" })).toHaveTextContent("");
    expect(screen.getByRole("button", { name: "收起右栏" })).toHaveTextContent("");

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

  it("resizes both side panels by dragging and persists widths locally", () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    const layout = screen.getByTestId("workspace-layout");
    const leftHandle = screen.getByTestId("left-resize-handle");
    const rightHandle = screen.getByTestId("right-resize-handle");

    fireEvent.pointerDown(leftHandle, { clientX: 320 });
    fireEvent.pointerMove(window, { clientX: 360 });
    fireEvent.pointerUp(window);

    fireEvent.pointerDown(rightHandle, { clientX: 1120 });
    fireEvent.pointerMove(window, { clientX: 1080 });
    fireEvent.pointerUp(window);

    expect(layout.getAttribute("style")).toContain("360px");
    expect(layout.getAttribute("style")).toContain("360px");
    expect(JSON.parse(window.localStorage.getItem("workspace-panel-widths") ?? "{}")).toEqual({
      left: 360,
      right: 360,
    });
  });

  it("restores saved side panel widths after reload", () => {
    window.localStorage.setItem(
      "workspace-panel-widths",
      JSON.stringify({
        left: 352,
        right: 332,
      }),
    );

    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("workspace-layout").getAttribute("style")).toContain("352px");
    expect(screen.getByTestId("workspace-layout").getAttribute("style")).toContain("332px");
  });

  it("double clicks the resize handles to restore default widths", () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    const layout = screen.getByTestId("workspace-layout");
    const leftHandle = screen.getByTestId("left-resize-handle");
    const rightHandle = screen.getByTestId("right-resize-handle");

    fireEvent.pointerDown(leftHandle, { clientX: 320 });
    fireEvent.pointerMove(window, { clientX: 380 });
    fireEvent.pointerUp(window);
    fireEvent.pointerDown(rightHandle, { clientX: 1120 });
    fireEvent.pointerMove(window, { clientX: 1060 });
    fireEvent.pointerUp(window);

    fireEvent.doubleClick(leftHandle);
    fireEvent.doubleClick(rightHandle);

    expect(layout.getAttribute("style")).toContain("320px");
    expect(layout.getAttribute("style")).toContain("340px");
  });

  it("renders document content, active clause, and local model status", () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );
    expect(screen.getAllByText("采购与付款管理制度").length).toBeGreaterThan(0);
    expect(screen.queryByText("阅读视图")).not.toBeInTheDocument();
    expect(screen.queryByText("可编辑")).not.toBeInTheDocument();
    expect(screen.getByText("来源：WebLLM")).toBeInTheDocument();
    expect(screen.getByText("待连接")).toBeInTheDocument();
    expect(screen.getByText(/按需启动/)).toBeInTheDocument();
    expect(getActiveClauseHeading()).toHaveAttribute("data-active", "true");
  });

  it("shows the selected model source in the assistant panel", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "设置" }));
    fireEvent.click(screen.getByText("OpenAI 风格 API").closest("label")!);
    fireEvent.change(screen.getByLabelText("OpenAI 风格 API 地址"), {
      target: { value: "https://api.example.com/v1" },
    });
    fireEvent.change(screen.getByLabelText("OpenAI 风格 API Key"), {
      target: { value: "sk-demo" },
    });
    fireEvent.change(screen.getByLabelText("OpenAI 风格模型名"), {
      target: { value: "qwen-reviewer" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存设置" }));

    await waitFor(() => {
      expect(screen.getByText("来源：OpenAI API")).toBeInTheDocument();
      expect(screen.getByText("已连接")).toBeInTheDocument();
      expect(screen.getByText("API：qwen-reviewer")).toBeInTheDocument();
    });
  });

  it("shows unconfigured status when the selected provider is missing required fields", async () => {
    getProviderMissingConfigMessageMock.mockImplementation(
      (settings: { llmProvider: string; openAIBaseUrl?: string; openAIApiKey?: string; openAIModel?: string }) => {
        if (settings.llmProvider === "openai" && !settings.openAIApiKey?.trim()) {
          return "请先在设置里填写 API Key。";
        }

        return "";
      },
    );

    window.localStorage.setItem(
      "app-settings",
      JSON.stringify({
        themeId: "warm",
        reviewPromptNote: "",
        llmProvider: "openai",
        webllmModelId: "Qwen3-0.6B-q4f16_1-MLC",
        openAIBaseUrl: "https://api.example.com/v1",
        openAIApiKey: "",
        openAIModel: "qwen-reviewer",
        ollamaBaseUrl: "http://127.0.0.1:11434",
        ollamaModel: "qwen2.5:3b",
      }),
    );

    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("来源：OpenAI API")).toBeInTheDocument();
      expect(screen.getByText("未配置")).toBeInTheDocument();
      expect(screen.getByText("先在设置里补全 API Key。")).toBeInTheDocument();
    });
  });

  it("opens workspace settings, filters models, and persists selected model", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "设置" }));

    expect(screen.getByText("工作区设置")).toBeInTheDocument();
    expect(screen.getAllByText("模型服务").length).toBeGreaterThan(0);
    expect(screen.getByText(/当前状态：模型：Qwen3 0.6B · 按需启动/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("搜索本地模型"), {
      target: { value: "1.5B" },
    });

    expect(screen.queryByText("Qwen3 0.6B")).not.toBeInTheDocument();
    const selectedModelCard = screen.getByText("Qwen2.5 1.5B").closest("label");
    expect(selectedModelCard).not.toBeNull();
    expect(selectedModelCard).toHaveTextContent("Qwen2.5 1.5B");
    expect(selectedModelCard).toHaveTextContent("推荐设备档位：主流设备");
    expect(selectedModelCard).toHaveTextContent("显存提示：建议显存 4GB 以上");

    fireEvent.click(selectedModelCard!);
    fireEvent.click(screen.getByRole("button", { name: "保存设置" }));

    await waitFor(() => {
      const appSettings = JSON.parse(window.localStorage.getItem("app-settings") ?? "{}");
      expect(appSettings.webllmModelId).toBe("Qwen2.5-1.5B-Instruct-q4f16_1-MLC");
      expect(appSettings.llmProvider).toBe("webllm");
      expect(ensureLLMProviderReadyMock).toHaveBeenCalled();
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

  it("opens settings, updates the workspace title, and persists it", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "设置" }));
    expect(screen.getByText("工作区设置")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("工作区名称"), {
      target: { value: "法务文档台" },
    });
    fireEvent.change(screen.getByLabelText("提示词偏好"), {
      target: { value: "审阅时优先指出事实缺失" },
    });
    fireEvent.click(screen.getByLabelText("冷灰墨"));
    fireEvent.change(screen.getByLabelText("搜索本地模型"), {
      target: { value: "1.5B" },
    });
    fireEvent.click(screen.getByText("Qwen2.5 1.5B").closest("label")!);
    fireEvent.click(screen.getByRole("button", { name: "保存设置" }));

    await waitFor(() => {
      expect(screen.getAllByText("法务文档台").length).toBeGreaterThan(0);
      expect(
        JSON.parse(window.localStorage.getItem("workspace-state:ws-enterprise") ?? "{}").summary
          .workspaceTitle,
      ).toBe("法务文档台");
      expect(JSON.parse(window.localStorage.getItem("app-settings") ?? "{}").themeId).toBe("ink");
      expect(JSON.parse(window.localStorage.getItem("app-settings") ?? "{}").reviewPromptNote).toBe(
        "审阅时优先指出事实缺失",
      );
      expect(JSON.parse(window.localStorage.getItem("app-settings") ?? "{}").webllmModelId).toBe(
        "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
      );
    });
  });

  it("switches to OpenAI style API and persists provider settings", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "设置" }));
    fireEvent.click(screen.getByText("OpenAI 风格 API").closest("label")!);
    fireEvent.change(screen.getByLabelText("OpenAI 风格 API 地址"), {
      target: { value: "https://api.example.com/v1" },
    });
    fireEvent.change(screen.getByLabelText("OpenAI 风格 API Key"), {
      target: { value: "sk-demo" },
    });
    fireEvent.change(screen.getByLabelText("OpenAI 风格模型名"), {
      target: { value: "qwen-reviewer" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存设置" }));

    await waitFor(() => {
      const appSettings = JSON.parse(window.localStorage.getItem("app-settings") ?? "{}");
      expect(appSettings.llmProvider).toBe("openai");
      expect(appSettings.openAIBaseUrl).toBe("https://api.example.com/v1");
      expect(appSettings.openAIApiKey).toBe("sk-demo");
      expect(appSettings.openAIModel).toBe("qwen-reviewer");
      expect(ensureLLMProviderReadyMock).toHaveBeenCalled();
    });
  });

  it("checks the selected model provider directly in settings", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "设置" }));
    fireEvent.click(screen.getByText("OpenAI 风格 API").closest("label")!);
    fireEvent.change(screen.getByLabelText("OpenAI 风格 API 地址"), {
      target: { value: "https://api.example.com/v1" },
    });
    fireEvent.change(screen.getByLabelText("OpenAI 风格 API Key"), {
      target: { value: "sk-demo" },
    });
    fireEvent.change(screen.getByLabelText("OpenAI 风格模型名"), {
      target: { value: "qwen-reviewer" },
    });
    fireEvent.click(screen.getByRole("button", { name: "检查连接" }));

    await waitFor(() => {
      expect(validateLLMProviderConnectionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          llmProvider: "openai",
          openAIBaseUrl: "https://api.example.com/v1",
          openAIApiKey: "sk-demo",
          openAIModel: "qwen-reviewer",
        }),
      );
      expect(screen.getByText("接口可用，可继续使用 qwen-reviewer。")).toBeInTheDocument();
      expect(screen.getByText(/最近检查：/)).toBeInTheDocument();
    });
  });

  it("clears old connection result after model settings change", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "设置" }));
    fireEvent.click(screen.getByText("OpenAI 风格 API").closest("label")!);
    fireEvent.change(screen.getByLabelText("OpenAI 风格 API 地址"), {
      target: { value: "https://api.example.com/v1" },
    });
    fireEvent.change(screen.getByLabelText("OpenAI 风格 API Key"), {
      target: { value: "sk-demo" },
    });
    fireEvent.change(screen.getByLabelText("OpenAI 风格模型名"), {
      target: { value: "qwen-reviewer" },
    });
    fireEvent.click(screen.getByRole("button", { name: "检查连接" }));

    await waitFor(() => {
      expect(screen.getByText("接口可用，可继续使用 qwen-reviewer。")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("OpenAI 风格模型名"), {
      target: { value: "qwen-reviewer-v2" },
    });

    await waitFor(() => {
      expect(screen.queryByText("接口可用，可继续使用 qwen-reviewer。")).not.toBeInTheDocument();
    });
  });

  it("clears persisted workspace records from settings", async () => {
    window.localStorage.setItem(
      "workspace-state:ws-enterprise",
      JSON.stringify({
        summary: {
          ...mockWorkspaceSummary,
          workspaceTitle: "法务文档台",
          activeDocumentTitle: "已恢复文档",
        },
      }),
    );

    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "设置" }));
    fireEvent.click(screen.getByRole("button", { name: "清空当前工作区记录" }));

    await waitFor(() => {
      expect(screen.getAllByText("文档工作台").length).toBeGreaterThan(0);
      expect(screen.getAllByText("采购与付款管理制度").length).toBeGreaterThan(0);
      expect(window.localStorage.getItem("workspace-state:ws-enterprise")).toBeNull();
      expect(window.localStorage.getItem("workspace-summary:ws-enterprise")).toBeNull();
    });
  });

  it("closes settings when clicking the backdrop", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "设置" }));
    expect(screen.getByText("工作区设置")).toBeInTheDocument();

    fireEvent.click(screen.getByText("工作区设置").closest("section")!.parentElement!);

    await waitFor(() => {
      expect(screen.queryByText("工作区设置")).not.toBeInTheDocument();
    });
  });

  it("exports the current workspace as markdown", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "导出" }));
    expect(screen.getByText("导出当前文档")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Markdown (.md)"));
    fireEvent.click(screen.getByRole("button", { name: "开始导出" }));

    await waitFor(() => {
      expect(createObjectURLMock).toHaveBeenCalled();
      expect(anchorClickMock).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:workspace-export");
    });
  });

  it("sends a chat message and appends it to the assistant thread", async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("输入你的要求，或继续处理当前内容"), {
      target: { value: "请把语气改得更正式" },
    });
    fireEvent.click(screen.getByRole("button", { name: "发送" }));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("输入你的要求，或继续处理当前内容"),
      ).toHaveValue("");
      expect(screen.getByText("请把语气改得更正式")).toBeInTheDocument();
      expect(screen.getAllByText("这是本地模型返回的真实回复。").length).toBeGreaterThan(0);
      expect(ensureLLMProviderReadyMock).toHaveBeenCalled();
      expect(runLLMTaskMock).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "chat",
          userMessage: "请把语气改得更正式",
        }),
        expect.any(Object),
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

    fireEvent.change(screen.getByPlaceholderText("输入你的要求，或继续处理当前内容"), {
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
      expect(screen.queryByText("原样预览")).not.toBeInTheDocument();
      expect(screen.queryByText("Markdown 原样预览")).not.toBeInTheDocument();
      expect(screen.queryByText("阅读视图")).not.toBeInTheDocument();
      expect(screen.queryByText("可编辑")).not.toBeInTheDocument();
      expect(screen.getAllByText("所有报销申请应附完整票据。").length).toBeGreaterThan(0);
      expect(screen.getByText("导入文件 · 差旅报销制度.md")).toBeInTheDocument();
      expect(screen.getByText("可直接选中内容处理，或输入要求。")).toBeInTheDocument();
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
      expect(screen.queryByText("原样预览")).not.toBeInTheDocument();
      expect(screen.queryByText("文本原样预览")).not.toBeInTheDocument();
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
      expect(screen.queryByText("原样预览")).not.toBeInTheDocument();
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
      expect(screen.getByText("改写结果")).toBeInTheDocument();
      expect(screen.getByText("可直接采用")).toBeInTheDocument();
      expect(screen.getAllByText("付款应在验收通过且发票齐全后，按约定节点分阶段支付。").length).toBeGreaterThan(0);
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
      expect(screen.queryByText("原样预览")).not.toBeInTheDocument();
      expect(screen.queryByText("PDF 原样预览 · 共 2 页")).not.toBeInTheDocument();
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
      expect(screen.queryByText("PDF 原样预览 · 共 2 页")).not.toBeInTheDocument();
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
      expect(screen.getByText("已切换到选中内容，可继续处理。")).toBeInTheDocument();
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
      expect(screen.getByText("校阅发现")).toBeInTheDocument();
      expect(
        screen.getAllByText((_, element) => element?.textContent?.includes("问题归类") ?? false).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByText((_, element) => element?.textContent?.includes("条款风险类") ?? false).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByText((_, element) => element?.textContent?.includes("修改建议") ?? false).length,
      ).toBeGreaterThan(0);
      expect(screen.queryByTestId("pdf-selection-popover")).not.toBeInTheDocument();
      expect(runLLMTaskMock).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "review",
          clauseTitle: "第 1 页",
          clauseText: "付款正文",
        }),
        expect.any(Object),
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
      expect(screen.getByText("润色结果")).toBeInTheDocument();
      expect(screen.getByText("保留原意")).toBeInTheDocument();
      expect(screen.getAllByText("建议在验收通过并完成票据核验后，按约定节点安排付款。").length).toBeGreaterThan(0);
      expect(screen.queryByTestId("document-selection-popover")).not.toBeInTheDocument();
      expect(removeAllRangesMock).toHaveBeenCalled();
      expect(runLLMTaskMock).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "polish",
          clauseTitle: "付款方式",
          clauseText: "合同签订后一次性支付全部款项。",
        }),
        expect.any(Object),
      );
    });
  });
});
