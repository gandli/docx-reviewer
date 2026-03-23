import { describe, expect, it } from "vitest";
import { normalizeAssistantMarkdown } from "@/shared/utils/assistant-message-format";

describe("assistant message format", () => {
  it("removes internal think blocks before rendering", () => {
    const result = normalizeAssistantMarkdown(`
<think>
这里是模型内部思考
</think>

### 问题 1
- 原文：付款条件不明确
- 修改建议：补充触发条件
`);

    expect(result).not.toContain("<think>");
    expect(result).not.toContain("这里是模型内部思考");
    expect(result).toContain("### 问题 1");
    expect(result).toContain("- 修改建议：补充触发条件");
  });

  it("keeps markdown content readable after cleanup", () => {
    const result = normalizeAssistantMarkdown(`

### 改写结果

付款应在验收通过且发票齐全后，按约定节点分阶段支付。
`);

    expect(result).toBe("### 改写结果\n\n付款应在验收通过且发票齐全后，按约定节点分阶段支付。");
  });

  it("repairs collapsed review output into readable markdown bullets", () => {
    const result = normalizeAssistantMarkdown(`
问题 1；- 问题类型：表达类；- 问题归类：语句通顺性；- 问题说明：原文中的句子不够顺。- 修改建议：建议调整语序。
`);

    expect(result).toContain("问题 1");
    expect(result).toContain("\n- 问题类型：表达类");
    expect(result).toContain("\n- 问题归类：语句通顺性");
    expect(result).toContain("\n- 问题说明：原文中的句子不够顺。");
    expect(result).toContain("\n- 修改建议：建议调整语序。");
  });
});
