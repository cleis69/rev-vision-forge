import { createFileRoute, redirect } from "@tanstack/react-router";

// Opens the programme on its overview.
export const Route = createFileRoute("/app/_espace/projets/$id/")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/app/projets/$id/apercu", params, replace: true });
  },
});
