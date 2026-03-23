import { normalizeAssistantMarkdown } from "@/shared/utils/assistant-message-format";
import type { AppSettings, LLMProvider } from "@/services/persistence/app-settings";

export type LocalLLMAction = "chat" | "review" | "revise" | "polish";

export type LocalLLMProgress = {
  progress: number;
  text: string;
};

export type LocalLLMRequest = {
  action: LocalLLMAction;
  clauseTitle: string;
  clauseText: string;
  userMessage?: string;
  modelId?: string;
  customPrompt?: string;
};

type LocalLLMMessage = {
  role: "system" | "user";
  content: string;
};

type OpenAICompatibleMessageContentPart =
  | string
  | {
      type?: string;
      text?: string;
      content?: string;
      parts?: OpenAICompatibleMessageContentPart[];
    };

type OpenAICompatiblePayload = {
  output_text?: string;
  choices?: Array<{
    message?: {
      content?: string | OpenAICompatibleMessageContentPart | OpenAICompatibleMessageContentPart[];
      reasoning_content?: string;
      refusal?: string;
    };
  }>;
};

export type LocalLLMModelOption = {
  id: string;
  label: string;
  summary: string;
  tags: string[];
  deviceTier: string;
  vramHint: string;
  reviewFit: string;
  generateFit: string;
};

export type LLMProviderOption = {
  id: LLMProvider;
  label: string;
  summary: string;
  reviewFit: string;
  generateFit: string;
};

const LLM_PROVIDER_OPTIONS: LLMProviderOption[] = [
  {
    id: "webllm",
    label: "WebLLM 本地模型",
    summary: "直接在浏览器里运行，适合离线使用。",
    reviewFit: "更适合离线审阅",
    generateFit: "适合轻到中等长度生成",
  },
  {
    id: "openai",
    label: "OpenAI 风格 API",
    summary: "兼容 chat/completions 接口的服务都可接入。",
    reviewFit: "适合接入更强的远端审阅模型",
    generateFit: "更适合长文生成",
  },
  {
    id: "anthropic",
    label: "Anthropic 风格 API",
    summary: "兼容 messages 接口的服务都可接入。",
    reviewFit: "适合严谨审阅和长上下文判断",
    generateFit: "适合结构化长文生成",
  },
  {
    id: "ollama",
    label: "Ollama",
    summary: "连接本机或局域网里的 Ollama 服务。",
    reviewFit: "适合本机或内网审阅",
    generateFit: "适合自托管生成",
  },
];

