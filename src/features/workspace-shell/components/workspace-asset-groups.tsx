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
    <section className="asset-groups">
      {groups.map((group) => {
        const isExpanded = expandedGroups[group.id] ?? false;

        return (
          <div
            key={group.id}
            className={`asset-card${group.active ? " is-active" : ""}${isExpanded ? " is-expanded" : ""}`}
          >
            <button
              className="asset-card__trigger"
              type="button"
              aria-expanded={isExpanded}
              onClick={() =>
                setExpandedGroups((current) => ({
                  ...current,
                  [group.id]: !isExpanded,
                }))
              }
            >
              <span className="asset-card__label">
                {group.label}
                <span className="asset-card__count">{group.items?.length ?? 0}</span>
              </span>
              <span
                className={`asset-card__chevron${isExpanded ? " is-expanded" : ""}`}
                aria-hidden="true"
              >
                ▾
              </span>
            </button>
            {isExpanded ? (
              <div className="asset-card__items">
                {group.items?.map((item) => (
                  <div
                    key={item.id}
                    className={`asset-card__item${item.selected ? " is-selected" : ""}`}
                  >
                    <div className="asset-card__item-header">
                      <div className="asset-card__item-title">{item.label}</div>
                      <div className="asset-card__item-kind">{item.kind}</div>
                    </div>
                    <div className="asset-card__item-meta">{item.updatedAt}</div>
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
