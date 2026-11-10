import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const PortfolioListPage = lazyRouteComponent(
  () => import("@/components/portfolio/PortfolioListPage"),
  "PortfolioListPage",
);

export const Route = createFileRoute("/$lang/portfolio/")({
  head: () => ({
    meta: [
      { title: "Semua Portofolio & Studi Kasus — ASTA Digital Agency" },
      {
        name: "description",
        content:
          "Jelajahi rekam jejak dan proyek sistem informasi, aplikasi mobile, serta solusi digital yang telah dikerjakan oleh ASTA Digital Agency.",
      },
      {
        property: "og:title",
        content: "Semua Portofolio & Studi Kasus — ASTA Digital Agency",
      },
      {
        property: "og:description",
        content:
          "Jelajahi rekam jejak dan proyek sistem informasi, aplikasi mobile, serta solusi digital yang telah dikerjakan oleh ASTA Digital Agency.",
      },
    ],
  }),
  component: PortfolioListPage,
});