const LOCAL_MODEL_STORAGE_KEY = "local-llm:selected-model";
const READY_LOCAL_MODEL_STORAGE_KEY = "local-llm:ready-model";
const DEFAULT_LOCAL_MODEL_ID = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";
const AVAILABLE_LOCAL_MODELS: LocalLLMModelOption[] = [
  {
    id: "SmolLM2-360M-Instruct-q4f16_1-MLC",
    label: "SmolLM2 360M",
    summary: "最轻量，适合先快速验证流程或低资源设备。",
    tags: ["轻量", "快速", "入门"],
    deviceTier: "入门设备",
    vramHint: "建议显存 2GB 以上",
    reviewFit: "适合快速找明显问题",
    generateFit: "只适合短文本起草",
  },
  {
    id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    label: "Qwen2.5 0.5B",
    summary: "中文友好，加载更快，适合轻量审阅和短文本处理。",
    tags: ["中文", "轻量", "快速"],
    deviceTier: "入门设备",
    vramHint: "建议显存 2GB 以上",
    reviewFit: "适合轻量中文审阅",
    generateFit: "适合短文本生成",
  },
  {
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    label: "Qwen2.5 1.5B",
    summary: "中文审阅和校改更稳，适合正式文档处理。",
    tags: ["推荐", "中文", "审阅"],
    deviceTier: "主流设备",
    vramHint: "建议显存 4GB 以上",
    reviewFit: "推荐用于正式文书审阅",
    generateFit: "适合常规初稿生成",
  },
  {
    id: "Qwen3-0.6B-q4f16_1-MLC",
    label: "Qwen3 0.6B",
    summary: "更轻，启动更快，适合先快速试跑。",
    tags: ["轻量", "快速"],
    deviceTier: "入门设备",
    vramHint: "建议显存 2GB 以上",
    reviewFit: "适合快速试跑审阅流程",
    generateFit: "适合轻量生成",
  },
  {
    id: "Qwen3-1.7B-q4f16_1-MLC",
    label: "Qwen3 1.7B",
    summary: "兼顾速度和质量，适合更长一点的上下文。",
    tags: ["平衡", "中文"],
    deviceTier: "主流设备",
    vramHint: "建议显存 4GB 以上",
    reviewFit: "适合连续审阅和改写",
    generateFit: "适合较长内容生成",
  },
  {
    id: "Qwen2.5-3B-Instruct-q4f16_1-MLC",
    label: "Qwen2.5 3B",
    summary: "比 1.5B 更稳，适合更复杂的正式文书生成和审阅。",
    tags: ["中文", "增强", "审阅"],
    deviceTier: "增强设备",
    vramHint: "建议显存 6GB 以上",
    reviewFit: "更适合复杂文书审阅",
    generateFit: "更适合严谨初稿生成",
  },
  {
    id: "Qwen3-4B-q4f16_1-MLC",
    label: "Qwen3 4B",
    summary: "更强的上下文理解与改写能力，适合长一点的文书任务。",
    tags: ["增强", "中文", "长文"],
    deviceTier: "增强设备",
    vramHint: "建议显存 8GB 以上",
    reviewFit: "适合长文审阅",
    generateFit: "推荐用于长文生成",
  },
  {
    id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    label: "Llama 3.2 1B",
    summary: "通用能力稳定，可作为 Qwen 之外的轻量备选。",
    tags: ["通用", "轻量", "备选"],
    deviceTier: "入门设备",
    vramHint: "建议显存 3GB 以上",
    reviewFit: "适合作为轻量备选审阅",
    generateFit: "适合作为轻量备选生成",
  },
  {
    id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
    label: "Llama 3.2 3B",
    summary: "质量更稳，适合做对比生成和通用文书处理。",
    tags: ["通用", "平衡", "备选"],
    deviceTier: "增强设备",
    vramHint: "建议显存 6GB 以上",
    reviewFit: "适合通用审阅对比",
    generateFit: "适合通用生成对比",
  },
  {
    id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
    label: "Phi 3.5 Mini",
    summary: "英文和通用写作表现稳定，可作备选。",
    tags: ["英文", "通用"],
    deviceTier: "主流设备",
    vramHint: "建议显存 4GB 以上",
    reviewFit: "适合英文或通用审阅",
    generateFit: "适合英文或通用生成",
  },
  {
    id: "gemma-2-2b-it-q4f16_1-MLC",
    label: "Gemma 2 2B",
    summary: "适合对比不同风格输出，回复更克制。",
    tags: ["备选", "克制"],
    deviceTier: "主流设备",
    vramHint: "建议显存 4GB 以上",
    reviewFit: "适合克制风格审阅",
    generateFit: "适合克制风格生成",
  },
  {
    id: "SmolLM2-1.7B-Instruct-q4f16_1-MLC",
    label: "SmolLM2 1.7B",
    summary: "在较低资源下保持不错的响应速度，适合轻量长文处理。",
    tags: ["轻量", "平衡", "低资源"],
    deviceTier: "主流设备",
    vramHint: "建议显存 4GB 以上",
    reviewFit: "适合低资源连续审阅",
    generateFit: "适合低资源长文生成",
  },
];

type WebLLMModule = typeof import("@mlc-ai/web-llm");
type MLCEngine = Awaited<ReturnType<WebLLMModule["CreateMLCEngine"]>>;

let cachedEngine: MLCEngine | undefined;
let loadingPromise: Promise<MLCEngine> | undefined;
let loadedModelId: string | undefined;

export function getAvailableLocalLLMModels() {
  return AVAILABLE_LOCAL_MODELS;
}

export function getAvailableLLMProviders() {
  return LLM_PROVIDER_OPTIONS;
}

export function getDefaultLocalLLMModelId() {
  return DEFAULT_LOCAL_MODEL_ID;
}

export function loadSelectedLocalLLMModelId() {
  if (typeof window === "undefined") {
    return DEFAULT_LOCAL_MODEL_ID;
  }

  const savedModelId = window.localStorage.getItem(LOCAL_MODEL_STORAGE_KEY);
  const isKnownModel = AVAILABLE_LOCAL_MODELS.some((model) => model.id === savedModelId);
  return isKnownModel && savedModelId ? savedModelId : DEFAULT_LOCAL_MODEL_ID;
}

