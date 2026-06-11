import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/surveys/$surveyId")({
  component: () => <Outlet />,
});
