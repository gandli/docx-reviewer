import type { WorkspaceDocumentBlock, WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";

export type WorkspaceExportFormat = "md" | "txt";

function sanitizeFileName(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "-").trim() || "文档导出";
}

function formatMarkdownBlock(block: WorkspaceDocumentBlock) {
  if (block.kind === "heading") {
    const level = Math.min(block.level ?? 2, 3);
    return `${"#".repeat(level)} ${block.text}`;
  }

  return block.text;
}

export function createWorkspaceExportPayload(
  summary: WorkspaceSummary,
  format: WorkspaceExportFormat,
) {
  const extension = format === "md" ? "md" : "txt";
  const fileName = `${sanitizeFileName(summary.activeDocumentTitle)}.${extension}`;

  const content =
    format === "md"
      ? summary.documentBlocks.map(formatMarkdownBlock).join("\n\n")
      : summary.documentBlocks.map((block) => block.text).join("\n\n");

  const mimeType = format === "md" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8";

  return {
    fileName,
    mimeType,
    content,
  };
}

export function downloadWorkspaceExport(summary: WorkspaceSummary, format: WorkspaceExportFormat) {
  const payload = createWorkspaceExportPayload(summary, format);
  const blob = new Blob([payload.content], { type: payload.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = payload.fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
