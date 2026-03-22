import { useState } from "react";

type AssetItem = {
  id: string;
  label: string;
  kind: string;
  updatedAt: string;
  selected?: boolean;
};

type AssetGroup = {
  id: string;
  label: string;
  active?: boolean;
  defaultExpanded?: boolean;
  items?: readonly AssetItem[];
};

type WorkspaceAssetGroupsProps = {
  groups: readonly AssetGroup[];
};

export function WorkspaceAssetGroups({ groups }: WorkspaceAssetGroupsProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((group) => [group.id, group.defaultExpanded ?? false])),
  );

  return (
    <section className="grid gap-[10px]">
      {groups.map((group) => {
        const isExpanded = expandedGroups[group.id] ?? false;

        return (
          <div
            key={group.id}
            className={`rounded-[14px] border-b border-[rgba(216,207,193,0.72)] py-[10px] ${group.active ? "font-bold text-[var(--color-text-primary)]" : ""}`}
          >
            <button
              className="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-0 text-left"
              type="button"
              aria-expanded={isExpanded}
              onClick={() =>
                setExpandedGroups((current) => ({
                  ...current,
                  [group.id]: !isExpanded,
                }))
              }
            >
              <span className="inline-flex items-center gap-2">
                {group.label}
                <span className="font-sans text-[0.76rem] font-semibold text-[var(--color-text-muted)]">
                  {group.items?.length ?? 0}
                </span>
              </span>
              <span
                className={`inline-flex items-center justify-center font-sans text-[0.78rem] font-semibold text-[var(--color-text-muted)] transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                aria-hidden="true"
              >
                ▾
              </span>
            </button>
            {isExpanded ? (
              <div className="mt-[10px] grid gap-2 pl-[2px]">
                {group.items?.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl px-[10px] py-2 text-[var(--color-text-secondary)] ${item.selected ? "bg-[rgba(255,251,244,0.72)] shadow-[inset_0_0_0_1px_rgba(216,207,193,0.82)]" : "bg-[rgba(255,251,244,0.32)]"}`}
                  >
                    <div className="flex items-center justify-between gap-[10px]">
                      <div className="font-sans text-[0.84rem] leading-[1.45] font-semibold text-inherit">
                        {item.label}
                      </div>
                      <div className="shrink-0 rounded-full bg-[rgba(236,228,216,0.78)] px-[7px] py-[2px] font-sans text-[0.68rem] font-semibold tracking-[0.02em] text-[var(--color-text-muted)]">
                        {item.kind}
                      </div>
                    </div>
                    <div className="font-sans text-[0.76rem] leading-[1.4] text-[var(--color-text-muted)]">
                      {item.updatedAt}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
