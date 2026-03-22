import type {
  WorkspaceAssistantMessage,
  WorkspaceDocumentBlock,
  WorkspaceSummary,
} from "@/features/workspace-context/types/workspace-summary";

export const mockAssistantMessages: WorkspaceAssistantMessage[] = [
  {
    id: "user-1",
    role: "user",
    content: "继续优化付款条款，降低履约争议。",
  },
  {
    id: "assistant-1",
    role: "assistant",
    content: "我建议把付款方式改成分阶段支付，并补充验收通过后的付款触发条件。",
  },
  {
    id: "assistant-2",
    role: "assistant",
    content: "这样可以降低履约争议，也更符合多数企业制度写法。",
  },
  {
    id: "assistant-3",
    role: "assistant",
    content: "证据来源：参考资料《付款节点说明》、Sheet2《采购付款计划》。",
  },
];

export const mockDocumentBlocks: WorkspaceDocumentBlock[] = [
  {
    id: "heading-1",
    kind: "heading",
    level: 1,
    text: "采购与付款管理制度",
  },
  {
    id: "paragraph-1",
    kind: "paragraph",
    text: "为规范采购付款管理流程，保障资金使用合规性，现对付款节点、验收依据和审批要求作如下规定。",
  },
  {
    id: "heading-2",
    kind: "heading",
    level: 2,
    text: "付款方式",
  },
  {
    id: "paragraph-2",
    kind: "paragraph",
    text: "合同签订后一次性支付全部款项。",
  },
  {
    id: "paragraph-3",
    kind: "paragraph",
    text: "如涉及分阶段交付，应当根据验收节点和发票到齐情况执行付款审批。",
  },
];

export const mockWorkspaceSummary: WorkspaceSummary = {
  workspaceId: "ws-enterprise",
  workspaceTitle: "文档工作台",
  activeDocumentId: "doc-procurement-policy",
  activeDocumentTitle: "采购与付款管理制度",
  activeNodeId: "clause-payment",
  activeClauseTitle: "付款方式",
  activeClauseText: "合同签订后一次性支付全部款项。",
  suggestedRevisionText: "建议改为分阶段支付，并增加验收节点说明。",
  isSelectionFocused: false,
  currentTask: "revise",
  currentTaskStatus: "ready_to_resume",
  lastUserIntent: "继续优化付款条款，降低履约争议。",
  latestConclusion: "建议改为分阶段支付，并补充验收触发条件。",
  nextAction: "继续处理付款条款",
  openQuestions: ["是否需要加入违约责任上限条款"],
  pendingSuggestionIds: ["suggestion-payment-1", "suggestion-payment-2"],
  recentEvidenceRefs: ["付款节点说明 · 第 4 页", "采购付款计划 · Sheet2"],
  assistantMessages: mockAssistantMessages,
  documentBlocks: mockDocumentBlocks,
  updatedAt: "2 分钟前",
};

export const mockAssetGroups = [
  {
    id: "doc",
    label: "主文档",
    active: true,
    defaultExpanded: true,
    items: [
      {
        id: "doc-procurement-policy",
        label: "采购与付款管理制度",
        kind: "文档",
        updatedAt: "刚刚更新",
        selected: true,
      },
    ],
  },
  {
    id: "template",
    label: "模板",
    defaultExpanded: false,
    items: [
      { id: "tpl-policy-v3", label: "制度模板 v3", kind: "模板", updatedAt: "今天 14:20" },
      { id: "tpl-contract-clauses", label: "合同条款模板", kind: "模板", updatedAt: "昨天 18:40" },
    ],
  },
  {
    id: "references",
    label: "参考资料",
    defaultExpanded: false,
    items: [
      { id: "ref-payment", label: "付款节点说明", kind: "资料", updatedAt: "今天 09:15" },
      { id: "ref-procurement", label: "采购管理办法", kind: "资料", updatedAt: "昨天 11:30" },
    ],
  },
  {
    id: "sheets",
    label: "表格资料",
    defaultExpanded: false,
    items: [
      { id: "sheet-plan", label: "采购付款计划", kind: "表格", updatedAt: "今天 10:05" },
      { id: "sheet-vendors", label: "供应商信息表", kind: "表格", updatedAt: "昨天 16:12" },
    ],
  },
] as const;
