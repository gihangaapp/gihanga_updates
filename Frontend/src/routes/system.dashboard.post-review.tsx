import { createFileRoute } from "@tanstack/react-router";
import { AdminWorkspacePage } from "@/components/system/AdminWorkspacePage";

export const Route = createFileRoute("/system/dashboard/post-review")({
  component: () => <AdminWorkspacePage module="post-review" />,
});
