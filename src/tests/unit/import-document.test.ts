import { beforeEach, describe, expect, it, vi } from "vitest";
import { importDocumentFile } from "@/services/import/import-document";

const { parseDocxDocumentMock } = vi.hoisted(() => ({
  parseDocxDocumentMock: vi.fn(),
}));

vi.mock("@/services/import/docx-document", () => ({
  parseDocxDocument: parseDocxDocumentMock,
}));

describe("import document", () => {
  beforeEach(() => {
    parseDocxDocumentMock.mockReset();
  });

  it("routes docx files to the docx parser", async () => {
    const file = new File(["fake"], "制度范本.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    parseDocxDocumentMock.mockResolvedValue({
      title: "制度范本",
      blocks: [],
      activeClauseTitle: "制度范本",
      activeClauseText: "正文",
    });

    const result = await importDocumentFile(file);

    expect(parseDocxDocumentMock).toHaveBeenCalledWith(file);
    expect(result.title).toBe("制度范本");
  });

  it("rejects unsupported file types", async () => {
    const file = new File(["fake"], "附件.pdf", { type: "application/pdf" });

    await expect(importDocumentFile(file)).rejects.toThrow("暂不支持导入该文件类型");
  });
});
