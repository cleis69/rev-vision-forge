import { createFileRoute, redirect } from "@tanstack/react-router";

// Opens the first available tab of the programme.
export const Route = createFileRoute("/app/_espace/projets/$id/")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/app/projets/$id/reglages", params, replace: true });
  },
});
