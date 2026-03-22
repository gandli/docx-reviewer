import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createLocalLLMMessages,
  getAvailableLocalLLMModels,
  getDefaultLocalLLMModelId,
  loadSelectedLocalLLMModelId,
  saveSelectedLocalLLMModelId,
} from "@/services/ai/local-llm";

describe("local llm", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("provides a curated local model list with a stable default", () => {
    const models = getAvailableLocalLLMModels();

    expect(models.length).toBeGreaterThanOrEqual(4);
    expect(models.some((model) => model.id === getDefaultLocalLLMModelId())).toBe(true);
    expect(models.some((model) => model.id === "Qwen2.5-1.5B-Instruct-q4f16_1-MLC")).toBe(true);
  });

  it("persists and restores selected model id", () => {
    saveSelectedLocalLLMModelId("Qwen2.5-1.5B-Instruct-q4f16_1-MLC");

    expect(loadSelectedLocalLLMModelId()).toBe("Qwen2.5-1.5B-Instruct-q4f16_1-MLC");
  });

  it("builds document review prompts for finding issues", () => {
    const messages = createLocalLLMMessages({
      action: "review",
      clauseTitle: "付款方式",
      clauseText: "合同签订后一次性支付全部款项。",
    });

    expect(messages[0]?.content).toContain("商务文档审阅助手");
    expect(messages[0]?.content).toContain("只列出 2 到 3 条最重要的问题");
    expect(messages[0]?.content).toContain("风险等级");
    expect(messages[1]?.content).toContain("请审阅下面这段");
  });

  it("builds document revision prompts for direct rewrite", () => {
    const messages = createLocalLLMMessages({
      action: "revise",
      clauseTitle: "付款方式",
      clauseText: "合同签订后一次性支付全部款项。",
    });

    expect(messages[0]?.content).toContain("文档校改助手");
    expect(messages[0]?.content).toContain("直接输出改写后的正式正文");
    expect(messages[0]?.content).toContain("不要解释");
    expect(messages[1]?.content).toContain("请直接改写下面这段");
  });

  it("builds document polish prompts while preserving intent", () => {
    const messages = createLocalLLMMessages({
      action: "polish",
      clauseTitle: "付款方式",
      clauseText: "合同签订后一次性支付全部款项。",
    });

    expect(messages[0]?.content).toContain("文档润色助手");
    expect(messages[0]?.content).toContain("不能改变原意");
    expect(messages[0]?.content).toContain("更规范、更专业、更适合正式文档");
    expect(messages[1]?.content).toContain("请润色下面这段");
  });
});
