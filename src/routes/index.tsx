import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "INK/FORM" }],
  }),
  component: EmptyPage,
});

function EmptyPage() {
  return null;
}
