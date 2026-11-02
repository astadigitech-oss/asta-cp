import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const BlogListPage = lazyRouteComponent(
  () => import("@/components/blog/BlogListPage"),
  "BlogListPage",
);

export const Route = createFileRoute("/$lang/blog/")({
  head: () => ({
    meta: [
      { title: "Artikel & Wawasan — ASTA Digital Agency" },
      {
        name: "description",
        content:
          "Jelajahi kumpulan artikel, panduan, dan wawasan seputar transformasi digital, teknologi, dan pertumbuhan bisnis dari ASTA Digital Agency.",
      },
      {
        property: "og:title",
        content: "Artikel & Wawasan — ASTA Digital Agency",
      },
      {
        property: "og:description",
        content:
          "Jelajahi kumpulan artikel, panduan, dan wawasan seputar transformasi digital, teknologi, dan pertumbuhan bisnis dari ASTA Digital Agency.",
      },
    ],
  }),
  component: BlogListPage,
});
