import { createFileRoute } from "@tanstack/react-router";

// Shareable link of a lot: the programme page opens the lot named here.
export const Route = createFileRoute("/en/p/$slug/lot/$numero")({
  component: () => null,
});
