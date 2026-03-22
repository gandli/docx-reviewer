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
};

const LOCAL_MODEL_ID = "Qwen3-0.6B-q4f16_1-MLC";

type WebLLMModule = typeof import("@mlc-ai/web-llm");
type MLCEngine = Awaited<ReturnType<WebLLMModule["CreateMLCEngine"]>>;

let cachedEngine: MLCEngine | undefined;
let loadingPromise: Promise<MLCEngine> | undefined;

export function getLocalLLMModelId() {
  return LOCAL_MODEL_ID;
}

export function isLocalLLMSupported() {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

export async function ensureLocalLLM(
  onProgress?: (progress: LocalLLMProgress) => void,
): Promise<MLCEngine> {
  if (!isLocalLLMSupported()) {
    throw new Error("当前浏览器不支持 WebGPU，无法启用本地模型。");
  }

  if (cachedEngine) {
    onProgress?.({ progress: 1, text: "本地模型已就绪" });
    return cachedEngine;
  }

  if (!loadingPromise) {
    loadingPromise = (async () => {
      const webllm = await import("@mlc-ai/web-llm");
      const engine = await webllm.CreateMLCEngine(LOCAL_MODEL_ID, {
        initProgressCallback: (report) => {
          onProgress?.({
            progress: report.progress,
            text: report.text,
          });
        },
      });
      cachedEngine = engine;
      return engine;
    })().catch((error) => {
      loadingPromise = undefined;
      throw error;
    });
  }

  return loadingPromise;
}

function buildMessages(request: LocalLLMRequest) {
  const baseSystemPrompt =
    "你是一个完全本地运行的中文文档助手。回答要直接、清晰、克制，不要空话。";

  if (request.action === "review") {
    return [
      {
        role: "system" as const,
        content: `${baseSystemPrompt} 你的任务是找出文档内容里的关键问题。请只列出 2 到 3 条最重要的问题。每条单独成行，格式为“问题：… 原因：… 建议：…”。`,
      },
      {
        role: "user" as const,
        content: `请检查下面这段“${request.clauseTitle}”内容，并直接找出问题：\n\n${request.clauseText}`,
      },
    ];
  }

  if (request.action === "revise") {
    return [
      {
        role: "system" as const,
        content: `${baseSystemPrompt} 你的任务是直接改写文档内容。请只输出改写后的正文，不要解释，不要加标题。`,
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
        content: `${baseSystemPrompt} 你的任务是润色表达。请保持原意不变，只优化措辞、语气和专业度。请只输出润色后的正文，不要解释。`,
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
      content: `${baseSystemPrompt} 你需要结合当前文档上下文回答用户问题。`,
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
  const engine = await ensureLocalLLM(onProgress);
  const result = await engine.chat.completions.create({
    messages: buildMessages(request),
    temperature: request.action === "chat" ? 0.4 : 0.2,
    top_p: 0.9,
    max_tokens: request.action === "review" ? 240 : 320,
    extra_body: {
      enable_thinking: false,
    },
  });

  const reply = result.choices[0]?.message.content?.trim();

  if (!reply) {
    throw new Error("本地模型没有返回可用内容。");
  }

  return reply;
}
