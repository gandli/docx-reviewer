export function normalizeAssistantMarkdown(content: string) {
  return content
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<\/?think>/gi, "")
    .replace(/\r/g, "")
    .replace(/(#+\s*问题\s*\d+)\s*[；;]+\s*/g, "$1\n")
    .replace(/([。！？])\s*-\s*(原文：|问题类型：|问题归类：|问题说明：|修改建议：)/g, "$1\n\n- $2")
    .replace(/(?<!\n)-\s*(原文：|问题类型：|问题归类：|问题说明：|修改建议：)/g, "\n- $1")
    .replace(/(问题归类：[^-\n]+?)\s+[；;]?\s*-\s*(问题说明：)/g, "$1\n- $2")
    .replace(/(问题说明：[^-\n]+?)\s+[；;]?\s*-\s*(修改建议：)/g, "$1\n- $2")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
