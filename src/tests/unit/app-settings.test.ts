import {
  createExportedModelServiceConfig,
  getDefaultAppSettings,
  parseImportedModelServiceConfig,
} from "@/services/persistence/app-settings";

describe("app settings", () => {
  it("exports and reimports model service config including anthropic fields", () => {
    const settings = {
      ...getDefaultAppSettings(),
      llmProvider: "anthropic" as const,
      anthropicBaseUrl: "https://anthropic.example.com/v1",
      anthropicApiKey: "anthropic-key",
      anthropicModel: "claude-reviewer",
    };

    const exported = createExportedModelServiceConfig(settings, "Qwen2.5-1.5B-Instruct-q4f16_1-MLC");
    const imported = parseImportedModelServiceConfig(JSON.stringify(exported), getDefaultAppSettings());

    expect(imported.settings.llmProvider).toBe("anthropic");
    expect(imported.settings.anthropicBaseUrl).toBe("https://anthropic.example.com/v1");
    expect(imported.settings.anthropicApiKey).toBe("anthropic-key");
    expect(imported.settings.anthropicModel).toBe("claude-reviewer");
    expect(imported.readyWebllmModelId).toBe("Qwen2.5-1.5B-Instruct-q4f16_1-MLC");
  });

  it("rejects invalid imported model service config", () => {
    expect(() =>
      parseImportedModelServiceConfig("{not-json}", getDefaultAppSettings()),
    ).toThrow("导入文件不是有效的 JSON 配置。");
  });
});