export function saveSelectedLocalLLMModelId(modelId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCAL_MODEL_STORAGE_KEY, modelId);
}

export function loadReadyLocalLLMModelId() {
  if (typeof window === "undefined") {
    return "";
  }

  const modelId = window.localStorage.getItem(READY_LOCAL_MODEL_STORAGE_KEY);
  return typeof modelId === "string" ? modelId : "";
}

export function saveReadyLocalLLMModelId(modelId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(READY_LOCAL_MODEL_STORAGE_KEY, modelId);
}

export function clearReadyLocalLLMModelId() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(READY_LOCAL_MODEL_STORAGE_KEY);
}

export function getLoadedLocalLLMModelId() {
  return loadedModelId;
}

export function getProviderModelLabel(settings: AppSettings) {
  if (settings.llmProvider === "webllm") {
    return (
      AVAILABLE_LOCAL_MODELS.find((model) => model.id === settings.webllmModelId)?.label ??
      getLocalLLMModelId(settings.webllmModelId)
    );
  }

  if (settings.llmProvider === "openai") {
    return settings.openAIModel.trim() || "未设置模型";
  }

  if (settings.llmProvider === "anthropic") {
    return settings.anthropicModel.trim() || "未设置模型";
  }

  return settings.ollamaModel.trim() || "未设置模型";
}

export function getProviderStatusSummary(settings: AppSettings) {
  if (settings.llmProvider === "webllm") {
    return `模型：${getProviderModelLabel(settings)} · 按需启动`;
  }

  if (settings.llmProvider === "openai") {
    return `API：${getProviderModelLabel(settings)}`;
  }

  if (settings.llmProvider === "anthropic") {
    return `Anthropic：${getProviderModelLabel(settings)}`;
  }

  return `Ollama：${getProviderModelLabel(settings)}`;
}

export function getProviderMissingConfigMessage(settings: AppSettings) {
  if (settings.llmProvider === "webllm") {
    return "";
  }

  if (settings.llmProvider === "openai") {
    if (!settings.openAIBaseUrl.trim()) {
      return "请先在设置里填写 API 地址。";
    }

    if (!settings.openAIModel.trim()) {
      return "请先在设置里填写 API 模型名。";
    }

    if (!settings.openAIApiKey.trim()) {
      return "请先在设置里填写 API Key。";
    }

    return "";
  }

  if (settings.llmProvider === "anthropic") {
    if (!settings.anthropicBaseUrl.trim()) {
      return "请先在设置里填写 Anthropic 地址。";
    }

    if (!settings.anthropicModel.trim()) {
      return "请先在设置里填写 Anthropic 模型名。";
    }

    if (!settings.anthropicApiKey.trim()) {
      return "请先在设置里填写 Anthropic Key。";
    }

    return "";
  }

  if (!settings.ollamaBaseUrl.trim()) {
    return "请先在设置里填写 Ollama 地址。";
  }

  if (!settings.ollamaModel.trim()) {
    return "请先在设置里填写 Ollama 模型名。";
  }

  return "";
}

