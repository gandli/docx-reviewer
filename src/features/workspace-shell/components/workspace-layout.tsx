import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";
import { useEffect, useMemo, useState } from "react";
import { WorkspaceSidebar } from "@/features/workspace-shell/components/workspace-sidebar";
import { DocumentCanvas } from "@/features/editor-draft/components/document-canvas";
import { PdfDocumentCanvas } from "@/features/editor-draft/components/pdf-document-canvas";
import { DocxDocumentCanvas } from "@/features/editor-draft/components/docx-document-canvas";
import { AssistantPanel } from "@/features/assistant-panel/components/assistant-panel";
import type { WorkspacePreviewDocument } from "@/features/workspace-context/types/workspace-summary";

const DESKTOP_BREAKPOINT = 981;
const COLLAPSED_PANEL_WIDTH = 72;
const RESIZE_HANDLE_WIDTH = 10;
const DEFAULT_LEFT_PANEL_WIDTH = 320;
const DEFAULT_RIGHT_PANEL_WIDTH = 340;
const MIN_LEFT_PANEL_WIDTH = 248;
const MAX_LEFT_PANEL_WIDTH = 440;
const MIN_RIGHT_PANEL_WIDTH = 280;
const MAX_RIGHT_PANEL_WIDTH = 460;
const MIN_CENTER_PANEL_WIDTH = 420;
const PANEL_LAYOUT_STORAGE_KEY = "workspace-panel-widths";

type DragHandle = "left" | "right" | null;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function loadStoredPanelWidths() {
  if (typeof window === "undefined") {
    return {
      left: DEFAULT_LEFT_PANEL_WIDTH,
      right: DEFAULT_RIGHT_PANEL_WIDTH,
    };
  }

  try {
    const rawValue = window.localStorage.getItem(PANEL_LAYOUT_STORAGE_KEY);
    if (!rawValue) {
      return {
        left: DEFAULT_LEFT_PANEL_WIDTH,
        right: DEFAULT_RIGHT_PANEL_WIDTH,
      };
    }

    const parsed = JSON.parse(rawValue) as { left?: number; right?: number };
    return {
      left:
        typeof parsed.left === "number" && Number.isFinite(parsed.left)
          ? parsed.left
          : DEFAULT_LEFT_PANEL_WIDTH,
      right:
        typeof parsed.right === "number" && Number.isFinite(parsed.right)
          ? parsed.right
          : DEFAULT_RIGHT_PANEL_WIDTH,
    };
  } catch {
    return {
      left: DEFAULT_LEFT_PANEL_WIDTH,
      right: DEFAULT_RIGHT_PANEL_WIDTH,
    };
  }
}

function getDesktopViewportWidth() {
  if (typeof window === "undefined") {
    return 1440;
  }

  return window.innerWidth;
}

type WorkspaceLayoutProps = {
  summary: WorkspaceSummary;
  previewDocument?: WorkspacePreviewDocument;
  onApplySuggestion: () => void;
  onJumpToSelection: () => void;
  onSelectText: (payload: {
    text: string;
    blockId?: string;
    contextLabel?: string;
    intent?: "review" | "revise" | "polish";
  }) => void;
  onSendMessage: (message: string) => void;
  onImportDocument: (file: File) => void | Promise<void>;
  onExport: () => void;
  onOpenSettings: () => void;
  localModelSourceLabel: string;
  localModelStatusLabel: string;
  localModelStatusTone?: "neutral" | "success" | "warning" | "error";
  localModelLabel: string;
  isLocalModelBusy?: boolean;
};

