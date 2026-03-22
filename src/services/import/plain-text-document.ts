import type {
  WorkspaceDocumentBlock,
  WorkspaceImportedDocument,
} from "@/features/workspace-context/types/workspace-summary";

const headingPattern = /^(#{1,3})\s+(.*)$/;

function createBlockId(prefix: string, index: number) {
  return `${prefix}-${index + 1}`;
}

function getTitleFromFileName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "") || "未命名文档";
}

function collectBlocks(content: string) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: WorkspaceDocumentBlock[] = [];
  const paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    const text = paragraphBuffer.join(" ").trim();
    paragraphBuffer.length = 0;

    if (!text) {
      return;
    }

    blocks.push({
      id: createBlockId("paragraph", blocks.length),
      kind: "paragraph",
      text,
    });
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      continue;
    }

    const headingMatch = line.match(headingPattern);
    if (headingMatch) {
      flushParagraph();
      blocks.push({
        id: createBlockId("heading", blocks.length),
        kind: "heading",
        level: Math.min(headingMatch[1].length, 3) as 1 | 2 | 3,
        text: headingMatch[2].trim(),
      });
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushParagraph();

  return blocks.length > 0
    ? blocks
    : [
        {
          id: "paragraph-1",
          kind: "paragraph",
          text: "文档内容为空。",
        },
      ];
}

export function parseTextDocumentContent(
  fileName: string,
  content: string,
): WorkspaceImportedDocument {
  const blocks = collectBlocks(content);
  const firstHeading = blocks.find((block) => block.kind === "heading");
  const firstParagraph = blocks.find((block) => block.kind === "paragraph");

  return {
    mode: "structured",
    title: firstHeading?.text ?? getTitleFromFileName(fileName),
    blocks,
    activeClauseTitle: firstHeading?.text ?? getTitleFromFileName(fileName),
    activeClauseText: firstParagraph?.text ?? "暂无正文内容。",
  };
}

export function parsePlainTextDocument(fileName: string, content: string): WorkspaceImportedDocument {
  return parseTextDocumentContent(fileName, content);
}