export async function validateLLMProviderConnection(settings: AppSettings) {
  const missingMessage = getProviderMissingConfigMessage(settings);
  if (missingMessage) {
    throw new Error(missingMessage);
  }

  if (settings.llmProvider === "webllm") {
    if (!isLocalLLMSupported()) {
      throw new Error("当前浏览器不支持 WebGPU，无法启用本地模型。");
    }

    return {
      ok: true,
      message: `当前设备可用，可加载 ${getProviderModelLabel(settings)}。`,
    };
  }

  if (settings.llmProvider === "openai") {
    try {
      const response = await fetch(`${settings.openAIBaseUrl.replace(/\/$/, "")}/models`, {
        headers: {
          Authorization: `Bearer ${settings.openAIApiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
    } catch {
      const fallbackResponse = await fetch(
        `${settings.openAIBaseUrl.replace(/\/$/, "")}/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${settings.openAIApiKey}`,
          },
          body: JSON.stringify({
            model: settings.openAIModel,
            messages: [{ role: "user", content: "ping" }],
            max_tokens: 1,
            stream: false,
          }),
        },
      );

      if (!fallbackResponse.ok) {
        const text = await fallbackResponse.text();
        throw new Error(text || "OpenAI 风格 API 连接失败。");
      }
    }

    return {
      ok: true,
      message: `接口可用，可继续使用 ${settings.openAIModel}。`,
    };
  }

  if (settings.llmProvider === "anthropic") {
    const response = await fetch(`${settings.anthropicBaseUrl.replace(/\/$/, "")}/models`, {
      headers: {
        "x-api-key": settings.anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Anthropic 风格 API 连接失败。");
    }

    return {
      ok: true,
      message: `接口可用，可继续使用 ${settings.anthropicModel}。`,
    };
  }

  const response = await fetch(`${settings.ollamaBaseUrl.replace(/\/$/, "")}/api/tags`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Ollama 连接失败。");
  }

  return {
    ok: true,
    message: `Ollama 可用，可继续使用 ${settings.ollamaModel}。`,
  };
}

export function getLocalLLMModelId(modelId?: string) {
  return modelId ?? loadedModelId ?? loadSelectedLocalLLMModelId();
}

export function isLocalLLMSupported() {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

export async function ensureLocalLLM(
  modelId = loadSelectedLocalLLMModelId(),
  onProgress?: (progress: LocalLLMProgress) => void,
): Promise<MLCEngine> {
  if (!isLocalLLMSupported()) {
    throw new Error("当前浏览器不支持 WebGPU，无法启用本地模型。");
  }

  if (cachedEngine && loadedModelId === modelId) {
    onProgress?.({ progress: 1, text: "本地模型已就绪" });
    saveReadyLocalLLMModelId(modelId);
    return cachedEngine;
  }

  if (loadedModelId && loadedModelId !== modelId) {
    cachedEngine = undefined;
    loadingPromise = undefined;
    loadedModelId = undefined;
    clearReadyLocalLLMModelId();
  }

  if (!loadingPromise) {
    loadingPromise = (async () => {
      const webllm = await import("@mlc-ai/web-llm");
      const engine = await webllm.CreateMLCEngine(modelId, {
        initProgressCallback: (report) => {
          onProgress?.({
            progress: report.progress,
            text: report.text,
          });
        },
      });
      cachedEngine = engine;
      loadedModelId = modelId;
      saveReadyLocalLLMModelId(modelId);
      return engine;
    })().catch((error) => {
      loadingPromise = undefined;
      clearReadyLocalLLMModelId();
      throw error;
    });
  }

  return loadingPromise;
}

export async function ensureLLMProviderReady(
  settings: AppSettings,
  onProgress?: (progress: LocalLLMProgress) => void,
) {
  const missingMessage = getProviderMissingConfigMessage(settings);
  if (missingMessage) {
    throw new Error(missingMessage);
  }

  if (settings.llmProvider === "webllm") {
    await ensureLocalLLM(settings.webllmModelId, onProgress);
  }
}

export function createLocalLLMMessages(request: LocalLLMRequest): LocalLLMMessage[] {
  const baseSystemPrompt =
    "你是一个完全本地运行的中文正式文档助手。回答要直接、清晰、克制，优先服务于制度、合同、需求说明、流程文件等正式文档处理。";
  const customPromptSuffix = request.customPrompt?.trim()
    ? ` 额外遵循以下用户偏好：${request.customPrompt.trim()}`
    : "";

  if (request.action === "review") {
    return [
      {
        role: "system" as const,
        content: `${baseSystemPrompt} 你现在是商务文档审阅助手，任务是做正式文件审阅和校对，而不是自由聊天。请按以下顺序逐一检查：1. 用词；2. 标点；3. 语法；4. 语句通顺性；5. 逻辑是否清楚；6. 事实是否完整；7. 条款风险。只输出你真正有把握的问题，绝对不要为了凑数量而编造问题。如果原文没有明确错误或风险，请直接输出：## 审阅结论\n未发现需要修改的明确问题。\n\n- 说明：这段内容在当前上下文下未发现确定性的用词、标点、语法、逻辑、事实完整性或条款风险问题。 如果发现问题，最多列出 3 条，并且必须严格使用 Markdown，多行展示，不能把标题和列表写在同一行。格式必须像下面这样：\n## 问题 1\n- 原文：...\n- 问题类型：...\n- 问题归类：笔误类 / 标点类 / 语法类 / 表达类 / 逻辑类 / 事实完整性类 / 条款风险类\n- 问题说明：...\n- 修改建议：...\n不要写客套话，不要泛泛评价，不要输出 <think> 或思考过程。${customPromptSuffix}`,
      },
      {
        role: "user" as const,
        content: `请审阅下面这段“${request.clauseTitle}”内容，并直接指出最关键的问题：\n\n${request.clauseText}`,
      },
    ];
  }

  if (request.action === "revise") {
    return [
      {
        role: "system" as const,
        content: `${baseSystemPrompt} 你现在是文档校改助手，工作模式是正式文件校改成稿。请把输入内容直接改成可用于正式文件落稿的正文。要求：保持原意和核心事实；修正用词、标点、语法、语句不通顺；补齐逻辑不清、事实不完整之处；消除明显的条款风险；必要时补足责任主体、触发条件、时间或交付条件，但不要凭空编造无法从上下文合理推出的新事实。请用 Markdown 输出，只输出改写后的正文内容，可以正常分段或列表，不要解释，不要加代码块，不要输出 <think> 或思考过程。${customPromptSuffix}`,
      },
      {
        role: "user" as const,
        content: `请直接改写下面这段“${request.clauseTitle}”内容，使其更明确、可执行：\n\n${request.clauseText}`,
      },
    ];
  }

  if (request.action === "polish") {
    return [
      {
        role: "system" as const,
        content: `${baseSystemPrompt} 你现在是文档润色助手，工作模式是轻度润色模式。请在不能改变原意、不能新增事实、不能改变责任边界的前提下，只优化措辞、标点、语气、节奏和书面感，让文本更顺、更稳、更适合正式文档。不要把轻度润色写成重新改写，不要主动补充新要求或新约束。请用 Markdown 输出，只输出润色后的正文内容，可以正常分段或列表，不要解释，不要加代码块，不要输出 <think> 或思考过程。${customPromptSuffix}`,
      },
      {
        role: "user" as const,
        content: `请润色下面这段“${request.clauseTitle}”内容，但不要改变原意：\n\n${request.clauseText}`,
      },
    ];
  }

  return [
      {
        role: "system" as const,
        content: `${baseSystemPrompt} 你需要结合当前文档上下文回答用户问题，默认把用户视为在处理正式文件。${customPromptSuffix}`,
      },
      {
        role: "user" as const,
        content: `当前处理位置：${request.clauseTitle}\n当前内容：${request.clauseText}\n\n用户要求：${request.userMessage ?? ""}`,
    },
  ];
}

export async function runLocalLLMTask(
  request: LocalLLMRequest,
  onProgress?: (progress: LocalLLMProgress) => void,
) {
  const engine = await ensureLocalLLM(request.modelId, onProgress);
  const result = await engine.chat.completions.create({
    messages: createLocalLLMMessages(request),
    temperature: request.action === "chat" ? 0.4 : 0.2,
    top_p: 0.9,
    max_tokens: request.action === "review" ? 240 : 320,
    extra_body: {
      enable_thinking: false,
    },
  });

  const reply = normalizeAssistantMarkdown(result.choices[0]?.message.content?.trim() ?? "");

  if (!reply) {
    throw new Error("本地模型没有返回可用内容。");
  }

  return reply;
}

function extractOpenAICompatibleContentPart(content?: OpenAICompatibleMessageContentPart): string {
  if (typeof content === "string") {
    return content.trim();
  }

  if (!content || typeof content !== "object") {
    return "";
  }

  if (typeof content.text === "string" && content.text.trim()) {
    return content.text.trim();
  }

  if (typeof content.content === "string" && content.content.trim()) {
    return content.content.trim();
  }

  if (Array.isArray(content.parts)) {
    return content.parts
      .map((part) => extractOpenAICompatibleContentPart(part))
      .filter(Boolean)
      .join("\n\n")
      .trim();
  }

  return "";
}

function extractOpenAICompatibleMessageText(
  content?: string | OpenAICompatibleMessageContentPart | OpenAICompatibleMessageContentPart[],
) {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => extractOpenAICompatibleContentPart(part))
      .filter(Boolean)
      .join("\n\n")
      .trim();
  }

  return extractOpenAICompatibleContentPart(content);
}

