import { beforeEach, describe, expect, it, vi } from "vitest";
import { importDocumentFile } from "@/services/import/import-document";

const { parseDocxDocumentMock } = vi.hoisted(() => ({
  parseDocxDocumentMock: vi.fn(),
}));
const { parsePdfDocumentMock } = vi.hoisted(() => ({
  parsePdfDocumentMock: vi.fn(),
}));

vi.mock("@/services/import/docx-document", () => ({
  parseDocxDocument: parseDocxDocumentMock,
}));

vi.mock("@/services/import/pdf-document", () => ({
  parsePdfDocument: parsePdfDocumentMock,
}));

describe("import document", () => {
  beforeEach(() => {
    parseDocxDocumentMock.mockReset();
    parsePdfDocumentMock.mockReset();
  });

  it("routes docx files to the docx parser", async () => {
    const file = new File(["fake"], "制度范本.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    parseDocxDocumentMock.mockResolvedValue({
      mode: "docx",
      title: "制度范本",
      blocks: [],
      activeClauseTitle: "制度范本",
      activeClauseText: "正文",
      docxSource: new ArrayBuffer(8),
    });

    const result = await importDocumentFile(file);

    expect(parseDocxDocumentMock).toHaveBeenCalledWith(file);
    expect(result.title).toBe("制度范本");
  });

  it("routes pdf files to the pdf parser", async () => {
    const file = new File(["fake"], "附件.pdf", { type: "application/pdf" });

    parsePdfDocumentMock.mockResolvedValue({
      mode: "pdf",
      title: "附件",
      blocks: [
        { id: "pdf-heading-1", kind: "heading", level: 2, pageNumber: 1, text: "第 1 页" },
        { id: "pdf-paragraph-1", kind: "paragraph", pageNumber: 1, text: "付款方式..." },
      ],
      activeClauseTitle: "第 1 页",
      activeClauseText: "付款方式...",
      pdfSource: "data:application/pdf;base64,ZmFrZQ==",
    });

    const result = await importDocumentFile(file);

    expect(parsePdfDocumentMock).toHaveBeenCalledWith(file);
    expect(result.mode).toBe("pdf");
    expect(result.title).toBe("附件");
    expect(result.pdfSource).toContain("data:application/pdf");
  });

  it("shows a clear message for legacy doc files", async () => {
    const file = new File(["fake"], "旧版制度.doc", { type: "application/msword" });

    await expect(importDocumentFile(file)).rejects.toThrow(
      "当前版本暂不支持直接预览 .doc，请先转换为 .docx 后再导入。",
    );
  });

  it("rejects unsupported file types", async () => {
    const file = new File(["fake"], "附件.xls", { type: "application/vnd.ms-excel" });

    await expect(importDocumentFile(file)).rejects.toThrow("暂不支持导入该文件类型");
  });
});
