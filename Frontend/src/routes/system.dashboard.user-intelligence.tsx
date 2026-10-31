import { createFileRoute } from "@tanstack/react-router";
import { AdminWorkspacePage } from "@/components/system/AdminWorkspacePage";

export const Route = createFileRoute("/system/dashboard/user-intelligence")({
  component: () => <AdminWorkspacePage module="user-intelligence" />,
});