function extractOpenAICompatibleReply(payload: OpenAICompatiblePayload) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const firstChoice = payload.choices?.[0];
  const message = firstChoice?.message;
  const contentText = extractOpenAICompatibleMessageText(message?.content);
  if (contentText) {
    return contentText;
  }

  if (typeof message?.refusal === "string" && message.refusal.trim()) {
    return message.refusal.trim();
  }

  return "";
}

function describeOpenAICompatibleReplyIssue(payload: OpenAICompatiblePayload) {
  if (!Array.isArray(payload.choices) || payload.choices.length === 0) {
    return "模型接口已连通，但响应里没有返回 choices。";
  }

  const firstChoice = payload.choices[0];
  if (!firstChoice?.message) {
    return "模型接口已连通，但响应里没有返回 message。";
  }

  if (typeof firstChoice.message.reasoning_content === "string" && firstChoice.message.reasoning_content.trim()) {
    return "模型接口已连通，但只返回了思考内容，没有返回最终正文。";
  }

  if (Array.isArray(firstChoice.message.content)) {
    return "模型接口已连通，但 content 数组里没有可读取的正文。";
  }

  return "模型接口已连通，但返回正文为空或返回格式不兼容。";
}

async function runOpenAICompatibleTask(request: LocalLLMRequest, settings: AppSettings) {
  const response = await fetch(`${settings.openAIBaseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.openAIApiKey}`,
    },
    body: JSON.stringify({
      model: settings.openAIModel,
      messages: createLocalLLMMessages(request),
      temperature: request.action === "chat" ? 0.4 : 0.2,
      top_p: 0.9,
      max_tokens: request.action === "review" ? 240 : 320,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "外部模型服务调用失败。");
  }

  const payload = (await response.json()) as OpenAICompatiblePayload;
  const reply = normalizeAssistantMarkdown(extractOpenAICompatibleReply(payload));

  if (!reply) {
    console.warn("[llm] openai-compatible provider returned no usable reply", {
      hasOutputText: typeof payload.output_text === "string" && payload.output_text.trim().length > 0,
      choicesCount: Array.isArray(payload.choices) ? payload.choices.length : 0,
      firstChoiceKeys:
        payload.choices && payload.choices[0] ? Object.keys(payload.choices[0]) : [],
      firstMessageKeys:
        payload.choices?.[0]?.message ? Object.keys(payload.choices[0].message ?? {}) : [],
    });
    throw new Error(describeOpenAICompatibleReplyIssue(payload));
  }

  return reply;
}

