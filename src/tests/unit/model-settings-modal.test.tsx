import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocalModelSettingsModal } from "@/features/assistant-panel/components/local-model-settings-modal";

describe("local model settings modal", () => {
  const modelOptions = [
    {
      id: "Qwen3-0.6B-q4f16_1-MLC",
      label: "Qwen3 0.6B",
      summary: "更轻，启动更快",
      tags: ["中文", "轻量", "推荐"],
    },
    {
      id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
      label: "Qwen2.5 1.5B",
      summary: "中文审阅更稳",
      tags: ["中文", "审阅"],
    },
  ];

  it("filters model list by keyword and confirms selection", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <LocalModelSettingsModal
        isOpen
        selectedModelId="Qwen3-0.6B-q4f16_1-MLC"
        activeModelId="Qwen3-0.6B-q4f16_1-MLC"
        modelOptions={modelOptions}
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("搜索模型"), {
      target: { value: "1.5B" },
    });

    expect(screen.queryByText("Qwen3 0.6B")).not.toBeInTheDocument();
    expect(screen.getByText("Qwen2.5 1.5B")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Qwen2.5 1.5B"));
    fireEvent.click(screen.getByRole("button", { name: "保存并启用" }));

    expect(onConfirm).toHaveBeenCalledWith("Qwen2.5-1.5B-Instruct-q4f16_1-MLC");
  });
});
