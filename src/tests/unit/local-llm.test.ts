import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createLocalLLMMessages,
  getAvailableLLMProviders,
  getAvailableLocalLLMModels,
  getDefaultLocalLLMModelId,
  loadReadyLocalLLMModelId,
  loadSelectedLocalLLMModelId,
  runLLMTask,
  saveReadyLocalLLMModelId,
  saveSelectedLocalLLMModelId,
  validateLLMProviderConnection,
} from "@/services/ai/local-llm";

describe("local llm", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("provides a curated local model list with a stable default", () => {
    const models = getAvailableLocalLLMModels();

    expect(models.length).toBeGreaterThanOrEqual(9);
    expect(models.some((model) => model.id === getDefaultLocalLLMModelId())).toBe(true);
    expect(models.some((model) => model.id === "Qwen2.5-1.5B-Instruct-q4f16_1-MLC")).toBe(true);
    expect(models.some((model) => model.id === "SmolLM2-360M-Instruct-q4f16_1-MLC")).toBe(true);
    expect(models.some((model) => model.id === "Qwen2.5-3B-Instruct-q4f16_1-MLC")).toBe(true);
    expect(models.some((model) => model.id === "Llama-3.2-3B-Instruct-q4f16_1-MLC")).toBe(true);
    expect(models.every((model) => model.deviceTier.length > 0)).toBe(true);
    expect(models.every((model) => model.vramHint.length > 0)).toBe(true);
    expect(models.every((model) => model.reviewFit.length > 0)).toBe(true);
    expect(models.every((model) => model.generateFit.length > 0)).toBe(true);
  });

  it("provides provider options including Anthropic style api", () => {
    const providers = getAvailableLLMProviders();

    expect(providers.some((provider) => provider.id === "anthropic")).toBe(true);
    expect(providers.find((provider) => provider.id === "anthropic")?.label).toContain("Anthropic");
  });

  it("persists and restores selected model id", () => {
    saveSelectedLocalLLMModelId("Qwen2.5-1.5B-Instruct-q4f16_1-MLC");

    expect(loadSelectedLocalLLMModelId()).toBe("Qwen2.5-1.5B-Instruct-q4f16_1-MLC");
  });

  it("persists and restores ready local model id", () => {
    saveReadyLocalLLMModelId("Qwen3-0.6B-q4f16_1-MLC");

    expect(loadReadyLocalLLMModelId()).toBe("Qwen3-0.6B-q4f16_1-MLC");
  });

  it("builds document review prompts for finding issues", () => {
    const messages = createLocalLLMMessages({
      action: "review",
      clauseTitle: "付款方式",
      clauseText: "合同签订后一次性支付全部款项。",
      customPrompt: "审阅时优先指出事实缺失。",
    });

    expect(messages[0]?.content).toContain("商务文档审阅助手");
    expect(messages[0]?.content).toContain("按以下顺序逐一检查");
    expect(messages[0]?.content).toContain("用词");
    expect(messages[0]?.content).toContain("标点");
    expect(messages[0]?.content).toContain("语法");
    expect(messages[0]?.content).toContain("语句通顺性");
    expect(messages[0]?.content).toContain("逻辑是否清楚");
    expect(messages[0]?.content).toContain("事实是否完整");
    expect(messages[0]?.content).toContain("条款风险");
    expect(messages[0]?.content).toContain("问题归类");
    expect(messages[0]?.content).toContain("笔误类");
    expect(messages[0]?.content).toContain("语法类");
    expect(messages[0]?.content).toContain("条款风险类");
    expect(messages[0]?.content).toContain("绝对不要为了凑数量而编造问题");
    expect(messages[0]?.content).toContain("未发现需要修改的明确问题");
    expect(messages[0]?.content).toContain("Markdown");
    expect(messages[0]?.content).toContain("## 问题 1");
    expect(messages[0]?.content).toContain("- 原文：");
    expect(messages[0]?.content).toContain("- 修改建议：");
    expect(messages[0]?.content).toContain("审阅时优先指出事实缺失");
    expect(messages[1]?.content).toContain("请审阅下面这段");
  });

  it("builds document revision prompts for direct rewrite", () => {
    const messages = createLocalLLMMessages({
      action: "revise",
      clauseTitle: "付款方式",
      clauseText: "合同签订后一次性支付全部款项。",
    });

    expect(messages[0]?.content).toContain("文档校改助手");
    expect(messages[0]?.content).toContain("正式文件校改成稿");
    expect(messages[0]?.content).toContain("修正用词、标点、语法、语句不通顺");
    expect(messages[0]?.content).toContain("补齐逻辑不清、事实不完整");
    expect(messages[0]?.content).toContain("消除明显的条款风险");
    expect(messages[0]?.content).toContain("只输出改写后的正文");
    expect(messages[0]?.content).toContain("Markdown");
    expect(messages[1]?.content).toContain("请直接改写下面这段");
  });

  it("builds document polish prompts while preserving intent", () => {
    const messages = createLocalLLMMessages({
      action: "polish",
      clauseTitle: "付款方式",
      clauseText: "合同签订后一次性支付全部款项。",
    });

    expect(messages[0]?.content).toContain("文档润色助手");
    expect(messages[0]?.content).toContain("轻度润色模式");
    expect(messages[0]?.content).toContain("不能改变原意");
    expect(messages[0]?.content).toContain("不能新增事实");
    expect(messages[0]?.content).toContain("不能改变责任边界");
    expect(messages[0]?.content).toContain("只优化措辞、标点、语气、节奏和书面感");
    expect(messages[0]?.content).toContain("Markdown");
    expect(messages[1]?.content).toContain("请润色下面这段");
  });

  it("falls back to chat completions when openai style model listing is unavailable", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: false,
        text: async () => "not supported",
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [] }),
      } as Response);

    await expect(
      validateLLMProviderConnection({
        themeId: "warm",
        reviewPromptNote: "",
        llmProvider: "openai",
        webllmModelId: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
        openAIBaseUrl: "https://open.bigmodel.cn/api/paas/v4",
        openAIApiKey: "glm-key",
        openAIModel: "glm-4.7-flash",
        anthropicBaseUrl: "https://api.anthropic.com/v1",
        anthropicApiKey: "",
        anthropicModel: "claude-3-5-sonnet-latest",
        ollamaBaseUrl: "http://127.0.0.1:11434",
        ollamaModel: "qwen2.5:3b",
      }),
    ).resolves.toEqual({
      ok: true,
      message: "接口可用，可继续使用 glm-4.7-flash。",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer glm-key",
        }),
      }),
    );
  });

  it("accepts openai-compatible responses whose message content is an array", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: [
                {
                  type: "text",
                  text: "## 审阅结论\n- 问题说明：付款条件缺少验收前提。",
                },
              ],
            },
          },
        ],
      }),
    } as Response);

    await expect(
      runLLMTask(
        {
          action: "review",
          clauseTitle: "付款方式",
          clauseText: "合同签订后一次性支付全部款项。",
        },
        {
          themeId: "warm",
          reviewPromptNote: "",
          llmProvider: "openai",
          webllmModelId: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
          openAIBaseUrl: "https://open.bigmodel.cn/api/paas/v4",
          openAIApiKey: "glm-key",
          openAIModel: "glm-4.7-flash",
          anthropicBaseUrl: "https://api.anthropic.com/v1",
          anthropicApiKey: "",
          anthropicModel: "claude-3-5-sonnet-latest",
          ollamaBaseUrl: "http://127.0.0.1:11434",
          ollamaModel: "qwen2.5:3b",
        },
      ),
    ).resolves.toContain("付款条件缺少验收前提");
  });

  it("gives a precise error when the remote provider returns no final content", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "",
            },
          },
        ],
      }),
    } as Response);

    await expect(
      runLLMTask(
        {
          action: "review",
          clauseTitle: "付款方式",
          clauseText: "合同签订后一次性支付全部款项。",
        },
        {
          themeId: "warm",
          reviewPromptNote: "",
          llmProvider: "openai",
          webllmModelId: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
          openAIBaseUrl: "https://open.bigmodel.cn/api/paas/v4",
          openAIApiKey: "glm-key",
          openAIModel: "glm-4.7-flash",
          anthropicBaseUrl: "https://api.anthropic.com/v1",
          anthropicApiKey: "",
          anthropicModel: "claude-3-5-sonnet-latest",
          ollamaBaseUrl: "http://127.0.0.1:11434",
          ollamaModel: "qwen2.5:3b",
        },
      ),
    ).rejects.toThrow("模型接口已连通，但返回正文为空或返回格式不兼容。");
  });
});
