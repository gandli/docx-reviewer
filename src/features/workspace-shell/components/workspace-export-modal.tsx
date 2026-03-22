import { useEffect, useState } from "react";
import type { WorkspaceExportFormat } from "@/services/export/workspace-export";

type WorkspaceExportModalProps = {
  isOpen: boolean;
  documentTitle: string;
  onClose: () => void;
  onExport: (format: WorkspaceExportFormat) => void;
};

export function WorkspaceExportModal({
  isOpen,
  documentTitle,
  onClose,
  onExport,
}: WorkspaceExportModalProps) {
  const [format, setFormat] = useState<WorkspaceExportFormat>("md");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormat("md");
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,14,10,0.45)] px-6 py-10 backdrop-blur-sm">
      <section className="flex w-full max-w-xl flex-col overflow-hidden rounded-[28px] border border-[rgba(216,207,193,0.9)] bg-[rgba(251,248,242,0.98)] shadow-[0_28px_80px_rgba(41,31,21,0.22)]">
        <header className="flex items-start justify-between gap-4 border-b border-[rgba(216,207,193,0.72)] px-6 py-5">
          <div>
            <div className="font-sans text-[12px] font-semibold tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
              Export
            </div>
            <h2 className="mt-2 text-[1.35rem] font-bold text-[var(--color-text-primary)]">
              导出当前文档
            </h2>
            <p className="mt-1 font-sans text-[0.9rem] leading-[1.6] text-[var(--color-text-muted)]">
              先把《{documentTitle}》导出成可直接带走的文本文件。当前支持 Markdown 和纯文本。
            </p>
          </div>
          <button
            className="cursor-pointer rounded-full border border-[rgba(216,207,193,0.78)] bg-[rgba(255,251,244,0.86)] px-3 py-2 font-sans text-[0.82rem] text-[var(--color-text-secondary)]"
            type="button"
            onClick={onClose}
          >
            关闭
          </button>
        </header>

        <div className="grid gap-3 px-6 py-5">
          <label
            aria-label="Markdown (.md)"
            className={`cursor-pointer rounded-2xl border px-4 py-4 transition ${
              format === "md"
                ? "border-[rgba(181,142,83,0.72)] bg-[rgba(251,246,233,0.96)] shadow-[0_0_0_3px_rgba(181,142,83,0.12)]"
                : "border-[rgba(216,207,193,0.78)] bg-[rgba(255,252,247,0.86)]"
            }`}
          >
            <input
              checked={format === "md"}
              className="sr-only"
              type="radio"
              name="workspace-export-format"
              onChange={() => setFormat("md")}
            />
            <div className="text-[1rem] font-semibold text-[var(--color-text-primary)]">
              Markdown (.md)
            </div>
            <div className="mt-1 font-sans text-[0.86rem] leading-[1.6] text-[var(--color-text-muted)]">
              适合继续编辑、归档，标题层级会一起保留。
            </div>
          </label>

          <label
            aria-label="纯文本 (.txt)"
            className={`cursor-pointer rounded-2xl border px-4 py-4 transition ${
              format === "txt"
                ? "border-[rgba(181,142,83,0.72)] bg-[rgba(251,246,233,0.96)] shadow-[0_0_0_3px_rgba(181,142,83,0.12)]"
                : "border-[rgba(216,207,193,0.78)] bg-[rgba(255,252,247,0.86)]"
            }`}
          >
            <input
              checked={format === "txt"}
              className="sr-only"
              type="radio"
              name="workspace-export-format"
              onChange={() => setFormat("txt")}
            />
            <div className="text-[1rem] font-semibold text-[var(--color-text-primary)]">
              纯文本 (.txt)
            </div>
            <div className="mt-1 font-sans text-[0.86rem] leading-[1.6] text-[var(--color-text-muted)]">
              适合快速发给别人或做进一步处理，结构更简单。
            </div>
          </label>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-[rgba(216,207,193,0.72)] px-6 py-4">
          <button
            className="cursor-pointer rounded-full border border-[rgba(216,207,193,0.78)] bg-[rgba(255,251,244,0.86)] px-4 py-2 font-sans text-[0.84rem] text-[var(--color-text-secondary)]"
            type="button"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="cursor-pointer rounded-full border-0 bg-[rgba(47,38,29,0.94)] px-4 py-2 font-sans text-[0.84rem] font-semibold text-[#fffdf9]"
            type="button"
            onClick={() => onExport(format)}
          >
            开始导出
          </button>
        </footer>
      </section>
    </div>
  );
}
