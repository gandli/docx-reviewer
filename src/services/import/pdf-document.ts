import type { WorkspaceImportedDocument } from "@/features/workspace-context/types/workspace-summary";

function stripExtension(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "");
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error(`读取 PDF 失败：${file.name}`));
    reader.readAsDataURL(file);
  });
}

export async function parsePdfDocument(file: File): Promise<WorkspaceImportedDocument> {
  const title = stripExtension(file.name);
  const pdfSource = await readFileAsDataUrl(file);

  return {
    mode: "pdf",
    title,
    blocks: [],
    activeClauseTitle: "PDF 预览",
    activeClauseText: "当前文档已按原样预览打开，可继续围绕整份文档发起审阅或修订。",
    pdfSource,
  };
}
