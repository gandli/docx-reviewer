import { useState } from "react";

type AssetGroup = {
  id: string;
  label: string;
  active?: boolean;
  defaultExpanded?: boolean;
  items?: readonly string[];
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
              <span>{group.label}</span>
              <span className="asset-card__chevron" aria-hidden="true">
                {isExpanded ? "−" : "+"}
              </span>
            </button>
            {isExpanded ? (
              <div className="asset-card__items">
                {group.items?.map((item) => (
                  <div key={item} className="asset-card__item">
                    {item}
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
