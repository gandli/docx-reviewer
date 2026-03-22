import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { App } from "@/app/App";
import { WorkspacePage } from "@/features/workspace-shell/routes/workspace-page";
import { themeTokens } from "@/shared/constants/theme";
import { mockWorkspaceSummary } from "@/shared/mocks/workspace-shell";

describe("workspace shell", () => {
  it("defines warm neutral workspace palette", () => {
    expect(themeTokens.surface.paper).toBeTruthy();
    expect(themeTokens.surface.sidebar).toBeTruthy();
    expect(themeTokens.text.primary).toBeTruthy();
  });

  it("renders workspace route shell from app", () => {
    window.history.pushState({}, "", "/workspace/ws-enterprise");
    render(<App />);
    expect(screen.getAllByText("文档工作台").length).toBeGreaterThan(0);
  });

  it("renders sidebar, document area, and assistant panel", () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("workspace-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("document-canvas")).toBeInTheDocument();
    expect(screen.getByTestId("assistant-panel")).toBeInTheDocument();
  });

  it("shows asset groups, recent evidence, and resume state", () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );
    expect(screen.getByText("主文档")).toBeInTheDocument();
    expect(screen.getByText("参考资料")).toBeInTheDocument();
    expect(screen.getByText("最近引用")).toBeInTheDocument();
    expect(screen.getAllByText("采购与付款管理制度").length).toBeGreaterThan(0);
    expect(screen.getByText(/已继承当前工作区摘要/)).toBeInTheDocument();
  });

  it("collapses and expands asset groups", () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    expect(screen.queryByText("付款节点说明")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "参考资料" }));
    expect(screen.getByText("付款节点说明")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "参考资料" }));
    expect(screen.queryByText("付款节点说明")).not.toBeInTheDocument();
  });

  it("renders document header, selected clause block, and assistant actions", () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );
    expect(screen.getAllByText("采购与付款管理制度").length).toBeGreaterThan(0);
    expect(screen.getByText("当前选中条款")).toBeInTheDocument();
    expect(screen.getByText("修订")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "更多操作" })).toBeInTheDocument();
  });

  it("applies the suggestion and updates the clause text", () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "更多操作" }));
    fireEvent.click(screen.getByRole("button", { name: "接受建议" }));

    expect(screen.getByText(mockWorkspaceSummary.suggestedRevisionText)).toBeInTheDocument();
    expect(screen.getByText(`已应用建议：${mockWorkspaceSummary.suggestedRevisionText}`)).toBeInTheDocument();
  });

  it("restores a saved workspace summary from local storage", async () => {
    const restoredSummary = {
      ...mockWorkspaceSummary,
      activeClauseText: "付款分三期执行，验收通过后支付尾款。",
      latestConclusion: "已从本地恢复付款条款修订结果。",
    };
    window.localStorage.setItem(
      `workspace-summary:${mockWorkspaceSummary.workspaceId}`,
      JSON.stringify(restoredSummary),
    );

    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("付款分三期执行，验收通过后支付尾款。")).toBeInTheDocument();
    expect(await screen.findByText(/已从本地恢复付款条款修订结果/)).toBeInTheDocument();
  });

  it("jumps back to the current clause when asked", () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "更多操作" }));
    fireEvent.click(screen.getByRole("button", { name: "跳到原文位置" }));

    expect(screen.getByText("已定位到当前条款")).toBeInTheDocument();
  });
});
