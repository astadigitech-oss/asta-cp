import { createFileRoute } from "@tanstack/react-router";
import { DiscoverDetailPage } from "@/components/discover/DiscoverDetailPage";

export const Route = createFileRoute("/discover/$id")({
  head: () => ({
    meta: [
      { title: "Detail Wawasan & Berita — ASTA Digital Agency" },
      { name: "description", content: "Jelajahi inovasi, cerita perkembangan teknologi, dan wawasan industri dari ASTA Digital Agency." },
    ],
  }),
  component: DiscoverDetailPage,
});
