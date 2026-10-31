import { createFileRoute } from "@tanstack/react-router";
import { AdminWorkspacePage } from "@/components/system/AdminWorkspacePage";

export const Route = createFileRoute("/system/dashboard/my-performance")({
  component: () => <AdminWorkspacePage module="my-performance" />,
});
