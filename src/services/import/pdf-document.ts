import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import type {
  WorkspaceDocumentBlock,
  WorkspaceImportedDocument,
} from "@/features/workspace-context/types/workspace-summary";

function stripExtension(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "");
}

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error(`读取 PDF 失败：${file.name}`));
    reader.readAsDataURL(file);
  });
}

function normalizePageText(items: string[]) {
  return items
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/\s([,.!?;:])/g, "$1")
    .trim();
}

async function extractPdfBlocks(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDocument = await loadingTask.promise;
  const blocks: WorkspaceDocumentBlock[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const strings = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .filter((item): item is string => Boolean(item));
      const pageText = normalizePageText(strings);

      blocks.push({
        id: `pdf-heading-${pageNumber}`,
        kind: "heading",
        level: 2,
        pageNumber,
        text: `第 ${pageNumber} 页`,
      });

      blocks.push({
        id: `pdf-paragraph-${pageNumber}`,
        kind: "paragraph",
        pageNumber,
        text: pageText || `第 ${pageNumber} 页暂未提取到可用正文。`,
      });
    }
  } finally {
    await pdfDocument.destroy();
  }

  return blocks;
}

export async function parsePdfDocument(file: File): Promise<WorkspaceImportedDocument> {
  const title = stripExtension(file.name);
  const [pdfSource, blocks] = await Promise.all([readFileAsDataUrl(file), extractPdfBlocks(file)]);
  const firstPageParagraph = blocks.find(
    (block) => block.kind === "paragraph" && block.pageNumber === 1,
  );

  return {
    mode: "pdf",
    title,
    blocks,
    activeClauseTitle: "第 1 页",
    activeClauseText:
      firstPageParagraph?.text || "当前文档已按原样预览打开，可继续围绕整份文档找问题或直接改写。",
    pdfSource,
  };
}
