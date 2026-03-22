import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";

export const mockWorkspaceSummary: WorkspaceSummary = {
  workspaceId: "ws-enterprise",
  workspaceTitle: "企业文档工作区",
  activeDocumentId: "doc-procurement-policy",
  activeNodeId: "clause-payment",
  currentTask: "revise",
  currentTaskStatus: "ready_to_resume",
  lastUserIntent: "继续优化付款条款，降低履约争议。",
  latestConclusion: "建议改为分阶段支付，并补充验收触发条件。",
  nextAction: "继续处理付款条款",
  openQuestions: ["是否需要加入违约责任上限条款"],
  pendingSuggestionIds: ["suggestion-payment-1", "suggestion-payment-2"],
  recentEvidenceRefs: ["付款节点说明 · 第 4 页", "采购付款计划 · Sheet2"],
  updatedAt: "2 分钟前",
  lastAgent: "Claude Code",
};

export const mockAssetGroups = [
  { id: "doc", label: "主文档", active: true },
  { id: "template", label: "模板" },
  { id: "references", label: "参考资料" },
  { id: "sheets", label: "表格资料" },
] as const;

export const mockAssistantMessages = [
  "我建议把付款方式改成分阶段支付，并补充验收通过后的付款触发条件。",
  "这样可以降低履约争议，也更符合多数企业制度写法。",
  "证据来源：参考资料《付款节点说明》、Sheet2《采购付款计划》。",
];
