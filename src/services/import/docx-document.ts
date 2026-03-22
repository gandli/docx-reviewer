import mammoth from "mammoth";
import type {
  WorkspaceDocumentBlock,
  WorkspaceImportedDocument,
} from "@/features/workspace-context/types/workspace-summary";
import { parseTextDocumentContent } from "@/services/import/plain-text-document";

function parseHeadingLevel(tagName: string) {
  if (tagName === "H1") {
    return 1;
  }

  if (tagName === "H2") {
    return 2;
  }

  if (tagName === "H3") {
    return 3;
  }

  return undefined;
}

function parseDocxHtml(fileName: string, html: string): WorkspaceImportedDocument | undefined {
  if (typeof DOMParser === "undefined") {
    return undefined;
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(`<body>${html}</body>`, "text/html");
  const elements = Array.from(document.body.children);
  const blocks: WorkspaceDocumentBlock[] = elements
    .map((element, index) => {
      const text = element.textContent?.trim() ?? "";
      if (!text) {
        return undefined;
      }

      const level = parseHeadingLevel(element.tagName);

      return {
        id: `${level ? "heading" : "paragraph"}-${index + 1}`,
        kind: level ? ("heading" as const) : ("paragraph" as const),
        level,
        text,
      };
    })
    .filter((block): block is WorkspaceDocumentBlock => Boolean(block));

  if (blocks.length === 0) {
    return undefined;
  }

  const firstHeading = blocks.find((block) => block.kind === "heading");
  const firstParagraph = blocks.find((block) => block.kind === "paragraph");

  return {
    mode: "structured",
    title: firstHeading?.text ?? blocks[0].text ?? fileName.replace(/\.[^.]+$/, ""),
    blocks,
    activeClauseTitle: firstHeading?.text ?? blocks[0].text ?? fileName.replace(/\.[^.]+$/, ""),
    activeClauseText: firstParagraph?.text ?? blocks[0].text,
  };
}

export async function parseDocxDocument(file: File): Promise<WorkspaceImportedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
  const parsedHtml = parseDocxHtml(file.name, htmlResult.value);

  if (parsedHtml) {
    return parsedHtml;
  }

  const textResult = await mammoth.extractRawText({ arrayBuffer });

  return parseTextDocumentContent(file.name, textResult.value);
}
