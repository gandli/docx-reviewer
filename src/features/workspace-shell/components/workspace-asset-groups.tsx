type AssetGroup = {
  id: string;
  label: string;
  active?: boolean;
};

type WorkspaceAssetGroupsProps = {
  groups: readonly AssetGroup[];
};

export function WorkspaceAssetGroups({ groups }: WorkspaceAssetGroupsProps) {
  return (
    <section className="asset-groups">
      {groups.map((group) => (
        <div
          key={group.id}
          className={`asset-card${group.active ? " is-active" : ""}`}
        >
          {group.label}
        </div>
      ))}
    </section>
  );
}
