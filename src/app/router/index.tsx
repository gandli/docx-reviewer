import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { WorkspacePage } from "@/features/workspace-shell/routes/workspace-page";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/workspace/ws-enterprise" replace />} />
        <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />
      </Routes>
    </BrowserRouter>
  );
}
