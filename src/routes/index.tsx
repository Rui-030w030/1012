import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "INK / FORM" },
      { name: "description", content: "INK / FORM" },
      { property: "og:title", content: "INK / FORM" },
      { property: "og:description", content: "INK / FORM" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BlankPage,
});

function BlankPage() {
  return <div className="min-h-screen bg-background" />;
}
