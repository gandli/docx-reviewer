import type { WorkspaceImportedDocument } from "@/features/workspace-context/types/workspace-summary";
import { parseDocxDocument } from "@/services/import/docx-document";
import { parsePdfDocument } from "@/services/import/pdf-document";
import { parsePlainTextDocument } from "@/services/import/plain-text-document";

function getExtension(fileName: string) {
  const match = fileName.toLowerCase().match(/\.([^.]+)$/);
  return match?.[1] ?? "";
}

export async function importDocumentFile(file: File): Promise<WorkspaceImportedDocument> {
  const extension = getExtension(file.name);

  if (extension === "txt" || extension === "md") {
    return parsePlainTextDocument(file.name, await file.text());
  }

  if (extension === "docx") {
    return parseDocxDocument(file);
  }

  if (extension === "pdf") {
    return parsePdfDocument(file);
  }

  throw new Error(`暂不支持导入该文件类型：${file.name}`);
}
