import { normalizeAssistantMarkdown } from "@/shared/utils/assistant-message-format";

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
};

type LocalLLMMessage = {
  role: "system" | "user";
  content: string;
};

export type LocalLLMModelOption = {
  id: string;
  label: string;
  summary: string;
  tags: string[];
};

const LOCAL_MODEL_STORAGE_KEY = "local-llm:selected-model";
const DEFAULT_LOCAL_MODEL_ID = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";
const AVAILABLE_LOCAL_MODELS: LocalLLMModelOption[] = [
  {
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    label: "Qwen2.5 1.5B",
    summary: "中文审阅和校改更稳，适合正式文档处理。",
    tags: ["推荐", "中文", "审阅"],
  },
  {
    id: "Qwen3-0.6B-q4f16_1-MLC",
    label: "Qwen3 0.6B",
    summary: "更轻，启动更快，适合先快速试跑。",
    tags: ["轻量", "快速"],
  },
  {
    id: "Qwen3-1.7B-q4f16_1-MLC",
    label: "Qwen3 1.7B",
    summary: "兼顾速度和质量，适合更长一点的上下文。",
    tags: ["平衡", "中文"],
  },
  {
    id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
    label: "Phi 3.5 Mini",
    summary: "英文和通用写作表现稳定，可作备选。",
    tags: ["英文", "通用"],
  },
  {
    id: "gemma-2-2b-it-q4f16_1-MLC",
    label: "Gemma 2 2B",
    summary: "适合对比不同风格输出，回复更克制。",
    tags: ["备选", "克制"],
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

export function getLoadedLocalLLMModelId() {
  return loadedModelId;
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
    return cachedEngine;
  }

  if (loadedModelId && loadedModelId !== modelId) {
    cachedEngine = undefined;
    loadingPromise = undefined;
    loadedModelId = undefined;
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
      return engine;
    })().catch((error) => {
      loadingPromise = undefined;
      throw error;
    });
  }

  return loadingPromise;
}

export function createLocalLLMMessages(request: LocalLLMRequest): LocalLLMMessage[] {
  const baseSystemPrompt =
    "你是一个完全本地运行的中文正式文档助手。回答要直接、清晰、克制，优先服务于制度、合同、需求说明、流程文件等正式文档处理。";

  if (request.action === "review") {
    return [
      {
        role: "system" as const,
        content: `${baseSystemPrompt} 你现在是商务文档审阅助手，任务是做正式文件审阅和校对，而不是自由聊天。请按以下顺序逐一检查：1. 用词；2. 标点；3. 语法；4. 语句通顺性；5. 逻辑是否清楚；6. 事实是否完整；7. 条款风险。请只列出 2 到 3 条最重要、最有把握的问题，不要凑数。请用 Markdown 输出，格式示例必须遵守：### 问题 1；- 原文：…；- 问题类型：…；- 问题归类：笔误类/标点类/语法类/表达类/逻辑类/事实完整性类/条款风险类；- 问题说明：…；- 修改建议：…。不要写客套话，不要泛泛评价，不要输出 <think> 或思考过程。`,
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
        content: `${baseSystemPrompt} 你现在是文档校改助手，工作模式是正式文件校改成稿。请把输入内容直接改成可用于正式文件落稿的正文。要求：保持原意和核心事实；修正用词、标点、语法、语句不通顺；补齐逻辑不清、事实不完整之处；消除明显的条款风险；必要时补足责任主体、触发条件、时间或交付条件，但不要凭空编造无法从上下文合理推出的新事实。请用 Markdown 输出，只输出改写后的正文内容，可以正常分段或列表，不要解释，不要加代码块，不要输出 <think> 或思考过程。`,
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
        content: `${baseSystemPrompt} 你现在是文档润色助手，工作模式是轻度润色模式。请在不能改变原意、不能新增事实、不能改变责任边界的前提下，只优化措辞、标点、语气、节奏和书面感，让文本更顺、更稳、更适合正式文档。不要把轻度润色写成重新改写，不要主动补充新要求或新约束。请用 Markdown 输出，只输出润色后的正文内容，可以正常分段或列表，不要解释，不要加代码块，不要输出 <think> 或思考过程。`,
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
        content: `${baseSystemPrompt} 你需要结合当前文档上下文回答用户问题，默认把用户视为在处理正式文件。`,
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