export function WorkspaceLayout({
  summary,
  previewDocument,
  onApplySuggestion,
  onJumpToSelection,
  onSelectText,
  onSendMessage,
  onImportDocument,
  onExport,
  onOpenSettings,
  localModelSourceLabel,
  localModelStatusLabel,
  localModelStatusTone,
  localModelLabel,
  isLocalModelBusy,
}: WorkspaceLayoutProps) {
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [panelWidths, setPanelWidths] = useState(loadStoredPanelWidths);
  const [dragHandle, setDragHandle] = useState<DragHandle>(null);
  const [isDesktop, setIsDesktop] = useState(() => getDesktopViewportWidth() >= DESKTOP_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => {
      const nextIsDesktop = getDesktopViewportWidth() >= DESKTOP_BREAKPOINT;
      setIsDesktop(nextIsDesktop);

      if (!nextIsDesktop) {
        return;
      }

      setPanelWidths((current) => {
        const maxLeft = Math.min(
          MAX_LEFT_PANEL_WIDTH,
          getDesktopViewportWidth() - current.right - MIN_CENTER_PANEL_WIDTH - RESIZE_HANDLE_WIDTH * 2,
        );
        const nextLeft = clamp(current.left, MIN_LEFT_PANEL_WIDTH, Math.max(MIN_LEFT_PANEL_WIDTH, maxLeft));
        const maxRight = Math.min(
          MAX_RIGHT_PANEL_WIDTH,
          getDesktopViewportWidth() - nextLeft - MIN_CENTER_PANEL_WIDTH - RESIZE_HANDLE_WIDTH * 2,
        );
        const nextRight = clamp(
          current.right,
          MIN_RIGHT_PANEL_WIDTH,
          Math.max(MIN_RIGHT_PANEL_WIDTH, maxRight),
        );

        if (nextLeft === current.left && nextRight === current.right) {
          return current;
        }

        return {
          left: nextLeft,
          right: nextRight,
        };
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(PANEL_LAYOUT_STORAGE_KEY, JSON.stringify(panelWidths));
  }, [panelWidths]);

  useEffect(() => {
    if (!dragHandle || !isDesktop) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      setPanelWidths((current) => {
        const viewportWidth = getDesktopViewportWidth();

        if (dragHandle === "left") {
          const maxLeft = Math.min(
            MAX_LEFT_PANEL_WIDTH,
            viewportWidth - current.right - MIN_CENTER_PANEL_WIDTH - RESIZE_HANDLE_WIDTH * 2,
          );

          return {
            ...current,
            left: clamp(event.clientX, MIN_LEFT_PANEL_WIDTH, Math.max(MIN_LEFT_PANEL_WIDTH, maxLeft)),
          };
        }

        const maxRight = Math.min(
          MAX_RIGHT_PANEL_WIDTH,
          viewportWidth - current.left - MIN_CENTER_PANEL_WIDTH - RESIZE_HANDLE_WIDTH * 2,
        );

        return {
          ...current,
          right: clamp(
            viewportWidth - event.clientX,
            MIN_RIGHT_PANEL_WIDTH,
            Math.max(MIN_RIGHT_PANEL_WIDTH, maxRight),
          ),
        };
      });
    };

    const handlePointerUp = () => {
      setDragHandle(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragHandle, isDesktop]);

  const desktopGridTemplateColumns = useMemo(() => {
    const leftColumnWidth = isLeftCollapsed ? COLLAPSED_PANEL_WIDTH : panelWidths.left;
    const rightColumnWidth = isRightCollapsed ? COLLAPSED_PANEL_WIDTH : panelWidths.right;
    const leftHandleWidth = isLeftCollapsed ? 0 : RESIZE_HANDLE_WIDTH;
    const rightHandleWidth = isRightCollapsed ? 0 : RESIZE_HANDLE_WIDTH;

    return `${leftColumnWidth}px ${leftHandleWidth}px minmax(0, 1fr) ${rightHandleWidth}px ${rightColumnWidth}px`;
  }, [isLeftCollapsed, isRightCollapsed, panelWidths.left, panelWidths.right]);

  return (
    <div
      className="grid h-screen overflow-hidden bg-[var(--color-surface-app)] max-[980px]:grid-cols-1"
      data-testid="workspace-layout"
      style={isDesktop ? { gridTemplateColumns: desktopGridTemplateColumns } : undefined}
    >
      <WorkspaceSidebar
        summary={summary}
        onImportDocument={onImportDocument}
        onExport={onExport}
        onOpenSettings={onOpenSettings}
        isCollapsed={isLeftCollapsed}
        onToggleCollapse={() => setIsLeftCollapsed((current) => !current)}
      />
      <div
        aria-hidden={isLeftCollapsed || !isDesktop}
        className={`group relative max-[980px]:hidden ${
          isLeftCollapsed || !isDesktop ? "pointer-events-none opacity-0" : "cursor-col-resize"
        }`}
        data-testid="left-resize-handle"
        title="拖动调整左栏宽度，双击恢复默认"
        onPointerDown={() => {
          if (!isLeftCollapsed && isDesktop) {
            setDragHandle("left");
          }
        }}
        onDoubleClick={() => {
          setPanelWidths((current) => ({
            ...current,
            left: DEFAULT_LEFT_PANEL_WIDTH,
          }));
        }}
      >
        <div
          className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors ${
            dragHandle === "left"
              ? "bg-[rgba(181,142,83,0.88)]"
              : "bg-[rgba(216,207,193,0.16)] group-hover:bg-[rgba(181,142,83,0.42)]"
          }`}
        />
        <div className="pointer-events-none absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(47,38,29,0.88)] px-2 py-1 font-sans text-[0.72rem] text-[#fffdf9] shadow-[0_10px_24px_rgba(47,38,29,0.16)] group-hover:block">
          拖动调整左栏宽度
        </div>
      </div>
      <main
        className={`min-w-0 overflow-x-hidden overflow-y-auto bg-[var(--color-surface-app)] px-0 pt-0 pb-0 max-[980px]:h-auto max-[980px]:min-h-[55vh] ${
          dragHandle ? "" : "transition-[width] duration-150 ease-out"
        }`}
        data-scroll-region="true"
      >
        {summary.activeDocumentMode === "pdf" ? (
          <PdfDocumentCanvas
            summary={summary}
            title={summary.activeDocumentTitle}
            previewDocument={previewDocument}
            onSelectText={onSelectText}
          />
        ) : summary.activeDocumentMode === "docx" ? (
          <DocxDocumentCanvas
            summary={summary}
            title={summary.activeDocumentTitle}
            previewDocument={previewDocument}
            onSelectText={onSelectText}
          />
        ) : (
          <DocumentCanvas summary={summary} onSelectText={onSelectText} />
        )}
      </main>
      <div
        aria-hidden={isRightCollapsed || !isDesktop}
        className={`group relative max-[980px]:hidden ${
          isRightCollapsed || !isDesktop ? "pointer-events-none opacity-0" : "cursor-col-resize"
        }`}
        data-testid="right-resize-handle"
        title="拖动调整右栏宽度，双击恢复默认"
        onPointerDown={() => {
          if (!isRightCollapsed && isDesktop) {
            setDragHandle("right");
          }
        }}
        onDoubleClick={() => {
          setPanelWidths((current) => ({
            ...current,
            right: DEFAULT_RIGHT_PANEL_WIDTH,
          }));
        }}
      >
        <div
          className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors ${
            dragHandle === "right"
              ? "bg-[rgba(181,142,83,0.88)]"
              : "bg-[rgba(216,207,193,0.16)] group-hover:bg-[rgba(181,142,83,0.42)]"
          }`}
        />
        <div className="pointer-events-none absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(47,38,29,0.88)] px-2 py-1 font-sans text-[0.72rem] text-[#fffdf9] shadow-[0_10px_24px_rgba(47,38,29,0.16)] group-hover:block">
          拖动调整右栏宽度
        </div>
      </div>
      <AssistantPanel
        summary={summary}
        onApplySuggestion={onApplySuggestion}
        onJumpToSelection={onJumpToSelection}
        onSendMessage={onSendMessage}
        localModelSourceLabel={localModelSourceLabel}
        localModelStatusLabel={localModelStatusLabel}
        localModelStatusTone={localModelStatusTone}
        localModelLabel={localModelLabel}
        isLocalModelBusy={isLocalModelBusy}
        isCollapsed={isRightCollapsed}
        onToggleCollapse={() => setIsRightCollapsed((current) => !current)}
      />
    </div>
  );
}