async function runAnthropicCompatibleTask(request: LocalLLMRequest, settings: AppSettings) {
  const messages = createLocalLLMMessages(request);
  const system = messages.find((message) => message.role === "system")?.content ?? "";
  const conversation = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));

  const response = await fetch(`${settings.anthropicBaseUrl.replace(/\/$/, "")}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": settings.anthropicApiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: settings.anthropicModel,
      system,
      messages: conversation,
      temperature: request.action === "chat" ? 0.4 : 0.2,
      top_p: 0.9,
      max_tokens: request.action === "review" ? 240 : 320,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Anthropic 风格 API 调用失败。");
  }

  const payload = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const reply = normalizeAssistantMarkdown(
    payload.content
      ?.filter((block) => block.type === "text" && typeof block.text === "string")
      .map((block) => block.text?.trim() ?? "")
      .filter(Boolean)
      .join("\n\n") ?? "",
  );

  if (!reply) {
    throw new Error("Anthropic 风格 API 没有返回可用内容。");
  }

  return reply;
}

async function runOllamaTask(request: LocalLLMRequest, settings: AppSettings) {
  const response = await fetch(`${settings.ollamaBaseUrl.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: settings.ollamaModel,
      stream: false,
      messages: createLocalLLMMessages(request),
      options: {
        temperature: request.action === "chat" ? 0.4 : 0.2,
        top_p: 0.9,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Ollama 调用失败。");
  }

  const payload = (await response.json()) as {
    message?: { content?: string };
  };
  const reply = normalizeAssistantMarkdown(payload.message?.content?.trim() ?? "");

  if (!reply) {
    throw new Error("Ollama 没有返回可用内容。");
  }

  return reply;
}

export async function runLLMTask(
  request: LocalLLMRequest,
  settings: AppSettings,
  onProgress?: (progress: LocalLLMProgress) => void,
) {
  if (settings.llmProvider === "webllm") {
    return runLocalLLMTask(
      {
        ...request,
        modelId: settings.webllmModelId,
      },
      onProgress,
    );
  }

  if (settings.llmProvider === "openai") {
    return runOpenAICompatibleTask(request, settings);
  }

  if (settings.llmProvider === "anthropic") {
    return runAnthropicCompatibleTask(request, settings);
  }

  return runOllamaTask(request, settings);
}
