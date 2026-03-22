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

    expect(models.length).toBeGreaterThanOrEqual(9);
    expect(models.some((model) => model.id === getDefaultLocalLLMModelId())).toBe(true);
    expect(models.some((model) => model.id === "Qwen2.5-1.5B-Instruct-q4f16_1-MLC")).toBe(true);
    expect(models.some((model) => model.id === "SmolLM2-360M-Instruct-q4f16_1-MLC")).toBe(true);
    expect(models.some((model) => model.id === "Qwen2.5-3B-Instruct-q4f16_1-MLC")).toBe(true);
    expect(models.some((model) => model.id === "Llama-3.2-3B-Instruct-q4f16_1-MLC")).toBe(true);
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
    expect(messages[0]?.content).toContain("Markdown");
    expect(messages[0]?.content).toContain("### 问题 1");
    expect(messages[0]?.content).toContain("- 原文：");
    expect(messages[0]?.content).toContain("- 修改建议：");
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
});
