export type SourceFormat =
  | "pdf"
  | "doc"
  | "docx"
  | "xls"
  | "xlsx"
  | "txt"
  | "md";

export type AssetPurpose =
  | "template"
  | "reference"
  | "review-target"
  | "knowledge-base";

export type PreviewKind =
  | "pdf"
  | "docx"
  | "spreadsheet"
  | "text"
  | "markdown";

export type NodeType =
  | "section"
  | "paragraph"
  | "clause"
  | "table"
  | "table-row"
  | "table-cell"
  | "field"
  | "spreadsheet"
  | "spreadsheet-row";

export type RevisionAction =
  | "proposed"
  | "accepted"
  | "rejected"
  | "edited"
  | "superseded";

export interface SourceRef {
  fileId: string;
  format: SourceFormat;
  page?: number;
  sheetName?: string;
  cellRange?: string;
  blockId?: string;
  previewAnchor?: string;
  quote?: string;
}

export interface AssetRecord {
  id: string;
  name: string;
  ext: string;
  mimeType: string;
  size: number;
  sha256: string;
  sourceFormat: SourceFormat;
  purpose: AssetPurpose;
  status: "uploaded" | "importing" | "parsed" | "indexed" | "failed";
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface RevisionRecord {
  id: string;
  nodeId: string;
  issueId?: string;
  action: RevisionAction;
  before?: string;
  after?: string;
  reason?: string;
  createdAt: string;
}

export interface BaseNode {
  id: string;
  documentId: string;
  parentId?: string;
  type: NodeType;
  order: number;
  sourceRefs: SourceRef[];
  revisions?: RevisionRecord[];
}

export interface SectionNode extends BaseNode {
  type: "section";
  title: string;
  level: number;
  numbering?: string;
  children: string[];
}

export interface ParagraphNode extends BaseNode {
  type: "paragraph";
  text: string;
  style?: string;
}

export interface ClauseNode extends BaseNode {
  type: "clause";
  title?: string;
  numbering?: string;
  text: string;
}

export interface TableCellNode extends BaseNode {
  type: "table-cell";
  text: string;
  row: number;
  col: number;
  rowSpan?: number;
  colSpan?: number;
  header?: boolean;
}

export interface TableRowNode extends BaseNode {
  type: "table-row";
  rowIndex: number;
  children: string[];
}

export interface TableNode extends BaseNode {
  type: "table";
  title?: string;
  columnCount: number;
  rowCount: number;
  children: string[];
}

export interface FieldNode extends BaseNode {
  type: "field";
  fieldKey: string;
  label: string;
  value: string | number | boolean | null;
  valueType: "text" | "number" | "boolean" | "date" | "currency";
}

export interface SpreadsheetRowNode extends BaseNode {
  type: "spreadsheet-row";
  sheetName: string;
  rowIndex: number;
  values: Record<string, string | number | boolean | null>;
}

export interface SpreadsheetNode extends BaseNode {
  type: "spreadsheet";
  sheetName: string;
  headers: string[];
  rowCount: number;
  range?: string;
  namedRanges?: Array<{ name: string; range: string }>;
  children: string[];
}

export type DocumentNode =
  | SectionNode
  | ParagraphNode
  | ClauseNode
  | TableNode
  | TableRowNode
  | TableCellNode
  | FieldNode
  | SpreadsheetNode
  | SpreadsheetRowNode;

export interface ParsedDocument {
  id: string;
  assetId: string;
  sourceFormat: SourceFormat;
  title: string;
  rootNodeIds: string[];
  schemaVersion: number;
  stats: {
    nodeCount: number;
    chunkCount: number;
    sectionCount: number;
    tableCount: number;
    sheetCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PreviewAnchor {
  fileId: string;
  page?: number;
  sheetName?: string;
  cellRange?: string;
  domSelector?: string;
  textRange?: { start: number; end: number };
}

export interface PreviewModel {
  id: string;
  assetId: string;
  kind: PreviewKind;
  anchorMap: Record<string, PreviewAnchor>;
  pageCount?: number;
  sheetNames?: string[];
  html?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  assetId: string;
  nodeId: string;
  kind: "text" | "table" | "row" | "cell-summary";
  text: string;
  tokenEstimate: number;
  sourceRefs: SourceRef[];
}

export interface ImportFileCommand {
  file: File;
  purpose: AssetPurpose;
}

export interface ImportFileResult {
  assetId: string;
  sourceFormat: SourceFormat;
  previewModelId?: string;
  parsedDocumentId?: string;
  warnings: string[];
}
