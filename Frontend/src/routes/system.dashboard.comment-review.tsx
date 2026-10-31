import { createFileRoute } from "@tanstack/react-router";
import { AdminWorkspacePage } from "@/components/system/AdminWorkspacePage";

export const Route = createFileRoute("/system/dashboard/comment-review")({
  component: () => <AdminWorkspacePage module="comment-review" />,
});
