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
  customPrompt?: string;
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
  deviceTier: string;
  vramHint: string;
};

const LOCAL_MODEL_STORAGE_KEY = "local-llm:selected-model";
const DEFAULT_LOCAL_MODEL_ID = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";
const AVAILABLE_LOCAL_MODELS: LocalLLMModelOption[] = [
  {
    id: "SmolLM2-360M-Instruct-q4f16_1-MLC",
    label: "SmolLM2 360M",
    summary: "最轻量，适合先快速验证流程或低资源设备。",
    tags: ["轻量", "快速", "入门"],
    deviceTier: "入门设备",
    vramHint: "建议显存 2GB 以上",
  },
  {
    id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    label: "Qwen2.5 0.5B",
    summary: "中文友好，加载更快，适合轻量审阅和短文本处理。",
    tags: ["中文", "轻量", "快速"],
    deviceTier: "入门设备",
    vramHint: "建议显存 2GB 以上",
  },
  {
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    label: "Qwen2.5 1.5B",
    summary: "中文审阅和校改更稳，适合正式文档处理。",
    tags: ["推荐", "中文", "审阅"],
    deviceTier: "主流设备",
    vramHint: "建议显存 4GB 以上",
  },
  {
    id: "Qwen3-0.6B-q4f16_1-MLC",
    label: "Qwen3 0.6B",
    summary: "更轻，启动更快，适合先快速试跑。",
    tags: ["轻量", "快速"],
    deviceTier: "入门设备",
    vramHint: "建议显存 2GB 以上",
  },
  {
    id: "Qwen3-1.7B-q4f16_1-MLC",
    label: "Qwen3 1.7B",
    summary: "兼顾速度和质量，适合更长一点的上下文。",
    tags: ["平衡", "中文"],
    deviceTier: "主流设备",
    vramHint: "建议显存 4GB 以上",
  },
  {
    id: "Qwen2.5-3B-Instruct-q4f16_1-MLC",
    label: "Qwen2.5 3B",
    summary: "比 1.5B 更稳，适合更复杂的正式文书生成和审阅。",
    tags: ["中文", "增强", "审阅"],
    deviceTier: "增强设备",
    vramHint: "建议显存 6GB 以上",
  },
  {
    id: "Qwen3-4B-q4f16_1-MLC",
    label: "Qwen3 4B",
    summary: "更强的上下文理解与改写能力，适合长一点的文书任务。",
    tags: ["增强", "中文", "长文"],
    deviceTier: "增强设备",
    vramHint: "建议显存 8GB 以上",
  },
  {
    id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    label: "Llama 3.2 1B",
    summary: "通用能力稳定，可作为 Qwen 之外的轻量备选。",
    tags: ["通用", "轻量", "备选"],
    deviceTier: "入门设备",
    vramHint: "建议显存 3GB 以上",
  },
  {
    id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
    label: "Llama 3.2 3B",
    summary: "质量更稳，适合做对比生成和通用文书处理。",
    tags: ["通用", "平衡", "备选"],
    deviceTier: "增强设备",
    vramHint: "建议显存 6GB 以上",
  },
  {
    id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
    label: "Phi 3.5 Mini",
    summary: "英文和通用写作表现稳定，可作备选。",
    tags: ["英文", "通用"],
    deviceTier: "主流设备",
    vramHint: "建议显存 4GB 以上",
  },
  {
    id: "gemma-2-2b-it-q4f16_1-MLC",
    label: "Gemma 2 2B",
    summary: "适合对比不同风格输出，回复更克制。",
    tags: ["备选", "克制"],
    deviceTier: "主流设备",
    vramHint: "建议显存 4GB 以上",
  },
  {
    id: "SmolLM2-1.7B-Instruct-q4f16_1-MLC",
    label: "SmolLM2 1.7B",
    summary: "在较低资源下保持不错的响应速度，适合轻量长文处理。",
    tags: ["轻量", "平衡", "低资源"],
    deviceTier: "主流设备",
    vramHint: "建议显存 4GB 以上",
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
