import type {
  WorkspacePreviewDocument,
  WorkspaceSummary,
} from "@/features/workspace-context/types/workspace-summary";

export interface WorkspaceSummaryRepository {
  load(workspaceId: string): Promise<{
    summary?: WorkspaceSummary;
    previewDocument?: WorkspacePreviewDocument;
  }>;
  save(summary: WorkspaceSummary, previewDocument?: WorkspacePreviewDocument): Promise<void>;
}

type PersistedWorkspaceState = {
  summary: WorkspaceSummary;
  previewDocument?: PersistedPreviewDocument;
};

type PersistedPreviewDocument =
  | {
      mode: "pdf";
      source: string;
    }
  | {
      mode: "docx";
      source: string;
    };

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buffer).toString("base64");
  }

  let binary = "";
  for (const byte of new Uint8Array(buffer)) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  if (typeof Buffer !== "undefined") {
    const buffer = Buffer.from(base64, "base64");
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function serializePreviewDocument(
  previewDocument?: WorkspacePreviewDocument,
): PersistedPreviewDocument | undefined {
  if (!previewDocument) {
    return undefined;
  }

  if (previewDocument.mode === "pdf") {
    return previewDocument;
  }

  return {
    mode: "docx",
    source: arrayBufferToBase64(previewDocument.source),
  };
}

function deserializePreviewDocument(
  previewDocument?: PersistedPreviewDocument,
): WorkspacePreviewDocument | undefined {
  if (!previewDocument) {
    return undefined;
  }

  if (previewDocument.mode === "pdf") {
    return previewDocument;
  }

  return {
    mode: "docx",
    source: base64ToArrayBuffer(previewDocument.source),
  };
}

function normalizeWorkspaceSummary(
  summary: WorkspaceSummary,
  fallbackSummary?: WorkspaceSummary,
): WorkspaceSummary {
  if (!fallbackSummary || fallbackSummary.workspaceId !== summary.workspaceId) {
    return summary;
  }

  return {
    ...fallbackSummary,
    ...summary,
    workspaceTitle: fallbackSummary.workspaceTitle,
  };
}

export function createMemoryWorkspaceSummaryRepository(
  initialSummary?: WorkspaceSummary,
  initialPreviewDocument?: WorkspacePreviewDocument,
): WorkspaceSummaryRepository {
  let current = initialSummary;
  let currentPreviewDocument = initialPreviewDocument;

  return {
    async load(workspaceId) {
      if (current?.workspaceId === workspaceId) {
        return {
          summary: current,
          previewDocument: currentPreviewDocument,
        };
      }

      return {};
    },
    async save(summary, previewDocument) {
      current = summary;
      currentPreviewDocument = previewDocument;
    },
  };
}

export function createBrowserWorkspaceSummaryRepository(
  fallbackSummary?: WorkspaceSummary,
): WorkspaceSummaryRepository {
  const memory = createMemoryWorkspaceSummaryRepository(fallbackSummary);

  const getStorage = () => {
    if (typeof window === "undefined") {
      return undefined;
    }

    return window.localStorage;
  };

  return {
    async load(workspaceId) {
      const storage = getStorage();
      const stateValue = storage?.getItem(`workspace-state:${workspaceId}`);

      if (stateValue) {
        try {
          const state = JSON.parse(stateValue) as PersistedWorkspaceState;

          return {
            summary: normalizeWorkspaceSummary(state.summary, fallbackSummary),
            previewDocument: deserializePreviewDocument(state.previewDocument),
          };
        } catch {
          return memory.load(workspaceId);
        }
      }

      const summaryValue = storage?.getItem(`workspace-summary:${workspaceId}`);

      if (!summaryValue) {
        return memory.load(workspaceId);
      }

      try {
        return {
          summary: normalizeWorkspaceSummary(
            JSON.parse(summaryValue) as WorkspaceSummary,
            fallbackSummary,
          ),
        };
      } catch {
        return memory.load(workspaceId);
      }
    },
    async save(summary, previewDocument) {
      const storage = getStorage();
      storage?.setItem(
        `workspace-state:${summary.workspaceId}`,
        JSON.stringify({
          summary,
          previewDocument: serializePreviewDocument(previewDocument),
        } satisfies PersistedWorkspaceState),
      );
      storage?.setItem(`workspace-summary:${summary.workspaceId}`, JSON.stringify(summary));
      await memory.save(summary, previewDocument);
    },
  };
}
