import { createFileRoute } from "@tanstack/react-router";
import { AdminWorkspacePage } from "@/components/system/AdminWorkspacePage";

export const Route = createFileRoute("/system/dashboard/story-review")({
  component: () => <AdminWorkspacePage module="story-review" />,
});
