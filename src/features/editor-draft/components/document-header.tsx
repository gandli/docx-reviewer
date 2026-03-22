import type {
  WorkspaceDocumentMode,
  WorkspacePreviewLabel,
} from "@/features/workspace-context/types/workspace-summary";

type DocumentHeaderProps = {
  title: string;
  mode: WorkspaceDocumentMode;
  previewLabel?: WorkspacePreviewLabel;
};

export function DocumentHeader({ title, mode, previewLabel }: DocumentHeaderProps) {
  return (
    <header className="mb-[18px] flex items-baseline justify-between gap-4">
      <div>
        <div className="font-sans text-[12px] font-semibold tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
          Document
        </div>
        <div className="mt-2 text-[1.4rem] leading-[1.25] font-bold text-[var(--color-text-primary)]">
          {title}
        </div>
      </div>
      <div className="inline-flex items-center gap-2 font-sans text-[0.8rem] font-semibold text-[var(--color-text-muted)]">
        {mode === "pdf" || mode === "docx" || mode === "plain" ? (
          <>
            <span className="text-[var(--color-text-primary)]">原样预览</span>
            {previewLabel ? (
              <>
                <span className="text-[rgba(109,100,87,0.55)]" aria-hidden="true">
                  ·
                </span>
                <span>{previewLabel}</span>
              </>
            ) : null}
          </>
        ) : (
          <>
            <span>阅读视图</span>
            <span className="text-[rgba(109,100,87,0.55)]" aria-hidden="true">
              ·
            </span>
            <span className="text-[var(--color-text-primary)]">可编辑</span>
          </>
        )}
      </div>
    </header>
  );
}
