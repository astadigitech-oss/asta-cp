import { createFileRoute } from "@tanstack/react-router";
import { DiscoverListPage } from "@/components/discover/DiscoverListPage";

export const Route = createFileRoute("/$lang/discover/")({
  head: () => ({
    meta: [
      { title: "Semua Wawasan, Cerita & Panduan Teknologi — ASTA Digital Agency" },
      {
        name: "description",
        content:
          "Jelajahi kumpulan wawasan industri, studi kasus transformasi digital, dan panduan rekayasa perangkat lunak dari para ahli di ASTA Digital Agency.",
      },
      {
        property: "og:title",
        content: "Semua Wawasan, Cerita & Panduan Teknologi — ASTA Digital Agency",
      },
      {
        property: "og:description",
        content:
          "Jelajahi kumpulan wawasan industri, studi kasus transformasi digital, dan panduan rekayasa perangkat lunak dari para ahli di ASTA Digital Agency.",
      },
    ],
  }),
  component: DiscoverListPage,
});

